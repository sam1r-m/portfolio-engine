import { create } from "zustand";
import type { HoldingRow } from "@/lib/csv/schema";

interface PortfolioState {
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

// In-memory only by design &mdash; no persist middleware so holdings never
// survive a refresh. That's the privacy story.
export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: null,
  snapshotDate: null,
  fileName: null,
  setHoldings: (holdings, snapshotDate, fileName) =>
    set({ holdings, snapshotDate, fileName }),
  clear: () => set({ holdings: null, snapshotDate: null, fileName: null }),
}));
