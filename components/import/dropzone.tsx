"use client";

import { useRef, useState } from "react";
import { useLoadHoldings } from "@/components/import/use-load-holdings";
import { cn } from "@/lib/utils";

/** Registration target — the file lands here. */
function Crosshair({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className={cn(
        "size-9 transition-colors duration-200",
        active ? "text-accent" : "text-rule-strong",
      )}
    >
      <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeWidth="1" />
      <path
        d="M20 0v12M20 28v12M0 20h12M28 20h12"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

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
          "relative flex flex-col items-center justify-center gap-4 border px-6 py-12 text-center transition-colors duration-200 sm:py-16",
          dragging
            ? "border-accent bg-accent-wash"
            : "border-rule bg-panel hover:border-rule-strong",
        )}
      >
        {[
          "left-0 top-0 border-l-2 border-t-2",
          "right-0 top-0 border-r-2 border-t-2",
          "left-0 bottom-0 border-l-2 border-b-2",
          "right-0 bottom-0 border-r-2 border-b-2",
        ].map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={cn(
              "absolute size-3.5 transition-colors duration-200",
              pos,
              dragging ? "border-accent" : "border-ink/50",
            )}
          />
        ))}

        <Crosshair active={dragging} />

        <div>
          <p className="text-base font-medium">
            {loading ? "Parsing…" : "Drop the holdings csv"}
          </p>
          <p className="mt-1.5 text-sm text-ink-2">
            Parsed in this tab. Only ticker symbols ever reach the network.
          </p>
        </div>

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
          className="num border border-ink bg-ink px-4 py-2 text-xs font-medium tracking-wide text-white transition-colors hover:bg-accent hover:border-accent disabled:opacity-50"
        >
          Choose file
        </button>
      </div>

      {error ? (
        <div className="mt-3 border border-neg/40 bg-panel px-4 py-3">
          <p className="text-sm font-medium text-neg">
            That is not a Wealthsimple holdings report.
          </p>
          <p className="num mt-1.5 text-xs leading-relaxed text-ink-2">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
