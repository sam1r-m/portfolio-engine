import { AsciiCoinLoop } from "@/components/landing/ascii-coin-loop";
import { ContinueToDashboard } from "@/components/landing/continue-to-dashboard";
import { DemoPortfolioPanel } from "@/components/import/demo-portfolio-panel";
import { Dropzone } from "@/components/import/dropzone";

const SPEC = [
  { label: "Funds", value: "split into real sector weights" },
  { label: "Prices", value: "live, with live fx" },
  { label: "Views", value: "sector, cap size, region" },
  { label: "File", value: "parsed in the tab" },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between gap-6 border-b border-rule pb-6">
        <div className="flex items-center gap-5 sm:gap-7">
          <AsciiCoinLoop
            className="w-24 shrink-0 sm:w-32"
            maxHeight={176}
            narrowMaxHeight={124}
          />
          <div>
            <h1 className="text-2xl leading-none tracking-tight sm:text-[2rem]">
              Portfolio Engine
            </h1>
            <p className="ui mt-2.5 text-[11px] text-ink-3">
              Wealthsimple holdings report
            </p>
          </div>
        </div>
        <a
          href="https://github.com/sam1r-m/portfolio-engine"
          target="_blank"
          rel="noreferrer"
          className="ui hidden text-[11px] text-ink-3 transition-colors hover:text-ink sm:block"
        >
          Source
        </a>
      </header>

      <div className="mt-8 space-y-3 sm:mt-10">
        <Dropzone
          footer={
            <>
              <DemoPortfolioPanel />
              <p className="ui text-[11px] text-ink-3">
                Wealthsimple → Documents → Holdings Report
              </p>
            </>
          }
        />
        <ContinueToDashboard />
      </div>

      <dl className="mt-10 grid gap-x-8 gap-y-6 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-4">
        {SPEC.map(({ label, value }) => (
          <div key={label}>
            <dt className="label">{label}</dt>
            <dd className="mt-2 text-[15px] leading-snug">{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
