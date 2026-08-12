import pw from "/Users/samir/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js";
const { chromium } = pw;
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
console.log(await page.evaluate(() => {
  const a = document.querySelector('a[aria-label*="ASCII"]');
  const inner = a?.firstElementChild;
  const pre = inner?.firstElementChild;
  return JSON.stringify({
    colWidth: a?.parentElement?.clientWidth,
    anchorWidth: a?.clientWidth,
    anchorHeight: a?.clientHeight,
    preW: pre?.offsetWidth, preH: pre?.offsetHeight,
    transform: inner?.style.transform,
  });
}));
await b.close();
