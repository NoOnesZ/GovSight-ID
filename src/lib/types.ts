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
  status?: "verified" | "expansion" | "audit-penuh" | "tahap-2";
  statusAudit?: "audit-penuh" | "tahap-2";
  zone?: string;
  zones?: string[];
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

export interface SumatraProvince {
  code: string;
  name: string;
  capital: string;
  regencyCount: number;
  cityCount: number;
  regionCount: number;
  estimatedApbd: number;
  absorptionRate: number;
}

export interface IslandGroupOverview {
  name: string;
  provincesCount: number;
  regionCount: number;
  provinces?: string[];
}

export interface NationalOverview {
  totalProvinces: number;
  totalRegions: number;
  totalKabupaten: number;
  totalKota: number;
  islandGroups: IslandGroupOverview[];
}
