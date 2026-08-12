import { AsciiCoinLoop } from "@/components/landing/ascii-coin-loop";
import { ContinueToDashboard } from "@/components/landing/continue-to-dashboard";
import { DemoPortfolioPanel } from "@/components/import/demo-portfolio-panel";
import { Dropzone } from "@/components/import/dropzone";

const PROCEDURE = [
  { step: "Wealthsimple", detail: "on the web, profile menu" },
  { step: "Documents", detail: "then Holdings Report" },
  { step: "Pick account + date", detail: "one account or all of them" },
  { step: "Download csv", detail: "drop it above" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[88rem] px-4 py-6 sm:px-6 sm:py-8">
      <div className="border border-rule bg-panel">
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule px-5 py-3 sm:px-7">
          <h1 className="text-sm font-semibold tracking-tight">
            Portfolio Engine
          </h1>
          <p className="num text-[11px] text-ink-3">
            Wealthsimple holdings report → live composition
          </p>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col justify-center border-b border-rule px-5 py-8 sm:px-7 sm:py-10 lg:border-b-0 lg:border-r">
            <p className="max-w-[46ch] text-[1.35rem] leading-[1.35] tracking-[-0.02em] sm:text-[1.6rem]">
              The export tells you what you own. This tells you what you are
              actually holding — after the funds are dissolved into their real
              sector weights, at today&rsquo;s prices and today&rsquo;s rate.
            </p>

            <div className="mt-9 space-y-4">
              <Dropzone />
              <DemoPortfolioPanel />
              <ContinueToDashboard />
            </div>
          </div>

          <div className="flex items-center justify-center overflow-hidden bg-panel-sunk px-5 py-8 sm:px-7">
            <AsciiCoinLoop />
          </div>
        </div>

        <ol className="grid border-t border-rule sm:grid-cols-2 lg:grid-cols-4">
          {PROCEDURE.map(({ step, detail }, i) => (
            <li
              key={step}
              className="border-b border-rule px-5 py-4 last:border-b-0 sm:px-7 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <span className="num text-[11px] font-medium text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-1.5 text-sm font-medium">{step}</p>
              <p className="mt-0.5 text-xs text-ink-2">{detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
