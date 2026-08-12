import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseHoldingsCsv } from "./parser";
import { buildPositions, portfolioTotals } from "@/lib/portfolio/positions";

const DEMO_CSV = fs.readFileSync(
  path.join(__dirname, "../../public/demo/sample_holdings_report.csv"),
  "utf8",
);

describe("public demo holdings csv", () => {
  it("parses and totals against the export's own prices", () => {
    const { rows, snapshotDate } = parseHoldingsCsv(DEMO_CSV);
    expect(rows.length).toBeGreaterThan(25);
    expect(snapshotDate?.getFullYear()).toBe(2026);

    const positions = buildPositions({
      rows,
      quotes: {},
      profiles: {},
      usdCad: 1.36,
    });
    const totals = portfolioTotals(positions);
    expect(Math.round(totals.valueCad)).toBe(142739);
    expect(totals.livePositions).toBe(0);
  });
});
