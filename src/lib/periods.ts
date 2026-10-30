import { months } from "./regions";

export interface Period {
  year: number;
  month: number;
}

// Satu-satunya daftar periode yang tersedia. Urut dari terlama ke terbaru.
// Tes memastikan daftar ini sama persis dengan isi data/snapshots.json.
export const periods: Period[] = [
  { year: 2023, month: 12 },
  ...[2024, 2025].flatMap((year) =>
    Array.from({ length: 12 }, (_, i) => ({ year, month: i + 1 })),
  ),
  ...Array.from({ length: 10 }, (_, i) => ({ year: 2026, month: i + 1 })),
];

export const latestPeriod = periods[periods.length - 1];
export const years = [...new Set(periods.map((row) => row.year))].sort(
  (a, b) => b - a,
);
export const reportMonths = [...new Set(periods.map((row) => row.month))].sort(
  (a, b) => a - b,
);
// Tahun terbaru dianggap berjalan selama datanya belum sampai Desember.
export const runningYear = latestPeriod.month < 12 ? latestPeriod.year : null;

export function isAvailablePeriod(year: number, month: number) {
  return periods.some((row) => row.year === year && row.month === month);
}
export function monthsInYear(year: number) {
  return periods.filter((row) => row.year === year).map((row) => row.month);
}

function yearRange(values: number[]) {
  const contiguous = values.every(
    (value, index) => index === 0 || value === values[index - 1] + 1,
  );
  return contiguous && values.length > 1
    ? `${values[0]}–${values[values.length - 1]}`
    : values.join(", ");
}
export const availabilityLabel = new Intl.ListFormat("id-ID", {
  type: "disjunction",
}).format(
  reportMonths.map(
    (month) =>
      `${months[month]} ${yearRange(
        periods.filter((row) => row.month === month).map((row) => row.year),
      )}`,
  ),
);
