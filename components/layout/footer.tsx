export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <p>
          Built by{" "}
          <a
            href="https://samirmd.com"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Samir
          </a>
          . Holdings never leave your browser.
        </p>
        <p>Not affiliated with Wealthsimple.</p>
      </div>
    </footer>
  );
}
