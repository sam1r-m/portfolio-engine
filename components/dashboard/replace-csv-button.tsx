"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/lib/store/portfolio";

export function ReplaceCsvButton() {
  const router = useRouter();
  const clear = usePortfolioStore((s) => s.clear);

  return (
    <Button
      type="button"
      variant="outline"
      className="pressable-surface shrink-0 border-[var(--ws-charcoal)]/25 bg-background font-medium text-[var(--ws-charcoal)] hover:bg-secondary"
      onClick={() => {
        clear();
        router.push("/");
      }}
    >
      Replace CSV
    </Button>
  );
}
