"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopHolding } from "@/lib/portfolio/aggregations";

type SortKey = "symbol" | "marketValueCad" | "percent" | "unrealizedPlCad";
type Dir = "asc" | "desc";

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function HoldingsTable({ rows }: { rows: TopHolding[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("marketValueCad");
  const [dir, setDir] = useState<Dir>("desc");

  const sorted = useMemo(() => {
    const out = [...rows];
    out.sort((a, b) => {
      const av = pickSortValue(a, sortKey);
      const bv = pickSortValue(b, sortKey);
      if (typeof av === "string" && typeof bv === "string") {
        return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = Number(av);
      const bn = Number(bv);
      return dir === "asc" ? an - bn : bn - an;
    });
    return out;
  }, [rows, sortKey, dir]);

  function toggle(key: SortKey) {
    if (sortKey === key) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDir("desc");
    }
  }

  return (
    <div className="rounded-lg border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="Symbol" col="symbol" sortKey={sortKey} dir={dir} onSort={toggle} />
            <TableHead>Name</TableHead>
            <SortHead
              label="Market value"
              col="marketValueCad"
              sortKey={sortKey}
              dir={dir}
              onSort={toggle}
              align="right"
            />
            <SortHead
              label="%"
              col="percent"
              sortKey={sortKey}
              dir={dir}
              onSort={toggle}
              align="right"
            />
            <SortHead
              label="Unrealized P/L"
              col="unrealizedPlCad"
              sortKey={sortKey}
              dir={dir}
              onSort={toggle}
              align="right"
            />
            <TableHead>Sector</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((h) => (
            <TableRow key={`${h.symbol}-${h.name}`}>
              <TableCell className="font-medium">{h.symbol}</TableCell>
              <TableCell className="text-muted-foreground">{h.name}</TableCell>
              <TableCell className="text-right tabular-nums">
                ${fmt(h.marketValueCad.toNumber())}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {h.percent.toFixed(1)}%
              </TableCell>
              <TableCell
                className={`text-right tabular-nums ${
                  h.unrealizedPlCad.isPositive()
                    ? "text-emerald-700"
                    : h.unrealizedPlCad.isNegative()
                      ? "text-destructive"
                      : ""
                }`}
              >
                {h.unrealizedPlCad.isPositive() ? "+" : ""}$
                {fmt(h.unrealizedPlCad.toNumber())}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {h.sector ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function pickSortValue(h: TopHolding, key: SortKey) {
  switch (key) {
    case "symbol":
      return h.symbol;
    case "marketValueCad":
      return h.marketValueCad.toNumber();
    case "percent":
      return h.percent;
    case "unrealizedPlCad":
      return h.unrealizedPlCad.toNumber();
  }
}

function SortHead({
  label,
  col,
  sortKey,
  dir,
  onSort,
  align,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  dir: Dir;
  onSort: (k: SortKey) => void;
  align?: "right";
}) {
  const active = sortKey === col;
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1.5 hover:text-foreground ${
          active ? "text-foreground" : ""
        }`}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </TableHead>
  );
}
