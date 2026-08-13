export function securityKey(symbol: string, mic: string): string {
  return `${symbol}|${mic}`;
}

const MIC_SUFFIX: Record<string, string> = {
  XTSE: ".TO",
  XTSX: ".V",
  XCNQ: ".CN",
  NEOE: ".NE",
  AEQL: ".NE",
};

/**
 * Yahoo tags non-US listings with an exchange suffix and writes share classes
 * with a dash where the export uses a dot (BRK.B → BRK-B, CTC.A → CTC-A.TO).
 */
export function yahooSymbol(symbol: string, mic: string): string {
  const base = symbol.trim().toUpperCase().replace(/[\s.]+/g, "-");
  const suffix = MIC_SUFFIX[mic];
  return suffix ? `${base}${suffix}` : base;
}

export const US_MICS = new Set(["XNAS", "XNYS", "BATS", "ARCX", "XASE", "IEXG"]);
export const CA_MICS = new Set(["XTSE", "XTSX", "XCNQ", "AEQL", "NEOE"]);

export function exchangeLabel(mic: string): string {
  switch (mic) {
    case "XNAS":
      return "Nasdaq";
    case "XNYS":
      return "NYSE";
    case "ARCX":
      return "NYSE Arca";
    case "BATS":
      return "Cboe BZX";
    case "XASE":
      return "NYSE American";
    case "IEXG":
      return "IEX";
    case "XTSE":
      return "TSX";
    case "XTSX":
      return "TSX Venture";
    case "XCNQ":
      return "CSE";
    case "NEOE":
    case "AEQL":
      return "Cboe Canada";
    default:
      return mic || "–";
  }
}
