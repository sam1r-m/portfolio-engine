import type { HoldingRow } from "@/lib/csv/schema";
import {
  enrichmentKey,
  type EnrichmentMap,
} from "@/lib/portfolio/aggregations";
import { etfEntryFor, type EtfLookthrough } from "@/lib/portfolio/etf-lookthrough";

export interface PortfolioDataQuality {
  /** Count of rows with `securityType === "EQUITY"`. */
  equityRows: number;
  /** Equities that received a sector label from `/api/enrich`. */
  equitiesWithLabels: number;
  /** Count of ETF rows. */
  etfRows: number;
  /** ETFs that use the static sector look-through map. */
  etfsWithLookthrough: number;
}

export function portfolioDataQuality(
  rows: HoldingRow[],
  enrichment: EnrichmentMap,
  etfLookthrough: EtfLookthrough,
): PortfolioDataQuality {
  const equities = rows.filter((r) => r.securityType === "EQUITY");
  let withLabels = 0;
  for (const r of equities) {
    if (enrichment.has(enrichmentKey(r.symbol, r.mic))) withLabels += 1;
  }

  const etfs = rows.filter((r) => r.securityType === "EXCHANGE_TRADED_FUND");
  let etfMapped = 0;
  for (const r of etfs) {
    if (etfEntryFor(etfLookthrough, r.symbol, r.mic)) etfMapped += 1;
  }

  return {
    equityRows: equities.length,
    equitiesWithLabels: withLabels,
    etfRows: etfs.length,
    etfsWithLookthrough: etfMapped,
  };
}
