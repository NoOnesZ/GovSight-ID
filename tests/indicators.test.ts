import test from "node:test";
import assert from "node:assert/strict";
import { dataset } from "../src/lib/dataset";
import {
  yearEndModalFlag,
  categoryShares,
  monthlyAbsorption,
  threeYearTrend,
  belowThreeYearReference,
  generateInquiryBrief,
} from "../src/lib/indicators";

test("penanda cocok dengan enam snapshot dan menangani tahun berjalan", () => {
  for (const [code, year, expected] of [
    ["0215", 2024, 27.11],
    ["0215", 2025, 35.23],
    ["0214", 2024, 56.28],
    ["0214", 2025, 52.41],
    ["0203", 2024, 47.89],
    ["0203", 2025, 73.41],
  ] as const) {
    const get = (month: number) =>
      dataset.snapshots.find(
        (s) => s.regionCode === code && s.year === year && s.month === month,
      );
    assert.equal(yearEndModalFlag(get(10), get(12)).share, expected);
  }
  assert.equal(
    yearEndModalFlag(
      dataset.snapshots.find((s) => s.regionCode === "0215" && s.year === 2026),
      undefined,
    ).status,
    "belum-tersedia",
  );
});

test("acuan tiga tahun memakai ambang pengguna dan menolak data tidak lengkap", () => {
  const source = dataset.snapshots.find(
    (s) => s.regionCode === "0215" && s.year === 2025 && s.month === 12,
  )!;
  const sample = (year: number, value: string | null) => ({
    ...source,
    year,
    total: { ...source.total, realized: "100" },
    categories: source.categories.map((c) =>
      c.code === "modal" ? { ...c, realized: value } : c,
    ),
  });
  const rows = [sample(2023, "10"), sample(2024, "20"), sample(2025, "30")];
  assert.equal(belowThreeYearReference(rows, 31), true);
  assert.equal(belowThreeYearReference(rows, 30), false);
  assert.equal(belowThreeYearReference(rows, 101), null);
  assert.equal(belowThreeYearReference([rows[0], rows[1]], 31), null);
});

test("pola tiga tahun hanya dihitung dari tiga tahun berurutan dan data lengkap", () => {
  const source = dataset.snapshots.find(
    (s) => s.regionCode === "0215" && s.year === 2025 && s.month === 12,
  )!;
  const sample = (year: number, value: string | null) => ({
    ...source,
    year,
    total: { ...source.total, realized: "100" },
    categories: source.categories.map((c) =>
      c.code === "modal" ? { ...c, realized: value } : c,
    ),
  });
  assert.equal(
    threeYearTrend([
      sample(2023, "10"),
      sample(2024, "20"),
      sample(2025, "30"),
    ]),
    "meningkat",
  );
  assert.equal(
    threeYearTrend([
      sample(2023, "30"),
      sample(2024, "20"),
      sample(2025, "10"),
    ]),
    "menurun",
  );
  assert.equal(
    threeYearTrend([
      sample(2023, "10"),
      sample(2024, "30"),
      sample(2025, "20"),
    ]),
    "berfluktuasi",
  );
  assert.equal(
    threeYearTrend([
      sample(2022, "10"),
      sample(2024, "20"),
      sample(2025, "30"),
    ]),
    null,
  );
  assert.equal(
    threeYearTrend([
      sample(2023, null),
      sample(2024, "20"),
      sample(2025, "30"),
    ]),
    null,
  );
});

test("rasio pagu, realisasi, dan serapan bulanan memakai penyebut tepat", () => {
  const source = dataset.snapshots.find(
    (s) => s.regionCode === "0215" && s.year === 2025 && s.month === 10,
  )!;
  const sample = {
    ...source,
    total: { ...source.total, budget: "100", realized: "50" },
    categories: source.categories.map((c) =>
      c.code === "modal" ? { ...c, budget: "20", realized: "15" } : c,
    ),
  };
  assert.deepEqual(categoryShares(sample, "modal"), {
    budget: 20,
    realized: 30,
  });
  assert.equal(monthlyAbsorption(sample), 50);
  assert.equal(
    monthlyAbsorption({ ...sample, total: { ...sample.total, budget: "0" } }),
    null,
  );
  assert.deepEqual(categoryShares(sample, "hilang"), {
    budget: null,
    realized: null,
  });
});

