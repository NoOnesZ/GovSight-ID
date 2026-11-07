import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("test-results/previews", { recursive: true });

try {
  for (const width of [1280, 768, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, name] of [
      ["/", "jelajah"],
      ["/daerah/0215", "profil"],
      ["/bandingkan", "bandingkan"],
      ["/metodologi", "metodologi"],
    ]) {
      await page.goto(base + route);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".loading-state").waitFor({ state: "hidden" });
      if (name === "jelajah") {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
      } else if (name === "profil") {
        const historyTab = page.locator('button.profile-reader-tab:has-text("Riwayat")');
        if ((await historyTab.count()) > 0) {
          await historyTab.click();
          await page.waitForTimeout(400);
        }
      }
      if (name !== "metodologi") {
        await page.locator(".recharts-wrapper").first().waitFor({ timeout: 10000 });
        await page.waitForFunction(() =>
          [...document.querySelectorAll(".recharts-wrapper")].every(
            (element) =>
              element.getBoundingClientRect().width <=
              element
                .closest(".recharts-responsive-container")
                .getBoundingClientRect().width +
                1,
          ),
        );
      }
      if (name === "profil") {
        const advTab = page.locator('button.profile-reader-tab:has-text("Ringkasan")');
        if ((await advTab.count()) > 0) {
          await advTab.click();
          await page.waitForTimeout(300);
        }
      }
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      assert.equal(overflow, false, `${name} overflows at ${width}px`);
      if (width !== 768)
        await page.screenshot({
          path: `test-results/previews/${name}-${width}.png`,
          fullPage: true,
        });
      console.log(`PASS ${name} at ${width}px`);
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base);
  await page.locator(".region-table tbody tr").first().waitFor();
  assert.equal(await page.locator(".region-table tbody tr").count(), 10);

  // Pagination verification
  const paginationInfo = await page.locator(".pagination__info").textContent();
  assert.ok(
    paginationInfo?.includes("Menampilkan 1–10 dari 33 daerah") ||
      paginationInfo?.includes("Menampilkan 1-10 dari 33 daerah"),
    `Expected pagination info to contain "Menampilkan 1–10 dari 33 daerah", got: "${paginationInfo}"`,
  );

  await page
    .locator('.pagination__size .segmented__btn:has-text("Semua")')
    .click();
  await page.waitForFunction(
    () => document.querySelectorAll(".region-table tbody tr").length === 33,
  );
  assert.equal(await page.locator(".region-table tbody tr").count(), 33);

  await page.locator('.pagination__size .segmented__btn:has-text("10")').click();
  await page.waitForFunction(
    () => document.querySelectorAll(".region-table tbody tr").length === 10,
  );
  assert.equal(await page.locator(".region-table tbody tr").count(), 10);
  console.log("PASS pagination initial 10, expand to Semua (33), back to 10");

  // Capture preview screenshots of Unified Filter Panel and Pagination Bar
  const filterPanel = page.locator(".filter-panel");
  if ((await filterPanel.count()) > 0) {
    await filterPanel.screenshot({
      path: "test-results/previews/unified-filter-panel.png",
    });
    console.log("PASS captured unified-filter-panel.png");
  }

  const paginationBar = page.locator(".pagination, .pagination-bar");
  if ((await paginationBar.count()) > 0) {
    await paginationBar.first().screenshot({
      path: "test-results/previews/pagination-bar.png",
    });
    console.log("PASS captured pagination-bar.png");
  }

  await page.getByRole("textbox", { name: "Cari daerah" }).fill("Binjai");
  await page.waitForFunction(
    () => document.querySelectorAll(".region-table tbody tr").length === 1,
  );
  assert.match(page.url(), /q=Binjai/);
  await page.getByLabel("Tahun anggaran", { exact: true }).selectOption("2025");
  await page.waitForURL(/tahun=2025/);
  await page.waitForFunction(() =>
    document
      .querySelector("a[download]")
      ?.getAttribute("href")
      ?.includes("tahun=2025"),
  );
  const csvUrl = await page
    .getByRole("link", { name: "Unduh CSV" })
    .getAttribute("href");
  const csvResponse = await page.request.get(base + csvUrl);
  assert.equal(csvResponse.status(), 200);
  const csv = await csvResponse.text();
  assert.ok(csv.includes('"Kota Binjai","2025","10"'));
  assert.ok(!csv.includes('"Kota Medan"'));
  await page
    .getByRole("textbox", { name: "Cari daerah" })
    .fill("TidakAdaDaerahIni");
  await page.getByRole("heading", { name: "Daerah tidak ditemukan" }).waitFor();
  console.log("PASS search, URL, year filter, filtered CSV, empty state");

  await page.goto(base + "/daerah/0215?tahun=2025&bulan=12");
  await page
    .getByRole("heading", { name: "Kota Medan", exact: true })
    .waitFor();
  const historyBtn = page.locator("#tab-history, button.profile-reader-tab:has-text('Riwayat')");
  if ((await historyBtn.count()) > 0) {
    await historyBtn.first().click();
    await page.waitForTimeout(400);
  }
  await page
    .getByRole("heading", { name: "Serapan belanja bulanan" })
    .waitFor();
  await page
    .getByRole("heading", { name: "Porsi realisasi modal tiga tahun terakhir" })
    .waitFor();
  await page.getByLabel("Acuan perbandingan pilihanmu (%)").fill("20");
  await page.waitForURL(/acuan=20/);
  await page.reload();
  assert.equal(
    await page.getByLabel("Acuan perbandingan pilihanmu (%)").inputValue(),
    "20",
  );
  assert.equal(await page.locator("#riwayat-tahunan tbody tr").count(), 3);
  await page.getByLabel("Tahun anggaran", { exact: true }).selectOption("2026");
  await page.waitForURL(/tahun=2026/);
  await page.waitForFunction(
    () =>
      document.querySelector('select[aria-label="Bulan pelaporan"]')?.value ===
      "10",
  );
  await page.waitForFunction(
    () => document.querySelectorAll("#riwayat-tahunan tbody tr").length === 3,
  );
  assert.equal(
    await page.getByLabel("Bulan pelaporan", { exact: true }).inputValue(),
    "10",
  );
  assert.equal(await page.locator("#riwayat-tahunan tbody tr").count(), 3);
  console.log("PASS comparable profile history and unavailable December 2026");

  await page.goto(base + "/bandingkan");
  await page.locator('.region-option:has-text("Deli Serdang")').click();
  await page
    .getByRole("heading", { name: "Penanda akhir tahun berdampingan" })
    .waitFor();
  await page.getByText(/Kamu membandingkan kota dan kabupaten/).waitFor();
  assert.equal(
    await page.locator(".region-option[aria-pressed=true]").count(),
    3,
  );
  await page.locator('.region-option:has-text("Medan")').click();
  await page.locator('.region-option:has-text("Binjai")').click();
  await page
    .getByText(/Tambahkan 1 daerah lagi/)
    .first()
    .waitFor();
  console.log("PASS comparison selection and mixed-region context");

  await page.goto(base + "/daerah/0203?tahun=2025&bulan=12&tab=history");
  await page
    .getByText(/73,41%/)
    .first()
    .waitFor();
  assert.ok(
    (await page.getByRole("link", { name: /Unduh.*Oktober/ }).count()) > 0,
  );
  assert.ok(
    (await page.getByRole("link", { name: /Unduh.*Desember/ }).count()) > 0,
  );
  console.log("PASS Deli Serdang flag and original sources");

  await page.goto(base + "/metodologi");
  const rawUrl = await page
    .getByRole("link", { name: "Unduh asli" })
    .first()
    .getAttribute("href");
  const raw = await page.request.get(base + rawUrl);
  assert.equal(raw.status(), 200);
  assert.match(await raw.text(), /Workbook/);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Bagikan", exact: true }).click();
  await page.getByRole("button", { name: "Tautan disalin" }).waitFor();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    base + "/metodologi",
  );
  console.log("PASS original source download and copy link");

  await page.goto(base + "/daerah/9999");
  await page.getByRole("heading", { name: "Daerah belum tersedia." }).waitFor();
  for (const route of ["/", "/daerah/0215", "/bandingkan", "/metodologi"]) {
    await page.goto(base + route + "?tahun=2026&bulan=12");
    await page
      .getByRole("heading", { name: "Periode belum tersedia" })
      .waitFor();
  }
  console.log("PASS unavailable URL periods are not silently substituted");
  await page.goto(base);
  await page.keyboard.press("Tab");
  assert.ok(
    (await page.evaluate(() => document.activeElement?.textContent))?.includes("Langsung ke konten"),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS unknown region, keyboard skip link, no browser runtime errors",
  );
} finally {
  await browser.close();
}
