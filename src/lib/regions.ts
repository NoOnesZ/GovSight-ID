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
];
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
