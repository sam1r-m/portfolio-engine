"use client";

import type { PortfolioDataQuality } from "@/lib/portfolio/data-quality";
import type { EnrichmentFetchStatus } from "@/lib/portfolio/use-enrichment";
import { cn } from "@/lib/utils";

export function DataQualityStrip({
  enrichmentStatus,
  quality,
}: {
  enrichmentStatus: EnrichmentFetchStatus;
  quality: PortfolioDataQuality;
}) {
  const { equityRows, equitiesWithLabels, etfRows, etfsWithLookthrough } =
    quality;
  const etfUnmapped = etfRows - etfsWithLookthrough;
  const equityGap = equityRows - equitiesWithLabels;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-sm leading-relaxed text-muted-foreground",
        enrichmentStatus === "error" &&
          "border-destructive/30 bg-destructive/[0.06] text-destructive/90",
        enrichmentStatus === "loading" && "animate-pulse",
      )}
    >
      {enrichmentStatus === "loading" ? (
        <p>Loading sector labels for your stocks…</p>
      ) : enrichmentStatus === "error" ? (
        <p>
          Could not reach the enrich service. Stock lines may show as{" "}
          <span className="font-medium text-foreground/90">Unclassified</span>{" "}
          until the request succeeds.
        </p>
      ) : (
        <p>
          <span className="font-medium text-[var(--ws-charcoal)]">
            {equitiesWithLabels}
          </span>{" "}
          of{" "}
          <span className="font-medium text-[var(--ws-charcoal)]">
            {equityRows}
          </span>{" "}
          stock {equityRows === 1 ? "line has" : "lines have"} sector data from
          the server.
          {equityGap > 0 ? (
            <>
              {" "}
              <span className="font-medium text-[var(--ws-charcoal)]">
                {equityGap}
              </span>{" "}
              {equityGap === 1 ? "line is" : "lines are"} still unclassified
              (unknown ticker or not yet enriched).
            </>
          ) : null}
          {etfRows > 0 ? (
            <>
              {" "}
              ETFs:{" "}
              <span className="font-medium text-[var(--ws-charcoal)]">
                {etfsWithLookthrough}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--ws-charcoal)]">
                {etfRows}
              </span>{" "}
              {etfRows === 1 ? "row uses" : "rows use"} the static sector map;{" "}
              <span className="font-medium text-[var(--ws-charcoal)]">
                {etfUnmapped}
              </span>{" "}
              {etfUnmapped === 1 ? "shows" : "show"} as a broad basket in sector
              charts.
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
