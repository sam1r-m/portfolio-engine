"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePortfolioStore } from "@/lib/store/portfolio";
import { usePortfolioHydrated } from "@/lib/store/use-portfolio-hydrated";
import { cn } from "@/lib/utils";

export function ContinueToDashboard({ className }: { className?: string }) {
  const hydrated = usePortfolioHydrated();
  const holdings = usePortfolioStore((s) => s.holdings);
  const fileName = usePortfolioStore((s) => s.fileName);

  if (!hydrated || !holdings?.length) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border/70 bg-card/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        You already have a portfolio loaded
        {fileName ? ` (${fileName})` : ""}. Data stays in this tab until you
        close it or replace the file.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center gap-1 self-start rounded-lg border border-[var(--ws-charcoal)]/20 bg-background px-3 py-2 text-sm font-medium text-[var(--ws-charcoal)] transition-colors hover:bg-secondary sm:self-auto"
      >
        Open dashboard
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
