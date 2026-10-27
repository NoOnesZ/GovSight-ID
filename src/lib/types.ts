export type CategoryCode = "pegawai" | "barang-jasa" | "modal" | "lainnya";
export type Amount = string | null;
export interface BudgetLine {
  code: string;
  label: string;
  budget: Amount;
  realized: Amount;
}
export interface Region {
  code: string;
  sourceCode: string;
  name: string;
  shortName: string;
  type: "kota" | "kabupaten";
}
export interface Snapshot {
  regionCode: string;
  year: number;
  month: number;
  total: BudgetLine;
  categories: BudgetLine[];
  source: {
    url: string;
    portalUrl: string;
    publishedAt: string | null;
    checkedAt: string;
    batchId: string;
    rawPath: string;
  };
}
export interface Dataset {
  version: number;
  generatedAt: string;
  snapshots: Snapshot[];
}
