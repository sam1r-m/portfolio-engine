"use client";

import type { SliceTooltipLine } from "@/lib/portfolio/aggregations";

export type RichChartDatum = {
  name: string;
  value: number;
  percent: number;
  tooltipLines?: SliceTooltipLine[];
};

const MAX_LINES = 14;

function fmtCad(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function clipName(s: string, max = 42) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/**
 * Rich tooltip for sector / industry / asset class / geography / currency /
 * account charts. Expects `tooltipLines` on each chart datum (from dashboard).
 */
export function BreakdownRichTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: RichChartDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (!p) return null;

  const lines = p.tooltipLines ?? [];
  const shown = lines.slice(0, MAX_LINES);
  const rest = Math.max(0, lines.length - shown.length);

  return (
    <div className="max-w-[min(calc(100vw-2rem),20rem)] rounded-lg border border-border/80 bg-card px-3 py-2.5 text-[13px] shadow-lg ring-1 ring-black/[0.04]">
      <p className="font-semibold leading-snug text-[var(--ws-black)]">{p.name}</p>
      <p className="mt-0.5 text-muted-foreground">
        {fmtCad(p.value)} in this bucket · {p.percent.toFixed(1)}% of portfolio
      </p>
      {shown.length > 0 ? (
        <>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Holdings ({lines.length})
          </p>
          <ul className="mt-1.5 max-h-52 space-y-1.5 overflow-y-auto pr-0.5">
            {shown.map((line, i) => (
              <li
                key={`${line.accountNumber}|${line.symbol}|${line.mic}|${i}`}
                className="flex justify-between gap-3 border-b border-border/50 pb-1.5 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-mono font-semibold text-[var(--ws-charcoal)]">
                    {line.symbol}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {clipName(line.name)}
                  </span>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <div className="font-medium text-[var(--ws-charcoal)]">
                    {fmtCad(line.valueCad.toNumber())}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {line.pctOfPortfolio.toFixed(1)}% of portfolio
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {rest > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              +{rest} more in this bucket
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-2 text-xs italic text-muted-foreground">
          No line-level breakdown for this bucket.
        </p>
      )}
      <p className="mt-2 border-t border-border/60 pt-2 text-[11px] leading-snug text-muted-foreground">
        Row amounts are market value in CAD. Percents are share of total
        portfolio market value (CAD) for the current filter.
      </p>
    </div>
  );
}
