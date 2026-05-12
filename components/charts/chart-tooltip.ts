import type { CSSProperties } from "react";

export const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  background: "var(--card)",
  border: "1px solid color-mix(in srgb, var(--ws-charcoal) 18%, transparent)",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--foreground)",
  boxShadow: "0 12px 32px -14px rgb(13 13 12 / 0.22)",
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
