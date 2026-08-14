"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { signedMoney, signedPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex flex-wrap items-stretch overflow-hidden rounded-md border border-rule bg-panel",
        className,
      )}
    >
      {options.map((option, i) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "ui px-2.5 py-1.5 text-[11px] font-medium tracking-wide transition-colors",
              i > 0 && "border-l border-rule",
              active
                ? "bg-accent text-white"
                : "text-ink-2 hover:bg-panel-sunk hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex items-center gap-2 rounded-md border border-rule bg-panel px-2.5 py-1.5 text-[11px] text-ink-2 transition-colors hover:bg-panel-sunk hover:text-ink"
    >
      <span
        className={cn(
          "relative block h-3 w-6 rounded-full border transition-colors",
          checked ? "border-accent bg-accent" : "border-rule-strong bg-panel",
        )}
      >
        <span
          className={cn(
            "absolute top-px block size-[10px] rounded-full transition-transform",
            checked
              ? "translate-x-[13px] bg-white"
              : "translate-x-px bg-rule-strong",
          )}
        />
      </span>
      <span className="ui font-medium tracking-wide">{children}</span>
    </button>
  );
}

export function Delta({
  value,
  percent,
  size = "sm",
  showIcon = true,
  hidePercentOnSmall,
}: {
  /** Absolute change in CAD. Omit to show the percent alone. */
  value?: number;
  percent: number | null;
  size?: "sm" | "lg";
  showIcon?: boolean;
  /** Drops the percent on narrow screens where the column cannot hold both. */
  hidePercentOnSmall?: boolean;
}) {
  if (percent === null) {
    return <span className="num text-ink-3">–</span>;
  }
  const up = (value ?? percent) >= 0;
  const flat = (value ?? percent) === 0;
  const Icon = up ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "num inline-flex items-baseline gap-1.5 font-medium tabular-nums",
        size === "lg" ? "text-base" : "text-xs",
        flat ? "text-ink-3" : up ? "text-pos" : "text-neg",
      )}
    >
      {showIcon && !flat ? (
        <Icon
          aria-hidden
          className={cn("self-center", size === "lg" ? "size-4" : "size-3")}
          strokeWidth={2.5}
        />
      ) : null}
      {value !== undefined ? <span>{signedMoney(value)}</span> : null}
      <span
        className={cn(
          value !== undefined && "text-[0.85em] opacity-80",
          hidePercentOnSmall && "hidden sm:inline",
        )}
      >
        {signedPercent(percent)}
      </span>
    </span>
  );
}
