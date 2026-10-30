import type { Region } from "./types";
export const regions: Region[] = [
  {
    code: "0215",
    sourceCode: "15",
    name: "Kota Medan",
    shortName: "Medan",
    type: "kota",
  },
  {
    code: "0214",
    sourceCode: "14",
    name: "Kota Binjai",
    shortName: "Binjai",
    type: "kota",
  },
  {
    code: "0203",
    sourceCode: "03",
    name: "Kabupaten Deli Serdang",
    shortName: "Deli Serdang",
    type: "kabupaten",
  },
  {
    code: "0216",
    sourceCode: "16",
    name: "Kota Pematang Siantar",
    shortName: "Pematang Siantar",
    type: "kota",
  },
  {
    code: "0219",
    sourceCode: "19",
    name: "Kota Tebing Tinggi",
    shortName: "Tebing Tinggi",
    type: "kota",
  },
  {
    code: "0218",
    sourceCode: "18",
    name: "Kota Tanjung Balai",
    shortName: "Tanjung Balai",
    type: "kota",
  },
  {
    code: "0224",
    sourceCode: "24",
    name: "Kabupaten Serdang Bedagai",
    shortName: "Serdang Bedagai",
    type: "kabupaten",
  },
  {
    code: "0206",
    sourceCode: "06",
    name: "Kabupaten Langkat",
    shortName: "Langkat",
    type: "kabupaten",
  },
  {
    code: "0204",
    sourceCode: "04",
    name: "Kabupaten Karo",
    shortName: "Karo",
    type: "kabupaten",
  },
  {
    code: "0201",
    sourceCode: "01",
    name: "Kabupaten Asahan",
    shortName: "Asahan",
    type: "kabupaten",
  },
];
export const regionListLabel = new Intl.ListFormat("id-ID", {
  type: "conjunction",
}).format(regions.map((region) => region.shortName));
export const categoryColors: Record<string, string> = {
  pegawai: "#2457E7",
  "barang-jasa": "#7896F0",
  modal: "#20A58A",
  lainnya: "#CBD5E1",
};
export const months = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
