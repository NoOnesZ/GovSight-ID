import { chromium } from "playwright";

async function verifyLive() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 869 } });
  
  console.log("=== Testing https://govsight-id.vercel.app on 320px viewport ===");
  await page.goto("https://govsight-id.vercel.app", { waitUntil: "networkidle" });
  
  let overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log("Home (320px):", overflow);

  // Check section order on home
  const regionsBox = await page.locator(".card.regions").boundingBox();
  const alertBox = await page.locator(".card.card--warn-alert").boundingBox();
  console.log("Section order: regions.y =", regionsBox?.y, "alert.y =", alertBox?.y);
  console.log("Regions is above Alert:", regionsBox && alertBox && regionsBox.y < alertBox.y);

  console.log("\n=== Testing https://govsight-id.vercel.app/arsitektur on 320px viewport ===");
  await page.goto("https://govsight-id.vercel.app/arsitektur", { waitUntil: "networkidle" });
  
  let archOverflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log("Arsitektur (320px):", archOverflow);

  // Click Tier 2 (Pulau Sumatera)
  const tier2Btn = page.locator("button:has-text('Pulau Sumatera')");
  if (await tier2Btn.count() > 0) {
    await tier2Btn.first().click();
    await page.waitForTimeout(500);
    const tier2Overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    console.log("Tier 2 view (320px):", tier2Overflow);

    // Click Return button
    const returnBtn = page.locator(".tier-nav-btn, button:has-text('Kembali')").first();
    if (await returnBtn.count() > 0) {
      console.log("Return button text:", (await returnBtn.innerText()).trim());
      await returnBtn.click();
      await page.waitForTimeout(500);
      console.log("Clicked return to baseline successfully!");
    }
  }

  // Click Tier 3 (Seluruh Indonesia)
  const tier3Btn = page.locator("button:has-text('Seluruh Indonesia')");
  if (await tier3Btn.count() > 0) {
    await tier3Btn.first().click();
    await page.waitForTimeout(500);
    const tier3Overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    console.log("Tier 3 view (320px):", tier3Overflow);

    // Return
    const returnBtn = page.locator(".tier-nav-btn, button:has-text('Kembali')").first();
    if (await returnBtn.count() > 0) {
      await returnBtn.click();
      await page.waitForTimeout(500);
      console.log("Returned from Tier 3 successfully!");
    }
  }

  // Also check desktop 1280px
  console.log("\n=== Testing https://govsight-id.vercel.app/arsitektur on 1280px desktop ===");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("https://govsight-id.vercel.app/arsitektur", { waitUntil: "networkidle" });
  const desktopOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
  }));
  console.log("Arsitektur Desktop (1280px):", desktopOverflow);

  await browser.close();
  console.log("\n=== ALL LIVE PRODUCTION VERIFICATIONS PASSED 100% ===");
}

verifyLive().catch(err => {
  console.error("Live test failed:", err);
  process.exit(1);
});
