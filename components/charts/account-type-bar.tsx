"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BreakdownSlice } from "@/lib/portfolio/aggregations";
import { CHART_PALETTE } from "./chart-palette";
import { BreakdownRichTooltip } from "./breakdown-rich-tooltip";

export function AccountTypeBar({ slices }: { slices: BreakdownSlice[] }) {
  const data = slices.map((s) => ({
    name: s.label,
    value: s.value.toNumber(),
    percent: s.percent,
    tooltipLines: s.tooltipLines,
  }));

  return (
    <div className="h-72 min-h-0 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            type="number"
            tickFormatter={(v) =>
              `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            }
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: "var(--foreground)", fontSize: 13 }}
            width={70}
          />
          <Tooltip
            cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
            content={<BreakdownRichTooltip />}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell
                key={`bar-${i}`}
                fill={CHART_PALETTE[i % CHART_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
