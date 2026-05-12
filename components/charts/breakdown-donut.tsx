"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BreakdownSlice } from "@/lib/portfolio/aggregations";
import { CHART_PALETTE } from "./chart-palette";
import { TOOLTIP_CONTENT_STYLE, moneyTooltipFormatter } from "./chart-tooltip";

// Cycles CHART_PALETTE; more than five buckets wrap to keep contrast rhythm.

export function BreakdownDonut({
  slices,
  height = 288,
}: {
  slices: BreakdownSlice[];
  height?: number;
}) {
  const data = slices.map((s) => ({
    name: s.label,
    value: s.value.toNumber(),
    percent: s.percent,
  }));

  return (
    <div style={{ height }} className="w-full min-w-0 min-h-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={110}
            stroke="var(--background)"
            strokeWidth={2}
            paddingAngle={1}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={moneyTooltipFormatter}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
