import Decimal from "decimal.js";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { Amount, BudgetLine } from "./types";

Decimal.set({ precision: 40 });

export function percentage(
  numerator: Amount,
  denominator: Amount,
): number | null {
  if (
    numerator === null ||
    denominator === null ||
    new Decimal(denominator).isZero()
  )
    return null;
  return new Decimal(numerator)
    .dividedBy(denominator)
    .times(100)
    .toDecimalPlaces(2)
    .toNumber();
}

export function sumAmounts(values: Amount[]): Amount {
  if (!values.length || values.some((value) => value === null)) return null;
  return values
    .reduce<Decimal>((sum, value) => sum.plus(value!), new Decimal(0))
    .toFixed();
}

function amount(value: string): Amount {
  if (!value || value === "-" || value.toLowerCase() === "null") return null;
  const number = new Decimal(value);
  if (!number.isFinite() || number.isNegative())
    throw new Error("Nilai negatif atau tidak valid dalam sumber");
  return number.toFixed();
}

export function parseDjpkExport(xml: string): {
  total: BudgetLine;
  categories: BudgetLine[];
} {
  if (/<!DOCTYPE/i.test(xml) || XMLValidator.validate(xml) !== true)
    throw new Error("Format ekspor DJPK bukan XML yang valid");
  const doc = new XMLParser({
    removeNSPrefix: true,
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: true,
  }).parse(xml);
  const worksheet = Array.isArray(doc.Workbook?.Worksheet)
    ? doc.Workbook.Worksheet[0]
    : doc.Workbook?.Worksheet;
  const rows = worksheet?.Table?.Row;
  if (!rows) throw new Error("Ekspor tidak berisi Belanja Daerah");
  const values = new Map<string, { budget: Amount; realized: Amount }>();
  for (const row of Array.isArray(rows) ? rows : [rows]) {
    const cells = Array.isArray(row.Cell) ? row.Cell : [row.Cell];
    const text = cells.map((cell: { Data?: unknown }) => {
      const data = cell?.Data;
      return String(
        typeof data === "object" && data !== null
          ? ((data as Record<string, unknown>)["#text"] ?? "")
          : (data ?? ""),
      ).trim();
    });
    const label = text[0]?.replace(/\s+/g, " ");
    if (
      ![
        "Belanja Daerah",
        "Belanja Pegawai",
        "Belanja Barang dan Jasa",
        "Belanja Modal",
        "Belanja Lainnya",
      ].includes(label)
    )
      continue;
    const line = {
      budget: amount(text[1] ?? ""),
      realized: amount(text[2] ?? ""),
    };
    const previous = values.get(label);
    if (
      previous &&
      (previous.budget !== line.budget || previous.realized !== line.realized)
    )
      throw new Error(
        `Konflik: kategori ${label} berulang dengan nilai berbeda`,
      );
    values.set(label, line);
  }
  const total = values.get("Belanja Daerah");
  if (!total) throw new Error("Total Belanja Daerah tidak ditemukan");
  const categories = [
    ["pegawai", "Belanja Pegawai"],
    ["barang-jasa", "Belanja Barang dan Jasa"],
    ["modal", "Belanja Modal"],
    ["lainnya", "Belanja Lainnya"],
  ].map(([code, label]) => ({
    code,
    label,
    ...(values.get(label) ?? { budget: null, realized: null }),
  }));
  for (const field of ["budget", "realized"] as const) {
    if (
      categories.every((line) => line[field] !== null) &&
      total[field] !== null
    ) {
      const sum = categories.reduce(
        (current, line) => current.plus(line[field]!),
        new Decimal(0),
      );
      if (sum.minus(total[field]!).abs().greaterThan(1))
        throw new Error(
          `Total ${field === "budget" ? "pagu" : "realisasi"} kategori berbeda dari total belanja sumber`,
        );
    }
  }
  return {
    total: { code: "total", label: "Belanja Daerah", ...total },
    categories,
  };
}

export function validateComparison(periods: { year: number; month: number }[]) {
  if (periods.length < 2 || periods.length > 3)
    throw new Error("Pilih dua hingga tiga daerah");
  if (
    periods.some(
      (period) =>
        period.year !== periods[0].year || period.month !== periods[0].month,
    )
  )
    throw new Error("Perbandingan harus memakai periode yang sama");
}
