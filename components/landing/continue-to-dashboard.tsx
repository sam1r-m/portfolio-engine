"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePortfolioStore } from "@/lib/store/portfolio";
import { usePortfolioHydrated } from "@/lib/store/use-portfolio-hydrated";

export function ContinueToDashboard() {
  const hydrated = usePortfolioHydrated();
  const holdings = usePortfolioStore((s) => s.holdings);
  const fileName = usePortfolioStore((s) => s.fileName);

  if (!hydrated || !holdings?.length) return null;

  return (
    <Link
      href="/dashboard"
      className="group flex items-center justify-between gap-4 border border-ink bg-panel px-4 py-3 transition-colors hover:bg-ink hover:text-white"
    >
      <span className="ui min-w-0 truncate text-xs">
        {fileName ?? "holdings"} · {holdings.length} positions
      </span>
      <span className="ui flex shrink-0 items-center gap-1.5 text-xs">
        Open
        <ArrowRight aria-hidden className="size-3.5" strokeWidth={2} />
      </span>
    </Link>
  );
}
