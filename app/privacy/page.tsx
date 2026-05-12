import type { Metadata } from "next";
import { DashboardBackHome } from "@/components/dashboard/dashboard-back-home";

export const metadata: Metadata = {
  title: "Privacy · Portfolio Engine",
  description:
    "What leaves your browser when you use Portfolio Engine, and what does not.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
      <DashboardBackHome className="mb-8" />
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
          in a zustand store, and for that tab the app mirrors them in{" "}
          <code className="rounded bg-muted/80 px-1 py-0.5 text-sm">
            sessionStorage
          </code>{" "}
          so a normal refresh keeps the dashboard. That parse path never opens
          a network request.
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
          fingerprint you. Next dev mode may write to localStorage during hot
          reload; nothing there is tied to your portfolio by this app.
        </Section>

        <Section title="Source is public.">
          Open sourced on{" "}
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
