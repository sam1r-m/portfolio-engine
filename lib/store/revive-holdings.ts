import { toDecimal } from "@/lib/csv/money";
import type { HoldingRow, SecurityType } from "@/lib/csv/schema";

function reviveHoldingRow(row: Record<string, unknown>): HoldingRow {
  return {
    accountName: String(row.accountName ?? ""),
    accountType: String(row.accountType ?? ""),
    accountClassification: String(row.accountClassification ?? ""),
    accountNumber: String(row.accountNumber ?? ""),
    symbol: String(row.symbol ?? ""),
    exchange: String(row.exchange ?? ""),
    mic: String(row.mic ?? ""),
    name: String(row.name ?? ""),
    securityType: String(row.securityType ?? "EQUITY") as SecurityType,
    quantity: toDecimal(row.quantity as string | number | null | undefined),
    positionDirection:
      row.positionDirection === "SHORT" ? "SHORT" : "LONG",
    marketPrice: toDecimal(row.marketPrice as string | number | null | undefined),
    marketPriceCurrency: String(row.marketPriceCurrency ?? ""),
    bookValueCad: toDecimal(row.bookValueCad as string | number | null | undefined),
    bookValueCadCurrency: String(row.bookValueCadCurrency ?? "CAD"),
    bookValueMarket: toDecimal(
      row.bookValueMarket as string | number | null | undefined,
    ),
    bookValueMarketCurrency: String(row.bookValueMarketCurrency ?? ""),
    marketValue: toDecimal(row.marketValue as string | number | null | undefined),
    marketValueCurrency: String(row.marketValueCurrency ?? ""),
    marketUnrealizedReturns: toDecimal(
      row.marketUnrealizedReturns as string | number | null | undefined,
    ),
    marketUnrealizedReturnsCurrency: String(
      row.marketUnrealizedReturnsCurrency ?? "",
    ),
  };
}

/** Restores Decimal fields after `sessionStorage` JSON round-trip. */
export function reviveHoldings(input: unknown): HoldingRow[] {
  if (!Array.isArray(input)) return [];
  return input.map((row) =>
    reviveHoldingRow(row as Record<string, unknown>),
  );
}
