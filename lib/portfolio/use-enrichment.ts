"use client";

import { useEffect, useState } from "react";
import type { HoldingRow } from "@/lib/csv/schema";
import { enrichmentKey, type EnrichmentMap } from "./aggregations";

export function useEnrichment(rows: HoldingRow[] | null): EnrichmentMap {
  const [map, setMap] = useState<EnrichmentMap>(() => new Map());

  useEffect(() => {
    if (!rows || rows.length === 0) return;

    // Only equities need sector enrichment -- ETFs go through look-through
    const tickers = [
      ...new Map(
        rows
          .filter((r) => r.securityType === "EQUITY")
          .map((r) => [enrichmentKey(r.symbol, r.mic), { symbol: r.symbol, mic: r.mic }]),
      ).values(),
    ];

    if (tickers.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/enrich", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tickers }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          enrichment: Record<string, { sector: string; industry: string }>;
        };
        if (cancelled) return;
        const next = new Map<string, { sector: string; industry: string }>();
        for (const [k, v] of Object.entries(data.enrichment)) next.set(k, v);
        setMap(next);
      } catch {
        // network problems shouldn't break the dashboard -- charts just
        // show "Unclassified" for missing tickers
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rows]);

  return map;
}
