# portfolio-engine

wealthsimple portfolio/holdings analysis. 

The flow is essentially: 
csv lands in the browser (no sensitive info is stored/persisted across sessions, fully client-side) -> papaparse + zod + decimal.js (so fat money strings from the export do not get wrecked by floats) -> charts for sector, industry, geography, currency, asset class, account type. i added a tiny `/api/enrich` route that only ever sees `{symbol, mic}` pairs and returns sector/industry strings, so the ui is not stuck on "unclassified" for every name. etfs i care about map to a hand rolled sector weight json so the donut reflects underlying exposure instead of one giant etf slice. access at: portfolio.samirmd.com

## features

- full client side parse, no upload endpoint, no database
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

open http://localhost:3000 (if port is busy: `npx next dev -p 3001`)

`npm test` runs vitest

## stack

next.js, react, typescript, tailwind v4, shadcn/ui, zustand, papaparse, zod, decimal.js, recharts, vitest, yahoo-finance2

not affiliated with wealthsimple, not financial advice. mit license in `LICENSE.md`.
