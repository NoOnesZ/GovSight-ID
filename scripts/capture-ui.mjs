import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 960 },
});
const page = await context.newPage();
const outDir = path.join(process.cwd(), "test-results", "ui-check");
await mkdir(outDir, { recursive: true });

const pagesToCapture = [
  { url: "/", name: "01-jelajah-desktop.png" },
  { url: "/daerah/0203", name: "02-profil-deli-serdang.png" },
  { url: "/daerah/0203#lembar-advokasi", name: "03-lembar-advokasi.png" },
  { url: "/bandingkan?daerah=0215,0203", name: "04-bandingkan-medan-deli.png" },
  { url: "/metodologi", name: "05-metodologi-edukasi.png" },
];

for (const item of pagesToCapture) {
  await page.goto(base + item.url);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(outDir, item.name),
    fullPage: true,
  });
  console.log(`Captured ${item.name}`);
}

// Test interactive click on quick filter pill
await page.goto(base + "/");
await page.waitForLoadState("networkidle");
const flaggedPill = page.locator("button.pill-button:has-text('Ditandai Akhir Tahun')");
if (await flaggedPill.isVisible()) {
  await flaggedPill.click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "01-jelajah-filter-flagged.png"),
    fullPage: false,
  });
  console.log("Captured 01-jelajah-filter-flagged.png");
}

await browser.close();
console.log("UI inspection capture complete.");
