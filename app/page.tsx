export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-serif text-5xl tracking-tight">
        See what your portfolio is actually made of.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Drop in your Wealthsimple holdings export and get the breakdowns
        Wealthsimple doesn&apos;t show you &mdash; sector, industry, geography,
        currency, account type. Everything runs in your browser.
      </p>

      {/* dropzone goes here once the parser is ready */}
      <div className="mt-12 rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        drop your holdings.csv here
      </div>
    </main>
  );
}
