"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WealthsimpleWord } from "@/components/brand/wealthsimple-word";
import { Button } from "@/components/ui/button";
import { CsvFormatError, parseHoldingsCsv } from "@/lib/csv/parser";
import { usePortfolioStore } from "@/lib/store/portfolio";
import { cn } from "@/lib/utils";

export function Dropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setHoldings = usePortfolioStore((s) => s.setHoldings);

  async function handleFile(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const { rows, snapshotDate } = parseHoldingsCsv(text);
      setHoldings(rows, snapshotDate, file.name);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof CsvFormatError) {
        setError(err.message);
      } else {
        setError("Could not read that file. Try a real csv export.");
      }
    }
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
      className={cn(
        "pressable-surface flex flex-col items-center justify-center rounded-xl border border-dashed border-border/90 bg-card/90 p-12 text-center sm:p-14",
        dragging
          ? "border-[var(--ws-charcoal)] bg-secondary/70"
          : "hover:border-[var(--ws-charcoal)]/40",
      )}
    >
      <p className="font-serif text-lg font-semibold tracking-tight text-[var(--ws-black)] sm:text-xl">
        Drop your holdings csv here
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        or click below to pick a file
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
        className="pressable-surface mt-6 border-[var(--ws-charcoal)]/25 bg-background font-medium text-[var(--ws-charcoal)] hover:bg-secondary"
        onClick={() => inputRef.current?.click()}
      >
        Choose file
      </Button>

      {error ? (
        <div className="mt-6 max-w-md rounded-lg border border-destructive/35 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive">
          <p className="font-medium">
            That does not look like a holdings export from{" "}
            <WealthsimpleWord />.
          </p>
          <p className="mt-1 text-destructive/85">{error}</p>
          <p className="mt-2 text-xs text-destructive/75">
            In <WealthsimpleWord />, open Documents, then Holdings Report, and
            download the csv from there.
          </p>
        </div>
      ) : null}
    </div>
  );
}
