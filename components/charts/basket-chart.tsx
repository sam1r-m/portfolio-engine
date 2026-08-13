"use client";

import { useCallback, useMemo, useState } from "react";
import type { BasketSeries } from "@/lib/portfolio/backtest";
import { axisDate, compactMoney, fullDate, money, signedPercent } from "@/lib/format";
import { useMeasure } from "@/lib/use-measure";
import { cn } from "@/lib/utils";

const PAD = { top: 14, right: 58, bottom: 24, left: 1 };
const HEIGHT = 300;

function niceTicks(min: number, max: number, count = 4): number[] {
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max; v += step) out.push(v);
  return out;
}

function path(points: Array<[number, number]>): string {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
}

export function BasketChart({
  series,
  showBenchmark,
  dimmed,
}: {
  series: BasketSeries;
  showBenchmark: boolean;
  /** Held at reduced opacity while a new range loads. */
  dimmed?: boolean;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const withBenchmark = showBenchmark && series.benchmark !== null;

  const geom = useMemo(() => {
    const w = Math.max(width, 320);
    const plotW = w - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;

    const all = withBenchmark
      ? [...series.values, ...(series.benchmark ?? [])]
      : series.values;
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const pad = (hi - lo) * 0.1 || hi * 0.02 || 1;
    const min = lo - pad;
    const max = hi + pad;

    const x = (i: number) =>
      PAD.left + (i / Math.max(series.dates.length - 1, 1)) * plotW;
    const y = (v: number) =>
      PAD.top + plotH - ((v - min) / (max - min)) * plotH;

    return {
      w,
      plotW,
      plotH,
      x,
      y,
      min,
      max,
      ticks: niceTicks(min, max),
      valuePoints: series.values.map((v, i) => [x(i), y(v)] as [number, number]),
      benchPoints: (series.benchmark ?? []).map(
        (v, i) => [x(i), y(v)] as [number, number],
      ),
    };
  }, [width, series, withBenchmark]);

  const pointFromEvent = useCallback(
    (clientX: number, rect: DOMRect) => {
      const rel = clientX - rect.left - PAD.left;
      const i = Math.round((rel / geom.plotW) * (series.dates.length - 1));
      return Math.min(Math.max(i, 0), series.dates.length - 1);
    },
    [geom.plotW, series.dates.length],
  );

  const active = hover ?? series.dates.length - 1;
  const activeValue = series.values[active];
  const activeStart = series.values[0];
  const activeChange =
    activeStart === 0 ? 0 : ((activeValue - activeStart) / activeStart) * 100;

  const xLabelCount = width < 520 ? 3 : 5;
  const spanDays =
    (series.dates[series.dates.length - 1] - series.dates[0]) / 86_400_000;
  const xLabels = Array.from({ length: xLabelCount }, (_, k) => {
    const i = Math.round((k / (xLabelCount - 1)) * (series.dates.length - 1));
    return { i, ts: series.dates[i] };
  });

  return (
    <div ref={ref} className="w-full">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span className="readout text-[1.75rem] leading-none">
            {money(activeValue)}
          </span>
          <span
            className={cn(
              "num text-xs font-semibold tabular-nums",
              activeChange >= 0 ? "text-pos" : "text-neg",
            )}
          >
            {signedPercent(activeChange)} over range
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LegendKey color="var(--accent)" label="This basket" />
          {withBenchmark ? (
            <LegendKey color="var(--ink-3)" label={series.benchmarkLabel ?? "Benchmark"} />
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "relative transition-opacity duration-200",
          dimmed && "opacity-40",
        )}
      >
        <svg
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${geom.w} ${HEIGHT}`}
          className="block touch-none outline-none"
          role="img"
          aria-label={`Basket value from ${fullDate(series.dates[0])} to ${fullDate(
            series.dates[series.dates.length - 1],
          )}`}
          tabIndex={0}
          onMouseMove={(e) =>
            setHover(pointFromEvent(e.clientX, e.currentTarget.getBoundingClientRect()))
          }
          onMouseLeave={() => setHover(null)}
          onTouchMove={(e) =>
            setHover(
              pointFromEvent(
                e.touches[0].clientX,
                e.currentTarget.getBoundingClientRect(),
              ),
            )
          }
          onTouchEnd={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            setHover((h) => {
              const next = (h ?? series.dates.length - 1) + (e.key === "ArrowRight" ? 1 : -1);
              return Math.min(Math.max(next, 0), series.dates.length - 1);
            });
          }}
        >
          {geom.ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={PAD.left + geom.plotW}
                y1={geom.y(t)}
                y2={geom.y(t)}
                stroke="var(--rule)"
                strokeWidth={1}
              />
              <text
                x={geom.w - PAD.right + 8}
                y={geom.y(t) + 3.5}
                className="num"
                fontSize={10}
                fill="var(--ink-3)"
              >
                {compactMoney(t)}
              </text>
            </g>
          ))}

          <line
            x1={PAD.left}
            x2={PAD.left + geom.plotW}
            y1={geom.y(series.values[0])}
            y2={geom.y(series.values[0])}
            stroke="var(--rule-strong)"
            strokeWidth={1}
          />

          <path
            d={`${path(geom.valuePoints)} L ${geom.x(series.values.length - 1)} ${
              PAD.top + geom.plotH
            } L ${PAD.left} ${PAD.top + geom.plotH} Z`}
            fill="var(--accent)"
            opacity={0.07}
          />

          {withBenchmark ? (
            <path
              d={path(geom.benchPoints)}
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          ) : null}

          <path
            d={path(geom.valuePoints)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {xLabels.map(({ i, ts }, k) => (
            <text
              key={ts}
              x={geom.x(i)}
              y={HEIGHT - 8}
              className="num"
              fontSize={10}
              fill="var(--ink-3)"
              textAnchor={k === 0 ? "start" : k === xLabels.length - 1 ? "end" : "middle"}
            >
              {axisDate(ts, spanDays)}
            </text>
          ))}

          {hover !== null ? (
            <g>
              <line
                x1={geom.x(hover)}
                x2={geom.x(hover)}
                y1={PAD.top}
                y2={PAD.top + geom.plotH}
                stroke="var(--ink)"
                strokeWidth={1}
                opacity={0.35}
              />
              {withBenchmark ? (
                <circle
                  cx={geom.x(hover)}
                  cy={geom.y(series.benchmark![hover])}
                  r={4}
                  fill="var(--ink-3)"
                  stroke="var(--panel)"
                  strokeWidth={2}
                />
              ) : null}
              <circle
                cx={geom.x(hover)}
                cy={geom.y(series.values[hover])}
                r={4.5}
                fill="var(--accent)"
                stroke="var(--panel)"
                strokeWidth={2}
              />
            </g>
          ) : null}
        </svg>

        {hover !== null ? (
          <Readout
            series={series}
            index={hover}
            withBenchmark={withBenchmark}
            left={geom.x(hover)}
            containerWidth={geom.w}
          />
        ) : null}
      </div>
    </div>
  );
}

function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="block h-0.5 w-4"
        style={{ background: color }}
      />
      <span className="label">{label}</span>
    </span>
  );
}

function Readout({
  series,
  index,
  withBenchmark,
  left,
  containerWidth,
}: {
  series: BasketSeries;
  index: number;
  withBenchmark: boolean;
  left: number;
  containerWidth: number;
}) {
  const flip = left > containerWidth * 0.6;
  const start = series.values[0];
  const change = start === 0 ? 0 : ((series.values[index] - start) / start) * 100;
  const benchStart = series.benchmark?.[0] ?? 0;
  const benchChange =
    benchStart === 0
      ? 0
      : ((series.benchmark![index] - benchStart) / benchStart) * 100;

  return (
    <div
      className="pointer-events-none absolute top-3 z-10 border border-rule bg-panel px-3 py-2 shadow-[0_2px_10px_-4px_rgb(16_16_16/0.35)]"
      style={{
        left: `${(left / containerWidth) * 100}%`,
        transform: flip ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
      }}
    >
      <p className="label">{fullDate(series.dates[index])}</p>
      <p className="num mt-1.5 text-sm font-semibold tabular-nums">
        {money(series.values[index])}
      </p>
      <p
        className={cn(
          "num text-[11px] tabular-nums",
          change >= 0 ? "text-pos" : "text-neg",
        )}
      >
        {signedPercent(change)} basket
      </p>
      {withBenchmark ? (
        <p className="num mt-0.5 text-[11px] tabular-nums text-ink-3">
          {signedPercent(benchChange)} {series.benchmarkLabel}
        </p>
      ) : null}
    </div>
  );
}
