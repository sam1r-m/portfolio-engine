import { NextResponse } from "next/server";
import { z } from "zod";
import YahooFinance from "yahoo-finance2";
import tickers from "@/lib/data/tickers.json";

// yahoo-finance2 v3+ supports edge runtimes (fetch-based). This route only
// ever sees public ticker symbols, never user positions or values.
export const runtime = "edge";

const TickerSchema = z.object({
  symbol: z.string().min(1).max(12),
  mic: z.string().max(8).optional().default(""),
});

const BodySchema = z.object({
  tickers: z.array(TickerSchema).min(1).max(200),
});

interface Enrichment {
  sector: string;
  industry: string;
}

const BUNDLED = tickers as Record<string, Enrichment>;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

function enrichmentKey(symbol: string, mic: string) {
  return `${symbol}|${mic}`;
}

// Yahoo's symbol convention: TSX gets ".TO", CSE gets ".CN", US is bare.
function yahooSymbol(symbol: string, mic: string): string {
  if (mic === "XTSE" || mic === "XTSX") return `${symbol}.TO`;
  if (mic === "XCNQ" || mic === "NEOE") return `${symbol}.NE`;
  return symbol;
}

async function lookupFromYahoo(
  symbol: string,
  mic: string,
): Promise<Enrichment | null> {
  try {
    const summary = await yf.quoteSummary(yahooSymbol(symbol, mic), {
      modules: ["assetProfile"],
    });
    const profile = summary?.assetProfile;
    if (!profile) return null;
    return {
      sector: profile.sector ?? "Unclassified",
      industry: profile.industry ?? "Unclassified",
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const out: Record<string, Enrichment> = {};
  // Each ticker is independent; fire them in parallel
  await Promise.all(
    parsed.data.tickers.map(async ({ symbol, mic }) => {
      const key = enrichmentKey(symbol, mic);
      // 1) check the bundled curated map first &mdash; no network needed
      const local = BUNDLED[key];
      if (local) {
        out[key] = local;
        return;
      }
      // 2) fall back to yahoo for anything we don't have curated
      const remote = await lookupFromYahoo(symbol, mic);
      if (remote) out[key] = remote;
    }),
  );

  return NextResponse.json({ enrichment: out });
}
