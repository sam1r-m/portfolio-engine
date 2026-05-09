import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · Portfolio Engine",
  description:
    "What Portfolio Engine sends to the server (and what it absolutely doesn't).",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Privacy
      </p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight">
        Your holdings stay in your browser.
      </h1>

      <div className="mt-10 space-y-8 text-lg leading-relaxed text-muted-foreground">
        <Section title="The CSV never leaves your machine.">
          When you drop your Holdings Report on the upload box, it&apos;s
          parsed entirely in your browser. The file is read with the
          FileReader API, parsed in memory with PapaParse, and held in a
          client-side Zustand store. The page itself is a static asset.
          Nothing in that path makes a network call out.
        </Section>

        <Section title="The only outbound request is to /api/enrich.">
          To label your equities by sector and industry, the dashboard
          posts a list of <em>public ticker symbols</em> to a Vercel Edge
          Function (e.g. <code>{"{symbol: \"AAPL\", mic: \"XNAS\"}"}</code>).
          The response is the corresponding sector and industry strings.
          That&apos;s it. No quantities, no values, no account types, no
          unrealized P/L, no snapshot date, no IP-derived identity, no
          authentication cookie.
        </Section>

        <Section title="No accounts, no tracking, no cookies.">
          There&apos;s no signup. There&apos;s no analytics script.
          There&apos;s no third-party fonts hotlink that could carry an
          identifier. The only thing in localStorage is whatever React /
          Next.js writes for hot reloading during dev &mdash; nothing
          related to your portfolio.
        </Section>

        <Section title="Open source.">
          The full source is on{" "}
          <a
            href="https://github.com/sam1r-m/portfolio-engine"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            GitHub
          </a>
          . The enrich route is ~80 lines of TypeScript; you can read
          exactly what gets sent in <code>app/api/enrich/route.ts</code>.
        </Section>

        <Section title="Reload = wipe.">
          The store is in-memory only. Close the tab or hit refresh and
          your holdings are gone. To re-analyze, just drop the CSV again.
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-2xl tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}
