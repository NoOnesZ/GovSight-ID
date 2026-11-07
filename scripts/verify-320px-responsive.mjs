import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 320, height: 869 } });

try {
  console.log("Testing Tier 3 Roadmap Nasional at 320px x 869px...");
  await page.goto(base + "/?tier=3#jelajah");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  // 1. Check document horizontal overflow
  const overflowTier3 = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  console.log(
    "Tier 3 scrollWidth:",
    await page.evaluate(() => document.documentElement.scrollWidth),
    "innerWidth:",
    320,
  );
  assert.equal(
    overflowTier3,
    false,
    "Tier 3 should have 0 horizontal overflow at 320px",
  );

  // 2. Check tier-nav-bar bounding box
  const navBar = page.locator(".tier-nav-bar");
  const navBox = await navBar.boundingBox();
  assert.ok(navBox, "tier-nav-bar must exist");
  assert.ok(
    navBox.width <= 320,
    `navBox.width (${navBox.width}) should be <= 320`,
  );

  // 3. Check tier-nav-btn bounding box
  const btn = page.locator(".tier-nav-btn");
  const btnBox = await btn.boundingBox();
  assert.ok(btnBox, "tier-nav-btn must exist");
  assert.ok(
    btnBox.x >= navBox.x - 1,
    `btnBox.x (${btnBox.x}) should not overflow left of navBox.x (${navBox.x})`,
  );
  assert.ok(
    btnBox.x + btnBox.width <= navBox.x + navBox.width + 1,
    `btnBox right (${btnBox.x + btnBox.width}) should not overflow navBox right (${navBox.x + navBox.width})`,
  );

  // 4. Check Blueprint card & chips
  const bpCard = page.locator(".blueprint-card");
  const bpBox = await bpCard.boundingBox();
  assert.ok(bpBox, "blueprint-card must exist");
  assert.ok(
    bpBox.width <= 320,
    `bpBox.width (${bpBox.width}) should be <= 320`,
  );

  // Check chips don't overflow bpCard
  const chips = page.locator(".blueprint-card .chip");
  const chipCount = await chips.count();
  for (let i = 0; i < chipCount; i++) {
    const chipBox = await chips.nth(i).boundingBox();
    if (chipBox) {
      assert.ok(
        chipBox.x + chipBox.width <= bpBox.x + bpBox.width + 2,
        `Chip ${i} right (${chipBox.x + chipBox.width}) should not overflow bpBox right (${bpBox.x + bpBox.width})`,
      );
    }
  }

  // Capture screenshot of Tier 3 at 320px
  await page.screenshot({ path: "test-results/previews/tier3-mobile-320.png" });
  console.log(
    "PASS: Tier 3 at 320px verified cleanly! Screenshot saved to test-results/previews/tier3-mobile-320.png",
  );

  // Now test Tier 2 Regional Sumatera at 320px
  console.log("Testing Tier 2 Regional Sumatera at 320px x 869px...");
  await page.goto(base + "/?tier=2#jelajah");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const overflowTier2 = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  console.log(
    "Tier 2 scrollWidth:",
    await page.evaluate(() => document.documentElement.scrollWidth),
    "innerWidth:",
    320,
  );
  assert.equal(
    overflowTier2,
    false,
    "Tier 2 should have 0 horizontal overflow at 320px",
  );

  await page.screenshot({ path: "test-results/previews/tier2-mobile-320.png" });
  console.log(
    "PASS: Tier 2 at 320px verified cleanly! Screenshot saved to test-results/previews/tier2-mobile-320.png",
  );
} finally {
  await browser.close();
}
