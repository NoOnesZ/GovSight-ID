export interface ProvinsiSumatera {
  code: string;
  name: string;
  capital: string;
  daerahCount: number;
  kotaCount: number;
  kabCount: number;
  aggregateBudget: number; // in Rupiah
  modalAbsorptionRate: number; // %
  pegawaiAbsorptionRate: number; // %
  statusIngestion: "Aktif Penuh" | "In Progress" | "Pipeline Rujukan";
  progressPercent: number;
  featuredDaerah: string[];
}

export interface GugusKepulauan {
  id: string;
  name: string;
  island: string;
  provincesCount: number;
  daerahCount: number;
  aggregateBudget: number; // in Rupiah
  modalAbsorptionRate: number; // %
  pegawaiShareRate: number; // %
  yearEndModalSpikeRate: number; // % daerah with year-end concentration
  status: string;
  phase: string;
}

export interface NationalFiscalSummary {
  totalProvinces: number;
  totalDaerah: number;
  totalKota: number;
  totalKabupaten: number;
  totalAggregateBudget: number;
  targetUUHKPDModal: number; // 40%
  currentNationalModalAvg: number; // 18.2%
  targetUUHKPDPegawai: number; // 30%
  currentNationalPegawaiAvg: number; // 34.6%
  projectedPublicImpact: {
    modalAccelerationPotential: number; // in Rupiah
    personnelEfficiencyPotential: number; // in Rupiah
    totalMonitoredPemda: number;
  };
}

export const sumateraProvinces: ProvinsiSumatera[] = [
  {
    code: "11",
    name: "Aceh",
    capital: "Banda Aceh",
    daerahCount: 23,
    kotaCount: 5,
    kabCount: 18,
    aggregateBudget: 35820000000000, // Rp 35.82 T
    modalAbsorptionRate: 16.8,
    pegawaiAbsorptionRate: 36.2,
    statusIngestion: "In Progress",
    progressPercent: 75,
    featuredDaerah: ["Banda Aceh", "Sabang", "Lhokseumawe", "Aceh Besar", "Aceh Tengah"],
  },
  {
    code: "12",
    name: "Sumatera Utara",
    capital: "Medan",
    daerahCount: 33,
    kotaCount: 8,
    kabCount: 25,
    aggregateBudget: 63240000000000, // Rp 63.24 T
    modalAbsorptionRate: 19.4,
    pegawaiAbsorptionRate: 33.8,
    statusIngestion: "Aktif Penuh",
    progressPercent: 100,
    featuredDaerah: ["Medan", "Deli Serdang", "Binjai", "Pematang Siantar", "Karo"],
  },
  {
    code: "13",
    name: "Sumatera Barat",
    capital: "Padang",
    daerahCount: 19,
    kotaCount: 7,
    kabCount: 12,
    aggregateBudget: 26540000000000, // Rp 26.54 T
    modalAbsorptionRate: 18.2,
    pegawaiAbsorptionRate: 35.1,
    statusIngestion: "In Progress",
    progressPercent: 60,
    featuredDaerah: ["Padang", "Bukittinggi", "Payakumbuh", "Agam", "Solok"],
  },
  {
    code: "14",
    name: "Riau",
    capital: "Pekanbaru",
    daerahCount: 12,
    kotaCount: 2,
    kabCount: 10,
    aggregateBudget: 37120000000000, // Rp 37.12 T
    modalAbsorptionRate: 17.5,
    pegawaiAbsorptionRate: 31.9,
    statusIngestion: "Pipeline Rujukan",
    progressPercent: 55,
    featuredDaerah: ["Pekanbaru", "Dumai", "Bengkalis", "Siak", "Kampar"],
  },
  {
    code: "21",
    name: "Kepulauan Riau",
    capital: "Tanjungpinang",
    daerahCount: 7,
    kotaCount: 2,
    kabCount: 5,
    aggregateBudget: 14650000000000, // Rp 14.65 T
    modalAbsorptionRate: 21.1,
    pegawaiAbsorptionRate: 29.4,
    statusIngestion: "Pipeline Rujukan",
    progressPercent: 50,
    featuredDaerah: ["Batam", "Tanjungpinang", "Bintan", "Karimun", "Natuna"],
  },
  {
    code: "15",
    name: "Jambi",
    capital: "Jambi",
    daerahCount: 11,
    kotaCount: 2,
    kabCount: 9,
    aggregateBudget: 19830000000000, // Rp 19.83 T
    modalAbsorptionRate: 17.9,
    pegawaiAbsorptionRate: 34.5,
    statusIngestion: "Pipeline Rujukan",
    progressPercent: 45,
    featuredDaerah: ["Jambi", "Sungai Penuh", "Muaro Jambi", "Tanjung Jabung Barat", "Bungo"],
  },
  {
    code: "16",
    name: "Sumatera Selatan",
    capital: "Palembang",
    daerahCount: 17,
    kotaCount: 4,
    kabCount: 13,
    aggregateBudget: 44280000000000, // Rp 44.28 T
    modalAbsorptionRate: 18.6,
    pegawaiAbsorptionRate: 32.7,
    statusIngestion: "In Progress",
    progressPercent: 65,
    featuredDaerah: ["Palembang", "Prabumulih", "Lubuklinggau", "Banyuasin", "Muara Enim"],
  },
  {
    code: "19",
    name: "Kepulauan Bangka Belitung",
    capital: "Pangkalpinang",
    daerahCount: 7,
    kotaCount: 1,
    kabCount: 6,
    aggregateBudget: 11240000000000, // Rp 11.24 T
    modalAbsorptionRate: 20.3,
    pegawaiAbsorptionRate: 31.2,
    statusIngestion: "Pipeline Rujukan",
    progressPercent: 40,
    featuredDaerah: ["Pangkalpinang", "Bangka", "Belitung", "Belitung Timur", "Bangka Barat"],
  },
  {
    code: "17",
    name: "Bengkulu",
    capital: "Bengkulu",
    daerahCount: 10,
    kotaCount: 1,
    kabCount: 9,
    aggregateBudget: 13720000000000, // Rp 13.72 T
    modalAbsorptionRate: 16.4,
    pegawaiAbsorptionRate: 37.8,
    statusIngestion: "Pipeline Rujukan",
    progressPercent: 35,
    featuredDaerah: ["Bengkulu", "Rejang Lebong", "Bengkulu Utara", "Mukomuko", "Seluma"],
  },
  {
    code: "18",
    name: "Lampung",
    capital: "Bandar Lampung",
    daerahCount: 15,
    kotaCount: 2,
    kabCount: 13,
    aggregateBudget: 31410000000000, // Rp 31.41 T
    modalAbsorptionRate: 17.8,
    pegawaiAbsorptionRate: 33.4,
    statusIngestion: "Pipeline Rujukan",
    progressPercent: 50,
    featuredDaerah: ["Bandar Lampung", "Metro", "Lampung Selatan", "Lampung Tengah", "Tanggameus"],
  },
];

