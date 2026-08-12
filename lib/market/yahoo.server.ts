import "server-only";
import YahooFinance from "yahoo-finance2";
import { z } from "zod";
import type { SymbolRef } from "./types";

export const yf = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
  validation: { logErrors: false },
});

export const SymbolRefSchema = z.object({
  symbol: z.string().min(1).max(16),
  mic: z.string().max(8).optional().default(""),
});

export const SymbolsBodySchema = z.object({
  symbols: z.array(SymbolRefSchema).min(1).max(250),
});

/** Yahoo throttles hard on wide fan-out, so profile lookups go out in waves. */
export async function inBatches<T, R>(
  items: T[],
  size: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  }
  return out;
}

export function dedupe(symbols: SymbolRef[]): SymbolRef[] {
  const seen = new Map<string, SymbolRef>();
  for (const s of symbols) seen.set(`${s.symbol}|${s.mic}`, s);
  return [...seen.values()];
}

const FX_PAIR = "USDCAD=X";

/** CAD per USD. Falls back to the last close if the live quote is unavailable. */
export async function usdCadRate(): Promise<number | null> {
  try {
    const q = await yf.quote(FX_PAIR);
    const rate = q?.regularMarketPrice ?? q?.regularMarketPreviousClose;
    return typeof rate === "number" && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}
