"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { parseHoldingsCsv } from "@/lib/csv/parser";
import { usePortfolioStore } from "@/lib/store/portfolio";

export function Dropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const router = useRouter();
  const setHoldings = usePortfolioStore((s) => s.setHoldings);

  async function handleFile(file: File) {
    const text = await file.text();
    const { rows, snapshotDate } = parseHoldingsCsv(text);
    setHoldings(rows, snapshotDate, file.name);
    router.push("/dashboard");
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) await handleFile(file);
      }}
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-14 text-center transition-colors ${
        dragging
          ? "border-foreground bg-secondary/60"
          : "border-border/80 hover:bg-secondary/30"
      }`}
    >
      <p className="font-serif text-xl tracking-tight">
        Drop your holdings.csv here
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        or click to pick a file
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="mt-6"
        onClick={() => inputRef.current?.click()}
      >
        Choose file
      </Button>
    </div>
  );
}
