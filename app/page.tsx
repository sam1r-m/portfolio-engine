import type { ReactNode } from "react";
import { WealthsimpleWord } from "@/components/brand/wealthsimple-word";
import { AsciiCoinLoop } from "@/components/landing/ascii-coin-loop";
import { ContinueToDashboard } from "@/components/landing/continue-to-dashboard";
import { DemoPortfolioPanel } from "@/components/import/demo-portfolio-panel";
import { Dropzone } from "@/components/import/dropzone";
import { InsetRule } from "@/components/layout/inset-rule";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 sm:px-8">
      <section className="overflow-x-hidden py-14 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 items-start gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)] xl:gap-14">
          <div className="min-w-0">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--ws-black)] sm:text-5xl md:text-6xl">
              Portfolio Engine
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Side project built around the holdings export from{" "}
              <WealthsimpleWord />. Drop your own csv, or try the sample
              portfolio below — everything runs in the browser.
            </p>
            <div className="mt-10 max-w-xl space-y-4">
              <Dropzone />
              <DemoPortfolioPanel />
              <ContinueToDashboard />
            </div>
          </div>
          <div className="mt-14 min-w-0 w-full max-w-full max-lg:mx-auto max-lg:max-w-[min(100%,380px)] lg:mt-24 lg:max-w-none lg:-translate-x-10 lg:translate-y-2 lg:justify-self-end xl:-translate-x-14 xl:translate-y-3">
            <AsciiCoinLoop />
          </div>
        </div>
      </section>

      <InsetRule />

      <section className="py-16">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ws-black)] sm:text-3xl">
          Features
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          <Feature title="Local parsing">
            The csv never hits an upload url. PapaParse and Zod run in the tab,
            with Zustand holding the rows until you refresh the page.
          </Feature>
          <Feature title="ETF mapping">
            Static json weights for a few common, popular etfs (broad Canada
            and US index funds, plus a few thematic names). Your market value
            gets spread across those sector buckets within the charts.
          </Feature>
          <Feature title="Built on the export">
            Matches the columns in the uploaded{" "}
            <WealthsimpleWord /> holdings report. No broker links, no copy paste
            grid, no repetitive manual data entry.
          </Feature>
        </div>
      </section>

      <InsetRule />

      <section className="py-16">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ws-black)] sm:text-3xl">
          Holdings Retrieval Process
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          <Step n={1} title="Log in">
            Open <WealthsimpleWord /> on the web and go to your
            profile menu.
          </Step>
          <Step
            n={2}
            title={
              <>
                Documents, then{" "}
                <span className="underline underline-offset-[3px] decoration-[var(--ws-charcoal)]/50">
                  Holdings Report
                </span>
              </>
            }
            body="Pick the account (or all accounts) and the snapshot date you want."
          />
          <Step
            n={3}
            title="Download"
            body="Save the CSV and drop it in the box above. Parsing happens locally and securely."
          />
        </ol>
      </section>
    </main>
  );
}

function Feature({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pressable-surface rounded-xl border border-border/70 bg-card p-6">
      <h3 className="font-serif text-lg font-semibold tracking-tight text-[var(--ws-black)]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
  body,
}: {
  n: number;
  title: ReactNode;
  children?: React.ReactNode;
  body?: string;
}) {
  return (
    <li className="list-none">
      <p className="font-mono text-xs font-medium text-muted-foreground">
        {String(n).padStart(2, "0")}
      </p>
      <h3 className="mt-2 font-serif text-lg font-semibold tracking-tight text-[var(--ws-black)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body ?? children}
      </p>
    </li>
  );
}
