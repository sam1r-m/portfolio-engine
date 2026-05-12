"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/lib/store/portfolio";

/** Runs `persist.rehydrate()` once on the client (see `skipHydration` on the store). */
export function PortfolioRehydrate() {
  useEffect(() => {
    void usePortfolioStore.persist.rehydrate();
  }, []);
  return null;
}
