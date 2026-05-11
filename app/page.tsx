import { WealthsimpleWord } from "@/components/brand/wealthsimple-word";
import { Dropzone } from "@/components/import/dropzone";
import { InsetRule } from "@/components/layout/inset-rule";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 sm:px-8">
      <section className="py-20 sm:py-28">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--ws-black)] sm:text-5xl md:text-6xl">
          Portfolio Engine
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Side project I wrote for my own holdings export from{" "}
          <WealthsimpleWord />. You grab the official report csv, drop it
          here, and the tables and charts run entirely in the browser. A
          small api route only ever sees public ticker keys when it needs
          sector or industry text. Your quantities and balances never get
          sent up. A handful of etfs I mapped manually split into sector
          slices so the donut is not one giant etf block.
        </p>
        <div className="mt-10 max-w-xl">
          <Dropzone />
        </div>
      </section>

      <InsetRule />

      <section className="grid gap-8 py-16 sm:grid-cols-3 sm:gap-6">
        <Feature title="Local parse">
          The csv never hits an upload url. PapaParse and zod run in the tab,
          then zustand holds the rows until you refresh.
        </Feature>
        <Feature title="Etf map">
          Static json weights for funds I actually cared about (veqt style
          blends, broad us names, a few themes). Your market value gets
          spread across those sector buckets for the chart.
        </Feature>
        <Feature title="Built on the export">
          Matches the columns in the{" "}
          <WealthsimpleWord /> holdings report. No broker link, no copy paste
          grid.
        </Feature>
      </section>

      <InsetRule />

      <section className="py-16">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ws-black)] sm:text-3xl">
          Where to get the csv
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          <Step n={1} title="Log in">
            Open <WealthsimpleWord /> on web or the app and go to your
            profile menu.
          </Step>
          <Step
            n={2}
            title="Documents, then Holdings Report"
            body="Pick the account or all accounts and the snapshot date you want."
          />
          <Step
            n={3}
            title="Download"
            body="Save the csv, then drop it in the box above. That is the whole input."
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
  title: string;
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
