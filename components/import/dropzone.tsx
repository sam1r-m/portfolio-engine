"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useLoadHoldings } from "@/components/import/use-load-holdings";
import { cn } from "@/lib/utils";

export function Dropzone({ footer }: { footer?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { loadFromFile, error, loading } = useLoadHoldings();

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
        if (file) await loadFromFile(file);
      }}
      className={cn(
        "border transition-colors duration-200",
        dragging
          ? "border-accent bg-accent-wash"
          : "border-rule bg-panel hover:border-rule-strong",
      )}
    >
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
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

        {error ? (
          <p className="ui max-w-md text-xs leading-relaxed text-neg">{error}</p>
        ) : null}
      </div>

      {footer ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-rule px-4 py-3 sm:px-5">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
