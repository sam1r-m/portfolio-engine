"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTypeBar } from "@/components/charts/account-type-bar";
import { AssetClassDonut } from "@/components/charts/asset-class-donut";
import { CurrencyDonut } from "@/components/charts/currency-donut";
import { GeographyDonut } from "@/components/charts/geography-donut";
import { IndustryTreemap } from "@/components/charts/industry-treemap";
import { SectorDonut } from "@/components/charts/sector-donut";
import { usePortfolioStore } from "@/lib/store/portfolio";
import {
  byAccount,
  byAssetClass,
  byCurrency,
  byGeography,
  byIndustry,
  bySector,
  type EnrichmentMap,
} from "@/lib/portfolio/aggregations";

export default function DashboardPage() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const router = useRouter();

  useEffect(() => {
    if (!holdings) router.replace("/");
  }, [holdings, router]);

  // sector enrichment gets filled in by the edge route in a later commit
  const enrichment: EnrichmentMap = useMemo(() => new Map(), []);

  const slices = useMemo(() => {
    if (!holdings) return null;
    return {
      sector: bySector(holdings, enrichment),
      industry: byIndustry(holdings, enrichment),
      assetClass: byAssetClass(holdings),
      geography: byGeography(holdings),
      currency: byCurrency(holdings),
      account: byAccount(holdings),
    };
  }, [holdings, enrichment]);

  if (!holdings || !slices) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-4xl tracking-tight">Your portfolio</h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ChartCard title="By sector">
          <SectorDonut slices={slices.sector} />
        </ChartCard>
        <ChartCard title="By industry">
          <IndustryTreemap slices={slices.industry} />
        </ChartCard>
        <ChartCard title="By asset class">
          <AssetClassDonut slices={slices.assetClass} />
        </ChartCard>
        <ChartCard title="By geography">
          <GeographyDonut slices={slices.geography} />
        </ChartCard>
        <ChartCard title="By currency">
          <CurrencyDonut slices={slices.currency} />
        </ChartCard>
        <ChartCard title="By account">
          <AccountTypeBar slices={slices.account} />
        </ChartCard>
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
