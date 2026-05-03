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

export function AccountTypeBar({ slices }: { slices: BreakdownSlice[] }) {
  const data = slices.map((s) => ({
    name: s.label,
    value: s.value.toNumber(),
    percent: s.percent,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
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
          <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
