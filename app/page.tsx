import { AsciiCoinLoop } from "@/components/landing/ascii-coin-loop";
import { ContinueToDashboard } from "@/components/landing/continue-to-dashboard";
import { DemoPortfolioPanel } from "@/components/import/demo-portfolio-panel";
import { Dropzone } from "@/components/import/dropzone";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex items-center gap-5 border-b border-rule pb-6 sm:gap-7">
        <AsciiCoinLoop
          className="w-24 shrink-0 sm:w-32"
          maxHeight={176}
          narrowMaxHeight={124}
        />
        <div>
          <h1 className="text-[1.75rem] font-bold leading-[1.05] tracking-[-0.015em] sm:text-[2.5rem]">
            Portfolio Rebalancing Tool
          </h1>
          <p className="ui mt-3 text-[11px] text-ink-3">
            Strictly for Wealthsimple holdings reports.
          </p>
        </div>
      </header>

      <div className="mt-8 space-y-3 sm:mt-10">
        <Dropzone footer={<DemoPortfolioPanel />} />
        <ContinueToDashboard />
      </div>

      <p className="mt-10 border-t border-rule pt-6 text-[15px] text-ink-2">
        Get the file from Wealthsimple, under Documents, Holdings Report.
      </p>
    </main>
  );
}
