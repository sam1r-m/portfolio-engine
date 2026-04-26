"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CsvFormatError, parseHoldingsCsv } from "@/lib/csv/parser";
import { usePortfolioStore } from "@/lib/store/portfolio";

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
        setError("Couldn't read that file. Is it really a CSV?");
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

      {error ? (
        <div className="mt-6 max-w-md rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive">
          <p className="font-medium">That doesn&apos;t look like a Wealthsimple Holdings Report.</p>
          <p className="mt-1 text-destructive/80">{error}</p>
          <p className="mt-2 text-xs text-destructive/70">
            Go to Wealthsimple &rarr; Documents &rarr; Holdings Report and
            download the CSV from there.
          </p>
        </div>
      ) : null}
    </div>
  );
}
