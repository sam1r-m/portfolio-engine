"use client";

import { useState } from "react";
import { useLoadHoldings } from "@/components/import/use-load-holdings";
import {
  DEMO_HOLDINGS_FILE_NAME,
  fetchDemoHoldingsCsv,
} from "@/lib/import/demo-holdings";

export function DemoPortfolioPanel() {
  const { loadFromText, loading } = useLoadHoldings();
  const [failed, setFailed] = useState(false);
  const [fetching, setFetching] = useState(false);

  async function run() {
    setFetching(true);
    setFailed(false);
    try {
      await loadFromText(await fetchDemoHoldingsCsv(), DEMO_HOLDINGS_FILE_NAME);
    } catch {
      setFailed(true);
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-3">
      <button
        type="button"
        disabled={loading || fetching}
        onClick={() => void run()}
        className="ui border-b border-ink pb-0.5 text-xs text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {fetching || loading ? "Loading…" : "Try a sample portfolio"}
      </button>
      {failed ? (
        <span className="ui text-xs text-neg">Sample did not load</span>
      ) : null}
    </div>
  );
}
