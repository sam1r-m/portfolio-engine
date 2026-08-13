import { AsciiCoinLoop } from "@/components/landing/ascii-coin-loop";
import { ContinueToDashboard } from "@/components/landing/continue-to-dashboard";
import { DemoPortfolioPanel } from "@/components/import/demo-portfolio-panel";
import { Dropzone } from "@/components/import/dropzone";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-xl flex-col px-5 py-12 sm:py-16">
      <h1 className="sr-only">Portfolio Engine</h1>

      <AsciiCoinLoop />

      <div className="mt-10 space-y-3">
        <Dropzone />
        <ContinueToDashboard />
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <DemoPortfolioPanel />
        <p className="ui text-[11px] text-ink-3">
          Wealthsimple → Documents → Holdings Report
        </p>
      </div>
    </main>
  );
}
