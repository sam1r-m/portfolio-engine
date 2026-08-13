"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Panel } from "@/components/instrument/panel";
import { Delta, Segmented, Toggle } from "@/components/instrument/controls";
import { money, percent } from "@/lib/format";
import { UNCLASSIFIED } from "@/lib/market/taxonomy";
import {
  DIMENSIONS,
  allocate,
  type AllocationBucket,
  type DimensionId,
} from "@/lib/portfolio/allocation";
import type { Position } from "@/lib/portfolio/positions";
import { cn } from "@/lib/utils";

export function AllocationPanel({ positions }: { positions: Position[] }) {
  const [dimension, setDimension] = useState<DimensionId>("sector");
  const [lookthrough, setLookthrough] = useState(true);
  const [open, setOpen] = useState<string[]>([]);

  const active = DIMENSIONS.find((d) => d.id === dimension)!;
  const buckets = useMemo(
    () => allocate(positions, dimension, lookthrough),
    [positions, dimension, lookthrough],
  );

  const fundsWithWeights = useMemo(
    () => positions.filter((p) => p.etf?.sectorWeights).length,
    [positions],
  );

  const top3 = buckets.slice(0, 3).reduce((a, b) => a + b.percent, 0);

  return (
    <Panel
      title="Allocation"
      meta={`${buckets.length} buckets · top 3 hold ${percent(top3, 0)}`}
      flush
      actions={
        <Segmented
          label="Break allocation down by"
          value={dimension}
          onChange={(v) => {
            setDimension(v);
            setOpen([]);
          }}
          options={DIMENSIONS.map((d) => ({ value: d.id, label: d.label }))}
        />
      }
    >
      {active.supportsLookthrough && fundsWithWeights > 0 ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-rule px-4 py-2.5 sm:px-5">
          <Toggle checked={lookthrough} onChange={setLookthrough}>
            Look through funds
          </Toggle>
          <p className="text-xs text-ink-2">
            {lookthrough
              ? `${fundsWithWeights} fund ${fundsWithWeights === 1 ? "position is" : "positions are"} split by the sectors they hold.`
              : `${fundsWithWeights} fund ${fundsWithWeights === 1 ? "position counts" : "positions count"} as one line each.`}
          </p>
        </div>
      ) : null}

      <ul>
        {buckets.map((bucket) => (
          <Row
            key={bucket.label}
            bucket={bucket}
            expanded={open.includes(bucket.label)}
            onToggle={() =>
              setOpen((o) =>
                o.includes(bucket.label)
                  ? o.filter((l) => l !== bucket.label)
                  : [...o, bucket.label],
              )
            }
          />
        ))}
      </ul>
    </Panel>
  );
}

function Row({
  bucket,
  expanded,
  onToggle,
}: {
  bucket: AllocationBucket;
  expanded: boolean;
  onToggle: () => void;
}) {
  const unclassified = bucket.label === UNCLASSIFIED;
  const bodyId = `alloc-${bucket.label.replace(/\W+/g, "-")}`;

  return (
    <li className="border-b border-rule last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        className={cn(
          "group block w-full px-4 py-3 text-left transition-colors sm:px-5",
          expanded ? "bg-panel-sunk" : "hover:bg-panel-sunk",
        )}
      >
        <div className="flex items-baseline gap-3">
          <span className="min-w-0 flex-1 truncate text-[15px]">
            {bucket.label}
          </span>
          <span className="num hidden text-xs tabular-nums sm:block">
            <Delta percent={bucket.dayChangePercent} showIcon={false} />
          </span>
          <span className="num w-24 text-right text-sm tabular-nums sm:w-28">
            {money(bucket.valueCad)}
          </span>
          <span className="num w-14 text-right text-sm font-medium tabular-nums">
            {percent(bucket.percent)}
          </span>
          <ChevronDown
            aria-hidden
            strokeWidth={1.75}
            className={cn(
              "size-4 shrink-0 text-ink-3 transition-transform duration-200",
              expanded && "rotate-180 text-ink",
            )}
          />
        </div>
        {/* Bar length is share of the portfolio, so the track reads as 100%. */}
        <div className="mt-2 h-1.5 w-full bg-panel-sunk group-hover:bg-white/70">
          <div
            className={cn("h-full", unclassified ? "hatched" : "bg-accent")}
            style={{ width: `${Math.max(bucket.percent, 0.4)}%` }}
          />
        </div>
      </button>

      {expanded ? (
        <div id={bodyId} className="bg-panel-sunk px-4 pb-3 sm:px-5">
          <table className="w-full">
            <caption className="sr-only">
              Holdings inside {bucket.label}
            </caption>
            <thead>
              <tr className="border-b border-rule">
                <th className="label py-2 text-left font-medium">Holding</th>
                <th className="label py-2 text-right font-medium">Value</th>
                <th className="label hidden py-2 text-right font-medium sm:table-cell">
                  Of bucket
                </th>
                <th className="label py-2 text-right font-medium">Today</th>
              </tr>
            </thead>
            <tbody>
              {bucket.constituents.map((c) => {
                const share = (c.valueCad / bucket.valueCad) * 100;
                return (
                  <tr
                    key={`${c.position.key}-${bucket.label}`}
                    className="border-b border-rule/70 last:border-b-0"
                  >
                    <td className="py-1.5 pr-3">
                      <span className="num text-xs font-semibold">
                        {c.position.symbol}
                      </span>
                      <span className="ml-2 text-xs text-ink-2">
                        {c.position.name}
                      </span>
                      {c.shareOfPosition < 99.9 ? (
                        <span className="num ml-2 text-[10px] text-ink-3">
                          {percent(c.shareOfPosition, 1)} of position
                        </span>
                      ) : null}
                    </td>
                    <td className="num py-1.5 text-right text-xs tabular-nums">
                      {money(c.valueCad)}
                    </td>
                    <td className="num hidden py-1.5 text-right text-xs tabular-nums text-ink-2 sm:table-cell">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className="hidden h-1 w-12 bg-rule md:block"
                        >
                          <span
                            className="block h-full bg-accent/45"
                            style={{ width: `${Math.max(share, 1.5)}%` }}
                          />
                        </span>
                        {percent(share)}
                      </span>
                    </td>
                    <td className="py-1.5 text-right">
                      <Delta
                        percent={c.position.dayChangePercent}
                        showIcon={false}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </li>
  );
}
