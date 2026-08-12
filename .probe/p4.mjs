import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"], validation: { logErrors: false } });
const syms = ["NVDA","AAPL","MSFT","VFV.TO","VEQT.TO","GOOG","META","QQQ","TQQQ","ARKK","SHOP.TO","ATZ.TO","XEQT.TO","XAW.TO","TD.TO","RY.TO","ENB.TO","CNQ.TO","XGD.TO","ZEB.TO","AMD","AMZN","TSM","COST","BRK.B","CM.TO","CHPS.TO","INTC","LULU"];
try {
  const r = await yf.quote(syms);
  console.log("OK", r.length);
} catch (e) {
  console.log("BATCH ERR:", e.constructor.name, String(e.message).slice(0, 900));
}
// bisect
for (const s of syms) {
  try { await yf.quote(s); } catch (e) { console.log("BAD SYMBOL:", s, String(e.message).slice(0,120)); }
}
