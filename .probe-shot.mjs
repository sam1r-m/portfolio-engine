import pw from "/Users/samir/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js";
const { chromium } = pw;
const OUT = process.argv[2];
const b = await chromium.launch();

async function shoot(page, name, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
}

// Landing, desktop + mobile
const ctx = await b.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("console", m => m.type() === "error" && console.log("CONSOLE ERR:", m.text().slice(0,200)));
page.on("pageerror", e => console.log("PAGE ERR:", String(e).slice(0,300)));
await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
await shoot(page, "landing-desktop", 1440, 900);
await shoot(page, "landing-mobile", 390, 844);

// Load the sample and go to the dashboard
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /sample portfolio/i }).click();
await page.waitForURL("**/dashboard", { timeout: 20000 });
await page.waitForTimeout(9000);
await shoot(page, "dash-desktop", 1440, 1000);
await shoot(page, "dash-mobile", 390, 844);

await b.close();
console.log("shots written");
