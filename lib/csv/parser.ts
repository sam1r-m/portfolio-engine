import Papa from "papaparse";
import { toDecimal } from "./money";
import {
  HOLDINGS_HEADERS,
  RawHoldingsRowSchema,
  type HoldingRow,
  type RawHoldingsRow,
  type SecurityType,
} from "./schema";

export interface ParsedHoldings {
  rows: HoldingRow[];
  /** From the "As of ..." footer row. */
  snapshotDate: Date | null;
}

const AS_OF_RE = /"?As of\s+([0-9]{4}-[0-9]{2}-[0-9]{2}[^"]*)"?\s*$/;

function extractAsOfFooter(text: string): {
  cleaned: string;
  snapshotDate: Date | null;
} {
  const lines = text.split(/\r?\n/);
  let snapshotDate: Date | null = null;
  const kept: string[] = [];
  for (const line of lines) {
    const match = line.match(AS_OF_RE);
    if (match) {
      const parsed = new Date(match[1]);
      if (!Number.isNaN(parsed.getTime())) {
        snapshotDate = parsed;
      }
      continue;
    }
    kept.push(line);
  }
  return { cleaned: kept.join("\n"), snapshotDate };
}

export class CsvFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvFormatError";
  }
}

export function parseHoldingsCsv(text: string): ParsedHoldings {
  const { cleaned, snapshotDate } = extractAsOfFooter(text);
  const result = Papa.parse<Record<string, string>>(cleaned, {
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

  const rows: HoldingRow[] = [];
  for (let i = 0; i < result.data.length; i++) {
    const raw = result.data[i];
    const parsed = RawHoldingsRowSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      // +2: header is line 1, array is 0-indexed
      throw new CsvFormatError(
        `Row ${i + 2}: ${issue?.path.join(".") ?? "row"} — ${issue?.message ?? "invalid"}`,
      );
    }
    if (parsed.data["Position Direction"] === "SHORT") {
      throw new CsvFormatError(
        `Row ${i + 2}: ${parsed.data["Symbol"]} is a SHORT position. ` +
          `The math here assumes long only.`,
      );
    }
    rows.push(toHoldingRow(parsed.data));
  }
  return { rows, snapshotDate };
}

function toHoldingRow(raw: RawHoldingsRow): HoldingRow {
  return {
    accountName: raw["Account Name"],
    accountType: raw["Account Type"],
    accountClassification: raw["Account Classification"],
    accountNumber: raw["Account Number"],
    symbol: raw["Symbol"],
    exchange: raw["Exchange"],
    mic: raw["MIC"],
    name: raw["Name"],
    securityType: raw["Security Type"] as SecurityType,
    quantity: toDecimal(raw["Quantity"]),
    positionDirection: raw["Position Direction"],
    marketPrice: toDecimal(raw["Market Price"]),
    marketPriceCurrency: raw["Market Price Currency"],
    bookValueCad: toDecimal(raw["Book Value (CAD)"]),
    bookValueCadCurrency: raw["Book Value Currency (CAD)"] || "CAD",
    bookValueMarket: toDecimal(raw["Book Value (Market)"]),
    bookValueMarketCurrency: raw["Book Value Currency (Market)"],
    marketValue: toDecimal(raw["Market Value"]),
    marketValueCurrency: raw["Market Value Currency"],
    marketUnrealizedReturns: toDecimal(raw["Market Unrealized Returns"]),
    marketUnrealizedReturnsCurrency: raw["Market Unrealized Returns Currency"],
  };
}
