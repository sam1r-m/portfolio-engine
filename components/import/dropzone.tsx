"use client";

import { useRef, useState } from "react";
import { useLoadHoldings } from "@/components/import/use-load-holdings";
import { cn } from "@/lib/utils";

export function Dropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { loadFromFile, error, loading } = useLoadHoldings();

  return (
    <div>
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
          if (file) await loadFromFile(file);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-5 border px-6 py-12 text-center transition-colors duration-200",
          dragging
            ? "border-accent bg-accent-wash"
            : "border-rule bg-panel hover:border-rule-strong",
        )}
      >
        <p className="text-xl">
          {loading ? "Reading…" : "Drop your holdings csv"}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={loading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await loadFromFile(file);
          }}
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="ui border border-ink bg-ink px-4 py-2 text-xs tracking-wide text-white transition-colors hover:border-accent hover:bg-accent disabled:opacity-50"
        >
          Choose file
        </button>
      </div>

      {error ? (
        <p className="ui mt-3 text-xs leading-relaxed text-neg">{error}</p>
      ) : null}
    </div>
  );
}
