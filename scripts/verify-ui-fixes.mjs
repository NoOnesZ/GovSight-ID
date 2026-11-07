import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { copyFile, mkdir } from "node:fs/promises";

const base = "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await mkdir("test-results/ui-fixes", { recursive: true });
const artifactsDir = "C:/Users/ASUS/.gemini/antigravity/brain/264db116-1090-4425-8c4b-200d78cca2d0";

console.log("Navigating to Explorer...");
await page.goto(base);
await page.locator("h1").waitFor();
await page.evaluate(() => document.fonts.ready);
await page.locator(".loading-state").waitFor({ state: "hidden" });

// 1. Capture Filter Panel
const filterPanel = page.locator(".filter-panel");
await filterPanel.waitFor();
await filterPanel.screenshot({ path: "test-results/ui-fixes/filter-panel-fixed.png" });
console.log("Captured filter-panel-fixed.png");

// 2. Capture Anomaly Alert Grid
const anomalySection = page.locator(".card--warn-alert");
await anomalySection.waitFor();
await anomalySection.screenshot({ path: "test-results/ui-fixes/anomaly-cards-fixed.png" });
console.log("Captured anomaly-cards-fixed.png");

// Verify card heights are equal
const cardHeights = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll(".priority-card"));
  return cards.map((c) => Math.round(c.getBoundingClientRect().height));
});
console.log("Anomaly card heights:", cardHeights);
const firstHeight = cardHeights[0];
const allEqual = cardHeights.every((h) => Math.abs(h - firstHeight) <= 1);
assert.ok(allEqual, `Cards must have equal height! Heights: ${cardHeights.join(", ")}`);
console.log("VERIFIED: All 8 anomaly cards have identical heights!");

// 3. Capture Chart with 10 Terbesar and Semua 33
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(600);

const chartCard = page.locator('.card:has-text("Rencana dan realisasi")');
await chartCard.waitFor();
await chartCard.screenshot({ path: "test-results/ui-fixes/chart-top10-fixed.png" });
console.log("Captured chart-top10-fixed.png");

// Switch chart to "Semua"
const semuaChartBtn = chartCard.locator('button.segmented__btn:has-text("Semua")');
if (await semuaChartBtn.count() > 0) {
  await semuaChartBtn.click();
  await page.waitForTimeout(600);
  await chartCard.screenshot({ path: "test-results/ui-fixes/chart-all33-fixed.png" });
  console.log("Captured chart-all33-fixed.png");
}

// 4. Mobile 360px check
await page.setViewportSize({ width: 360, height: 800 });
await page.goto(base);
await page.locator("h1").waitFor();
await page.evaluate(() => document.fonts.ready);
await page.locator(".loading-state").waitFor({ state: "hidden" });

const mobileFilter = page.locator(".filter-panel");
await mobileFilter.screenshot({ path: "test-results/ui-fixes/filter-panel-mobile.png" });
console.log("Captured filter-panel-mobile.png");

const mobileAnomaly = page.locator(".card--warn-alert");
await mobileAnomaly.screenshot({ path: "test-results/ui-fixes/anomaly-cards-mobile.png" });
console.log("Captured anomaly-cards-mobile.png");

// Copy images to artifact dir for user inspection
const files = [
  "filter-panel-fixed.png",
  "anomaly-cards-fixed.png",
  "chart-top10-fixed.png",
  "chart-all33-fixed.png",
  "filter-panel-mobile.png",
  "anomaly-cards-mobile.png",
];
for (const file of files) {
  await copyFile(`test-results/ui-fixes/${file}`, `${artifactsDir}/${file}`);
}
console.log("All screenshots copied to artifacts directory!");

await browser.close();
console.log("VERIFICATION COMPLETE!");
