import { describe, expect, it } from "vitest";
import { toDecimal } from "@/lib/csv/money";
import type { HoldingRow } from "@/lib/csv/schema";
import { capBucket, fundRegion, normalizeSector } from "@/lib/market/taxonomy";
import type { Profile, Quote } from "@/lib/market/types";
import { allocate, concentration } from "./allocation";
import { basketSeries } from "./backtest";
import { buildPositions, portfolioTotals } from "./positions";

function row(over: Partial<HoldingRow> & Pick<HoldingRow, "symbol">): HoldingRow {
  return {
    accountName: "TFSA",
    accountType: "TFSA",
    accountClassification: "Trade",
    accountNumber: "A1",
    exchange: "NASDAQ",
    mic: "XNAS",
    name: over.symbol,
    securityType: "EQUITY",
    quantity: toDecimal(10),
    positionDirection: "LONG",
    marketPrice: toDecimal(100),
    marketPriceCurrency: "USD",
    bookValueCad: toDecimal(1000),
    bookValueCadCurrency: "CAD",
    bookValueMarket: toDecimal(1000),
    bookValueMarketCurrency: "USD",
    marketValue: toDecimal(1000),
    marketValueCurrency: "USD",
    marketUnrealizedReturns: toDecimal(0),
    marketUnrealizedReturnsCurrency: "USD",
    ...over,
  } as HoldingRow;
}

const quote = (over: Partial<Quote>): Quote => ({
  currency: "USD",
  price: 100,
  previousClose: 100,
  changePercent: 0,
  marketCap: null,
  name: null,
  quoteType: "EQUITY",
  ...over,
});

const profile = (over: Partial<Profile>): Profile => ({
  sector: "Technology",
  industry: "Software",
  country: "United States",
  region: "United States",
  isFund: false,
  etf: null,
  ...over,
});

describe("taxonomy", () => {
  it("folds Yahoo's two sector spellings into one label", () => {
    expect(normalizeSector("financial_services")).toBe("Financial Services");
    expect(normalizeSector("Financial Services")).toBe("Financial Services");
    expect(normalizeSector("realestate")).toBe("Real Estate");
    expect(normalizeSector(undefined)).toBe("Unclassified");
  });

  it("buckets market caps at the conventional boundaries", () => {
    expect(capBucket(3e12, false)).toBe("Mega cap");
    expect(capBucket(50e9, false)).toBe("Large cap");
    expect(capBucket(5e9, false)).toBe("Mid cap");
    expect(capBucket(500e6, false)).toBe("Small cap");
    expect(capBucket(50e6, false)).toBe("Micro cap");
    expect(capBucket(3e12, true)).toBe("Funds");
    expect(capBucket(undefined, false)).toBe("Unclassified");
  });

  it("reads a fund's region from its category, then its name", () => {
    expect(fundRegion("Diversified Emerging Mkts", null)).toBe("Emerging markets");
    expect(fundRegion("Foreign Large Blend", null)).toBe("International developed");
    expect(fundRegion("Large Blend", null)).toBe("United States");
    expect(fundRegion(null, "Vanguard S&P 500 Index ETF")).toBe("United States");
    expect(fundRegion(null, "iShares Core MSCI EAFE IMI ETF")).toBe(
      "International developed",
    );
    expect(fundRegion(null, "iShares Core Equity ETF Portfolio")).toBe("Global");
    expect(fundRegion(null, "")).toBe("Unclassified");
  });
});

describe("buildPositions", () => {
  it("prices from the live quote and converts at the live rate", () => {
    const positions = buildPositions({
      rows: [row({ symbol: "AAPL" })],
      quotes: { "AAPL|XNAS": quote({ price: 120, previousClose: 100 }) },
      profiles: {},
      usdCad: 1.4,
    });
    // 10 shares x $120 USD x 1.4
    expect(positions[0].valueCad).toBeCloseTo(1680, 6);
    expect(positions[0].livePrice).toBe(true);
    expect(positions[0].dayChangeCad).toBeCloseTo(280, 6);
    expect(positions[0].gainCad).toBeCloseTo(680, 6);
  });

  it("falls back to the export's own value when no quote came back", () => {
    const positions = buildPositions({
      rows: [row({ symbol: "AAPL" })],
      quotes: {},
      profiles: {},
      usdCad: 1.4,
    });
    expect(positions[0].valueCad).toBeCloseTo(1400, 6);
    expect(positions[0].livePrice).toBe(false);
    expect(positions[0].dayChangeCad).toBe(0);
  });

  it("leaves CAD positions unconverted", () => {
    const positions = buildPositions({
      rows: [
        row({
          symbol: "SHOP",
          mic: "XTSE",
          marketValueCurrency: "CAD",
          marketValue: toDecimal(2000),
        }),
      ],
      quotes: {},
      profiles: {},
      usdCad: 1.4,
    });
    expect(positions[0].valueCad).toBeCloseTo(2000, 6);
  });
});

