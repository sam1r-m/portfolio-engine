# portfolio-engine

wealthsimple holdings analysis. the export lists what you bought. this shows
what you actually hold.

live at https://portfolio.samirmd.com

## what it does

drop the Holdings Report csv and it parses in the tab with papaparse, zod and
decimal.js. no upload endpoint. rows are mirrored to sessionStorage so a
refresh keeps the dashboard. quantities, book values and account numbers never
leave the browser.

what does go out is ticker symbols, to three of its own routes:

- `/api/quotes` for live price, day change, market cap and the usd/cad rate
- `/api/profiles` for sector, industry and country on stocks, plus real sector
  weights and top holdings on any etf
- `/api/history` for daily closes on the basket, the fx pair and the s&p 500

everything downstream is computed in the tab.

## the parts worth having

**fund look-through against real weights.** a veqt position gets split into its
11 actual sector weights instead of sitting in one "etf" slice. each line shows
which fraction of which position landed in the bucket, and there is a toggle to
turn it off. no hand-maintained weights file. it is whatever the fund publishes
today.

**one allocation panel, seven ways.** sector, cap size, region, asset class,
industry, currency, account. rows expand into the holdings behind them.

**cap size** from live market cap converted to cad, bucketed at the usual
boundaries. funds get their own bucket.

**basket over time.** today's share counts priced at historical closes and the
fx rate on each day, against the s&p 500 rebased to the same start. it is a
backtest of the basket you hold now, not account history, because the export
carries no transactions. the panel says so.

**live fx.** usd positions convert at the actual pair, not a constant.

## run it

```bash
npm install
npm run dev
```

`npm test` runs vitest over the parser, the taxonomy, the position model, the
allocation math and the backtest.

## stack

next.js, react, typescript, tailwind v4, zustand, papaparse, zod, decimal.js,
yahoo-finance2, vitest. charts are hand-built svg.

## notes

- shorts are rejected at parse time. the math assumes long only
- reporting currency is cad
- money stays `Decimal` through parsing because the export emits 30-digit values
- not affiliated with wealthsimple, not financial advice

mit, see `LICENSE.md`.
