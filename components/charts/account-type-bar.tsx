"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BreakdownSlice } from "@/lib/portfolio/aggregations";
import { TOOLTIP_CONTENT_STYLE, moneyTooltipFormatter } from "./chart-tooltip";

export function AccountTypeBar({ slices }: { slices: BreakdownSlice[] }) {
  const data = slices.map((s) => ({
    name: s.label,
    value: s.value.toNumber(),
    percent: s.percent,
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
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={moneyTooltipFormatter}
          />
          <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
