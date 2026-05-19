"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CsvFormatError, parseHoldingsCsv } from "@/lib/csv/parser";
import { usePortfolioStore } from "@/lib/store/portfolio";

export function useLoadHoldings() {
  const router = useRouter();
  const setHoldings = usePortfolioStore((s) => s.setHoldings);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFromText = useCallback(
    async (text: string, fileName: string) => {
      setError(null);
      setLoading(true);
      try {
        const { rows, snapshotDate } = parseHoldingsCsv(text);
        setHoldings(rows, snapshotDate, fileName);
        router.push("/dashboard");
      } catch (err) {
        if (err instanceof CsvFormatError) {
          setError(err.message);
        } else {
          setError("Could not read that file. Try a real csv export.");
        }
      } finally {
        setLoading(false);
      }
    },
    [router, setHoldings],
  );

  const loadFromFile = useCallback(
    async (file: File) => loadFromText(await file.text(), file.name),
    [loadFromText],
  );

  return { loadFromText, loadFromFile, error, loading, clearError: () => setError(null) };
}
