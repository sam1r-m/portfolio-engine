"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/lib/store/portfolio";

/** The store sets skipHydration, so the client kicks it off here. */
export function PortfolioRehydrate() {
  useEffect(() => {
    void usePortfolioStore.persist.rehydrate();
  }, []);
  return null;
}
