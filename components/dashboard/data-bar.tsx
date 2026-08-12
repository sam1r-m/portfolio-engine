"use client";

import { RotateCw } from "lucide-react";
import { clockTime } from "@/lib/format";
import { UNCLASSIFIED } from "@/lib/market/taxonomy";
import type { Position } from "@/lib/portfolio/positions";
import { USD_CAD_FALLBACK } from "@/lib/portfolio/positions";
import type { FetchStatus } from "@/lib/portfolio/use-market-data";
import { cn } from "@/lib/utils";

/** Provenance strip: what is measured, what is reconstructed, and from when. */
export function DataBar({
  positions,
  usdCad,
  asOf,
  quoteStatus,
  profileStatus,
  onRefresh,
}: {
  positions: Position[];
  usdCad: number | null;
  asOf: string | null;
  quoteStatus: FetchStatus;
  profileStatus: FetchStatus;
  onRefresh: () => void;
}) {
  const stale = positions.filter((p) => !p.livePrice).length;
  const unclassified = positions.filter((p) => p.sector === UNCLASSIFIED).length;
  const loading = quoteStatus === "loading" || profileStatus === "loading";

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border border-rule bg-panel px-4 py-2 sm:px-5">
      <Cell
        label="Prices"
        tone={quoteStatus === "error" ? "warn" : undefined}
        value={
          quoteStatus === "error"
            ? "unavailable — showing export values"
            : loading
              ? "fetching…"
              : asOf
                ? `live · ${clockTime(asOf)}`
                : "export values"
        }
      />
      <Cell
        label="USD/CAD"
        tone={usdCad === null ? "warn" : undefined}
        value={
          usdCad === null
            ? `${USD_CAD_FALLBACK.toFixed(2)} fallback`
            : usdCad.toFixed(4)
        }
      />
      {stale > 0 ? (
        <Cell label="Unpriced" tone="warn" value={`${stale} of ${positions.length}`} />
      ) : null}
      {unclassified > 0 ? (
        <Cell
          label="Unclassified"
          tone="warn"
          value={`${unclassified} of ${positions.length}`}
        />
      ) : null}

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="label ml-auto inline-flex items-center gap-1.5 transition-colors hover:text-ink disabled:opacity-50"
      >
        <RotateCw
          aria-hidden
          strokeWidth={2}
          className={cn("size-3", loading && "animate-spin")}
        />
        Refresh
      </button>
    </div>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="label">{label}</span>
      <span
        className={cn(
          "num text-[11px] tabular-nums",
          tone === "warn" ? "text-neg" : "text-ink-2",
        )}
      >
        {value}
      </span>
    </span>
  );
}
