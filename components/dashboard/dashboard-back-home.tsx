"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardBackHome({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-[var(--ws-charcoal)] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_2px_8px_rgb(20_20_19/0.08)] transition-[box-shadow,transform] duration-200 hover:border-[var(--ws-charcoal)]/25 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.55),0_6px_18px_rgb(20_20_19/0.12)]",
        "motion-reduce:transition-none",
        className,
      )}
      style={{ perspective: "140px" }}
      aria-label="Back to home"
    >
      <span
        className={cn(
          "inline-flex origin-center transition-transform duration-300 ease-out will-change-transform",
          "group-hover:[transform:translateZ(10px)_rotateY(-18deg)]",
          "group-active:[transform:translateZ(2px)_rotateY(-6deg)_scale(0.96)]",
          "motion-reduce:transform-none motion-reduce:group-hover:transform-none",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <ArrowLeft
          className="size-5 drop-shadow-[0_1px_0_rgb(255_255_255/0.65)]"
          strokeWidth={2.25}
          aria-hidden
        />
      </span>
    </Link>
  );
}