export const nationalIslandsGroups: GugusKepulauan[] = [
  {
    id: "sumatera",
    name: "Gugus Pulau Sumatera",
    island: "Sumatera",
    provincesCount: 10,
    daerahCount: 154,
    aggregateBudget: 297850000000000, // Rp 297.85 T
    modalAbsorptionRate: 18.4,
    pegawaiShareRate: 33.7,
    yearEndModalSpikeRate: 74,
    status: "33 Daerah Live SHA-256 · 121 Daerah Staging",
    phase: "Fase 1 (Aktif)",
  },
  {
    id: "jawa",
    name: "Gugus Pulau Jawa",
    island: "Jawa",
    provincesCount: 6,
    daerahCount: 119,
    aggregateBudget: 382410000000000, // Rp 382.41 T
    modalAbsorptionRate: 21.8,
    pegawaiShareRate: 31.2,
    yearEndModalSpikeRate: 62,
    status: "Schema Mapping & API Rujukan Selesai",
    phase: "Fase 2 (Q2 2026)",
  },
  {
    id: "kalimantan",
    name: "Gugus Pulau Kalimantan",
    island: "Kalimantan",
    provincesCount: 5,
    daerahCount: 56,
    aggregateBudget: 148920000000000, // Rp 148.92 T
    modalAbsorptionRate: 19.1,
    pegawaiShareRate: 30.5,
    yearEndModalSpikeRate: 68,
    status: "Validasi Parsing Format SIKD",
    phase: "Fase 3 (Q3 2026)",
  },
  {
    id: "sulawesi",
    name: "Gugus Pulau Sulawesi",
    island: "Sulawesi",
    provincesCount: 6,
    daerahCount: 81,
    aggregateBudget: 136240000000000, // Rp 136.24 T
    modalAbsorptionRate: 17.3,
    pegawaiShareRate: 36.1,
    yearEndModalSpikeRate: 71,
    status: "Sinkronisasi Pagu APBD Murni",
    phase: "Fase 3 (Q3 2026)",
  },
  {
    id: "bali-nusra",
    name: "Gugus Kepulauan Bali & Nusa Tenggara",
    island: "Bali & Nusa Tenggara",
    provincesCount: 3,
    daerahCount: 41,
    aggregateBudget: 68510000000000, // Rp 68.51 T
    modalAbsorptionRate: 16.7,
    pegawaiShareRate: 35.8,
    yearEndModalSpikeRate: 69,
    status: "Katalogisasi Kodifikasi Daerah",
    phase: "Fase 4 (Q4 2026)",
  },
  {
    id: "maluku-papua",
    name: "Gugus Kepulauan Maluku & Papua",
    island: "Maluku & Papua",
    provincesCount: 8,
    daerahCount: 63,
    aggregateBudget: 112470000000000, // Rp 112.47 T
    modalAbsorptionRate: 15.2,
    pegawaiShareRate: 38.4,
    yearEndModalSpikeRate: 79,
    status: "Pemetaan Alokasi Khusus & Otsus",
    phase: "Fase 4 (2027)",
  },
];

export const nationalFiscalSummary: NationalFiscalSummary = {
  totalProvinces: 38,
  totalDaerah: 514,
  totalKota: 98,
  totalKabupaten: 416,
  totalAggregateBudget: 1146400000000000, // Rp 1.146,4 Triliun (~Rp 1,15 Kuadriliun)
  targetUUHKPDModal: 40.0,
  currentNationalModalAvg: 18.2,
  targetUUHKPDPegawai: 30.0,
  currentNationalPegawaiAvg: 34.6,
  projectedPublicImpact: {
    modalAccelerationPotential: 126800000000000, // Rp 126,8 Triliun potensi akselerasi modal
    personnelEfficiencyPotential: 52700000000000, // Rp 52,7 Triliun potensi realokasi pegawai
    totalMonitoredPemda: 514,
  },
};
