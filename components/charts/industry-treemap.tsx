"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import type { BreakdownSlice } from "@/lib/portfolio/aggregations";

// Same 5-color rotation as the donut for visual consistency.
const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  name?: string;
  value?: number;
  percent?: number;
}

function TreemapNode(props: NodeProps) {
  const { x, y, width, height, index, name, percent } = props;
  const fill = PALETTE[index % PALETTE.length];
  const showLabel = width > 70 && height > 28;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: "var(--background)",
          strokeWidth: 2,
        }}
      />
      {showLabel ? (
        <>
          <text
            x={x + 10}
            y={y + 22}
            fill="var(--foreground)"
            fontSize={13}
            fontWeight={500}
          >
            {name}
          </text>
          {percent !== undefined && height > 48 ? (
            <text
              x={x + 10}
              y={y + 40}
              fill="var(--foreground)"
              fontSize={11}
              opacity={0.7}
            >
              {percent.toFixed(1)}%
            </text>
          ) : null}
        </>
      ) : null}
    </g>
  );
}

export function IndustryTreemap({ slices }: { slices: BreakdownSlice[] }) {
  const data = slices.map((s) => ({
    name: s.label,
    value: s.value.toNumber(),
    percent: s.percent,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          aspectRatio={4 / 3}
          stroke="var(--background)"
          content={<TreemapNode {...({} as NodeProps)} />}
        >
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value, _name, item) => {
              const v = Number(value ?? 0);
              const pct = Number(item?.payload?.percent ?? 0);
              return [
                `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${pct.toFixed(1)}%)`,
                String(item?.payload?.name ?? ""),
              ];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
