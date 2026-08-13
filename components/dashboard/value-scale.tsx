"use client";

import { money, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

const TICKS = Array.from({ length: 21 }, (_, i) => i);

/**
 * Market value measured against book value on one scale. Ink runs to whatever
 * was paid, then the gain or shortfall is a span you can read the length of.
 */
export function ValueScale({
  marketValue,
  bookValue,
}: {
  marketValue: number;
  bookValue: number;
}) {
  const gain = marketValue - bookValue;
  const gainPercent = bookValue === 0 ? 0 : (gain / bookValue) * 100;
  const span = Math.max(marketValue, bookValue);
  const axisMax = span === 0 ? 1 : span * 1.04;

  const paidPct = (Math.min(bookValue, marketValue) / axisMax) * 100;
  const deltaPct = (Math.abs(gain) / axisMax) * 100;
  const labelFits = deltaPct >= 20;

  return (
    <div className="w-full">
      <div className="relative flex h-2.5 items-end" aria-hidden>
        {TICKS.map((t) => (
          <span
            key={t}
            className={cn(
              "absolute w-px bg-rule-strong",
              t % 5 === 0 ? "h-2.5" : "h-1.5",
            )}
            style={{ left: `${t * 5}%` }}
          />
        ))}
      </div>

      <div
        className="flex h-3.5 w-full items-stretch"
        role="img"
        aria-label={`Book value ${money(bookValue)}, market value ${money(
          marketValue,
        )}, ${gain >= 0 ? "gain" : "loss"} ${money(Math.abs(gain))}`}
      >
        <div className="bg-ink" style={{ width: `${paidPct}%` }} />
        {deltaPct > 0 ? (
          <>
            <div className="w-0.5 shrink-0 bg-panel" />
            <div
              className={gain >= 0 ? "bg-pos" : "bg-neg"}
              style={{ width: `${Math.max(deltaPct - 0.4, 0.4)}%` }}
            />
          </>
        ) : null}
      </div>

      <div className="mt-2 flex items-start">
        <div style={{ width: `${paidPct}%` }} className="min-w-0">
          <p className="label whitespace-nowrap">Book</p>
          <p className="num mt-1 text-xs text-ink-2">{money(bookValue)}</p>
        </div>
        <div
          style={labelFits ? { width: `${deltaPct}%` } : undefined}
          className={cn("min-w-0 pl-2", !labelFits && "shrink-0")}
        >
          <p className="label whitespace-nowrap">
            {gain >= 0 ? "Unrealized gain" : "Unrealized loss"}
          </p>
          <p
            className={cn(
              "num mt-1 whitespace-nowrap text-xs font-medium",
              gain >= 0 ? "text-pos" : "text-neg",
            )}
          >
            {money(Math.abs(gain))} · {percent(Math.abs(gainPercent))}
          </p>
        </div>
      </div>
    </div>
  );
}
