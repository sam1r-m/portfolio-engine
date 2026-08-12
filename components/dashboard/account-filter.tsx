"use client";

import { Segmented } from "@/components/instrument/controls";
import type { HoldingRow } from "@/lib/csv/schema";

export const ALL_ACCOUNTS = "__all__";

export function AccountFilter({
  rows,
  value,
  onChange,
}: {
  rows: HoldingRow[];
  value: string;
  onChange: (v: string) => void;
}) {
  const types = Array.from(
    new Set(rows.map((r) => r.accountType).filter(Boolean)),
  ).sort();

  if (types.length < 2) return null;

  return (
    <Segmented
      label="Filter by account"
      value={value}
      onChange={onChange}
      options={[
        { value: ALL_ACCOUNTS, label: "All" },
        ...types.map((t) => ({ value: t, label: t })),
      ]}
    />
  );
}
