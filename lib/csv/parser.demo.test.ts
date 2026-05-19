import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseHoldingsCsv } from "./parser";
import { portfolioTotals } from "@/lib/portfolio/aggregations";

const DEMO_CSV = fs.readFileSync(
  path.join(__dirname, "../../public/demo/sample_holdings_report.csv"),
  "utf8",
);

describe("public demo holdings csv", () => {
  it("parses and totals near $142,739 CAD", () => {
    const { rows, snapshotDate } = parseHoldingsCsv(DEMO_CSV);
    expect(rows.length).toBeGreaterThan(25);
    expect(snapshotDate?.getFullYear()).toBe(2026);
    const totals = portfolioTotals(rows);
    expect(Number(totals.marketValueCad.toFixed(0))).toBe(142739);
  });
});
