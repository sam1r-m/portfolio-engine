/**
 * Yahoo reports equity sectors as title strings ("Financial Services") and fund
 * sector weights as snake_case keys ("financial_services"). Same taxonomy, two
 * spellings, so both normalise here and a stock and an ETF land in one bucket.
 */
export const SECTORS = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Consumer Cyclical",
  "Communication Services",
  "Industrials",
  "Consumer Defensive",
  "Energy",
  "Basic Materials",
  "Real Estate",
  "Utilities",
] as const;

export type Sector = (typeof SECTORS)[number];

export const UNCLASSIFIED = "Unclassified";

const SECTOR_BY_SLUG = new Map<string, string>(
  SECTORS.map((s) => [s.toLowerCase().replace(/[^a-z]/g, ""), s]),
);
SECTOR_BY_SLUG.set("realestate", "Real Estate");

export function normalizeSector(raw: string | undefined | null): string {
  if (!raw) return UNCLASSIFIED;
  const slug = raw.toLowerCase().replace(/[^a-z]/g, "");
  return SECTOR_BY_SLUG.get(slug) ?? raw;
}

export const CAP_BUCKETS = [
  "Mega cap",
  "Large cap",
  "Mid cap",
  "Small cap",
  "Micro cap",
  "Funds",
  UNCLASSIFIED,
] as const;

/** Thresholds in the reporting currency. Conventional US boundaries. */
export function capBucket(
  marketCapBase: number | undefined,
  isFund: boolean,
): string {
  if (isFund) return "Funds";
  if (!marketCapBase || marketCapBase <= 0) return UNCLASSIFIED;
  if (marketCapBase >= 200e9) return "Mega cap";
  if (marketCapBase >= 10e9) return "Large cap";
  if (marketCapBase >= 2e9) return "Mid cap";
  if (marketCapBase >= 300e6) return "Small cap";
  return "Micro cap";
}

export const REGIONS = [
  "United States",
  "Canada",
  "International developed",
  "Emerging markets",
  "Global",
] as const;

const COUNTRY_ALIASES: Record<string, string> = {
  "united states": "United States",
  usa: "United States",
  us: "United States",
  canada: "Canada",
};

export function equityRegion(country: string | undefined | null): string {
  if (!country) return UNCLASSIFIED;
  return COUNTRY_ALIASES[country.trim().toLowerCase()] ?? country.trim();
}

/**
 * Funds carry no country field, so the region comes from the Morningstar
 * category where Yahoo supplies one (Canadian listings usually return null),
 * then from the mandate spelled out in the fund's own name.
 */
export function fundRegion(
  categoryName: string | undefined | null,
  fundName: string | undefined | null,
): string {
  const category = (categoryName ?? "").toLowerCase();
  if (category) {
    if (/emerging/.test(category)) return "Emerging markets";
    if (/foreign|international|europe|japan|pacific|china|india/.test(category))
      return "International developed";
    if (/global|world/.test(category)) return "Global";
    if (/canad/.test(category)) return "Canada";
    return "United States";
  }

  const name = (fundName ?? "").toLowerCase();
  if (!name) return UNCLASSIFIED;
  if (/emerging/.test(name)) return "Emerging markets";
  // VEQT, XEQT, XGRO and the rest of the all-in-one family are world baskets.
  if (
    /all[- ]?equity|all[- ]?world|total world|global|acwi|(equity|growth|balanced|conservative|income)\s+etf portfolio/.test(
      name,
    )
  )
    return "Global";
  if (/eafe|ex[- ]north america|ex[- ]canada|developed ex|international|europe|japan/.test(name))
    return "International developed";
  if (/s&p 500|nasdaq|russell|total (u\.?s\.?|stock) market|\bu\.?s\.?\b|\bus\b|american/.test(name))
    return "United States";
  if (/tsx|canad|\bcad\b/.test(name)) return "Canada";
  return UNCLASSIFIED;
}

export const ASSET_CLASS_LABEL: Record<string, string> = {
  EQUITY: "Stocks",
  EXCHANGE_TRADED_FUND: "ETFs",
  MUTUAL_FUND: "Mutual funds",
  BOND: "Bonds",
  OPTION: "Options",
  CASH: "Cash",
};
