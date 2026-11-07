import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  dataset,
  toCsv,
  readApiPeriod,
  readApiRegions,
} from "../src/lib/dataset";
import { parseDjpkExport } from "../src/lib/data-core";
import { periods } from "../src/lib/periods";
import {
  coreRegions,
  expansionRegions,
  allSumutRegions,
  regions,
  sumatraProvinces,
  nationalOverview,
} from "../src/lib/regions";
import { GET as compare } from "../src/app/api/bandingkan/route";
import { GET as exportCsv } from "../src/app/api/ekspor/route";

test("seluruh snapshot cocok dengan berkas DJPK asli dan SHA-256", () => {
  assert.equal(coreRegions.length, 10);
  assert.equal(regions.length, 33);
  assert.ok(periods.some((p) => p.year === 2023 && p.month === 12));
  assert.ok(periods.filter((p) => p.year === 2025).length === 12);
  const coreSnapshots = dataset.snapshots.filter((s) =>
    coreRegions.some((r) => r.code === s.regionCode),
  );
  assert.equal(coreSnapshots.length, coreRegions.length * periods.length);
  const unique = new Set<string>();
  for (const snapshot of coreSnapshots) {
    const raw = readFileSync(
      path.join(process.cwd(), "public", snapshot.source.rawPath),
      "utf8",
    );
    assert.equal(
      createHash("sha256").update(raw).digest("hex"),
      snapshot.source.batchId,
    );
    const parsed = parseDjpkExport(raw);
    assert.deepEqual(parsed.total, snapshot.total);
    assert.deepEqual(parsed.categories, snapshot.categories);
    unique.add(`${snapshot.regionCode}/${snapshot.year}/${snapshot.month}`);
  }
  assert.equal(unique.size, coreRegions.length * periods.length);
});

test("daftar periode sama persis dengan snapshot setiap daerah", () => {
  const expected = regions
    .flatMap((region) =>
      periods.map(({ year, month }) => `${region.code}/${year}/${month}`),
    )
    .sort();
  const actual = dataset.snapshots
    .map((row) => `${row.regionCode}/${row.year}/${row.month}`)
    .sort();
  assert.deepEqual(actual, expected);
});

test("API tidak mengubah periode atau kode salah secara diam-diam", () => {
  assert.throws(
    () => readApiPeriod(new URLSearchParams("tahun=2026&bulan=12")),
    /belum tersedia/,
  );
  assert.throws(
    () => readApiPeriod(new URLSearchParams("tahun=2027")),
    /belum tersedia/,
  );
  assert.throws(
    () => readApiRegions(new URLSearchParams("daerah=0215,0215")),
    /berulang/,
  );
  assert.throws(
    () => readApiRegions(new URLSearchParams("daerah=9999")),
    /tidak valid/,
  );
});

test("CSV mengikuti daerah dan periode terpilih tanpa pembulatan nilai uang", () => {
  const snapshot = dataset.snapshots.find(
    (row) => row.regionCode === "0215" && row.year === 2025 && row.month === 10,
  )!;
  const csv = toCsv(["0215"], 2025, 10);
  assert.equal(csv.split("\r\n").length, 6);
  assert.ok(csv.includes(`"${snapshot.total.realized}"`));
  assert.ok(csv.includes('"2025","10"'));
  assert.ok(!csv.includes('"Kota Binjai"'));
  assert.ok(csv.includes(snapshot.source.batchId));
});

test("endpoint perbandingan dan ekspor memvalidasi input", async () => {
  const defaultComparison = compare(
    new Request("http://localhost/api/bandingkan"),
  );
  assert.equal(defaultComparison.status, 200);
  assert.equal((await defaultComparison.json()).snapshots.length, 2);
  assert.equal(
    compare(new Request("http://localhost/api/bandingkan?daerah=0215")).status,
    400,
  );
  const response = compare(
    new Request(
      "http://localhost/api/bandingkan?daerah=0215,0214&tahun=2024&bulan=10",
    ),
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.snapshots.length, 2);
  assert.ok(
    data.snapshots.every(
      (row: { year: number; month: number }) =>
        row.year === 2024 && row.month === 10,
    ),
  );
  const exportResponse = exportCsv(
    new Request("http://localhost/api/ekspor?daerah=0215&tahun=2025&bulan=12"),
  );
  assert.equal(exportResponse.status, 200);
  assert.match(exportResponse.headers.get("content-type")!, /text\/csv/);
  assert.ok((await exportResponse.text()).includes('"2025","12"'));
});

test("registry 33 daerah Sumut memuat 10 core terverifikasi dan 23 ekspansi lengkap", () => {
  assert.equal(regions.length, 33);
  assert.equal(allSumutRegions.length, 33);
  assert.equal(coreRegions.length, 10);
  assert.equal(expansionRegions.length, 23);

  const kota = regions.filter((r) => r.type === "kota");
  const kab = regions.filter((r) => r.type === "kabupaten");
  assert.equal(kota.length, 8);
  assert.equal(kab.length, 25);

  const verified = regions.filter((r) => r.status === "verified");
  const expansion = regions.filter((r) => r.status === "expansion");
  assert.equal(verified.length, 10);
  assert.equal(expansion.length, 23);

  for (const r of regions) {
    assert.ok(r.code.startsWith("02"));
    assert.ok(r.sourceCode.length === 2);
    assert.ok(r.name.length > 0);
    assert.ok(r.shortName.length > 0);
    assert.ok(r.zone && r.zone.length > 0);
    assert.ok(r.status === "verified" || r.status === "expansion");
  }
});

test("registry regional 10 provinsi Sumatera dan gambaran nasional 6 pulau valid", () => {
  assert.equal(sumatraProvinces.length, 10);
  const totalSumatraDaerah = sumatraProvinces.reduce(
    (sum, p) => sum + p.regionCount,
    0,
  );
  assert.equal(totalSumatraDaerah, 154);

  for (const prov of sumatraProvinces) {
    assert.ok(prov.capital.length > 0);
    assert.ok(prov.regionCount > 0);
    assert.ok(prov.estimatedApbd > 1_000_000_000_000);
    assert.ok(prov.absorptionRate > 70 && prov.absorptionRate < 100);
  }

  assert.equal(nationalOverview.totalProvinces, 38);
  assert.equal(nationalOverview.totalRegions, 514);
  assert.equal(nationalOverview.totalKabupaten, 416);
  assert.equal(nationalOverview.totalKota, 98);
  assert.equal(nationalOverview.islandGroups.length, 6);

  const sumProvinces = nationalOverview.islandGroups.reduce(
    (acc, g) => acc + g.provincesCount,
    0,
  );
  const sumRegions = nationalOverview.islandGroups.reduce(
    (acc, g) => acc + g.regionCount,
    0,
  );
  assert.equal(sumProvinces, 38);
  assert.equal(sumRegions, 514);
});
