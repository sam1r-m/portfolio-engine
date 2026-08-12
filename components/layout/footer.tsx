export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[88rem] px-4 pb-6 sm:px-6 sm:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-rule pt-4 text-xs text-ink-2">
        <p>
          Built by{" "}
          <a
            href="https://samirmd.com"
            target="_blank"
            rel="noreferrer"
            className="border-b border-rule-strong pb-px text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Samir
          </a>
          .{" "}
          <a
            href="https://github.com/sam1r-m/portfolio-engine"
            target="_blank"
            rel="noreferrer"
            className="border-b border-rule-strong pb-px transition-colors hover:border-ink hover:text-ink"
          >
            Source
          </a>
          .
        </p>
        <p className="num text-[11px] text-ink-3">
          Prices and classifications via Yahoo Finance. Not affiliated with
          Wealthsimple.
        </p>
      </div>
    </footer>
  );
}
