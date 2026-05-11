import Link from "next/link";
import { WealthsimpleWord } from "@/components/brand/wealthsimple-word";
import { InsetRule } from "@/components/layout/inset-rule";

export function Footer() {
  return (
    <footer className="bg-background">
      <InsetRule />
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-8">
        <p>
          © 2026{" "}
          <a
            href="https://samirmd.com"
            target="_blank"
            rel="noreferrer"
            className="nav-lift font-medium text-[var(--ws-charcoal)] underline-offset-4 hover:underline"
          >
            Samir
          </a>
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/privacy"
            className="nav-lift hover:text-[var(--ws-charcoal)]"
          >
            Privacy
          </Link>
          <a
            href="https://github.com/sam1r-m/portfolio-engine"
            target="_blank"
            rel="noreferrer"
            className="nav-lift hover:text-[var(--ws-charcoal)]"
          >
            GitHub
          </a>
          <span>
            <span className="underline underline-offset-2">Not</span> affiliated with <WealthsimpleWord />.
       
          </span>
        </div>
      </div>
    </footer>
  );
}
