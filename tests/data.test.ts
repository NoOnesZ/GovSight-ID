import test from "node:test";
import assert from "node:assert/strict";
import {
  parseDjpkExport,
  percentage,
  sumAmounts,
  validateComparison,
} from "../src/lib/data-core";

function xml(rows: [string, string, string][]) {
  return `<?xml version="1.0"?><Workbook><Worksheet><Table><Row><Cell><Data>Akun</Data></Cell><Cell><Data>Anggaran</Data></Cell><Cell><Data>Realisasi</Data></Cell></Row>${rows.map((row) => `<Row>${row.map((value) => `<Cell><Data>${value}</Data></Cell>`).join("")}</Row>`).join("")}</Table></Worksheet></Workbook>`;
}

test("persentase serapan dan komposisi memakai penyebut berbeda", () => {
  assert.equal(percentage("25", "100"), 25);
  assert.equal(percentage("25", "50"), 50);
  assert.equal(percentage(null, "50"), null);
  assert.equal(percentage("0", "100"), 0);
  assert.equal(percentage("10", "0"), null);
});

test("parser mempertahankan presisi dan tidak menjumlahkan kategori berulang", () => {
  const result = parseDjpkExport(
    xml([
      [" Belanja Daerah", "9007199254740993.25", "100.50"],
      [" Belanja Modal", "50.00", "10.25"],
      [" Belanja Modal", "50.00", "10.25"],
    ]),
  );
  assert.equal(result.total.budget, "9007199254740993.25");
  assert.equal(
    result.categories.find((row) => row.code === "modal")?.realized,
    "10.25",
  );
  assert.equal(result.categories.length, 4);
  assert.equal(
    result.categories.find((row) => row.code === "pegawai")?.realized,
    null,
  );
});

test("kategori berulang dengan angka bertentangan menggagalkan impor", () => {
  assert.throws(
    () =>
      parseDjpkExport(
        xml([
          ["Belanja Daerah", "100", "80"],
          ["Belanja Modal", "30", "20"],
          ["Belanja Modal", "30", "25"],
        ]),
      ),
    /berbeda|konflik/i,
  );
});

test("ekspor tanpa total belanja atau angka negatif ditolak", () => {
  assert.throws(
    () => parseDjpkExport(xml([["PAD", "100", "10"]])),
    /Belanja Daerah/,
  );
  assert.throws(
    () => parseDjpkExport(xml([["Belanja Daerah", "100", "-1"]])),
    /negatif/i,
  );
});

test("perbandingan menolak periode berbeda dan membatasi dua hingga tiga daerah", () => {
  assert.throws(
    () =>
      validateComparison([
        { year: 2026, month: 10 },
        { year: 2025, month: 10 },
      ]),
    /periode/i,
  );
  assert.throws(
    () => validateComparison([{ year: 2026, month: 10 }]),
    /dua|2/i,
  );
  assert.doesNotThrow(() =>
    validateComparison([
      { year: 2026, month: 10 },
      { year: 2026, month: 10 },
    ]),
  );
});

test("total parsial tidak boleh terlihat sebagai total lengkap", () => {
  assert.equal(sumAmounts(["10.25", "20.50"]), "30.75");
  assert.equal(sumAmounts(["10.25", null]), null);
  assert.equal(sumAmounts([]), null);
});

test("konflik total pagu juga menggagalkan impor walaupun realisasi cocok", () => {
  assert.throws(
    () =>
      parseDjpkExport(
        xml([
          ["Belanja Daerah", "100", "80"],
          ["Belanja Pegawai", "100", "20"],
          ["Belanja Barang dan Jasa", "100", "20"],
          ["Belanja Modal", "100", "20"],
          ["Belanja Lainnya", "100", "20"],
        ]),
      ),
    /total.*pagu|total.*budget/i,
  );
});
