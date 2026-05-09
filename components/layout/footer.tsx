import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
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
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <a
            href="https://github.com/sam1r-m/portfolio-engine"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <span>Not affiliated with Wealthsimple.</span>
        </div>
      </div>
    </footer>
  );
}
