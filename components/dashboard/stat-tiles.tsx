"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PortfolioTotals } from "@/lib/portfolio/aggregations";
import type { Money } from "@/lib/csv/money";

function formatCad(money: Money) {
  return `$${money.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function StatTiles({
  totals,
  snapshotDate,
}: {
  totals: PortfolioTotals;
  snapshotDate: Date | null;
}) {
  const isUp = totals.unrealizedPlCad.isPositive();
  const pnlColor = totals.unrealizedPlCad.isZero()
    ? "text-muted-foreground"
    : isUp
      ? "text-emerald-700"
      : "text-destructive";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Tile label="Market value" value={formatCad(totals.marketValueCad)} hint="CAD" />
      <Tile label="Book value" value={formatCad(totals.bookValueCad)} hint="CAD" />
      <Tile
        label="Unrealized P/L"
        value={`${isUp ? "+" : ""}${formatCad(totals.unrealizedPlCad)}`}
        hint={`${totals.unrealizedPlPercent.toFixed(2)}%`}
        valueClassName={pnlColor}
      />
      <Tile
        label="Holdings"
        value={String(totals.holdingsCount)}
        hint={
          snapshotDate
            ? `as of ${snapshotDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}`
            : ""
        }
      />
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <Card className="pressable-surface border border-border/70 ring-0">
      <CardContent className="py-5">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-2 font-serif text-3xl font-semibold tracking-tight text-[var(--ws-black)] ${valueClassName ?? ""}`}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
