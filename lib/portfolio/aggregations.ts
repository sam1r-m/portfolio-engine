import { Decimal, toDecimal } from "@/lib/csv/money";
import type { Money } from "@/lib/csv/money";
import type { HoldingRow } from "@/lib/csv/schema";

export interface BreakdownSlice {
  label: string;
  value: Money;
  percent: number; // 0..100
}

export interface EnrichmentEntry {
  sector: string;
  industry: string;
}

/**
 * Keyed by `${symbol}|${mic}` so e.g. TSX-listed CM (CIBC) and a hypothetical
 * NYSE CM don't get smushed into the same bucket.
 */
export type EnrichmentMap = Map<string, EnrichmentEntry>;

export function enrichmentKey(symbol: string, mic: string): string {
  return `${symbol}|${mic}`;
}

// We don't have Market Value in CAD on the row, only in its market currency.
// For now we use a hardcoded rate -- gets replaced with a live one later.
const USD_TO_CAD_FALLBACK = new Decimal("1.36");

function marketValueCad(row: HoldingRow, usdToCad: Decimal): Money {
  if (row.marketValueCurrency === "CAD") return row.marketValue;
  if (row.marketValueCurrency === "USD") return row.marketValue.times(usdToCad);
  // anything else (rare) -- treat as already CAD-ish; better than crashing.
  return row.marketValue;
}

function bucketsToSlices(
  buckets: Map<string, Money>,
  total: Money,
): BreakdownSlice[] {
  const slices: BreakdownSlice[] = [];
  for (const [label, value] of buckets) {
    const percent = total.isZero()
      ? 0
      : value.div(total).times(100).toNumber();
    slices.push({ label, value, percent });
  }
  return slices.sort((a, b) => b.value.minus(a.value).toNumber());
}

function addTo(buckets: Map<string, Money>, key: string, amount: Money) {
  buckets.set(key, (buckets.get(key) ?? toDecimal(0)).plus(amount));
}

export function bySector(
  rows: HoldingRow[],
  enrichment: EnrichmentMap,
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): BreakdownSlice[] {
  const buckets = new Map<string, Money>();
  let total = toDecimal(0);
  for (const row of rows) {
    const value = marketValueCad(row, usdToCad);
    total = total.plus(value);
    if (row.securityType === "EXCHANGE_TRADED_FUND") {
      // Real ETF look-through comes later. Until then they ride together.
      addTo(buckets, "Diversified (ETF)", value);
      continue;
    }
    const sector =
      enrichment.get(enrichmentKey(row.symbol, row.mic))?.sector ??
      "Unclassified";
    addTo(buckets, sector, value);
  }
  return bucketsToSlices(buckets, total);
}

export function byIndustry(
  rows: HoldingRow[],
  enrichment: EnrichmentMap,
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): BreakdownSlice[] {
  const buckets = new Map<string, Money>();
  let total = toDecimal(0);
  for (const row of rows) {
    const value = marketValueCad(row, usdToCad);
    total = total.plus(value);
    if (row.securityType === "EXCHANGE_TRADED_FUND") {
      addTo(buckets, "Diversified (ETF)", value);
      continue;
    }
    const industry =
      enrichment.get(enrichmentKey(row.symbol, row.mic))?.industry ??
      "Unclassified";
    addTo(buckets, industry, value);
  }
  return bucketsToSlices(buckets, total);
}

const ASSET_CLASS_LABEL: Record<string, string> = {
  EQUITY: "Equity",
  EXCHANGE_TRADED_FUND: "ETF",
  MUTUAL_FUND: "Mutual Fund",
  BOND: "Bond",
  OPTION: "Option",
  CASH: "Cash",
};

export function byAssetClass(
  rows: HoldingRow[],
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): BreakdownSlice[] {
  const buckets = new Map<string, Money>();
  let total = toDecimal(0);
  for (const row of rows) {
    const value = marketValueCad(row, usdToCad);
    total = total.plus(value);
    const label = ASSET_CLASS_LABEL[row.securityType] ?? row.securityType;
    addTo(buckets, label, value);
  }
  return bucketsToSlices(buckets, total);
}

const US_MICS = new Set(["XNAS", "XNYS", "BATS", "ARCX", "XASE", "IEXG"]);
const CA_MICS = new Set(["XTSE", "XTSX", "XCNQ", "AEQL", "NEOE"]);

function geographyFor(mic: string): string {
  if (US_MICS.has(mic)) return "United States";
  if (CA_MICS.has(mic)) return "Canada";
  return "International";
}

export function byGeography(
  rows: HoldingRow[],
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): BreakdownSlice[] {
  const buckets = new Map<string, Money>();
  let total = toDecimal(0);
  for (const row of rows) {
    const value = marketValueCad(row, usdToCad);
    total = total.plus(value);
    addTo(buckets, geographyFor(row.mic), value);
  }
  return bucketsToSlices(buckets, total);
}

export function byCurrency(
  rows: HoldingRow[],
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): BreakdownSlice[] {
  const buckets = new Map<string, Money>();
  let total = toDecimal(0);
  for (const row of rows) {
    const value = marketValueCad(row, usdToCad);
    total = total.plus(value);
    const label = row.marketValueCurrency || "Other";
    addTo(buckets, label, value);
  }
  return bucketsToSlices(buckets, total);
}

export function byAccount(_rows: HoldingRow[]): BreakdownSlice[] {
  return [];
}
