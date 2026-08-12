import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Registration marks at the corners — the panel reads as a measured plate. */
function CornerTicks() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {[
        "left-0 top-0 border-l border-t",
        "right-0 top-0 border-r border-t",
        "left-0 bottom-0 border-l border-b",
        "right-0 bottom-0 border-r border-b",
      ].map((pos) => (
        <span
          key={pos}
          className={cn("absolute size-2 border-ink/45", pos)}
        />
      ))}
    </span>
  );
}

export function Panel({
  title,
  meta,
  actions,
  children,
  className,
  bodyClassName,
  flush,
}: {
  title?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Body sits edge to edge; use for tables and charts that own their padding. */
  flush?: boolean;
}) {
  return (
    <section className={cn("relative border border-rule bg-panel", className)}>
      <CornerTicks />
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3 sm:px-5">
          <div className="flex items-baseline gap-3">
            {title ? <h2 className="label">{title}</h2> : null}
            {meta ? (
              <span className="num text-[11px] text-ink-3">{meta}</span>
            ) : null}
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </header>
      )}
      <div className={cn(flush ? "" : "px-4 py-4 sm:px-5 sm:py-5", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

export function Field({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "pos" | "neg";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="label">{label}</span>
      <span
        className={cn(
          "num text-[15px] font-medium tabular-nums",
          tone === "pos" && "text-pos",
          tone === "neg" && "text-neg",
        )}
      >
        {value}
      </span>
      {hint ? <span className="num text-[11px] text-ink-3">{hint}</span> : null}
    </div>
  );
}
