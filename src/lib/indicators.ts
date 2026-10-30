import Decimal from "decimal.js";
import type { Snapshot } from "./types";
import { percentage } from "./data-core";

export function categoryShares(snapshot: Snapshot, code: string) {
  const category = snapshot.categories.find((line) => line.code === code);
  return {
    budget: percentage(category?.budget ?? null, snapshot.total.budget),
    realized: percentage(category?.realized ?? null, snapshot.total.realized),
  };
}
export function monthlyAbsorption(snapshot: Snapshot) {
  return percentage(snapshot.total.realized, snapshot.total.budget);
}

export function threeYearTrend(
  snapshots: Snapshot[],
): "meningkat" | "menurun" | "tetap" | "berfluktuasi" | null {
  const sorted = [...snapshots].sort((a, b) => a.year - b.year);
  if (
    sorted.length !== 3 ||
    sorted.some(
      (s, i) =>
        s.month !== 12 ||
        s.regionCode !== sorted[0].regionCode ||
        (i > 0 && s.year !== sorted[i - 1].year + 1),
    )
  )
    return null;
  const values = sorted.map((s) => categoryShares(s, "modal").realized);
  if (values.some((value) => value === null)) return null;
  const [a, b, c] = values as number[];
  if (a === b && b === c) return "tetap";
  if (a <= b && b <= c) return "meningkat";
  if (a >= b && b >= c) return "menurun";
  return "berfluktuasi";
}

export function belowThreeYearReference(
  snapshots: Snapshot[],
  reference: number,
): boolean | null {
  if (
    !Number.isFinite(reference) ||
    reference < 0 ||
    reference > 100 ||
    threeYearTrend(snapshots) === null
  )
    return null;
  return snapshots.every(
    (snapshot) => categoryShares(snapshot, "modal").realized! < reference,
  );
}

