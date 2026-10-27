import stored from "../../data/snapshots.json";
import { regions } from "./regions";
import type { Dataset } from "./types";

export const dataset = stored as Dataset;
export function getSnapshot(code: string, year = 2026, month = 10) {
  return dataset.snapshots.find(
    (row) =>
      row.regionCode === code && row.year === year && row.month === month,
  );
}
export function readApiPeriod(params: URLSearchParams) {
  const year = Number(params.get("tahun") ?? 2026);
  const month = Number(params.get("bulan") ?? 10);
  if (
    ![2024, 2025, 2026].includes(year) ||
    ![10, 12].includes(month) ||
    (year === 2026 && month === 12)
  )
    throw new Error(
      "Periode belum tersedia. Pilih Oktober 2024–2026 atau Desember 2024–2025.",
    );
  return { year, month };
}
export function readApiRegions(params: URLSearchParams) {
  const codes = (
    params.get("daerah") ?? regions.map((region) => region.code).join(",")
  ).split(",");
  if (
    !codes.length ||
    new Set(codes).size !== codes.length ||
    codes.some((code) => !regions.some((region) => region.code === code))
  )
    throw new Error("Kode daerah tidak valid atau berulang.");
  return codes;
}
export function toCsv(codes: string[], year: number, month: number) {
  const rows: (string | number | null)[][] = [
    [
      "kode_daerah",
      "daerah",
      "tahun",
      "bulan",
      "akun",
      "pagu_rupiah",
      "realisasi_rupiah",
      "tanggal_sumber",
      "diperiksa_pada",
      "sumber",
      "batch_sha256",
    ],
  ];
  for (const code of codes) {
    const region = regions.find((item) => item.code === code)!;
    const snapshot = getSnapshot(code, year, month);
    if (!snapshot)
      throw new Error("Data daerah belum tersedia untuk periode ini.");
    for (const line of [snapshot.total, ...snapshot.categories])
      rows.push([
        code,
        region.name,
        year,
        month,
        line.label,
        line.budget,
        line.realized,
        snapshot.source.publishedAt,
        snapshot.source.checkedAt,
        snapshot.source.url,
        snapshot.source.batchId,
      ]);
  }
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n")
  );
}
