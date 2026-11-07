import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  console.log("1. Testing Section Order on Home Page...");
  await page.goto(base + "/");
  await page.waitForLoadState("networkidle");

  // Check section order: Daftar Daerah Terpantau should appear BEFORE Fokus Pengawasan Publik
  const regionsBox = await page.locator(".card.regions").boundingBox();
  const alertBox = await page.locator(".card.card--warn-alert").boundingBox();

  assert.ok(regionsBox, "Daftar Daerah Terpantau exists");
  assert.ok(alertBox, "Fokus Pengawasan Publik exists");
  assert.ok(
    regionsBox.y < alertBox.y,
    `Expected Daftar Daerah (y=${regionsBox.y}) to be ABOVE Fokus Pengawasan (y=${alertBox.y})`,
  );
  console.log(
    "PASS: Daftar Daerah Terpantau is placed above Fokus Pengawasan Publik!",
  );

  console.log("2. Testing Tier 2 Switch & Blueprint Interactive Cards...");
  // Click Scope Card Tier 2
  const tier2ScopeCard = page.locator('.scope-card:has-text("Pulau Sumatera")');
  await tier2ScopeCard.click();
  await page.waitForTimeout(400);

  // Verify Matrix Fiskal Pulau Sumatera heading appears
  const matrixHeading = page.locator(
    'h2:has-text("Matrix Fiskal Pulau Sumatera")',
  );
  await matrixHeading.waitFor({ timeout: 5000 });
  console.log("PASS: Navigated to Tier 2 Pulau Sumatera Matrix!");

  // In Blueprint: Tap Tier 1 card to return to baseline
  const blueprintTier1Btn = page.locator(
    '.blueprint-tier-card:has-text("Sumatera Utara")',
  );
  await blueprintTier1Btn.click();
  await page.waitForTimeout(400);

  // Verify we returned to 33 Daerah Sumut
  const regionsTitle = page.locator(
    '.card.regions .card__title:has-text("Daftar Daerah Terpantau")',
  );
  await regionsTitle.waitFor({ timeout: 5000 });
  console.log(
    "PASS: Tapping Tier 1 in Blueprint returned to baseline 33 Pemda Sumut!",
  );

  console.log("3. Testing Back Navigation Bar...");
  await tier2ScopeCard.click();
  await matrixHeading.waitFor({ timeout: 5000 });

  const backNavBtn = page.locator(
    '.tier-nav-bar button:has-text("Kembali ke Jelajah Anggaran Sumut")',
  );
  await backNavBtn.click();
  await page.waitForTimeout(400);
  await regionsTitle.waitFor({ timeout: 5000 });
  console.log("PASS: Back Navigation Bar successfully returned to baseline!");

  console.log("4. Testing Row Return CTA on Sumatera Utara...");
  await tier2ScopeCard.click();
  await matrixHeading.waitFor({ timeout: 5000 });

  const sumutRowBtn = page.locator(
    '.region-cell button:has-text("Buka 33 Daerah Sumut")',
  );
  await sumutRowBtn.click();
  await page.waitForTimeout(400);
  await regionsTitle.waitFor({ timeout: 5000 });
  console.log("PASS: Sumatera Utara row button returned to baseline!");

  console.log("5. Testing Interactive Pipeline Steps & Inspector Drawer...");
  await tier2ScopeCard.click();
  await matrixHeading.waitFor({ timeout: 5000 });

  // Click Step 01. Sumber
  const step1Btn = page.locator('.pipeline-step-btn:has-text("01. Sumber")');
  await step1Btn.click();
  await page.waitForTimeout(300);

  // Drawer should be open
  const drawer = page.locator(".pipeline-drawer");
  assert.equal(await drawer.count(), 1, "Drawer should be open");
  assert.ok(
    (await drawer.textContent()).includes("Token Bucket"),
    "Drawer contains technical details",
  );
  console.log("PASS: Pipeline Step 01 expands technical inspector drawer!");

  // Click close button
  const closeDrawerBtn = page.locator(
    '.pipeline-drawer button:has-text("Kembali ke Tampilan Standar")',
  );
  await closeDrawerBtn.click();
  await page.waitForTimeout(300);
  assert.equal(await drawer.count(), 0, "Drawer should be closed");
  console.log("PASS: Pipeline drawer cleanly returns to original state!");

  console.log("6. Testing Mobile Responsiveness at 360px in Tier 2...");
  await page.setViewportSize({ width: 360, height: 800 });
  await page.waitForTimeout(400);

  // Check table is hidden on mobile and mobile cards are shown
  const tableWrapVisible = await page.locator(".matrix-table-wrap").isVisible();
  const mobileCardsVisible = await page.locator(".matrix-cards").isVisible();
  assert.equal(
    tableWrapVisible,
    false,
    "Desktop matrix table should be hidden on mobile 360px",
  );
  assert.equal(
    mobileCardsVisible,
    true,
    "Mobile cards should be visible on mobile 360px",
  );

  // Verify no horizontal overflow
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  assert.equal(
    overflow,
    false,
    "Page should NOT have horizontal overflow on 360px",
  );
  console.log(
    "PASS: Mobile 360px layout is completely responsive without overflow!",
  );

  // Take screenshot of mobile Tier 2
  await page.screenshot({ path: "test-results/previews/tier2-mobile-360.png" });
  console.log(
    "PASS: Captured mobile screenshot at test-results/previews/tier2-mobile-360.png",
  );

  // Switch back to 1280px and capture desktop screenshot
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: "test-results/previews/tier2-desktop-1280.png",
  });
  console.log(
    "PASS: Captured desktop screenshot at test-results/previews/tier2-desktop-1280.png",
  );
} finally {
  await browser.close();
}
