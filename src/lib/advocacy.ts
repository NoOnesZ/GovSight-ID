import type { InquiryItem } from "./indicators";
import type { Region, Snapshot } from "./types";
import { categoryShares, yearEndModalFlag, formatFlagShare } from "./indicators";
import { compactMoney, fullMoney, percent, periodLabel } from "./format";
import { percentage } from "./data-core";

export interface LaporReportParams {
  region: Region;
  currentSnapshot: Snapshot;
  items: InquiryItem[];
  currentUrl?: string;
  octoberSnapshot?: Snapshot;
  decemberSnapshot?: Snapshot;
}

export interface LaporReportResult {
  title: string;
  agency: string;
  observation: string;
  sources: string[];
  fullText: string;
}

/**
 * Menghasilkan naskah aduan terstruktur khusus untuk portal pengaduan resmi SP4N-LAPOR!.
 * Memadukan temuan kuantitatif APBD, kepatuhan UU HKPD No. 1/2022 (Pasal 146/147),
 * indikator lonjakan belanja akhir tahun, dan tautan audit resmi.
 */
export function generateLaporReport({
  region,
  currentSnapshot,
  items,
  currentUrl,
  octoberSnapshot,
  decemberSnapshot,
}: LaporReportParams): LaporReportResult {
  const rate = percentage(
    currentSnapshot.total.realized,
    currentSnapshot.total.budget,
  );
  const sharesPegawai = categoryShares(currentSnapshot, "pegawai");
  const sharesModal = categoryShares(currentSnapshot, "modal");

  // Ringkasan Masalah untuk Judul Laporan
  const atensiItem = items.find((i) => i.badge === "atensi") ?? items[0];
  const ringkasanMasalah = atensiItem
    ? atensiItem.title
    : `Evaluasi Porsi Belanja Modal & Pegawai (${periodLabel(currentSnapshot.year, currentSnapshot.month)})`;

  const title = `[Dugaan Anomali Belanja APBD] ${region.name} TA ${currentSnapshot.year} - ${ringkasanMasalah}`;
  const agency = `Pemerintah Daerah ${region.name} / Kementerian Keuangan RI (DJPK)`;

  const auditUrl =
    currentUrl ||
    (typeof window !== "undefined"
      ? window.location.href
      : `https://govsight.id/profil/${region.code}?tahun=${currentSnapshot.year}&bulan=${currentSnapshot.month}`);
  const portalUrl =
    currentSnapshot.source?.portalUrl ||
    "https://djpk.kemenkeu.go.id/portal/data/apbd";

  const uraianLines: string[] = [
    `Kepada Yth. Pengelola Pengaduan SP4N-LAPOR! / Inspektorat Daerah / DJPK Kemenkeu RI,`,
    ``,
    `Melalui kanal pengaduan resmi ini, kami menyampaikan telaah data pelaksanaan APBD ${region.name} TA ${currentSnapshot.year} (posisi s.d. ${periodLabel(currentSnapshot.year, currentSnapshot.month)}) berbasis data resmi Sistem Informasi Keuangan Daerah (SIKD) Kementerian Keuangan RI:`,
    ``,
    `1. DATA KUANTITATIF ANGGARAN:`,
    `- Total Pagu Belanja: Rp ${fullMoney(currentSnapshot.total.budget)} (${compactMoney(currentSnapshot.total.budget)})`,
    `- Realisasi Kas Daerah: Rp ${fullMoney(currentSnapshot.total.realized)} (${compactMoney(currentSnapshot.total.realized)})`,
    `- Tingkat Serapan Belanja: ${percent(rate)} terserap`,
    ``,
    `2. EVALUASI KEPATUHAN REGULASI UU NO. 1/2022 (HKPD):`,
  ];

  if (sharesPegawai.budget !== null) {
    const isPegawaiOver = sharesPegawai.budget > 30;
    uraianLines.push(
      `- Porsi Belanja Pegawai: ${formatFlagShare(sharesPegawai.budget)} dari total pagu APBD (Realisasi: ${formatFlagShare(sharesPegawai.realized)}).`,
    );
    uraianLines.push(
      `  Ketentuan UU HKPD No. 1/2022 Pasal 146 ayat (1): Belanja pegawai dibatasi maksimal 30% dari total belanja APBD.${
        isPegawaiOver
          ? ` Alokasi anggaran ini terindikasi melampaui batas maksimal 30% dan membutuhkan evaluasi rasionalisasi birokrasi daerah.`
          : ` Masih memenuhi batas ambang maksimal 30% yang diatur regulasi.`
      }`,
    );
  }

  if (sharesModal.budget !== null) {
    const isModalBelow = sharesModal.budget < 40;
    uraianLines.push(
      `- Porsi Belanja Modal: ${formatFlagShare(sharesModal.budget)} dari total pagu APBD (Realisasi: ${formatFlagShare(sharesModal.realized)}).`,
    );
    uraianLines.push(
      `  Ketentuan UU HKPD No. 1/2022 Pasal 147 ayat (1): Alokasi belanja infrastruktur pelayanan publik diarahkan minimal 40% dari total belanja APBD.${
        isModalBelow
          ? ` Porsi belanja modal saat ini berada di bawah target minimal 40%, berisiko membatasi percepatan pembangunan sarana dasar publik bagi warga.`
          : ` Porsi belanja modal telah memenuhi batas alokasi minimal yang diarahkan.`
      }`,
    );
  }

  // Check Year-End Surge
  const flag = yearEndModalFlag(octoberSnapshot, decemberSnapshot);
  if (flag.status === "ditandai") {
    uraianLines.push(``);
    uraianLines.push(`3. INDIKASI LONJAKAN BELANJA AKHIR TAHUN (YEAR-END SURGE):`);
    uraianLines.push(
      `- Konsentrasi Realisasi Modal: Sebesar ${formatFlagShare(flag.share)} realisasi belanja modal setahun dicairkan terburu-buru dalam 2 bulan terakhir (November–Desember ${flag.year}).`,
    );
    uraianLines.push(
      `  Temuan ini melampaui ambang batas pengawasan 40% dan mengindikasikan risiko mutu konstruksi fisik serta potensi ketidakpatuhan administrasi pencairan anggaran.`,
    );
  }

  if (items.length > 0) {
    uraianLines.push(``);
    uraianLines.push(`4. REKOMENDASI AUDIT & PERTANYAAN PENGAWASAN:`);
    items.forEach((item, idx) => {
      uraianLines.push(`[${idx + 1}] ${item.title} (${item.period})`);
      uraianLines.push(`    Temuan: ${item.observation}`);
      item.questions.forEach((q, qIdx) => {
        uraianLines.push(`    ${String.fromCharCode(97 + qIdx)}. ${q}`);
      });
    });
  }

  uraianLines.push(``);
  uraianLines.push(`5. PERMOHONAN TINDAK LANJUT:`);
  uraianLines.push(
    `Memohon Inspektorat Daerah dan Kementerian Keuangan RI untuk melakukan klarifikasi, verifikasi uji petik Berita Acara Serah Terima (BAST/PHO), serta peninjauan alokasi belanja demi optimalisasi pelayanan publik warga.`,
  );

  const observation = uraianLines.join("\n");
  const sources = [
    `Tautan Audit Interaktif GovSight ID: ${auditUrl}`,
    `Portal Resmi DJPK Kemenkeu (SIKD): ${portalUrl}`,
  ];

  const fullText = [
    `JUDUL LAPORAN:`,
    title,
    ``,
    `INSTANSI TUJUAN:`,
    agency,
    ``,
    `URAIAN TEMUAN:`,
    observation,
    ``,
    `SUMBER DATA:`,
    sources.map((s) => `- ${s}`).join("\n"),
    ``,
    `---`,
    `Naskah laporan pengaduan ini disusun secara objektif berbasis data resmi APBD melalui GovSight ID.`,
  ].join("\n");

  return {
    title,
    agency,
    observation,
    sources,
    fullText,
  };
}
