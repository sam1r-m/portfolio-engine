import { NextResponse } from "next/server";
import { z } from "zod";
import { securityKey, yahooSymbol } from "@/lib/market/symbols";
import type { HistoryRange, HistoryResponse } from "@/lib/market/types";
import {
  LENIENT,
  SymbolRefSchema,
  dedupe,
  inBatches,
  yf,
} from "@/lib/market/yahoo.server";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  symbols: z.array(SymbolRefSchema).min(1).max(120),
  range: z.enum(["1M", "3M", "6M", "1Y", "5Y", "MAX"]).default("1Y"),
});

const BENCHMARK = { symbol: "^GSPC", label: "S&P 500" };

const RANGE_MONTHS: Record<HistoryRange, number> = {
  "1M": 1,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
  "5Y": 60,
  MAX: 240,
};

function periodStart(range: HistoryRange): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - RANGE_MONTHS[range]);
  return d;
}

type Series = Map<number, number>;

/** Only the slice of the chart payload this route reads. */
interface ChartShape {
  meta: { currency?: string | null };
  quotes: Array<{ date?: Date | null; close?: number | null }>;
}

async function closeSeries(
  symbol: string,
  period1: Date,
  interval: "1d" | "1wk",
): Promise<{ series: Series; currency: string } | null> {
  try {
    const chart = (await yf.chart(
      symbol,
      { period1, interval },
      LENIENT,
    )) as ChartShape;
    const series: Series = new Map();
    for (const q of chart.quotes) {
      // Split-adjusted close, which is what today's share count needs. Rows are
      // null on halted days.
      if (typeof q.close !== "number" || !q.date) continue;
      series.set(q.date.getTime(), q.close);
    }
    if (series.size < 2) return null;
    return { series, currency: chart.meta.currency ?? "USD" };
  } catch {
    return null;
  }
}

/** Carries the last known close across days a series does not trade. */
function forwardFill(series: Series, axis: number[]): number[] {
  const points = [...series.entries()].sort((a, b) => a[0] - b[0]);
  const out: number[] = [];
  let i = 0;
  let last = points[0][1];
  for (const t of axis) {
    while (i < points.length && points[i][0] <= t) last = points[i++][1];
    out.push(Math.round(last * 1e4) / 1e4);
  }
  return out;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { range } = parsed.data;
  const refs = dedupe(parsed.data.symbols);
  const period1 = periodStart(range);
  const interval = range === "5Y" || range === "MAX" ? "1wk" : "1d";

  const fetched = await inBatches(refs, 8, async (ref) => ({
    key: securityKey(ref.symbol, ref.mic),
    result: await closeSeries(yahooSymbol(ref.symbol, ref.mic), period1, interval),
  }));

  const [fx, benchmark] = await Promise.all([
    closeSeries("USDCAD=X", period1, interval),
    closeSeries(BENCHMARK.symbol, period1, interval),
  ]);

  const resolved = fetched.filter((f) => f.result !== null);
  const missing = fetched.filter((f) => f.result === null).map((f) => f.key);

  if (resolved.length === 0 || !fx) {
    return NextResponse.json(
      { error: "no price history available" },
      { status: 502 },
    );
  }

  // A position that only started trading part-way through the window would
  // otherwise make the basket jump on its first day, so the axis starts where
  // every series has real data.
  const contributors = [...resolved.map((r) => r.result!.series), fx.series];
  const start = Math.max(...contributors.map((s) => Math.min(...s.keys())));
  const axis = [
    ...new Set(contributors.flatMap((s) => [...s.keys()])),
  ]
    .filter((t) => t >= start)
    .sort((a, b) => a - b);

  const closes: Record<string, number[]> = {};
  const currencies: Record<string, string> = {};
  for (const { key, result } of resolved) {
    closes[key] = forwardFill(result!.series, axis);
    currencies[key] = result!.currency;
  }

  const payload: HistoryResponse = {
    dates: axis,
    closes,
    currencies,
    usdCad: forwardFill(fx.series, axis),
    benchmark: benchmark
      ? { ...BENCHMARK, closes: forwardFill(benchmark.series, axis) }
      : null,
    missing,
  };

  return NextResponse.json(payload, {
    headers: {
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
