# portfolio-engine

wealthsimple portfolio/holdings analysis. 

The flow is essentially: 
-> csv lands in the browser — PapaParse + zod + decimal.js in the tab (no upload endpoint for the full report; large money strings stay precise) 
-> zustand holds the rows; the same snapshot is mirrored in sessionStorage for that tab so a refresh keeps the dashboard; closing the tab or Replace CSV clears that copy 
-> charts for sector, industry, geography, currency, asset class, account type. i added a tiny `/api/enrich` route that only ever sees `{symbol, mic}` pairs and returns sector/industry strings. this is so that the ui is not stuck on "unclassified" for every ticker. 
-> popular etfs list have mappings to a hardcoded (for now) sector weight json so the chart reflects underlying exposure instead of one amalgamated etf slice. 

access at: https://portfolio.samirmd.com

## features

- full client-side parse, no database, no holdings upload endpoint; sessionStorage mirror per tab for refresh (cleared when you close the tab or replace the csv from the dashboard)
- six recharts views + sortable top holdings with p/l coloring
- etf sector decomposition from curated static weights layered on real market values
- serverless enrich: bundled `tickers.json` first, then yahoo-finance2 on node (vercel), optional fmp if you set `FMP_API_KEY`
- pure ts aggregations on decimals, percents adjusted so slices sum to 100 in the ui
- vitest on the csv parser and aggregation helpers
- account filter + snapshot footer date when the file has it
- shorts intentionally rejected at parse time for v1 (math assumes long only)

## run locally

```bash
npm install
npm run dev
```

open http://localhost:3000

`npm test` runs vitest

## stack

next.js, react, typescript, tailwind v4, shadcn/ui, zustand, papaparse, zod, decimal.js, recharts, vitest, yahoo-finance2

NOT affiliated with wealthsimple, NOT financial advice. just a little side project for a gap i found in the product that i wanted. 

mit license in `LICENSE.md`.
