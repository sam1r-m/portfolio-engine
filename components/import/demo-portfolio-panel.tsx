"use client";

import { useState } from "react";
import { useLoadHoldings } from "@/components/import/use-load-holdings";
import {
  DEMO_HOLDINGS_CSV_PATH,
  DEMO_HOLDINGS_FILE_NAME,
  fetchDemoHoldingsCsv,
} from "@/lib/import/demo-holdings";

export function DemoPortfolioPanel() {
  const { loadFromText, loading } = useLoadHoldings();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  async function run() {
    setFetching(true);
    setFetchError(null);
    try {
      await loadFromText(await fetchDemoHoldingsCsv(), DEMO_HOLDINGS_FILE_NAME);
    } catch {
      setFetchError("The sample file could not be loaded.");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm text-ink-2">
      <button
        type="button"
        disabled={loading || fetching}
        onClick={() => void run()}
        className="ui border-b border-ink pb-0.5 text-xs font-semibold tracking-wide text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {fetching || loading ? "Loading sample…" : "Load a sample portfolio"}
      </button>
      <span className="text-xs">
        30 synthetic positions ·{" "}
        <a
          href={DEMO_HOLDINGS_CSV_PATH}
          download={DEMO_HOLDINGS_FILE_NAME}
          className="border-b border-rule-strong pb-px transition-colors hover:border-ink hover:text-ink"
        >
          download the csv
        </a>
      </span>
      {fetchError ? (
        <span className="text-xs text-neg">{fetchError}</span>
      ) : null}
    </div>
  );
}
