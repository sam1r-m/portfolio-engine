import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CsvFormatError, parseHoldingsCsv } from "./parser";

const FIXTURE = fs.readFileSync(
  path.join(__dirname, "fixtures/sample_holdings_report.csv"),
  "utf8",
);

describe("parseHoldingsCsv", () => {
  it("parses every row of the example holdings report", () => {
    const { rows } = parseHoldingsCsv(FIXTURE);
    // Sanity: there should be a bunch of rows and they should all be LONG
    expect(rows.length).toBeGreaterThan(20);
    expect(rows.every((r) => r.positionDirection === "LONG")).toBe(true);
  });

  it("pulls the snapshot date out of the as-of footer", () => {
    const { snapshotDate } = parseHoldingsCsv(FIXTURE);
    expect(snapshotDate).not.toBeNull();
    expect(snapshotDate?.getFullYear()).toBe(2026);
  });

  it("keeps full precision on those huge 30-digit values", () => {
    // GRGD in the fixture has Book Value 2758.920268754065581929388755
    const { rows } = parseHoldingsCsv(FIXTURE);
    const grgd = rows.find((r) => r.symbol === "GRGD");
    expect(grgd).toBeDefined();
    expect(grgd!.bookValueCad.toString()).toContain("2758.92026875406558");
  });

  it("throws when a required column is missing", () => {
    const broken = FIXTURE.split("\n");
    // nuke the Symbol column from the header
    broken[0] = broken[0].replace(/,Symbol,/, ",");
    expect(() => parseHoldingsCsv(broken.join("\n"))).toThrow(CsvFormatError);
  });

  it("rejects SHORT positions with a clear error", () => {
    const withShort = FIXTURE.replace(/"LONG"/, '"SHORT"');
    expect(() => parseHoldingsCsv(withShort)).toThrow(/SHORT position/);
  });
});
