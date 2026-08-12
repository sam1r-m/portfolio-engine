"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HoldingRow } from "@/lib/csv/schema";
import type { HistoryRange, HistoryResponse } from "@/lib/market/types";
import { symbolRefs } from "./positions";
import type { FetchStatus } from "./use-market-data";

export const RANGES: HistoryRange[] = ["1M", "3M", "6M", "1Y", "5Y", "MAX"];

interface Slot {
  request: string;
  data: HistoryResponse | null;
}

export function useHistory(rows: HoldingRow[] | null, range: HistoryRange) {
  const symbols = useMemo(() => (rows ? symbolRefs(rows) : []), [rows]);
  const request = useMemo(() => {
    const fingerprint = symbols
      .map((s) => `${s.symbol}|${s.mic}`)
      .sort()
      .join(",");
    return fingerprint ? `${range}::${fingerprint}` : "";
  }, [symbols, range]);

  const [slot, setSlot] = useState<Slot>({ request: "", data: null });
  // Ranges already fetched stay in hand so switching back is instant and the
  // chart never collapses to a skeleton.
  const cache = useRef(new Map<string, HistoryResponse>());

  useEffect(() => {
    if (!request) return;
    const hit = cache.current.get(request);
    if (hit) {
      setSlot({ request, data: hit });
      return;
    }

    let cancelled = false;
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
        cache.current.set(request, json);
        setSlot({ request, data: json });
      })
      .catch(() => {
        if (!cancelled) setSlot({ request, data: null });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const status: FetchStatus = !request
    ? "idle"
    : slot.request !== request
      ? "loading"
      : slot.data
        ? "ready"
        : "error";

  // Hold the previous range's line while the next one loads.
  return { data: slot.data, status };
}
