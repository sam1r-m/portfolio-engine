import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"], validation: { logErrors: false } });
const syms = ["NVDA","AAPL","BRK.B","BRK-B","VFV.TO","XGD.TO","CHPS.TO"];
try {
  const r = await yf.quote(syms, {}, { validateResult: false });
  console.log("validateResult:false OK ->", r.map(x => `${x.symbol}:${x.regularMarketPrice}`).join(" "));
} catch (e) { console.log("ERR", String(e.message).slice(0,200)); }
