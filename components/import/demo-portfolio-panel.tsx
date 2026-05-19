"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WealthsimpleWord } from "@/components/brand/wealthsimple-word";
import { useLoadHoldings } from "@/components/import/use-load-holdings";
import { Button } from "@/components/ui/button";
import {
  DEMO_HOLDINGS_CSV_PATH,
  DEMO_HOLDINGS_FILE_NAME,
  fetchDemoHoldingsCsv,
} from "@/lib/import/demo-holdings";
import { parseHoldingsCsv } from "@/lib/csv/parser";
import { portfolioTotals } from "@/lib/portfolio/aggregations";

function formatCad(value: { toFixed: (n: number) => string }): string {
  const n = Number(value.toFixed(2));
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function DemoPortfolioPanel() {
  const { loadFromText, error, loading } = useLoadHoldings();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const ensureCsv = useCallback(async () => {
    if (csvText) return csvText;
    setFetching(true);
    setFetchError(null);
    try {
      const text = await fetchDemoHoldingsCsv();
      setCsvText(text);
      return text;
    } catch {
      setFetchError("Could not load the sample CSV.");
      return null;
    } finally {
      setFetching(false);
    }
  }, [csvText]);

  useEffect(() => {
    if (previewOpen && !csvText && !fetching) {
      void ensureCsv();
    }
  }, [previewOpen, csvText, fetching, ensureCsv]);

  const preview = useMemo(() => {
    if (!csvText) return null;
    try {
      const { rows, snapshotDate } = parseHoldingsCsv(csvText);
      const totals = portfolioTotals(rows);
      const sortedRows = [...rows].sort((a, b) =>
        b.marketValue.minus(a.marketValue).toNumber(),
      );
      return { rows, snapshotDate, totals, sortedRows };
    } catch {
      return null;
    }
  }, [csvText]);

  async function handleTrySample() {
    const text = await ensureCsv();
    if (text) await loadFromText(text, DEMO_HOLDINGS_FILE_NAME);
  }

  return (
    <div className="mt-6 w-full max-w-xl text-left">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          No <WealthsimpleWord /> export? Try a synthetic portfolio (~$143k).
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={loading || fetching}
            onClick={() => void handleTrySample()}
          >
            {loading ? "Loading…" : "Try sample portfolio"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={fetching}
            onClick={() => setPreviewOpen((o) => !o)}
          >
            {previewOpen ? "Hide preview" : "Preview CSV"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : null}
      {fetchError ? (
        <p className="mt-3 text-sm text-destructive">{fetchError}</p>
      ) : null}

      {previewOpen ? (
        <div className="pressable-surface mt-4 overflow-hidden rounded-xl border border-border/80 bg-card/80">
          {fetching && !csvText ? (
            <p className="p-4 text-sm text-muted-foreground">Loading preview…</p>
          ) : preview ? (
            <>
              <div className="border-b border-border/70 px-4 py-3 text-sm text-muted-foreground">
                <span className="font-medium text-[var(--ws-charcoal)]">
                  {preview.rows.length} holdings
                </span>
                {" · "}
                <span>
                  {formatCad(preview.totals.marketValueCad)} total (CAD, approx.)
                </span>
                {preview.snapshotDate ? (
                  <>
                    {" · "}
                    <span>
                      as of{" "}
                      {preview.snapshotDate.toLocaleDateString("en-CA", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </>
                ) : null}
              </div>
              <div className="max-h-56 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-card/95 text-muted-foreground">
                    <tr className="border-b border-border/60">
                      <th className="px-4 py-2 font-medium">Symbol</th>
                      <th className="hidden py-2 font-medium sm:table-cell">
                        Account
                      </th>
                      <th className="py-2 pr-4 text-right font-medium">
                        Market value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sortedRows.map((row) => (
                      <tr
                        key={`${row.symbol}-${row.accountNumber}`}
                        className="border-b border-border/40 last:border-0"
                      >
                        <td className="px-4 py-1.5 font-medium text-[var(--ws-black)]">
                          {row.symbol}
                          <span className="ml-1.5 font-normal text-muted-foreground">
                            {row.securityType === "EXCHANGE_TRADED_FUND"
                              ? "ETF"
                              : ""}
                          </span>
                        </td>
                        <td className="hidden px-2 py-1.5 text-muted-foreground sm:table-cell">
                          {row.accountType}
                        </td>
                        <td className="py-1.5 pr-4 text-right tabular-nums text-muted-foreground">
                          {row.marketValue.toString()} {row.marketValueCurrency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
                All {preview.rows.length} positions (synthetic). Full file:{" "}
                <a
                  href={DEMO_HOLDINGS_CSV_PATH}
                  download={DEMO_HOLDINGS_FILE_NAME}
                  className="underline underline-offset-2 hover:text-[var(--ws-charcoal)]"
                >
                  download sample csv
                </a>
              </p>
              <details className="border-t border-border/60">
                <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-muted-foreground hover:text-[var(--ws-charcoal)]">
                  View raw CSV
                </summary>
                <pre className="max-h-52 overflow-auto border-t border-border/50 bg-muted/30 p-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
                  {csvText}
                </pre>
              </details>
            </>
          ) : (
            <p className="p-4 text-sm text-destructive">
              Could not parse the sample file.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
