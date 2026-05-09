import { Dropzone } from "@/components/import/dropzone";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="py-24 sm:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          For Wealthsimple investors
        </p>
        <h1 className="mt-5 font-serif text-[3.5rem] leading-[1.02] tracking-[-0.02em] sm:text-[5.5rem]">
          The portfolio breakdown
          <br />
          <span className="italic text-muted-foreground">
            Wealthsimple doesn&apos;t show you.
          </span>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-[1.65] text-muted-foreground">
          Drop in your Holdings Report and see your real exposure by sector,
          industry, geography, currency and account. ETFs are dissolved into
          their underlying sectors. No account, no upload &mdash; nothing ever
          leaves your browser.
        </p>
        <div className="mt-10">
          <Dropzone />
        </div>
      </section>

      <section className="grid gap-10 border-t border-border/60 py-20 sm:grid-cols-3">
        <Feature title="Private by design">
          Parsing happens entirely in your browser. The server only ever sees
          public ticker symbols, never your positions or P/L.
        </Feature>
        <Feature title="ETF look-through">
          VEQT, XEQT, VFV and friends get dissolved into their underlying
          sectors so the chart reflects your actual exposure, not just &ldquo;ETF.&rdquo;
        </Feature>
        <Feature title="Built for the WS export">
          Reads the official Holdings Report CSV exactly as Wealthsimple emits
          it. No copy-paste, no manual entry, no broker connection.
        </Feature>
      </section>

      <section className="border-t border-border/60 py-20">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Getting the file
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl">
          Three clicks inside Wealthsimple.
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          <Step n={1} label="Open Wealthsimple">
            Log in on web or open the app and head to your profile menu.
          </Step>
          <Step n={2} label="Documents → Holdings Report">
            Pick the account (or &ldquo;All accounts&rdquo;) and the snapshot date.
          </Step>
          <Step n={3} label="Download the CSV">
            Drop it on the box above. Everything runs locally from there.
          </Step>
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
    <div>
      <h3 className="font-serif text-xl tracking-tight">{title}</h3>
      <p className="mt-3 leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Step({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="list-none">
      <p className="font-serif text-2xl tracking-tight text-muted-foreground">
        {String(n).padStart(2, "0")}
      </p>
      <h3 className="mt-2 font-serif text-lg tracking-tight">{label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </li>
  );
}
