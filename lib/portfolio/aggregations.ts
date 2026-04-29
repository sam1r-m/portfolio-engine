import type { HoldingRow } from "@/lib/csv/schema";
import type { Money } from "@/lib/csv/money";

export interface BreakdownSlice {
  label: string;
  value: Money;
  percent: number; // 0..100
}

// TODO: fill these in. For now just stubs so the dashboard skeleton compiles.

export function bySector(_rows: HoldingRow[]): BreakdownSlice[] {
  return [];
}

export function byIndustry(_rows: HoldingRow[]): BreakdownSlice[] {
  return [];
}

export function byAssetClass(_rows: HoldingRow[]): BreakdownSlice[] {
  return [];
}

export function byGeography(_rows: HoldingRow[]): BreakdownSlice[] {
  return [];
}

export function byCurrency(_rows: HoldingRow[]): BreakdownSlice[] {
  return [];
}

export function byAccount(_rows: HoldingRow[]): BreakdownSlice[] {
  return [];
}
