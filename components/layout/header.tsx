import Link from "next/link";
import { InsetRule } from "@/components/layout/inset-rule";

export function Header() {
  return (
    <header className="bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
        <Link
          href="/"
          className="font-serif text-xl font-bold tracking-tight text-[var(--ws-charcoal)]"
        >
          Portfolio Engine
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/" className="nav-lift hover:text-[var(--ws-charcoal)]">
            Home
          </Link>
          <a
            href="https://github.com/sam1r-m/portfolio-engine"
            target="_blank"
            rel="noreferrer"
            className="nav-lift hover:text-[var(--ws-charcoal)]"
          >
            GitHub
          </a>
        </nav>
      </div>
      <InsetRule />
    </header>
  );
}
