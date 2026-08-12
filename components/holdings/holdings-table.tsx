"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Delta } from "@/components/instrument/controls";
import { compactMoney, money, percent, quantity } from "@/lib/format";
import type { Position } from "@/lib/portfolio/positions";
import { cn } from "@/lib/utils";

type SortKey =
  | "symbol"
  | "valueCad"
  | "weight"
  | "dayChangePercent"
  | "gainCad"
  | "sector";

const COLUMNS: Array<{
  key: SortKey;
  label: string;
  align: "left" | "right";
  hideBelow?: "sm" | "md" | "lg";
}> = [
  { key: "symbol", label: "Holding", align: "left" },
  { key: "valueCad", label: "Value", align: "right" },
  { key: "weight", label: "Weight", align: "right", hideBelow: "md" },
  { key: "dayChangePercent", label: "Today", align: "right", hideBelow: "sm" },
  { key: "gainCad", label: "Unrealized", align: "right" },
  { key: "sector", label: "Sector", align: "left", hideBelow: "lg" },
];

const HIDE_CLASS = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
} as const;

function sortValue(p: Position, key: SortKey, total: number): number | string {
  switch (key) {
    case "symbol":
      return p.symbol;
    case "sector":
      return p.sector;
    case "valueCad":
      return p.valueCad;
    case "weight":
      return total === 0 ? 0 : p.valueCad / total;
    case "dayChangePercent":
      return p.dayChangePercent ?? -Infinity;
    case "gainCad":
      return p.gainCad;
  }
}

export function HoldingsTable({ positions }: { positions: Position[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("valueCad");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const total = useMemo(
    () => positions.reduce((a, p) => a + p.valueCad, 0),
    [positions],
  );

  const sorted = useMemo(() => {
    const out = [...positions];
    out.sort((a, b) => {
      const av = sortValue(a, sortKey, total);
      const bv = sortValue(b, sortKey, total);
      if (typeof av === "string" && typeof bv === "string") {
        return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return dir === "asc"
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av);
    });
    return out;
  }, [positions, sortKey, dir, total]);

  const widest = sorted.reduce((a, p) => Math.max(a, p.valueCad), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse sm:min-w-[40rem]">
        <thead>
          <tr className="border-b border-rule">
            {COLUMNS.map((col) => {
              const activeCol = sortKey === col.key;
              const Icon = activeCol
                ? dir === "asc"
                  ? ChevronUp
                  : ChevronDown
                : ChevronsUpDown;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    activeCol
                      ? dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={cn(
                    "px-4 py-2.5 sm:px-5",
                    col.align === "right" ? "text-right" : "text-left",
                    col.hideBelow && HIDE_CLASS[col.hideBelow],
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (activeCol) setDir(dir === "asc" ? "desc" : "asc");
                      else {
                        setSortKey(col.key);
                        setDir(col.key === "symbol" || col.key === "sector" ? "asc" : "desc");
                      }
                    }}
                    className={cn(
                      "label inline-flex items-center gap-1 transition-colors hover:text-ink",
                      activeCol && "text-ink",
                      col.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {col.label}
                    <Icon aria-hidden className="size-3" strokeWidth={2} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => {
            const weight = total === 0 ? 0 : (p.valueCad / total) * 100;
            return (
              <tr
                key={p.key}
                className="border-b border-rule/70 transition-colors last:border-b-0 hover:bg-panel-sunk"
              >
                <td className="px-4 py-2.5 sm:px-5">
                  <div className="flex items-baseline gap-2">
                    <span className="num text-sm font-medium">{p.symbol}</span>
                    {!p.livePrice ? (
                      <span
                        className="label text-[9px] text-ink-3"
                        title="Priced from the export, not a live quote"
                      >
                        snapshot
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-xs text-ink-2">
                    <span className="truncate">{p.name}</span>
                    <span className="num text-[10px] text-ink-3">
                      {quantity(p.quantity)} @ {p.price.toFixed(2)} {p.currency}
                    </span>
                  </div>
                </td>
                <td className="num px-4 py-2.5 text-right text-sm tabular-nums sm:px-5">
                  {money(p.valueCad)}
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right sm:px-5",
                    HIDE_CLASS.md,
                  )}
                >
                  <span className="num text-sm tabular-nums">
                    {percent(weight)}
                  </span>
                  <span
                    aria-hidden
                    className="ml-auto mt-1 block h-1 bg-accent"
                    style={{
                      width: `${widest === 0 ? 0 : Math.max((p.valueCad / widest) * 48, 2)}px`,
                    }}
                  />
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right sm:px-5",
                    HIDE_CLASS.sm,
                  )}
                >
                  <Delta percent={p.dayChangePercent} showIcon={false} />
                </td>
                <td className="px-4 py-2.5 text-right sm:px-5">
                  <Delta value={p.gainCad} percent={p.gainPercent} showIcon={false} />
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-xs text-ink-2 sm:px-5",
                    HIDE_CLASS.lg,
                  )}
                >
                  <span className="block">{p.sector}</span>
                  {p.capBucket !== p.sector ? (
                    <span className="num mt-0.5 block text-[10px] text-ink-3">
                      {p.capBucket}
                      {p.marketCapCad ? ` · ${compactMoney(p.marketCapCad)}` : ""}
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
