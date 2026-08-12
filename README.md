# portfolio-engine

wealthsimple holdings analysis. the export tells you what you own; this tells
you what you're actually holding.

live at https://portfolio.samirmd.com

## what it does

drop the Holdings Report csv and it parses in the tab — papaparse + zod +
decimal.js, no upload endpoint, rows mirrored to sessionStorage so a refresh
keeps the dashboard. quantities, book values and account numbers never leave
the browser.

what the browser does send is ticker symbols, to three of its own routes:

- `/api/quotes` — live price, day change, market cap, live usd/cad
- `/api/profiles` — sector, industry, country for stocks; real sector weights
  and top holdings for any etf, straight from the fund's published data
- `/api/history` — daily closes for the basket, the fx pair and the s&p 500

everything downstream is computed in the tab.

## the parts worth having

**etf look-through against real weights.** a veqt position gets dissolved into
its 11 actual sector weights instead of sitting in one "etf" slice. the panel
tells you which fraction of which position landed in each bucket, and there's a
toggle to turn it off. no hand-maintained weights file — it's whatever the fund
publishes today.

**one allocation panel, seven ways.** sector, cap size, region, asset class,
industry, currency, account. rows expand into the holdings behind them.

**cap size** comes from live market cap converted to cad, bucketed at the
conventional boundaries. funds get their own bucket.

**basket over time.** today's share counts priced at historical closes and the
fx rate on each day, against the s&p 500 rebased to the same start. it is a
backtest of the current basket, not account history — the export has no
transactions — and it says so on the panel.

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

- shorts are rejected at parse time; the math assumes long only
- reporting currency is cad
- money stays `Decimal` through parsing because the export emits 30-digit values
- not affiliated with wealthsimple, not financial advice

mit, see `LICENSE.md`.
