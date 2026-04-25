/**
 * The 22 columns the WS Holdings Report ships with. Order matters &mdash;
 * we use this list to fail fast if WS ever changes the format on us.
 */
export const HOLDINGS_HEADERS = [
  "Account Name",
  "Account Type",
  "Account Classification",
  "Account Number",
  "Symbol",
  "Exchange",
  "MIC",
  "Name",
  "Security Type",
  "Quantity",
  "Position Direction",
  "Market Price",
  "Market Price Currency",
  "Book Value (CAD)",
  "Book Value Currency (CAD)",
  "Book Value (Market)",
  "Book Value Currency (Market)",
  "Market Value",
  "Market Value Currency",
  "Market Unrealized Returns",
  "Market Unrealized Returns Currency",
] as const;

export type HoldingsHeader = (typeof HOLDINGS_HEADERS)[number];

export type SecurityType =
  | "EQUITY"
  | "EXCHANGE_TRADED_FUND"
  | "MUTUAL_FUND"
  | "BOND"
  | "OPTION"
  | "CASH";

export type PositionDirection = "LONG" | "SHORT";

import type { Money } from "./money";

/**
 * One row of the parsed CSV. Numeric fields are Decimal because WS emits
 * 30-digit values that Number can't hold without rounding.
 */
export interface HoldingRow {
  accountName: string;
  accountType: string;
  accountClassification: string;
  accountNumber: string;
  symbol: string;
  exchange: string;
  mic: string;
  name: string;
  securityType: SecurityType;
  quantity: Money;
  positionDirection: PositionDirection;
  marketPrice: Money;
  marketPriceCurrency: string;
  bookValueCad: Money;
  bookValueCadCurrency: string;
  bookValueMarket: Money;
  bookValueMarketCurrency: string;
  marketValue: Money;
  marketValueCurrency: string;
  marketUnrealizedReturns: Money;
  marketUnrealizedReturnsCurrency: string;
}
