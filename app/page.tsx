import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="py-24 sm:py-32">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          For Wealthsimple investors
        </p>
        <h1 className="mt-6 font-serif text-6xl leading-[1.05] tracking-tight sm:text-7xl">
          The portfolio breakdown
          <br />
          <span className="italic text-muted-foreground">
            Wealthsimple doesn&apos;t show you.
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
          Drop in your Holdings Report and see your real exposure by sector,
          industry, geography, currency and account. ETFs are dissolved into
          their underlying sectors. Nothing leaves your browser.
        </p>
        <div className="mt-10 flex items-center gap-3">
          <Button size="lg">Import holdings.csv</Button>
          <span className="text-sm text-muted-foreground">
            Or drop the file anywhere on the page
          </span>
        </div>
      </section>

      <section className="grid gap-12 border-t border-border/60 py-20 sm:grid-cols-3">
        <Feature title="Private by design">
          Parsing happens entirely in your browser. The server only ever sees
          public ticker symbols, never your positions.
        </Feature>
        <Feature title="ETF look-through">
          VEQT, XEQT, VFV and friends get dissolved into their underlying
          sectors so the chart reflects actual exposure.
        </Feature>
        <Feature title="Built for the WS export">
          Reads the official Holdings Report CSV directly &mdash; no copy
          paste, no manual entry.
        </Feature>
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
    <div>
      <h3 className="font-serif text-2xl tracking-tight">{title}</h3>
      <p className="mt-3 text-muted-foreground">{children}</p>
    </div>
  );
}
