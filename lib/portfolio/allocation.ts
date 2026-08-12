import { UNCLASSIFIED } from "@/lib/market/taxonomy";
import type { Position } from "./positions";

export type DimensionId =
  | "sector"
  | "cap"
  | "region"
  | "assetClass"
  | "industry"
  | "currency"
  | "account";

export interface Dimension {
  id: DimensionId;
  label: string;
  /** ETF sector weights can dissolve a fund across this dimension. */
  supportsLookthrough: boolean;
}

export const DIMENSIONS: Dimension[] = [
  { id: "sector", label: "Sector", supportsLookthrough: true },
  { id: "cap", label: "Cap size", supportsLookthrough: false },
  { id: "region", label: "Region", supportsLookthrough: false },
  { id: "assetClass", label: "Asset class", supportsLookthrough: false },
  { id: "industry", label: "Industry", supportsLookthrough: false },
  { id: "currency", label: "Currency", supportsLookthrough: false },
  { id: "account", label: "Account", supportsLookthrough: false },
];

export interface Constituent {
  position: Position;
  /** Portion of the position sitting in this bucket, in CAD. */
  valueCad: number;
  /** Portion of the position in this bucket, 0–100. Always 100 unless split. */
  shareOfPosition: number;
}

export interface AllocationBucket {
  label: string;
  valueCad: number;
  percent: number;
  bookValueCad: number;
  gainCad: number;
  gainPercent: number;
  dayChangeCad: number;
  dayChangePercent: number | null;
  constituents: Constituent[];
}

function bucketKey(p: Position, dimension: DimensionId): string {
  switch (dimension) {
    case "sector":
      return p.sector || UNCLASSIFIED;
    case "industry":
      return p.industry || UNCLASSIFIED;
    case "cap":
      return p.capBucket;
    case "region":
      return p.region || UNCLASSIFIED;
    case "assetClass":
      return p.assetClass;
    case "currency":
      return p.currency || "Other";
    case "account":
      return p.accountType;
  }
}

/**
 * Splits one position across buckets. A fund with published sector weights is
 * dissolved into them; everything else lands whole in a single bucket.
 */
function splitPosition(
  p: Position,
  dimension: DimensionId,
  lookthrough: boolean,
): Array<{ label: string; share: number }> {
  if (dimension !== "sector" || !lookthrough) {
    return [{ label: bucketKey(p, dimension), share: 1 }];
  }
  const weights = p.etf?.sectorWeights;
  if (!weights) return [{ label: bucketKey(p, dimension), share: 1 }];

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total <= 0) return [{ label: bucketKey(p, dimension), share: 1 }];

  return Object.entries(weights).map(([label, weight]) => ({
    label,
    share: weight / total,
  }));
}

export function allocate(
  positions: Position[],
  dimension: DimensionId,
  lookthrough = true,
): AllocationBucket[] {
  const buckets = new Map<string, AllocationBucket>();
  let total = 0;

  for (const p of positions) {
    total += p.valueCad;
    for (const { label, share } of splitPosition(p, dimension, lookthrough)) {
      let bucket = buckets.get(label);
      if (!bucket) {
        bucket = {
          label,
          valueCad: 0,
          percent: 0,
          bookValueCad: 0,
          gainCad: 0,
          gainPercent: 0,
          dayChangeCad: 0,
          dayChangePercent: null,
          constituents: [],
        };
        buckets.set(label, bucket);
      }
      bucket.valueCad += p.valueCad * share;
      bucket.bookValueCad += p.bookValueCad * share;
      bucket.dayChangeCad += p.dayChangeCad * share;
      bucket.constituents.push({
        position: p,
        valueCad: p.valueCad * share,
        shareOfPosition: share * 100,
      });
    }
  }

  const out = [...buckets.values()];
  for (const b of out) {
    b.percent = total === 0 ? 0 : (b.valueCad / total) * 100;
    b.gainCad = b.valueCad - b.bookValueCad;
    b.gainPercent =
      b.bookValueCad === 0 ? 0 : (b.gainCad / b.bookValueCad) * 100;
    const previous = b.valueCad - b.dayChangeCad;
    b.dayChangePercent =
      previous === 0 || b.dayChangeCad === 0
        ? b.dayChangeCad === 0
          ? 0
          : null
        : (b.dayChangeCad / previous) * 100;
    b.constituents.sort((a, c) => c.valueCad - a.valueCad);
  }

  // Unclassified always sinks to the bottom; it is a gap, not a holding.
  return out.sort((a, b) => {
    if (a.label === UNCLASSIFIED) return 1;
    if (b.label === UNCLASSIFIED) return -1;
    return b.valueCad - a.valueCad;
  });
}

/** Share of portfolio value in the largest bucket, as a concentration read. */
export function concentration(positions: Position[], topN: number): number {
  const total = positions.reduce((a, p) => a + p.valueCad, 0);
  if (total === 0) return 0;
  const top = [...positions]
    .sort((a, b) => b.valueCad - a.valueCad)
    .slice(0, topN)
    .reduce((a, p) => a + p.valueCad, 0);
  return (top / total) * 100;
}
