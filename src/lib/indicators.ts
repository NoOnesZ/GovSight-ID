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

export interface InquiryItem {
  id: string;
  category: "akhir-tahun" | "alokasi" | "tren" | "serapan";
  title: string;
  badge: "kritis" | "perhatian" | "positif";
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
      title: `Lonjakan Belanja Modal Akhir Tahun (${formatFlagShare(flag.share)})`,
      badge: "kritis",
      badgeLabel: "Prioritas Ditanyakan",
      observation: `Sebanyak ${formatFlagShare(flag.share)} realisasi belanja modal setahun terkonsentrasi pada November–Desember ${flag.year}. Ini melampaui batas wajar rata-rata merata (16,67%) dan ambang ${YEAR_END_THRESHOLD}%.`,
      questions: [
        `Proyek fisik dan pengadaan apa saja yang dibayarkan pada November–Desember ${flag.year}?`,
        `Apakah seluruh pekerjaan telah melalui Berita Acara Serah Terima (BAST/PHO) dan uji mutu fisik sebelum pencairan anggaran?`,
        `Bagaimana mitigasi dinas teknis agar pencairan tidak tergesa-gesa di pengujung tahun anggaran berjalan?`,
      ],
    });
  } else if (flag.status === "wajar") {
    items.push({
      id: "akhir-tahun",
      category: "akhir-tahun",
      title: `Penyaluran Belanja Modal Akhir Tahun Terkendali (${formatFlagShare(flag.share)})`,
      badge: "positif",
      badgeLabel: "Di Bawah Ambang",
      observation: `Realisasi modal pada dua bulan terakhir ${flag.year} tercatat ${formatFlagShare(flag.share)}, di bawah ambang penanda ${YEAR_END_THRESHOLD}%.`,
      questions: [
        `Praktik penjadwalan dan termin lelang proyek apa yang terbukti efektif sehingga pencairan tidak menumpuk di akhir tahun?`,
      ],
    });
  }

  // 2. Keseimbangan Belanja Pegawai vs Belanja Modal
  const pegawai = categoryShares(currentSnapshot, "pegawai");
  const modal = categoryShares(currentSnapshot, "modal");
  if (pegawai.budget !== null && modal.budget !== null) {
    if (pegawai.budget > 40 || pegawai.budget > modal.budget * 2) {
      items.push({
        id: "alokasi-pegawai",
        category: "alokasi",
        title: `Porsi Belanja Pegawai (${formatFlagShare(pegawai.budget)}) Mendominasi Belanja Modal (${formatFlagShare(modal.budget)})`,
        badge: "perhatian",
        badgeLabel: "Keseimbangan Fiskal",
        observation: `Alokasi belanja aparatur mencapai ${formatFlagShare(pegawai.budget)} dari total pagu, berbanding ${formatFlagShare(modal.budget)} untuk investasi aset fisik dan infrastruktur publik.`,
        questions: [
          `Bagaimana rencana pemerintah daerah merestrukturisasi belanja operasional agar ruang fiskal untuk fasilitas publik meningkat?`,
          `Apakah besarnya alokasi aparatur berbanding lurus dengan kepuasan dan kecepatan layanan administrasi publik bagi warga?`,
        ],
      });
    }
  }

  // 3. Tren Investasi Modal 3 Tahun
  if (completeYearsSnapshots && completeYearsSnapshots.length === 3) {
    const trend = threeYearTrend(completeYearsSnapshots);
    if (trend === "menurun") {
      items.push({
        id: "tren-modal",
        category: "tren",
        title: "Porsi Belanja Modal Menurun dalam Tiga Tahun Terakhir",
        badge: "perhatian",
        badgeLabel: "Tren Investasi",
        observation:
          "Dalam kurun tiga tahun anggaran penuh berurutan, proporsi belanja modal terhadap total belanja daerah konsisten menyusut.",
        questions: [
          "Apa penyebab utama tren penurunan kapasitas belanja modal fisik daerah dari tahun ke tahun?",
          "Bagaimana strategi pemda dalam menjamin pemeliharaan jalan, jembatan, irigasi, dan gedung sekolah yang menua?",
        ],
      });
    } else if (trend === "meningkat") {
      items.push({
        id: "tren-modal",
        category: "tren",
        title: "Porsi Belanja Modal Meningkat Berkelanjutan",
        badge: "positif",
        badgeLabel: "Tren Positif",
        observation:
          "Komposisi belanja modal terhadap total realisasi daerah bertumbuh konsisten dalam tiga tahun berurutan.",
        questions: [
          "Infrastruktur strategis apa saja yang berhasil diselesaikan dari kenaikan porsi modal ini dan bagaimana dampak ekonominya bagi warga?",
        ],
      });
    }
  }

  // 4. Laju Serapan Berjalan (jika serapan < 50% pada semester kedua / bulan >= 8)
  const currentAbsorption = monthlyAbsorption(currentSnapshot);
  if (
    currentAbsorption !== null &&
    currentSnapshot.month >= 8 &&
    currentAbsorption < 50
  ) {
    items.push({
      id: "serapan-lambat",
      category: "serapan",
      title: `Serapan Berjalan Lambat (${formatFlagShare(currentAbsorption)} s.d. Bulan ${currentSnapshot.month})`,
      badge: "perhatian",
      badgeLabel: "Laju Pelaksanaan",
      observation: `Hingga bulan ${currentSnapshot.month}, baru ${formatFlagShare(currentAbsorption)} pagu tahunan yang terserap. Kondisi ini berpotensi memicu belanja kejar tayang di pengujung tahun.`,
      questions: [
        "Kendala apa yang dihadapi Organisasi Perangkat Daerah (OPD) dalam eksekusi lelang atau tender pengadaan?",
        "Apakah ada percepatan terukur yang disiapkan agar proyek tidak gagal bayar atau mangkrak di akhir tahun?",
      ],
    });
  }

  return items;
}
