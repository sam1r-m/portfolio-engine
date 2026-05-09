import type { CSSProperties } from "react";

export const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  boxShadow: "0 8px 24px -12px rgba(0,0,0,0.15)",
};

export function moneyTooltipFormatter(
  value: unknown,
  _name: unknown,
  item: { payload?: { name?: string; percent?: number } } | undefined,
): [string, string] {
  const v = Number(value ?? 0);
  const pct = Number(item?.payload?.percent ?? 0);
  return [
    `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })} · ${pct.toFixed(1)}%`,
    String(item?.payload?.name ?? ""),
  ];
}
