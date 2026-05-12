import { Decimal, toDecimal } from "@/lib/csv/money";
import type { Money } from "@/lib/csv/money";
import type { HoldingRow } from "@/lib/csv/schema";
import { etfEntryFor, type EtfLookthrough } from "./etf-lookthrough";

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
  slices.sort((a, b) => b.value.minus(a.value).toNumber());
  // Each percent gets rounded independently so the tooltip total drifts to
  // like 99.9% or 100.1%. Push the rounding error onto the biggest slice
  // so the displayed numbers always sum to exactly 100.
  if (slices.length > 0) {
    const sumPercent = slices.reduce((acc, s) => acc + s.percent, 0);
    if (sumPercent > 0) {
      slices[0] = {
        ...slices[0],
        percent: slices[0].percent + (100 - sumPercent),
      };
    }
  }
  return slices;
}

function addTo(buckets: Map<string, Money>, key: string, amount: Money) {
  buckets.set(key, (buckets.get(key) ?? toDecimal(0)).plus(amount));
}

export function bySector(
  rows: HoldingRow[],
  enrichment: EnrichmentMap,
  etfLookthrough?: EtfLookthrough,
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): BreakdownSlice[] {
  const buckets = new Map<string, Money>();
  let total = toDecimal(0);
  for (const row of rows) {
    const value = marketValueCad(row, usdToCad);
    total = total.plus(value);

    if (row.securityType === "EXCHANGE_TRADED_FUND") {
      // Dissolve ETFs into their underlying sectors when we have data for them
      const entry = etfLookthrough
        ? etfEntryFor(etfLookthrough, row.symbol, row.mic)
        : undefined;
      if (entry) {
        for (const [sector, weight] of Object.entries(entry.sectorWeights)) {
          const slice = value.times(weight).div(100);
          addTo(buckets, sector, slice);
        }
        continue;
      }
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

export function byAccount(
  rows: HoldingRow[],
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): BreakdownSlice[] {
  const buckets = new Map<string, Money>();
  let total = toDecimal(0);
  for (const row of rows) {
    const value = marketValueCad(row, usdToCad);
    total = total.plus(value);
    addTo(buckets, row.accountType || "Other", value);
  }
  return bucketsToSlices(buckets, total);
}

export interface PortfolioTotals {
  marketValueCad: Money;
  bookValueCad: Money;
  unrealizedPlCad: Money;
  unrealizedPlPercent: number;
  holdingsCount: number;
}

export function portfolioTotals(
  rows: HoldingRow[],
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): PortfolioTotals {
  let marketValueCad = toDecimal(0);
  let bookValueCad = toDecimal(0);
  for (const row of rows) {
    marketValueCad = marketValueCad.plus(marketValueCad_(row, usdToCad));
    // bookValueCad is already CAD on the row, courtesy of WS
    bookValueCad = bookValueCad.plus(row.bookValueCad);
  }
  const unrealizedPlCad = marketValueCad.minus(bookValueCad);
  const unrealizedPlPercent = bookValueCad.isZero()
    ? 0
    : unrealizedPlCad.div(bookValueCad).times(100).toNumber();
  return {
    marketValueCad,
    bookValueCad,
    unrealizedPlCad,
    unrealizedPlPercent,
    holdingsCount: rows.length,
  };
}

// renamed export so we can call it from above without a forward-ref dance
const marketValueCad_ = marketValueCad;

export interface TopHolding {
  /** Stable across duplicate tickers (e.g. same ETF in two accounts). */
  rowKey: string;
  symbol: string;
  name: string;
  marketValueCad: Money;
  percent: number;
  unrealizedPlCad: Money;
  sector?: string;
}

export function topHoldings(
  rows: HoldingRow[],
  enrichment: EnrichmentMap,
  limit = 10,
  usdToCad: Decimal = USD_TO_CAD_FALLBACK,
): TopHolding[] {
  const total = rows.reduce(
    (acc, row) => acc.plus(marketValueCad(row, usdToCad)),
    toDecimal(0),
  );
  const ranked = rows
    .map<TopHolding>((row) => {
      const value = marketValueCad(row, usdToCad);
      const pl = row.marketUnrealizedReturnsCurrency === "USD"
        ? row.marketUnrealizedReturns.times(usdToCad)
        : row.marketUnrealizedReturns;
      return {
        rowKey: `${row.accountNumber}|${row.symbol}|${row.mic}`,
        symbol: row.symbol,
        name: row.name,
        marketValueCad: value,
        percent: total.isZero() ? 0 : value.div(total).times(100).toNumber(),
        unrealizedPlCad: pl,
        sector: enrichment.get(enrichmentKey(row.symbol, row.mic))?.sector,
      };
    })
    .sort((a, b) => b.marketValueCad.minus(a.marketValueCad).toNumber());
  return ranked.slice(0, limit);
}
