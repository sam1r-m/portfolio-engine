import { NextResponse } from "next/server";
import { securityKey, yahooSymbol } from "@/lib/market/symbols";
import type { Quote, QuotesResponse } from "@/lib/market/types";
import {
  SymbolsBodySchema,
  dedupe,
  usdCadRate,
  yf,
} from "@/lib/market/yahoo.server";

// yahoo-finance2 reaches for node builtins, so this cannot run on edge.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = SymbolsBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const refs = dedupe(parsed.data.symbols);
  const byYahoo = new Map(refs.map((r) => [yahooSymbol(r.symbol, r.mic), r]));

  const [rows, usdCad] = await Promise.all([
    yf.quote([...byYahoo.keys()]).catch(() => []),
    usdCadRate(),
  ]);

  const quotes: Record<string, Quote> = {};
  for (const row of Array.isArray(rows) ? rows : [rows]) {
    const ref = byYahoo.get(row.symbol);
    const price = row.regularMarketPrice ?? row.regularMarketPreviousClose;
    if (!ref || typeof price !== "number") continue;
    quotes[securityKey(ref.symbol, ref.mic)] = {
      currency: row.currency ?? "USD",
      price,
      previousClose: row.regularMarketPreviousClose ?? null,
      changePercent: row.regularMarketChangePercent ?? null,
      marketCap: row.marketCap ?? null,
      name: row.longName ?? row.shortName ?? null,
      quoteType: row.quoteType ?? null,
    };
  }

  const payload: QuotesResponse = {
    asOf: new Date().toISOString(),
    usdCad,
    quotes,
    missing: refs
      .map((r) => securityKey(r.symbol, r.mic))
      .filter((k) => !quotes[k]),
  };

  return NextResponse.json(payload, {
    headers: {
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
