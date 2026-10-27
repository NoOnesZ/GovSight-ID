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
import { GET as compare } from "../src/app/api/bandingkan/route";
import { GET as exportCsv } from "../src/app/api/ekspor/route";

test("seluruh snapshot cocok dengan berkas DJPK asli dan SHA-256", () => {
  assert.equal(dataset.snapshots.length, 15);
  const unique = new Set<string>();
  for (const snapshot of dataset.snapshots) {
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
  assert.equal(unique.size, 15);
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
