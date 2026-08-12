import { NextResponse } from "next/server";
import { securityKey, yahooSymbol } from "@/lib/market/symbols";
import {
  UNCLASSIFIED,
  equityRegion,
  fundRegion,
  normalizeSector,
} from "@/lib/market/taxonomy";
import type { EtfProfile, Profile, ProfilesResponse } from "@/lib/market/types";
import {
  SymbolsBodySchema,
  dedupe,
  inBatches,
  yf,
} from "@/lib/market/yahoo.server";

export const runtime = "nodejs";

const MODULES = ["assetProfile", "topHoldings", "fundProfile", "price"] as const;

type SectorWeighting = Record<string, number | undefined>;

function toSectorWeights(raw: SectorWeighting[] | undefined) {
  const out: Record<string, number> = {};
  for (const entry of raw ?? []) {
    for (const [key, weight] of Object.entries(entry)) {
      if (typeof weight !== "number" || weight <= 0) continue;
      const label = normalizeSector(key);
      out[label] = (out[label] ?? 0) + weight * 100;
    }
  }
  return out;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = SymbolsBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const refs = dedupe(parsed.data.symbols);
  const profiles: Record<string, Profile> = {};
  const missing: string[] = [];

  await inBatches(refs, 8, async (ref) => {
    const key = securityKey(ref.symbol, ref.mic);
    try {
      const r = await yf.quoteSummary(yahooSymbol(ref.symbol, ref.mic), {
        modules: [...MODULES],
      });
      const top = r.topHoldings;
      const isFund = Boolean(top);
      const fundName = r.price?.longName ?? r.price?.shortName ?? null;

      const etf: EtfProfile | null = top
        ? {
            category: r.fundProfile?.categoryName ?? null,
            family: r.fundProfile?.family ?? null,
            sectorWeights: toSectorWeights(
              top.sectorWeightings as SectorWeighting[] | undefined,
            ),
            holdings: (top.holdings ?? [])
              .filter((h) => typeof h.holdingPercent === "number")
              .map((h) => ({
                symbol: h.symbol ?? "",
                name: h.holdingName ?? "",
                percent: (h.holdingPercent as number) * 100,
              })),
            stockPercent:
              typeof top.stockPosition === "number"
                ? top.stockPosition * 100
                : null,
            bondPercent:
              typeof top.bondPosition === "number"
                ? top.bondPosition * 100
                : null,
            cashPercent:
              typeof top.cashPosition === "number"
                ? top.cashPosition * 100
                : null,
          }
        : null;

      profiles[key] = {
        sector: isFund
          ? "Funds"
          : normalizeSector(r.assetProfile?.sector ?? null),
        industry: isFund
          ? (r.fundProfile?.categoryName ?? "Funds")
          : (r.assetProfile?.industry ?? UNCLASSIFIED),
        country: r.assetProfile?.country ?? null,
        region: isFund
          ? fundRegion(r.fundProfile?.categoryName, fundName)
          : equityRegion(r.assetProfile?.country),
        isFund,
        etf,
      };
    } catch {
      missing.push(key);
    }
  });

  const payload: ProfilesResponse = { profiles, missing };

  // Sector, industry, country and fund mandates change on the order of years.
  return NextResponse.json(payload, {
    headers: {
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
