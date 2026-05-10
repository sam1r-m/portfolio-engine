import { NextResponse } from "next/server";
import { z } from "zod";
import YahooFinance from "yahoo-finance2";
import tickers from "@/lib/data/tickers.json";

// yahoo-finance2 pulls in Node fs under the hood, so Edge won't fly here.
// Node serverless is fine — this route only ever sees public ticker symbols,
// never user positions or values.
export const runtime = "nodejs";

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

// FMP uses the same .TO suffix convention as Yahoo for TSX names.
async function lookupFromFmp(
  symbol: string,
  mic: string,
): Promise<Enrichment | null> {
  const key = process.env.FMP_API_KEY;
  if (!key) return null;
  const fmpSymbol = yahooSymbol(symbol, mic);
  try {
    const res = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(fmpSymbol)}?apikey=${key}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ sector?: string; industry?: string }>;
    const first = Array.isArray(json) ? json[0] : null;
    if (!first) return null;
    return {
      sector: first.sector ?? "Unclassified",
      industry: first.industry ?? "Unclassified",
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
      // 1) check the bundled curated map first — no network needed
      const local = BUNDLED[key];
      if (local) {
        out[key] = local;
        return;
      }
      // 2) fall back to yahoo for anything we don't have curated
      const yahoo = await lookupFromYahoo(symbol, mic);
      if (yahoo) {
        out[key] = yahoo;
        return;
      }
      // 3) last resort: FMP (if a key is configured)
      const fmp = await lookupFromFmp(symbol, mic);
      if (fmp) out[key] = fmp;
    }),
  );

  // Sector classifications barely change — cache for a day at the CDN /
  // stale-while-revalidate for a week. Saves Yahoo round-trips.
  return NextResponse.json(
    { enrichment: out },
    {
      headers: {
        "cache-control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
