import etfs from "@/lib/data/etfs.json";
import { enrichmentKey } from "./aggregations";

export interface EtfEntry {
  name: string;
  sectorWeights: Record<string, number>;
}

export type EtfLookthrough = Map<string, EtfEntry>;

let cached: EtfLookthrough | null = null;

export function loadEtfLookthrough(): EtfLookthrough {
  if (cached) return cached;
  const m: EtfLookthrough = new Map();
  for (const [key, entry] of Object.entries(etfs as Record<string, EtfEntry>)) {
    m.set(key, entry);
  }
  cached = m;
  return m;
}

export function etfEntryFor(
  lookthrough: EtfLookthrough,
  symbol: string,
  mic: string,
): EtfEntry | undefined {
  return lookthrough.get(enrichmentKey(symbol, mic));
}
