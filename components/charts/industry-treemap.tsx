"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import type { BreakdownSlice } from "@/lib/portfolio/aggregations";
import { TOOLTIP_CONTENT_STYLE, moneyTooltipFormatter } from "./chart-tooltip";

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
    <div className="h-80 min-h-0 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <Treemap
          data={data}
          dataKey="value"
          aspectRatio={4 / 3}
          stroke="var(--background)"
          content={(props) => <TreemapNode {...(props as NodeProps)} />}
        >
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={moneyTooltipFormatter}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
