import pw from "/Users/samir/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js";
const { chromium } = pw;
const OUT = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ deviceScaleFactor: 2, viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("PAGE ERR:", String(e).slice(0, 200)));

await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /sample portfolio/i }).click();
await page.waitForURL("**/dashboard");
await page.waitForTimeout(9000);

// Hover the chart mid-line
const svg = page.locator("svg[role=img]").first();
const box = await svg.boundingBox();
await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.5);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/chart-hover.png`, clip: { x: 20, y: box.y - 120, width: 1400, height: 520 } });

// Expand two allocation rows
await page.getByRole("button", { name: /Technology/ }).first().click();
await page.waitForTimeout(300);
const alloc = page.locator("section", { has: page.getByText("Allocation", { exact: true }) }).first();
await alloc.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await alloc.screenshot({ path: `${OUT}/alloc-expanded.png` });

// Switch to Cap size
await page.getByRole("radio", { name: "Cap size" }).click();
await page.waitForTimeout(400);
await alloc.screenshot({ path: `${OUT}/alloc-capsize.png` });

// Region
await page.getByRole("radio", { name: "Region" }).click();
await page.waitForTimeout(400);
await alloc.screenshot({ path: `${OUT}/alloc-region.png` });

await b.close();
console.log("interaction shots written");
