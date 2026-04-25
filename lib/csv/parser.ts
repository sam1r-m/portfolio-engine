import Papa from "papaparse";
import {
  HOLDINGS_HEADERS,
  type HoldingRow,
  type PositionDirection,
  type SecurityType,
} from "./schema";

export interface ParsedHoldings {
  rows: HoldingRow[];
}

export class CsvFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvFormatError";
  }
}

/**
 * Reads the WS Holdings Report CSV. We keep money values as raw strings here
 * &mdash; conversion to numbers happens later so we don't lose precision.
 */
export function parseHoldingsCsv(text: string): ParsedHoldings {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new CsvFormatError(
      `CSV parse failed: ${result.errors[0]?.message ?? "unknown error"}`,
    );
  }

  const fields = result.meta.fields ?? [];
  for (const header of HOLDINGS_HEADERS) {
    if (!fields.includes(header)) {
      throw new CsvFormatError(
        `Missing expected column "${header}". Is this really a Wealthsimple Holdings Report?`,
      );
    }
  }

  const rows = result.data.map(toHoldingRow);
  return { rows };
}

function toHoldingRow(raw: Record<string, string>): HoldingRow {
  return {
    accountName: raw["Account Name"] ?? "",
    accountType: raw["Account Type"] ?? "",
    accountClassification: raw["Account Classification"] ?? "",
    accountNumber: raw["Account Number"] ?? "",
    symbol: raw["Symbol"] ?? "",
    exchange: raw["Exchange"] ?? "",
    mic: raw["MIC"] ?? "",
    name: raw["Name"] ?? "",
    securityType: (raw["Security Type"] ?? "EQUITY") as SecurityType,
    quantity: raw["Quantity"] ?? "0",
    positionDirection: (raw["Position Direction"] ?? "LONG") as PositionDirection,
    marketPrice: raw["Market Price"] ?? "0",
    marketPriceCurrency: raw["Market Price Currency"] ?? "",
    bookValueCad: raw["Book Value (CAD)"] ?? "0",
    bookValueCadCurrency: raw["Book Value Currency (CAD)"] ?? "CAD",
    bookValueMarket: raw["Book Value (Market)"] ?? "0",
    bookValueMarketCurrency: raw["Book Value Currency (Market)"] ?? "",
    marketValue: raw["Market Value"] ?? "0",
    marketValueCurrency: raw["Market Value Currency"] ?? "",
    marketUnrealizedReturns: raw["Market Unrealized Returns"] ?? "0",
    marketUnrealizedReturnsCurrency:
      raw["Market Unrealized Returns Currency"] ?? "",
  };
}
