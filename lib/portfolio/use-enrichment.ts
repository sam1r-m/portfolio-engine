"use client";

import { useEffect, useState } from "react";
import type { HoldingRow } from "@/lib/csv/schema";
import { enrichmentKey, type EnrichmentMap } from "./aggregations";

export type EnrichmentFetchStatus = "idle" | "loading" | "done" | "error";

export function useEnrichment(rows: HoldingRow[] | null): {
  map: EnrichmentMap;
  status: EnrichmentFetchStatus;
} {
  const [map, setMap] = useState<EnrichmentMap>(() => new Map());
  const [status, setStatus] = useState<EnrichmentFetchStatus>("idle");

  useEffect(() => {
    if (!rows || rows.length === 0) {
      queueMicrotask(() => {
        setMap(new Map());
        setStatus("idle");
      });
      return;
    }

    const tickers = [
      ...new Map(
        rows
          .filter((r) => r.securityType === "EQUITY")
          .map((r) => [
            enrichmentKey(r.symbol, r.mic),
            { symbol: r.symbol, mic: r.mic },
          ]),
      ).values(),
    ];

    if (tickers.length === 0) {
      queueMicrotask(() => {
        setMap(new Map());
        setStatus("done");
      });
      return;
    }

    queueMicrotask(() => setStatus("loading"));
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/enrich", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tickers }),
        });
        if (!res.ok) {
          if (!cancelled) setStatus("error");
          return;
        }
        const data = (await res.json()) as {
          enrichment: Record<string, { sector: string; industry: string }>;
        };
        if (cancelled) return;
        const next = new Map<string, { sector: string; industry: string }>();
        for (const [k, v] of Object.entries(data.enrichment)) next.set(k, v);
        setMap(next);
        setStatus("done");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rows]);

  return { map, status };
}