test("batas ambang, nilai kosong, revisi, dan presisi rupiah", () => {
  const source = dataset.snapshots.find(
    (s) => s.regionCode === "0215" && s.year === 2025 && s.month === 10,
  )!;
  const sample = (month: number, value: string | null) => ({
    ...source,
    month,
    categories: source.categories.map((c) =>
      c.code === "modal" ? { ...c, realized: value } : c,
    ),
  });
  assert.equal(
    yearEndModalFlag(sample(10, "60"), sample(12, "100")).status,
    "ditandai",
  );
  assert.equal(
    yearEndModalFlag(sample(10, "60.01"), sample(12, "100")).status,
    "wajar",
  );
  assert.equal(
    yearEndModalFlag(sample(10, "60.001"), sample(12, "100")).status,
    "ditandai",
  );
  assert.equal(
    yearEndModalFlag(sample(10, "0"), sample(12, "0")).status,
    "belum-tersedia",
  );
  assert.equal(
    yearEndModalFlag(sample(10, null), sample(12, "100")).status,
    "belum-tersedia",
  );
  assert.equal(
    yearEndModalFlag(sample(10, "101"), sample(12, "100")).status,
    "tidak-konsisten",
  );
  assert.equal(
    yearEndModalFlag(
      sample(10, "6000000000000000"),
      sample(12, "10000000000000000"),
    ).share,
    40,
  );
});

test("daftar tahun penumpukan akhir tahun hanya menyertakan tahun dengan data Oktober", () => {
  const yearsForMedan = [
    ...new Set(
      dataset.snapshots
        .filter((s) => s.regionCode === "0215" && s.month === 10)
        .map((s) => s.year),
    ),
  ].sort((a, b) => b - a);

  // 2023 hanya punya Desember sehingga harus diabaikan, 2024-2026 punya Oktober
  assert.equal(yearsForMedan.includes(2023), false);
  assert.equal(yearsForMedan.includes(2024), true);
  assert.equal(yearsForMedan.includes(2025), true);
  assert.equal(yearsForMedan.includes(2026), true);
});

test("pengurutan penumpukan akhir tahun mengurutkan nilai share dari tertinggi ke terendah", () => {
  const latestCompleteYear = 2025;
  const flagFor = (code: string) =>
    yearEndModalFlag(
      dataset.snapshots.find(
        (s) => s.regionCode === code && s.year === latestCompleteYear && s.month === 10,
      ),
      dataset.snapshots.find(
        (s) => s.regionCode === code && s.year === latestCompleteYear && s.month === 12,
      ),
    );

  const sampleCodes = ["0215", "0203", "0214"]; // Medan (35.23%), Deli Serdang (73.41%), Binjai (52.41%)
  const sorted = [...sampleCodes].sort(
    (a, b) => (flagFor(b).share ?? -1) - (flagFor(a).share ?? -1),
  );

  assert.deepEqual(sorted, ["0203", "0214", "0215"]);
});

test("generateInquiryBrief menghasilkan telaah kritis berbasis temuan data", () => {
  const deli2025Oct = dataset.snapshots.find(
    (s) => s.regionCode === "0203" && s.year === 2025 && s.month === 10,
  );
  const deli2025Dec = dataset.snapshots.find(
    (s) => s.regionCode === "0203" && s.year === 2025 && s.month === 12,
  );
  const completeYears = dataset.snapshots
    .filter((s) => s.regionCode === "0203" && s.month === 12)
    .sort((a, b) => b.year - a.year)
    .slice(0, 3)
    .reverse();

  assert.ok(deli2025Oct && deli2025Dec);
  const brief = generateInquiryBrief(
    deli2025Dec!,
    deli2025Oct,
    deli2025Dec,
    completeYears,
  );

  // Deli Serdang 2025 memiliki flag 73.41% (> 40%), sehingga harus masuk kategori akhir-tahun dengan badge kritis
  const yearEndItem = brief.find((item) => item.category === "akhir-tahun");
  assert.ok(yearEndItem);
  assert.equal(yearEndItem?.badge, "kritis");
  assert.ok(yearEndItem?.questions.length > 0);
});
