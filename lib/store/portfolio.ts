import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { HoldingRow } from "@/lib/csv/schema";
import { reviveHoldings } from "@/lib/store/revive-holdings";

const STORAGE_KEY = "portfolio-engine-session-v1";

export interface PortfolioState {
  holdings: HoldingRow[] | null;
  snapshotDate: Date | null;
  fileName: string | null;
  setHoldings: (
    rows: HoldingRow[],
    snapshotDate: Date | null,
    fileName: string,
  ) => void;
  clear: () => void;
}

/** sessionStorage, not local: a refresh keeps the dashboard, closing the tab drops it. */
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: null,
      snapshotDate: null,
      fileName: null,
      setHoldings: (holdings, snapshotDate, fileName) =>
        set({ holdings, snapshotDate, fileName }),
      clear: () => set({ holdings: null, snapshotDate: null, fileName: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        holdings: s.holdings,
        snapshotDate: s.snapshotDate,
        fileName: s.fileName,
      }),
      version: 1,
      skipHydration: true,
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== "object")
          return currentState;
        const p = persistedState as Partial<PortfolioState>;
        try {
          return {
            ...currentState,
            holdings:
              p.holdings === undefined
                ? currentState.holdings
                : p.holdings === null
                  ? null
                  : Array.isArray(p.holdings)
                    ? reviveHoldings(p.holdings)
                    : currentState.holdings,
            snapshotDate: (() => {
              if (p.snapshotDate === undefined)
                return currentState.snapshotDate;
              if (p.snapshotDate === null) return null;
              if (p.snapshotDate instanceof Date) return p.snapshotDate;
              const d = new Date(String(p.snapshotDate));
              return Number.isNaN(d.getTime()) ? null : d;
            })(),
            fileName:
              p.fileName === undefined
                ? currentState.fileName
                : typeof p.fileName === "string" || p.fileName === null
                  ? p.fileName
                  : currentState.fileName,
          };
        } catch {
          return currentState;
        }
      },
    },
  ),
);
