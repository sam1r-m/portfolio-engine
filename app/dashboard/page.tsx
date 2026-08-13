"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BasketChart } from "@/components/charts/basket-chart";
import {
  AccountFilter,
  ALL_ACCOUNTS,
} from "@/components/dashboard/account-filter";
import { AllocationPanel } from "@/components/dashboard/allocation-panel";
import { DataBar } from "@/components/dashboard/data-bar";
import { ValueScale } from "@/components/dashboard/value-scale";
import { HoldingsTable } from "@/components/holdings/holdings-table";
import { Delta, Segmented, Toggle } from "@/components/instrument/controls";
import { Field, Panel } from "@/components/instrument/panel";
import { fullDate, money, percent } from "@/lib/format";
import type { HistoryRange } from "@/lib/market/types";
import { concentration } from "@/lib/portfolio/allocation";
import { basketSeries } from "@/lib/portfolio/backtest";
import { buildPositions, portfolioTotals } from "@/lib/portfolio/positions";
import { RANGES, useHistory } from "@/lib/portfolio/use-history";
import { useMarketData } from "@/lib/portfolio/use-market-data";
import { usePortfolioStore } from "@/lib/store/portfolio";
import { usePortfolioHydrated } from "@/lib/store/use-portfolio-hydrated";

export default function DashboardPage() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const snapshotDate = usePortfolioStore((s) => s.snapshotDate);
  const fileName = usePortfolioStore((s) => s.fileName);
  const clear = usePortfolioStore((s) => s.clear);
  const router = useRouter();
  const hydrated = usePortfolioHydrated();

  const [account, setAccount] = useState(ALL_ACCOUNTS);
  const [range, setRange] = useState<HistoryRange>("1Y");
  const [showBenchmark, setShowBenchmark] = useState(true);

  useEffect(() => {
    if (hydrated && !holdings) router.replace("/");
  }, [holdings, hydrated, router]);

  const market = useMarketData(holdings);
  const filteredRows = useMemo(() => {
    if (!holdings) return null;
    return account === ALL_ACCOUNTS
      ? holdings
      : holdings.filter((r) => r.accountType === account);
  }, [holdings, account]);

  const history = useHistory(filteredRows, range);

  const positions = useMemo(() => {
    if (!filteredRows) return [];
    return buildPositions({
      rows: filteredRows,
      quotes: market.quotes,
      profiles: market.profiles,
      usdCad: market.usdCad,
    });
  }, [filteredRows, market.quotes, market.profiles, market.usdCad]);

  const totals = useMemo(() => portfolioTotals(positions), [positions]);
  const series = useMemo(
    () => (history.data ? basketSeries(positions, history.data) : null),
    [positions, history.data],
  );

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-[88rem] px-4 py-16 sm:px-6">
        <p className="label">Reading session…</p>
      </main>
    );
  }
  if (!holdings || !filteredRows) return null;

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to import"
            className="flex size-8 items-center justify-center border border-rule bg-panel text-ink-2 transition-colors hover:border-ink hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              Portfolio Engine
            </h1>
            <p className="ui mt-0.5 text-[11px] text-ink-3">
              {fileName ?? "holdings"}
              {snapshotDate ? ` · export as of ${fullDate(snapshotDate)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AccountFilter rows={holdings} value={account} onChange={setAccount} />
          <button
            type="button"
            onClick={() => {
              clear();
              router.push("/");
            }}
            className="ui border border-rule bg-panel px-2.5 py-1.5 text-[11px] font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
          >
            Replace csv
          </button>
        </div>
      </div>

      <div className="mt-4">
        <DataBar
          positions={positions}
          usdCad={market.usdCad}
          asOf={market.asOf}
          quoteStatus={market.quoteStatus}
          profileStatus={market.profileStatus}
          onRefresh={market.refresh}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <Panel title="Market value" meta="CAD">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <p className="readout text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.92]">
              {money(totals.valueCad)}
            </p>
            <div className="pb-1.5">
              <p className="label mb-1.5">Today</p>
              <Delta
                value={totals.dayChangeCad}
                percent={totals.dayChangePercent}
                size="lg"
              />
            </div>
          </div>
          <div className="mt-7">
            <ValueScale
              marketValue={totals.valueCad}
              bookValue={totals.bookValueCad}
            />
          </div>
        </Panel>

        <Panel title="Shape">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Field label="Positions" value={totals.positions} />
            <Field label="Securities" value={totals.securities} />
            <Field
              label="Top 5 weight"
              value={percent(concentration(positions, 5), 0)}
              hint="of market value"
            />
            <Field
              label="Largest"
              value={
                [...positions].sort((a, b) => b.valueCad - a.valueCad)[0]
                  ?.symbol ?? "—"
              }
              hint={percent(concentration(positions, 1), 1)}
            />
          </dl>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel
          title="Basket over time"
          meta={
            series
              ? series.coverage < 99.5
                ? `${percent(series.coverage, 0)} of value priced`
                : undefined
              : undefined
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Toggle checked={showBenchmark} onChange={setShowBenchmark}>
                S&P 500
              </Toggle>
              <Segmented
                label="Time range"
                value={range}
                onChange={setRange}
                options={RANGES.map((r) => ({ value: r, label: r }))}
              />
            </div>
          }
        >
          {series ? (
            <>
              <BasketChart
                series={series}
                showBenchmark={showBenchmark}
                dimmed={history.status === "loading"}
              />
              <p className="mt-4 border-t border-rule pt-3 text-[13px] leading-relaxed text-ink-2">
                Your share counts today, priced at each day&rsquo;s close and
                converted at that day&rsquo;s rate. The export has no
                transactions in it, so this is what the basket you hold now
                would have been worth, not what the account actually did.
                {series.missing.length > 0
                  ? ` ${series.missing.length} ${series.missing.length === 1 ? "holding has" : "holdings have"} no price history, so ${series.missing.length === 1 ? "it sits" : "they sit"} outside the line.`
                  : ""}
              </p>
            </>
          ) : (
            <p className="py-16 text-center text-sm text-ink-2">
              {history.status === "error"
                ? "Price history did not load."
                : "Loading price history…"}
            </p>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <AllocationPanel positions={positions} />
      </div>

      <div className="mt-4">
        <Panel
          title="Holdings"
          meta={`${positions.length} ${positions.length === 1 ? "position" : "positions"}`}
          flush
        >
          <HoldingsTable positions={positions} />
        </Panel>
      </div>
    </main>
  );
}
