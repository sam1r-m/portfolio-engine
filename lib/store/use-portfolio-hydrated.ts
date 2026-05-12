"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/lib/store/portfolio";

/** True after zustand `persist` has finished reading `sessionStorage`. */
export function usePortfolioHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    typeof window !== "undefined"
      ? usePortfolioStore.persist.hasHydrated()
      : false,
  );

  useEffect(() => {
    queueMicrotask(() => {
      if (usePortfolioStore.persist.hasHydrated()) setHydrated(true);
    });
    return usePortfolioStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
