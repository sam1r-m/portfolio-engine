export interface SymbolRef {
  symbol: string;
  mic: string;
}

export interface Quote {
  currency: string;
  price: number;
  previousClose: number | null;
  changePercent: number | null;
  /** In the quote currency, not CAD. */
  marketCap: number | null;
  name: string | null;
  quoteType: string | null;
}

export interface QuotesResponse {
  asOf: string;
  /** CAD per USD. Null when the pair could not be fetched. */
  usdCad: number | null;
  quotes: Record<string, Quote>;
  missing: string[];
}

export interface EtfProfile {
  category: string | null;
  family: string | null;
  /** Sector label → percent of fund, 0–100. */
  sectorWeights: Record<string, number>;
  holdings: Array<{ symbol: string; name: string; percent: number }>;
  stockPercent: number | null;
  bondPercent: number | null;
  cashPercent: number | null;
}

export interface Profile {
  sector: string;
  industry: string;
  country: string | null;
  region: string;
  isFund: boolean;
  etf: EtfProfile | null;
}

export interface ProfilesResponse {
  profiles: Record<string, Profile>;
  missing: string[];
}

export type HistoryRange = "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

export interface HistoryResponse {
  /** Shared trading-day axis, epoch ms, ascending. */
  dates: number[];
  /** Security key → close on each date, forward filled, in the quote currency. */
  closes: Record<string, number[]>;
  currencies: Record<string, string>;
  /** CAD per USD on each date, forward filled. */
  usdCad: number[];
  benchmark: { symbol: string; label: string; closes: number[] } | null;
  missing: string[];
}
