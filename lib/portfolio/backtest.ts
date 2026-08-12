import type { HistoryResponse } from "@/lib/market/types";
import type { Position } from "./positions";

export interface BasketSeries {
  dates: number[];
  /** Portfolio value in CAD on each date. */
  values: number[];
  /** Benchmark rebased to the basket's opening value so one axis serves both. */
  benchmark: number[] | null;
  benchmarkLabel: string | null;
  /** Share of today's portfolio value that has price history, 0–100. */
  coverage: number;
  /** Securities with no usable history, excluded from the line. */
  missing: string[];
  changeCad: number;
  changePercent: number;
  low: number;
  high: number;
}

/**
 * Values today's share counts at historical closes. This is a backtest of the
 * current basket, not account history: the export carries no transactions, so
 * deposits, sales and past weightings are invisible to it.
 */
export function basketSeries(
  positions: Position[],
  history: HistoryResponse,
): BasketSeries | null {
  const { dates, closes, currencies, usdCad } = history;
  if (dates.length < 2) return null;

  const quantities = new Map<string, number>();
  for (const p of positions) {
    quantities.set(
      p.securityKey,
      (quantities.get(p.securityKey) ?? 0) + p.quantity,
    );
  }

  const priced = [...quantities.entries()].filter(([key]) => closes[key]);
  if (priced.length === 0) return null;

  const values = dates.map((_, i) => {
    let sum = 0;
    for (const [key, qty] of priced) {
      const rate = currencies[key] === "USD" ? usdCad[i] : 1;
      sum += qty * closes[key][i] * rate;
    }
    return sum;
  });

  const totalValue = positions.reduce((a, p) => a + p.valueCad, 0);
  const covered = positions
    .filter((p) => closes[p.securityKey])
    .reduce((a, p) => a + p.valueCad, 0);

  const first = values[0];
  const last = values[values.length - 1];

  return {
    dates,
    values,
    benchmark: history.benchmark
      ? rebase(history.benchmark.closes, first)
      : null,
    benchmarkLabel: history.benchmark?.label ?? null,
    coverage: totalValue === 0 ? 0 : (covered / totalValue) * 100,
    missing: [...quantities.keys()].filter((key) => !closes[key]),
    changeCad: last - first,
    changePercent: first === 0 ? 0 : ((last - first) / first) * 100,
    low: Math.min(...values),
    high: Math.max(...values),
  };
}

function rebase(series: number[], to: number): number[] {
  const base = series[0];
  if (!base) return series;
  return series.map((v) => (v / base) * to);
}
