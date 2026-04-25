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

import { z } from "zod";
import type { Money } from "./money";

// Numeric strings can be huge (up to 30 digits past the decimal) so we just
// pattern-match instead of parseFloat-ing.
const numericString = z
  .string()
  .refine((s) => s === "" || /^-?\d+(\.\d+)?$/.test(s), {
    message: "expected a numeric value",
  });

/**
 * Zod schema for one raw row coming straight out of PapaParse. Catches
 * malformed/missing values before they hit decimal.js and blow up.
 */
export const RawHoldingsRowSchema = z.object({
  "Account Name": z.string(),
  "Account Type": z.string(),
  "Account Classification": z.string(),
  "Account Number": z.string(),
  "Symbol": z.string().min(1),
  "Exchange": z.string(),
  "MIC": z.string(),
  "Name": z.string(),
  "Security Type": z.string().min(1),
  "Quantity": numericString,
  "Position Direction": z.enum(["LONG", "SHORT"]),
  "Market Price": numericString,
  "Market Price Currency": z.string(),
  "Book Value (CAD)": numericString,
  "Book Value Currency (CAD)": z.string(),
  "Book Value (Market)": numericString,
  "Book Value Currency (Market)": z.string(),
  "Market Value": numericString,
  "Market Value Currency": z.string(),
  "Market Unrealized Returns": numericString,
  "Market Unrealized Returns Currency": z.string(),
});

export type RawHoldingsRow = z.infer<typeof RawHoldingsRowSchema>;

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
