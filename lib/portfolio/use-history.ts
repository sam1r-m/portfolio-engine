"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HoldingRow } from "@/lib/csv/schema";
import type { HistoryRange, HistoryResponse } from "@/lib/market/types";
import { symbolRefs } from "./positions";
import type { FetchStatus } from "./use-market-data";

export const RANGES: HistoryRange[] = ["1M", "3M", "6M", "1Y", "5Y", "MAX"];

export function useHistory(rows: HoldingRow[] | null, range: HistoryRange) {
  const symbols = useMemo(() => (rows ? symbolRefs(rows) : []), [rows]);
  const fingerprint = useMemo(
    () =>
      symbols
        .map((s) => `${s.symbol}|${s.mic}`)
        .sort()
        .join(","),
    [symbols],
  );

  const [data, setData] = useState<HistoryResponse | null>(null);
  const [status, setStatus] = useState<FetchStatus>("idle");
  // Held so a range switch keeps the previous line on screen instead of
  // collapsing the chart to a skeleton.
  const cache = useRef(new Map<string, HistoryResponse>());

  useEffect(() => {
    if (!fingerprint) return;
    const cacheKey = `${range}::${fingerprint}`;
    const hit = cache.current.get(cacheKey);
    if (hit) {
      setData(hit);
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    fetch("/api/history", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ symbols, range }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<HistoryResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        cache.current.set(cacheKey, json);
        setData(json);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint, range]);

  return { data, status };
}
