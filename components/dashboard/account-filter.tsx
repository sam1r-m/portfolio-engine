"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  // Dedupe account types so the dropdown only shows the ones we actually have
  const accountTypes = Array.from(
    new Set(rows.map((r) => r.accountType).filter(Boolean)),
  ).sort();

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        Account
      </label>
      <Select value={value} onValueChange={(v) => onChange(v ?? ALL_ACCOUNTS)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_ACCOUNTS}>All accounts</SelectItem>
          {accountTypes.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
