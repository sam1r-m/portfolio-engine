import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"], validation: { logErrors: false } });
for (const s of ["AAPL", "VFV.TO", "BOGUSXYZ"]) {
  try {
    const r = await yf.quoteSummary(s, { modules: ["assetProfile", "topHoldings", "fundProfile"] });
    console.log(s, "OK", "sector=", r.assetProfile?.sector, "country=", r.assetProfile?.country,
      "hasTop=", !!r.topHoldings, "cat=", r.fundProfile?.categoryName, "fam=", r.fundProfile?.family);
  } catch (e) { console.log(s, "ERR", String(e.message).slice(0, 160)); }
}
const q = await yf.quote(["AAPL", "BOGUSXYZ", "VFV.TO"]).catch(e => { console.log("quote batch ERR", e.message.slice(0,200)); return null; });
console.log("batch len:", Array.isArray(q) ? q.length : q, Array.isArray(q) ? q.map(x=>x.symbol) : "");
