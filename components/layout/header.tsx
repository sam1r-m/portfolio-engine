import Link from "next/link";
import { InsetRule } from "@/components/layout/inset-rule";

export function Header() {
  return (
    <header className="bg-background">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-4 sm:px-8">
        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-tight text-[var(--ws-charcoal)] sm:text-xl"
        >
          Portfolio Engine
        </Link>
      </div>
      <InsetRule />
    </header>
  );
}
