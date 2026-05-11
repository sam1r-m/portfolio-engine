import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · Portfolio Engine",
  description:
    "What leaves your browser when you use Portfolio Engine, and what does not.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Privacy
      </p>
      <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-[var(--ws-black)] sm:text-5xl">
        Your holdings stay in the browser.
      </h1>

      <div className="mt-10 space-y-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
        <Section title="The csv never leaves your machine.">
          When you drop the report on the upload area, it is parsed in the
          tab with the FileReader api, PapaParse, and a zod schema. Rows sit
          in a zustand store. That path never opens a network request.
        </Section>

        <Section title="The only server call is /api/enrich.">
          To print sector and industry on stocks, the client posts a list of
          public ticker symbols to a small node route on Vercel (example{" "}
          <code>{"{ symbol: \"AAPL\", mic: \"XNAS\" }"}</code>
          ). The response is plain text labels. No quantities, no balances, no
          account type, no p/l, no snapshot date.
        </Section>

        <Section title="No accounts or analytics.">
          No login, no tracking snippet, no third party font host that could
          fingerprint you. localStorage only has whatever Next dev mode writes
          during hot reload, nothing tied to your portfolio.
        </Section>

        <Section title="Source is public.">
          Code lives on{" "}
          <a
            href="https://github.com/sam1r-m/portfolio-engine"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--ws-charcoal)] underline underline-offset-4"
          >
            GitHub
          </a>
          . The enrich handler is a single file if you want to read the exact
          request shape.
        </Section>

        <Section title="Reload clears the store.">
          Everything is in memory. Close the tab or refresh and the rows are
          gone. Import the csv again whenever you want a fresh pass.
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
      <h2 className="font-serif text-xl font-semibold tracking-tight text-[var(--ws-black)] sm:text-2xl">
        {title}
      </h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}
