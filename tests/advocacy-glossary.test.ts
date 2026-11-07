import test from "node:test";
import assert from "node:assert/strict";
import { dataset } from "../src/lib/dataset";
import { regions } from "../src/lib/regions";
import { generateInquiryBrief } from "../src/lib/indicators";
import { generateLaporReport } from "../src/lib/advocacy";
import { GLOSSARY } from "../src/components/shared";

test("GLOSSARY memuat 6 istilah wajib APBD & regulasi dengan definisi presisi", () => {
  const expectedTerms: Record<string, string> = {
    pagu: "Total batas anggaran belanja yang direncanakan selama satu tahun anggaran.",
    realisasi: "Jumlah uang kas daerah yang telah dicairkan dan dibelanjakan hingga bulan pelaporan.",
    "belanja-modal": "Anggaran pembangunan aset fisik berumur panjang (jalan, jembatan, gedung sekolah, puskesmas).",
    "belanja-pegawai": "Biaya kompensasi ASN/PNS daerah (gaji, tunjangan, uang lembur).",
    "uu-hkpd": "Undang-Undang Hubungan Keuangan antara Pemerintah Pusat dan Pemerintahan Daerah yang mewajibkan belanja modal min. 40% dan belanja pegawai maks. 30%.",
    silpa: "Sisa Lebih Pembiayaan Anggaran, sisa kas APBD pada akhir tahun yang belum terpakai.",
  };

  for (const [key, expectedDef] of Object.entries(expectedTerms)) {
    assert.ok(GLOSSARY[key], `Istilah ${key} harus ada di GLOSSARY`);
    assert.equal(GLOSSARY[key].definition, expectedDef, `Definisi ${key} harus sesuai`);
  }

  // Alias checks
  assert.equal(GLOSSARY.modal.definition, expectedTerms["belanja-modal"]);
  assert.equal(GLOSSARY.pegawai.definition, expectedTerms["belanja-pegawai"]);
  assert.equal(GLOSSARY.hkpd.definition, expectedTerms["uu-hkpd"]);
});

test("generateLaporReport menghasilkan naskah aduan terstruktur resmi untuk SP4N-LAPOR!", () => {
  const region = regions.find((r) => r.code === "0214")!; // Pakpak Bharat
  const snapshot2024 = dataset.snapshots.find(
    (s) => s.regionCode === "0214" && s.year === 2024 && s.month === 12,
  )!;
  const oct2024 = dataset.snapshots.find(
    (s) => s.regionCode === "0214" && s.year === 2024 && s.month === 10,
  );
  const dec2024 = snapshot2024;

  const items = generateInquiryBrief(snapshot2024, oct2024, dec2024);

  const report = generateLaporReport({
    region,
    currentSnapshot: snapshot2024,
    items,
    octoberSnapshot: oct2024,
    decemberSnapshot: dec2024,
    currentUrl: "https://govsight.id/profil/0214?tahun=2024&bulan=12",
  });

  // 1. Judul Laporan: [Dugaan Anomali Belanja APBD] [Nama Daerah] TA [Tahun] - [Ringkasan Masalah]
  assert.ok(report.title.startsWith(`[Dugaan Anomali Belanja APBD] ${region.name} TA 2024`));
  assert.ok(report.title.includes("Konsentrasi Belanja Modal Akhir Tahun"));

  // 2. Instansi Tujuan: Pemerintah Daerah [Nama Daerah] / Kementerian Keuangan RI (DJPK)
  assert.equal(
    report.agency,
    `Pemerintah Daerah ${region.name} / Kementerian Keuangan RI (DJPK)`,
  );

  // 3. Uraian Temuan: Ringkasan data kuantitatif, porsi belanja, UU HKPD No. 1/2022 (Pasal 146/147), lonjakan akhir tahun
  assert.ok(report.observation.includes("DATA KUANTITATIF ANGGARAN:"));
  assert.ok(report.observation.includes("Total Pagu Belanja:"));
  assert.ok(report.observation.includes("Realisasi Kas Daerah:"));
  assert.ok(report.observation.includes("Tingkat Serapan Belanja:"));
  assert.ok(report.observation.includes("UU NO. 1/2022 (HKPD)"));
  assert.ok(report.observation.includes("Pasal 146 ayat (1)"));
  assert.ok(report.observation.includes("Pasal 147 ayat (1)"));
  assert.ok(report.observation.includes("LONJAKAN BELANJA AKHIR TAHUN"));
  assert.ok(report.observation.includes("56,28%")); // Nilai lonjakan modal akhir tahun Pakpak Bharat 2024

  // 4. Sumber Data: Tautan audit langsung di GovSight ID dan portal DJPK Kemenkeu
  assert.ok(report.sources.some((s) => s.includes("https://govsight.id/profil/0214")));
  assert.ok(report.sources.some((s) => s.includes("djpk.kemenkeu.go.id")));

  // 5. FullText memuat seluruh komponen terstruktur siap salin ke portal
  assert.ok(report.fullText.includes("JUDUL LAPORAN:"));
  assert.ok(report.fullText.includes("INSTANSI TUJUAN:"));
  assert.ok(report.fullText.includes("URAIAN TEMUAN:"));
  assert.ok(report.fullText.includes("SUMBER DATA:"));
  assert.ok(report.fullText.includes(report.title));
  assert.ok(report.fullText.includes(report.agency));
});