export const YEAR_END_THRESHOLD = 40;
export function formatFlagShare(share: number | null): string {
  return share === null
    ? "Belum tersedia"
    : `${share.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
export function yearEndModalFlag(
  october: Snapshot | undefined,
  december: Snapshot | undefined,
) {
  const regionCode = october?.regionCode ?? december?.regionCode ?? "";
  const year = october?.year ?? december?.year ?? 0;
  const unavailable = {
    regionCode,
    year,
    share: null,
    status: "belum-tersedia" as const,
  };
  if (
    !october ||
    !december ||
    october.regionCode !== december.regionCode ||
    october.year !== december.year ||
    october.month !== 10 ||
    december.month !== 12
  )
    return unavailable;
  const a = october.categories.find((c) => c.code === "modal")?.realized;
  const b = december.categories.find((c) => c.code === "modal")?.realized;
  if (a == null || b == null || new Decimal(b).isZero()) return unavailable;
  if (new Decimal(a).gt(b))
    return { ...unavailable, status: "tidak-konsisten" as const };
  const value = new Decimal(b).minus(a).div(b).times(100);
  const rounded = value.toDecimalPlaces(2);
  return {
    regionCode,
    year,
    share: rounded.toNumber(),
    status: rounded.gte(YEAR_END_THRESHOLD)
      ? ("ditandai" as const)
      : ("wajar" as const),
  };
}

export type PersistenceStatus =
  | "dua-tahun-beruntun"
  | "baru-2025"
  | "baru-2024"
  | "konsisten-wajar"
  | "belum-lengkap";

export function yearEndPersistence(
  flag2024: ReturnType<typeof yearEndModalFlag>,
  flag2025: ReturnType<typeof yearEndModalFlag>,
): {
  status: PersistenceStatus;
  label: string;
} {
  const f24 = flag2024.status === "ditandai";
  const f25 = flag2025.status === "ditandai";
  const w24 = flag2024.status === "wajar";
  const w25 = flag2025.status === "wajar";

  if (f24 && f25) {
    return {
      status: "dua-tahun-beruntun",
      label: "Pola 2 Tahun Berurutan",
    };
  }
  if (!f24 && f25) {
    return {
      status: "baru-2025",
      label: "Baru Terindikasi di 2025",
    };
  }
  if (f24 && !f25) {
    return {
      status: "baru-2024",
      label: "Terindikasi di 2024 Saja",
    };
  }
  if (w24 && w25) {
    return {
      status: "konsisten-wajar",
      label: "Konsisten di Bawah Ambang",
    };
  }
  return {
    status: "belum-lengkap",
    label: "Data Belum Lengkap",
  };
}

export interface InquiryItem {
  id: string;
  category: "akhir-tahun" | "alokasi" | "tren" | "serapan";
  period: string;
  title: string;
  badge: "atensi" | "konteks" | "normal";
  badgeLabel: string;
  observation: string;
  questions: string[];
}

export function generateInquiryBrief(
  currentSnapshot: Snapshot,
  octoberSnapshot?: Snapshot,
  decemberSnapshot?: Snapshot,
  completeYearsSnapshots?: Snapshot[],
): InquiryItem[] {
  const items: InquiryItem[] = [];

  // 1. Indikator Lonjakan Akhir Tahun (Year-End Surge)
  const flag = yearEndModalFlag(octoberSnapshot, decemberSnapshot);
  if (flag.status === "ditandai") {
    items.push({
      id: "akhir-tahun",
      category: "akhir-tahun",
      period: `Evaluasi Tahun Anggaran ${flag.year}`,
      title: `Konsentrasi Belanja Modal Akhir Tahun (${formatFlagShare(flag.share)})`,
      badge: "atensi",
      badgeLabel: "Perlu Pendalaman",
      observation: `Sebanyak ${formatFlagShare(flag.share)} realisasi belanja modal setahun terkonsentrasi pada November–Desember ${flag.year}. Angka ini melampaui laju rata-rata merata 12 bulan (16,67%) dan ambang metodologi ${YEAR_END_THRESHOLD}%.`,
      questions: [
        `Program pengadaan dan paket pekerjaan fisik apa saja yang dibayarkan pada November–Desember ${flag.year}?`,
        `Apakah seluruh pekerjaan telah melalui Berita Acara Serah Terima (BAST/PHO) dan pengujian mutu teknis sebelum pencairan diterbitkan?`,
        `Langkah tata kelola apa yang diterapkan dinas terkait agar penyerapan modal tahun berikutnya terdistribusi lebih proporsional sepanjang triwulan?`,
      ],
    });
  } else if (flag.status === "wajar") {
    items.push({
      id: "akhir-tahun",
      category: "akhir-tahun",
      period: `Evaluasi Tahun Anggaran ${flag.year}`,
      title: `Penyaluran Belanja Modal Akhir Tahun Berada di Bawah Ambang (${formatFlagShare(flag.share)})`,
      badge: "normal",
      badgeLabel: "Sesuai Ambang",
      observation: `Realisasi modal pada dua bulan terakhir ${flag.year} tercatat ${formatFlagShare(flag.share)}, berada di bawah ambang penanda ${YEAR_END_THRESHOLD}%.`,
      questions: [
        `Praktik penjadwalan lelang atau termin kontrak apa yang dijalankan sehingga pencairan tidak menumpuk di pengujung tahun?`,
      ],
    });
  }

  // 2. Keseimbangan Belanja Pegawai vs Belanja Modal (Berakar pada UU HKPD No. 1/2022)
  const pegawai = categoryShares(currentSnapshot, "pegawai");
  const modal = categoryShares(currentSnapshot, "modal");
  if (pegawai.budget !== null && modal.budget !== null) {
    if (pegawai.budget > 30) {
      items.push({
        id: "alokasi-pegawai",
        category: "alokasi",
        period: `Pagu APBD ${currentSnapshot.year}`,
        title: `Porsi Belanja Pegawai ${formatFlagShare(pegawai.budget)} (Konteks UU HKPD Pasal 146)`,
        badge: "konteks",
        badgeLabel: "Konteks Regulasi",
        observation: `Alokasi belanja pegawai menyerap ${formatFlagShare(pegawai.budget)} dari total pagu belanja daerah. Sebagai acuan regulasi, UU No. 1 Tahun 2022 (HKPD) Pasal 146 ayat (1) mengarahkan batas maksimal belanja pegawai sebesar 30% dari APBD (dengan masa transisi 5 tahun hingga 2027).`,
        questions: [
          `Bagaimana rencana strategis pemerintah daerah dalam penyesuaian bertahap porsi belanja pegawai menuju target maksimal 30% sesuai amanat UU HKPD?`,
          `Upaya digitalisasi birokrasi dan penyederhanaan proses apa yang dirancang guna memperluas ruang fiskal untuk belanja publik?`,
        ],
      });
    }

    if (modal.budget !== null && modal.budget < 20) {
      items.push({
        id: "alokasi-modal",
        category: "alokasi",
        period: `Pagu APBD ${currentSnapshot.year}`,
        title: `Porsi Belanja Modal ${formatFlagShare(modal.budget)} (Konteks UU HKPD Pasal 147)`,
        badge: "konteks",
        badgeLabel: "Kapasitas Fiskal",
        observation: `Alokasi belanja modal untuk aset infrastruktur publik tercatat ${formatFlagShare(modal.budget)} dari pagu APBD. UU HKPD Pasal 147 ayat (1) mengarahkan pemda bertahap mengalokasikan minimal 40% belanja infrastruktur pelayanan publik.`,
        questions: [
          `Langkah apa yang dipersiapkan daerah untuk meningkatkan porsi investasi modal fisik bagi pemeliharaan dan penambahan fasilitas dasar warga?`,
        ],
      });
    }
  }

  // 3. Tren Investasi Modal 3 Tahun Berturut-turut
  if (completeYearsSnapshots && completeYearsSnapshots.length === 3) {
    const trend = threeYearTrend(completeYearsSnapshots);
    if (trend === "menurun") {
      items.push({
        id: "tren-modal",
        category: "tren",
        period: `Tren Realisasi 3 Tahun (${completeYearsSnapshots[0].year}–${completeYearsSnapshots[2].year})`,
        title: "Porsi Belanja Modal Tercatat Menurun 3 Tahun Berurutan",
        badge: "atensi",
        badgeLabel: "Perlu Pendalaman",
        observation:
          "Dalam kurun tiga tahun anggaran penuh berurutan, proporsi belanja modal terhadap total belanja yang direalisasikan mengalami tren penurunan konsisten.",
        questions: [
          "Faktor apa yang menjadi penyebab utama penurunan kapasitas alokasi belanja modal fisik daerah dari tahun ke tahun?",
          "Bagaimana strategi pemda dalam menjaga kesinambungan pemeliharaan jalan, jembatan, dan fasilitas publik yang menua?",
        ],
      });
    } else if (trend === "meningkat") {
      items.push({
        id: "tren-modal",
        category: "tren",
        period: `Tren Realisasi 3 Tahun (${completeYearsSnapshots[0].year}–${completeYearsSnapshots[2].year})`,
        title: "Porsi Belanja Modal Meningkat Konsisten 3 Tahun Berurutan",
        badge: "normal",
        badgeLabel: "Sesuai Ambang",
        observation:
          "Komposisi belanja modal terhadap total belanja yang direalisasikan menunjukkan tren kenaikan dalam tiga tahun berturut-turut.",
        questions: [
          "Program pembangunan prioritas apa saja yang didanai melalui kenaikan porsi modal ini dan bagaimana dampak nyata yang dirasakan masyarakat?",
        ],
      });
    }
  }

  // 4. Laju Serapan Berjalan (Hanya untuk tahun berjalan sebelum bulan 12)
  const currentAbsorption = monthlyAbsorption(currentSnapshot);
  if (
    currentAbsorption !== null &&
    currentSnapshot.month >= 8 &&
    currentSnapshot.month < 12 &&
    currentAbsorption < 50
  ) {
    items.push({
      id: "serapan-lambat",
      category: "serapan",
      period: `Laporan s.d. Bulan ${currentSnapshot.month} ${currentSnapshot.year}`,
      title: `Serapan Berjalan Lambat (${formatFlagShare(currentAbsorption)} s.d. Bulan ${currentSnapshot.month})`,
      badge: "konteks",
      badgeLabel: "Laju Pelaksanaan",
      observation: `Hingga bulan ${currentSnapshot.month}, baru ${formatFlagShare(currentAbsorption)} pagu tahunan yang terserap. Kondisi serapan paruh kedua yang rendah berpotensi mendorong percepatan pencairan di pengujung tahun anggaran.`,
      questions: [
        "Kendala apa yang dihadapi OPD dalam penyelesaian tahapan lelang atau pengadaan barang dan jasa?",
        "Langkah percepatan teknis apa yang disiapkan agar pekerjaan fisik dapat selesai dengan mutu baik sebelum tahun anggaran berakhir?",
      ],
    });
  } else if (
    currentAbsorption !== null &&
    currentSnapshot.month === 12 &&
    currentAbsorption < 85
  ) {
    items.push({
      id: "serapan-akhir-rendah",
      category: "serapan",
      period: `Laporan Akhir Tahun ${currentSnapshot.year}`,
      title: `Serapan Akhir Tahun Tercatat ${formatFlagShare(currentAbsorption)}`,
      badge: "konteks",
      badgeLabel: "Evaluasi Serapan",
      observation: `Hingga akhir tahun anggaran, realisasi belanja daerah ditutup pada angka ${formatFlagShare(currentAbsorption)} dari pagu tahunan.`,
      questions: [
        "Faktor apa yang menyebabkan pagu anggaran tidak terserap optimal dan program apa yang mengalami efisiensi atau penundaan?",
        "Bagaimana pemanfaatan Sisa Lebih Pembiayaan Anggaran (SiLPA) yang terbentuk untuk mendukung APBD tahun berikutnya?",
      ],
    });
  }

  return items;
}
