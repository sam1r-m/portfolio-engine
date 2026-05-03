"use client";

import { BreakdownDonut } from "./breakdown-donut";
import type { BreakdownSlice } from "@/lib/portfolio/aggregations";

export function CurrencyDonut({ slices }: { slices: BreakdownSlice[] }) {
  return <BreakdownDonut slices={slices} />;
}
