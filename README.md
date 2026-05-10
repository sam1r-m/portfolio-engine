# Portfolio Engine

A small client-side web app for analyzing a Wealthsimple portfolio &mdash;
sector, industry, geography, currency, asset-class and account-type
breakdowns straight from the official Holdings Report CSV.

The whole thing runs in your browser. The server only ever sees public
ticker symbols, never your positions or P/L.

Live at [portfolio.samirmd.com](https://portfolio.samirmd.com).

## Why

Wealthsimple's portfolio UI is great for the basics (market value, P/L,
account split), but it stops short of the kind of breakdowns you'd
actually want before rebalancing &mdash; sector exposure, industry
concentration, currency mix, ETF look-through. I built this as a tool I
actually use, and as a sample project for my Wealthsimple internship
application.

## Features

- Drag-and-drop CSV import &mdash; reads the official Wealthsimple
  Holdings Report format directly.
- Six chart views: sector donut, industry treemap, asset class donut,
  geography donut, currency donut, account-type bar.
- Sortable top-holdings table with unrealized P/L coloring.
- **ETF look-through**: VEQT, XEQT, VFV and ~25 other popular ETFs get
  dissolved into their underlying sector weights, so the sector chart
  reflects your true exposure instead of one giant "ETF" slice.
- Account filter dropdown (TFSA / RRSP / Non-Registered / etc.).
- Snapshot date pulled from the report footer.
- Arbitrary-precision math (`decimal.js`) so the totals match the CSV
  to the penny.

## Privacy story

- The CSV is parsed in the browser. It never gets uploaded.
- The only network call is `POST /api/enrich`, which sends a list of
  public ticker symbols (e.g. `[{symbol: "AAPL", mic: "XNAS"}]`) and
  receives back `{sector, industry}` for each. No values, no quantities,
  no account info ever leaves the browser.
- The enrich route is a Vercel Node serverless function that consults a bundled
  ticker map first, then falls back to Yahoo Finance (and optionally
  Financial Modeling Prep). Responses are cached at the edge for 24h.

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** for the component primitives
- **Zustand** for the in-memory holdings store
- **PapaParse** for CSV parsing
- **Zod** for schema validation on both the CSV and the API route
- **decimal.js** for financial-grade precision
- **Recharts** for the chart views
- **Vitest** for unit tests on the parser and aggregations
- **yahoo-finance2** (with FMP fallback) for sector/industry enrichment

## Local dev

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` and drop in your Holdings Report CSV.

To run the tests:

```bash
npm test
```

## Environment

Everything works out of the box without env vars. Yahoo Finance handles
the vast majority of tickers (including TSX). If you want the FMP
fallback for the long tail, set:

```bash
FMP_API_KEY=your_fmp_key
```

Free FMP key from [financialmodelingprep.com](https://financialmodelingprep.com).
The route degrades gracefully &mdash; missing tickers just show up as
"Unclassified."

## Getting your CSV

Inside Wealthsimple:

1. **Documents** &rarr; **Holdings Report**
2. Pick the account (or "All accounts") and the snapshot date
3. Download the CSV

That file is the input. Drop it on the upload box on the home page.

## Status

v1. The whole pipeline works end-to-end. Known limitations / roadmap:

- Industry look-through for ETFs (currently sector only).
- Short positions are explicitly rejected at parse time &mdash; they
  break the value math and weren't in my own portfolio to test against.
- USD &rarr; CAD conversion uses a fixed fallback rate. Real-time FX
  next.

## Disclaimer

Not affiliated with Wealthsimple. Not financial advice.

## License

MIT &mdash; see `LICENSE.md`.