describe("allocate", () => {
  const rows = [
    row({ symbol: "AAPL" }),
    row({ symbol: "XOM" }),
    row({ symbol: "VOO", securityType: "EXCHANGE_TRADED_FUND", mic: "ARCX" }),
  ];
  const profiles: Record<string, Profile> = {
    "AAPL|XNAS": profile({}),
    "XOM|XNAS": profile({ sector: "Energy", industry: "Oil & Gas" }),
    "VOO|ARCX": profile({
      sector: "Funds",
      industry: "Large Blend",
      isFund: true,
      region: "United States",
      etf: {
        category: "Large Blend",
        family: "Vanguard",
        sectorWeights: { Technology: 40, Energy: 10, Healthcare: 50 },
        holdings: [],
        stockPercent: 100,
        bondPercent: 0,
        cashPercent: 0,
      },
    }),
  };
  const positions = buildPositions({ rows, quotes: {}, profiles, usdCad: 1 });

  it("dissolves a fund into its published sector weights", () => {
    const buckets = allocate(positions, "sector", true);
    const byLabel = Object.fromEntries(buckets.map((b) => [b.label, b]));
    // Each row is $1000. The fund's 40/10/50 split lands on top of the stocks.
    expect(byLabel.Technology.valueCad).toBeCloseTo(1400, 6);
    expect(byLabel.Energy.valueCad).toBeCloseTo(1100, 6);
    expect(byLabel.Healthcare.valueCad).toBeCloseTo(500, 6);
    expect(byLabel.Funds).toBeUndefined();
  });

  it("keeps the fund whole when look-through is off", () => {
    const buckets = allocate(positions, "sector", false);
    const byLabel = Object.fromEntries(buckets.map((b) => [b.label, b]));
    expect(byLabel.Funds.valueCad).toBeCloseTo(1000, 6);
    expect(byLabel.Technology.valueCad).toBeCloseTo(1000, 6);
  });

  it("never lets rounding push the buckets off the portfolio total", () => {
    const buckets = allocate(positions, "sector", true);
    const total = buckets.reduce((a, b) => a + b.valueCad, 0);
    expect(total).toBeCloseTo(3000, 6);
    expect(buckets.reduce((a, b) => a + b.percent, 0)).toBeCloseTo(100, 6);
  });

  it("records the share of a position that landed in each bucket", () => {
    const tech = allocate(positions, "sector", true).find(
      (b) => b.label === "Technology",
    )!;
    const fundLine = tech.constituents.find((c) => c.position.symbol === "VOO")!;
    expect(fundLine.shareOfPosition).toBeCloseTo(40, 6);
    expect(fundLine.valueCad).toBeCloseTo(400, 6);
  });

  it("sorts Unclassified last however large it is", () => {
    const withGap = buildPositions({
      rows: [...rows, row({ symbol: "WAT", quantity: toDecimal(1000) })],
      quotes: {},
      profiles,
      usdCad: 1,
    });
    const buckets = allocate(withGap, "sector", true);
    expect(buckets[buckets.length - 1].label).toBe("Unclassified");
  });

  it("measures concentration over the largest positions", () => {
    expect(concentration(positions, 1)).toBeCloseTo(100 / 3, 6);
    expect(concentration(positions, 3)).toBeCloseTo(100, 6);
  });
});

describe("basketSeries", () => {
  const positions = buildPositions({
    rows: [row({ symbol: "AAPL", quantity: toDecimal(2) })],
    quotes: {},
    profiles: {},
    usdCad: 1.4,
  });

  it("values today's share count at historical closes and rates", () => {
    const series = basketSeries(positions, {
      dates: [1, 2, 3],
      closes: { "AAPL|XNAS": [100, 110, 120] },
      currencies: { "AAPL|XNAS": "USD" },
      usdCad: [1.3, 1.35, 1.4],
      benchmark: { symbol: "^GSPC", label: "S&P 500", closes: [50, 55, 60] },
      missing: [],
    })!;

    expect(series.values).toEqual([260, 297, 336]);
    expect(series.changeCad).toBeCloseTo(76, 6);
    expect(series.coverage).toBeCloseTo(100, 6);
    // Benchmark is rebased onto the basket's opening value, so one axis serves both.
    expect(series.benchmark![0]).toBeCloseTo(260, 6);
    expect(series.benchmark![2]).toBeCloseTo(312, 6);
  });

  it("reports coverage when a holding has no history", () => {
    const mixed = buildPositions({
      rows: [row({ symbol: "AAPL" }), row({ symbol: "NOHIST" })],
      quotes: {},
      profiles: {},
      usdCad: 1,
    });
    const series = basketSeries(mixed, {
      dates: [1, 2],
      closes: { "AAPL|XNAS": [100, 100] },
      currencies: { "AAPL|XNAS": "USD" },
      usdCad: [1, 1],
      benchmark: null,
      missing: [],
    })!;
    expect(series.coverage).toBeCloseTo(50, 6);
    expect(series.missing).toEqual(["NOHIST|XNAS"]);
  });
});

describe("portfolioTotals", () => {
  it("counts securities separately from positions", () => {
    const positions = buildPositions({
      rows: [
        row({ symbol: "VOO", accountNumber: "A1" }),
        row({ symbol: "VOO", accountNumber: "A2" }),
        row({ symbol: "AAPL" }),
      ],
      quotes: {},
      profiles: {},
      usdCad: 1,
    });
    const totals = portfolioTotals(positions);
    expect(totals.positions).toBe(3);
    expect(totals.securities).toBe(2);
  });
});
