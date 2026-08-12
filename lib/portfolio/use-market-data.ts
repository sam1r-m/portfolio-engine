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

/** Results carry the request they answered, so status is derived, not set. */
interface Slot<T> {
  request: string;
  data: T;
  failed: boolean;
}

const EMPTY_QUOTES: Slot<{
  quotes: Record<string, Quote>;
  usdCad: number | null;
  asOf: string | null;
}> = {
  request: "",
  data: { quotes: {}, usdCad: null, asOf: null },
  failed: false,
};

const EMPTY_PROFILES: Slot<Record<string, Profile>> = {
  request: "",
  data: {},
  failed: false,
};

function statusOf(slot: Slot<unknown>, request: string): FetchStatus {
  if (!request) return "idle";
  if (slot.request !== request) return "loading";
  return slot.failed ? "error" : "ready";
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
  const [nonce, setNonce] = useState(0);

  // Keyed on the set of tickers, not the rows array, so rebuilding the rows
  // does not refetch. The nonce is what a manual refresh moves.
  const request = useMemo(() => {
    const fingerprint = symbols
      .map((s) => `${s.symbol}|${s.mic}`)
      .sort()
      .join(",");
    return fingerprint ? `${nonce}::${fingerprint}` : "";
  }, [symbols, nonce]);

  const [quoteSlot, setQuoteSlot] = useState(EMPTY_QUOTES);
  const [profileSlot, setProfileSlot] = useState(EMPTY_PROFILES);

  useEffect(() => {
    if (!request) return;
    let cancelled = false;

    post<QuotesResponse>("/api/quotes", { symbols })
      .then((res) => {
        if (cancelled) return;
        setQuoteSlot({
          request,
          failed: false,
          data: { quotes: res.quotes, usdCad: res.usdCad, asOf: res.asOf },
        });
      })
      .catch(() => {
        if (!cancelled) setQuoteSlot({ ...EMPTY_QUOTES, request, failed: true });
      });

    post<ProfilesResponse>("/api/profiles", { symbols })
      .then((res) => {
        if (!cancelled) {
          setProfileSlot({ request, failed: false, data: res.profiles });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfileSlot({ ...EMPTY_PROFILES, request, failed: true });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    quotes: quoteSlot.data.quotes,
    profiles: profileSlot.data,
    usdCad: quoteSlot.data.usdCad,
    asOf: quoteSlot.data.asOf,
    quoteStatus: statusOf(quoteSlot, request),
    profileStatus: statusOf(profileSlot, request),
    refresh,
  };
}
