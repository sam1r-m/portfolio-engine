"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTypeBar } from "@/components/charts/account-type-bar";
import { AssetClassDonut } from "@/components/charts/asset-class-donut";
import { CurrencyDonut } from "@/components/charts/currency-donut";
import { GeographyDonut } from "@/components/charts/geography-donut";
import { IndustryTreemap } from "@/components/charts/industry-treemap";
import { SectorDonut } from "@/components/charts/sector-donut";
import {
  AccountFilter,
  ALL_ACCOUNTS,
} from "@/components/dashboard/account-filter";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { HoldingsTable } from "@/components/holdings/holdings-table";
import { usePortfolioStore } from "@/lib/store/portfolio";
import {
  byAccount,
  byAssetClass,
  byCurrency,
  byGeography,
  byIndustry,
  bySector,
  portfolioTotals,
  topHoldings,
  type EnrichmentMap,
} from "@/lib/portfolio/aggregations";
import { loadEtfLookthrough } from "@/lib/portfolio/etf-lookthrough";
import { useEnrichment } from "@/lib/portfolio/use-enrichment";

export default function DashboardPage() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const snapshotDate = usePortfolioStore((s) => s.snapshotDate);
  const router = useRouter();
  const [accountFilter, setAccountFilter] = useState<string>(ALL_ACCOUNTS);

  useEffect(() => {
    if (!holdings) router.replace("/");
  }, [holdings, router]);

  const enrichment: EnrichmentMap = useEnrichment(holdings);
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

  if (!holdings || !filtered || !data) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl tracking-tight">Your portfolio</h1>
        <AccountFilter
          rows={holdings}
          value={accountFilter}
          onChange={setAccountFilter}
        />
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
        <h2 className="font-serif text-2xl tracking-tight">Top holdings</h2>
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
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
