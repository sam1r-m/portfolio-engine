"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { HoldingRow } from "@/lib/csv/schema";
import type {
  Profile,
  ProfilesResponse,
  Quote,
  QuotesResponse,
} from "@/lib/market/types";
import { symbolRefs } from "./positions";

export type FetchStatus = "idle" | "loading" | "ready" | "error";

export interface MarketData {
  quotes: Record<string, Quote>;
  profiles: Record<string, Profile>;
  usdCad: number | null;
  asOf: string | null;
  quoteStatus: FetchStatus;
  profileStatus: FetchStatus;
  refresh: () => void;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.json() as Promise<T>;
}

export function useMarketData(rows: HoldingRow[] | null): MarketData {
  const symbols = useMemo(() => (rows ? symbolRefs(rows) : []), [rows]);
  // Refetch when the set of tickers changes, not when the rows array is rebuilt.
  const fingerprint = useMemo(
    () =>
      symbols
        .map((s) => `${s.symbol}|${s.mic}`)
        .sort()
        .join(","),
    [symbols],
  );

  const [nonce, setNonce] = useState(0);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [usdCad, setUsdCad] = useState<number | null>(null);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<FetchStatus>("idle");
  const [profileStatus, setProfileStatus] = useState<FetchStatus>("idle");

  useEffect(() => {
    if (!fingerprint) return;
    let cancelled = false;
    setQuoteStatus("loading");
    setProfileStatus("loading");

    post<QuotesResponse>("/api/quotes", { symbols })
      .then((data) => {
        if (cancelled) return;
        setQuotes(data.quotes);
        setUsdCad(data.usdCad);
        setAsOf(data.asOf);
        setQuoteStatus("ready");
      })
      .catch(() => !cancelled && setQuoteStatus("error"));

    post<ProfilesResponse>("/api/profiles", { symbols })
      .then((data) => {
        if (cancelled) return;
        setProfiles(data.profiles);
        setProfileStatus("ready");
      })
      .catch(() => !cancelled && setProfileStatus("error"));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    quotes,
    profiles,
    usdCad,
    asOf,
    quoteStatus,
    profileStatus,
    refresh,
  };
}
