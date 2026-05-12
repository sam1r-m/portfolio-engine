"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTypeBar } from "@/components/charts/account-type-bar";
import { AssetClassDonut } from "@/components/charts/asset-class-donut";
import { CurrencyDonut } from "@/components/charts/currency-donut";
import { GeographyDonut } from "@/components/charts/geography-donut";
import { IndustryTreemap } from "@/components/charts/industry-treemap";
import { SectorDonut } from "@/components/charts/sector-donut";
import { DashboardBackHome } from "@/components/dashboard/dashboard-back-home";
import { DataQualityStrip } from "@/components/dashboard/data-quality-strip";
import { ReplaceCsvButton } from "@/components/dashboard/replace-csv-button";
import {
  AccountFilter,
  ALL_ACCOUNTS,
} from "@/components/dashboard/account-filter";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { HoldingsTable } from "@/components/holdings/holdings-table";
import { usePortfolioStore } from "@/lib/store/portfolio";
import { usePortfolioHydrated } from "@/lib/store/use-portfolio-hydrated";
import {
  byAccount,
  byAssetClass,
  byCurrency,
  byGeography,
  byIndustry,
  bySector,
  portfolioTotals,
  topHoldings,
} from "@/lib/portfolio/aggregations";
import { portfolioDataQuality } from "@/lib/portfolio/data-quality";
import { loadEtfLookthrough } from "@/lib/portfolio/etf-lookthrough";
import { useEnrichment } from "@/lib/portfolio/use-enrichment";

export default function DashboardPage() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const snapshotDate = usePortfolioStore((s) => s.snapshotDate);
  const router = useRouter();
  const hydrated = usePortfolioHydrated();
  const [accountFilter, setAccountFilter] = useState<string>(ALL_ACCOUNTS);

  useEffect(() => {
    if (!hydrated) return;
    if (!holdings) router.replace("/");
  }, [holdings, hydrated, router]);

  const { map: enrichment, status: enrichmentStatus } =
    useEnrichment(holdings);
  const etfLookthrough = useMemo(() => loadEtfLookthrough(), []);

  const filtered = useMemo(() => {
    if (!holdings) return null;
    if (accountFilter === ALL_ACCOUNTS) return holdings;
    return holdings.filter((r) => r.accountType === accountFilter);
  }, [holdings, accountFilter]);

  const data = useMemo(() => {
    if (!filtered) return null;
    return {
      totals: portfolioTotals(filtered),
      sector: bySector(filtered, enrichment, etfLookthrough),
      industry: byIndustry(filtered, enrichment),
      assetClass: byAssetClass(filtered),
      geography: byGeography(filtered),
      currency: byCurrency(filtered),
      account: byAccount(filtered),
      top: topHoldings(filtered, enrichment, 25),
    };
  }, [filtered, enrichment, etfLookthrough]);

  const quality = useMemo(() => {
    if (!filtered) return null;
    return portfolioDataQuality(filtered, enrichment, etfLookthrough);
  }, [filtered, enrichment, etfLookthrough]);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <p className="text-sm text-muted-foreground">Loading your session…</p>
      </main>
    );
  }

  if (!holdings || !filtered || !data || !quality) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <DashboardBackHome className="sm:mt-1" />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--ws-black)]">
                Your portfolio
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <ReplaceCsvButton />
                <AccountFilter
                  rows={holdings}
                  value={accountFilter}
                  onChange={setAccountFilter}
                />
              </div>
            </div>
            <DataQualityStrip
              enrichmentStatus={enrichmentStatus}
              quality={quality}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <StatTiles totals={data.totals} snapshotDate={snapshotDate} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ChartCard title="By sector">
          <SectorDonut slices={data.sector} />
        </ChartCard>
        <ChartCard title="By industry">
          <IndustryTreemap slices={data.industry} />
        </ChartCard>
        <ChartCard title="By asset class">
          <AssetClassDonut slices={data.assetClass} />
        </ChartCard>
        <ChartCard title="By geography">
          <GeographyDonut slices={data.geography} />
        </ChartCard>
        <ChartCard title="By currency">
          <CurrencyDonut slices={data.currency} />
        </ChartCard>
        <ChartCard title="By account">
          <AccountTypeBar slices={data.account} />
        </ChartCard>
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ws-black)]">
          Top holdings
        </h2>
        <div className="mt-4">
          <HoldingsTable rows={data.top} />
        </div>
      </div>
    </main>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="pressable-surface border border-border/70 ring-0">
      <CardHeader>
        <CardTitle className="font-serif text-xl font-semibold tracking-tight text-[var(--ws-black)]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
