import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseHoldingsCsv } from "@/lib/csv/parser";
import {
  byAccount,
  byAssetClass,
  byCurrency,
  byGeography,
  bySector,
  enrichmentKey,
  portfolioTotals,
  topHoldings,
  type EnrichmentMap,
} from "./aggregations";

const FIXTURE = fs.readFileSync(
  path.join(__dirname, "../csv/fixtures/sample_holdings_report.csv"),
  "utf8",
);

const { rows } = parseHoldingsCsv(FIXTURE);

// tiny ad-hoc map so the sector tests have something to chew on
const enrichment: EnrichmentMap = new Map([
  [enrichmentKey("AAPL", "XNAS"), { sector: "Information Technology", industry: "Tech Hardware" }],
  [enrichmentKey("META", "XNAS"), { sector: "Communication Services", industry: "Interactive Media" }],
  [enrichmentKey("TD", "XTSE"), { sector: "Financials", industry: "Banks" }],
]);

describe("portfolio aggregations", () => {
  it("bucket percents on byAssetClass add up to exactly 100", () => {
    const slices = byAssetClass(rows);
    const sum = slices.reduce((acc, s) => acc + s.percent, 0);
    expect(sum).toBeCloseTo(100, 10);
  });

  it("byGeography splits into Canada / United States buckets", () => {
    const slices = byGeography(rows);
    const labels = slices.map((s) => s.label);
    expect(labels).toContain("Canada");
    expect(labels).toContain("United States");
  });

  it("byCurrency surfaces CAD and USD", () => {
    const slices = byCurrency(rows);
    const labels = slices.map((s) => s.label);
    expect(labels).toContain("CAD");
    expect(labels).toContain("USD");
  });

  it("byAccount finds the TFSA bucket", () => {
    const slices = byAccount(rows);
    expect(slices.some((s) => s.label === "TFSA")).toBe(true);
  });

  it("bySector groups ETFs into Diversified and EQUITYs by sector", () => {
    const slices = bySector(rows, enrichment);
    const labels = slices.map((s) => s.label);
    expect(labels).toContain("Diversified (ETF)");
    expect(labels).toContain("Information Technology");
  });

  it("topHoldings returns at most N holdings, sorted descending", () => {
    const top = topHoldings(rows, enrichment, 5);
    expect(top).toHaveLength(5);
    for (let i = 1; i < top.length; i++) {
      expect(
        top[i - 1].marketValueCad.gte(top[i].marketValueCad),
      ).toBe(true);
    }
  });

  it("portfolioTotals computes market value, book value, and unrealized P/L", () => {
    const totals = portfolioTotals(rows);
    expect(totals.holdingsCount).toBe(rows.length);
    expect(totals.marketValueCad.isPositive()).toBe(true);
    expect(totals.bookValueCad.isPositive()).toBe(true);
  });
});
