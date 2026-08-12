import type { HoldingRow } from "@/lib/csv/schema";
import { exchangeLabel, securityKey } from "@/lib/market/symbols";
import {
  ASSET_CLASS_LABEL,
  UNCLASSIFIED,
  capBucket,
} from "@/lib/market/taxonomy";
import type { EtfProfile, Profile, Quote } from "@/lib/market/types";

/** Last-resort rate, only used when the live pair could not be fetched. */
export const USD_CAD_FALLBACK = 1.39;

export interface Position {
  /** Unique per row: the same ETF held in two accounts stays two positions. */
  key: string;
  securityKey: string;
  symbol: string;
  name: string;
  mic: string;
  exchange: string;
  accountType: string;
  accountName: string;
  securityType: string;
  assetClass: string;

  quantity: number;
  currency: string;
  price: number;
  /** Price came from a live quote rather than the export's snapshot. */
  livePrice: boolean;
  valueCad: number;
  bookValueCad: number;
  gainCad: number;
  gainPercent: number;
  dayChangePercent: number | null;
  dayChangeCad: number;

  sector: string;
  industry: string;
  region: string;
  capBucket: string;
  marketCapCad: number | null;
  etf: EtfProfile | null;
}

export interface PositionsInput {
  rows: HoldingRow[];
  quotes: Record<string, Quote>;
  profiles: Record<string, Profile>;
  usdCad: number | null;
}

export function symbolRefs(rows: HoldingRow[]) {
  const seen = new Map<string, { symbol: string; mic: string }>();
  for (const r of rows) {
    seen.set(securityKey(r.symbol, r.mic), { symbol: r.symbol, mic: r.mic });
  }
  return [...seen.values()];
}

export function buildPositions({
  rows,
  quotes,
  profiles,
  usdCad,
}: PositionsInput): Position[] {
  const rate = usdCad ?? USD_CAD_FALLBACK;
  const toCad = (amount: number, currency: string) =>
    currency === "USD" ? amount * rate : amount;

  return rows.map((row) => {
    const secKey = securityKey(row.symbol, row.mic);
    const quote = quotes[secKey];
    const profile = profiles[secKey];

    const quantity = row.quantity.toNumber();
    const currency = quote?.currency ?? row.marketValueCurrency ?? "CAD";
    const price = quote?.price ?? row.marketPrice.toNumber();
    const livePrice = Boolean(quote);

    const valueCad = livePrice
      ? toCad(quantity * price, currency)
      : toCad(row.marketValue.toNumber(), row.marketValueCurrency || "CAD");
    const bookValueCad = row.bookValueCad.toNumber();
    const gainCad = valueCad - bookValueCad;

    const dayChangePercent = quote?.changePercent ?? null;
    const previousValueCad =
      quote?.previousClose != null
        ? toCad(quantity * quote.previousClose, currency)
        : null;

    const isFund = profile?.isFund ?? row.securityType === "EXCHANGE_TRADED_FUND";
    const marketCapCad = quote?.marketCap
      ? toCad(quote.marketCap, currency)
      : null;

    return {
      key: `${row.accountNumber}|${secKey}`,
      securityKey: secKey,
      symbol: row.symbol,
      name: quote?.name ?? row.name,
      mic: row.mic,
      exchange: exchangeLabel(row.mic),
      accountType: row.accountType || "Other",
      accountName: row.accountName,
      securityType: row.securityType,
      assetClass: ASSET_CLASS_LABEL[row.securityType] ?? row.securityType,

      quantity,
      currency,
      price,
      livePrice,
      valueCad,
      bookValueCad,
      gainCad,
      gainPercent: bookValueCad === 0 ? 0 : (gainCad / bookValueCad) * 100,
      dayChangePercent,
      dayChangeCad: previousValueCad === null ? 0 : valueCad - previousValueCad,

      sector: profile?.sector ?? (isFund ? "Funds" : UNCLASSIFIED),
      industry: profile?.industry ?? UNCLASSIFIED,
      region: profile?.region ?? UNCLASSIFIED,
      capBucket: capBucket(marketCapCad ?? undefined, isFund),
      marketCapCad,
      etf: profile?.etf ?? null,
    };
  });
}

export interface Totals {
  valueCad: number;
  bookValueCad: number;
  gainCad: number;
  gainPercent: number;
  dayChangeCad: number;
  dayChangePercent: number;
  positions: number;
  securities: number;
  /** Positions priced from a live quote. */
  livePositions: number;
}

export function portfolioTotals(positions: Position[]): Totals {
  let valueCad = 0;
  let bookValueCad = 0;
  let dayChangeCad = 0;
  let livePositions = 0;
  for (const p of positions) {
    valueCad += p.valueCad;
    bookValueCad += p.bookValueCad;
    dayChangeCad += p.dayChangeCad;
    if (p.livePrice) livePositions += 1;
  }
  const gainCad = valueCad - bookValueCad;
  const previous = valueCad - dayChangeCad;
  return {
    valueCad,
    bookValueCad,
    gainCad,
    gainPercent: bookValueCad === 0 ? 0 : (gainCad / bookValueCad) * 100,
    dayChangeCad,
    dayChangePercent: previous === 0 ? 0 : (dayChangeCad / previous) * 100,
    positions: positions.length,
    securities: new Set(positions.map((p) => p.securityKey)).size,
    livePositions,
  };
}
