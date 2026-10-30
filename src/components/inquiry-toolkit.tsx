"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileQuestion,
  HelpCircle,
  Info,
  Printer,
  Sparkles,
  Users,
} from "lucide-react";
import type { Dataset, Region, Snapshot } from "@/lib/types";
import { generateInquiryBrief } from "@/lib/indicators";
import { months } from "@/lib/regions";
import { fullMoney, periodLabel } from "@/lib/format";

export function InquiryToolkit({
  region,
  currentSnapshot,
  dataset,
}: {
  region: Region;
  currentSnapshot: Snapshot;
  dataset: Dataset;
}) {
  const [copied, setCopied] = useState(false);

  // Cari tahun lengkap terakhir yang memiliki snapshot Oktober dan Desember
  const completeYears = dataset.snapshots
    .filter((s) => s.regionCode === region.code && s.month === 12)
    .sort((a, b) => b.year - a.year)
    .slice(0, 3)
    .reverse();

  const latestCompleteYear = Math.max(
    ...dataset.snapshots
      .filter((s) => s.regionCode === region.code && s.month === 12)
      .map((s) => s.year),
  );

  const october = dataset.snapshots.find(
    (s) =>
      s.regionCode === region.code &&
      s.year === latestCompleteYear &&
      s.month === 10,
  );
  const december = dataset.snapshots.find(
    (s) =>
      s.regionCode === region.code &&
      s.year === latestCompleteYear &&
      s.month === 12,
  );

  const items = generateInquiryBrief(
    currentSnapshot,
    october,
    december,
    completeYears,
  );

  function copyQuestions() {
    const textLines = [
      `LEMBAR TELAAH & DAFTAR PERTANYAAN PUBLIK APBD`,
      `Daerah: ${region.name} (Sumatera Utara)`,
      `Periode Analisis: ${periodLabel(currentSnapshot.year, currentSnapshot.month)}`,
      `Sumber Data: Data Resmi DJPK Kementerian Keuangan (diolah GovSight ID)`,
      `--------------------------------------------------`,
      ``,
    ];

    items.forEach((item, idx) => {
      textLines.push(`[${idx + 1}] ${item.title.toUpperCase()}`);
      textLines.push(`Temuan Data: ${item.observation}`);
      textLines.push(`Rekomendasi Pertanyaan:`);
      item.questions.forEach((q, qIdx) => {
        textLines.push(`  ${String.fromCharCode(97 + qIdx)}. ${q}`);
      });
      textLines.push(``);
    });

    textLines.push(
      `Dicetak/disalin melalui GovSight ID (Sistem Pendukung Keputusan Warga & Advokasi Kebijakan Publik).`,
    );

    navigator.clipboard.writeText(textLines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <section className="panel inquiry-toolkit-panel" id="lembar-advokasi">
      <div className="inquiry-header">
        <div className="inquiry-header-text">
          <span className="pill amber">
            <Sparkles size={13} /> Decision Support System (DSS)
          </span>
          <h2>Panduan Advokasi & Lembar Pertanyaan Publik</h2>
          <p>
            Daftar telaah otomatis berbasis data APBD untuk bahan Rapat Dengar
            Pendapat (RDP) DPRD, liputan jurnalis, atau audiensi warga.
          </p>
        </div>
        <div className="inquiry-actions no-print">
          <button
            type="button"
            className="button button-secondary"
            onClick={copyQuestions}
            aria-label="Salin naskah pertanyaan ke clipboard"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-600" />
                <span>Naskah Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Salin Naskah Pertanyaan</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={handlePrint}
            aria-label="Cetak lembar telaah atau simpan sebagai PDF"
          >
            <Printer size={16} />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      <div className="inquiry-grid">
        {items.map((item) => {
          const isKritis = item.badge === "kritis";
          const isPerhatian = item.badge === "perhatian";
          return (
            <div
              key={item.id}
              className={`inquiry-card ${
                isKritis
                  ? "inquiry-card-kritis"
                  : isPerhatian
                    ? "inquiry-card-perhatian"
                    : "inquiry-card-positif"
              }`}
            >
              <div className="inquiry-card-top">
                <span
                  className={`inquiry-badge ${
                    isKritis
                      ? "badge-kritis"
                      : isPerhatian
                        ? "badge-perhatian"
                        : "badge-positif"
                  }`}
                >
                  {isKritis ? (
                    <AlertTriangle size={13} />
                  ) : isPerhatian ? (
                    <Info size={13} />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  {item.badgeLabel}
                </span>
                <h3>{item.title}</h3>
              </div>
              <p className="inquiry-observation">{item.observation}</p>

              <div className="inquiry-questions-box">
                <h4>
                  <FileQuestion size={15} /> Pertanyaan yang Disarankan:
                </h4>
                <ol>
                  {item.questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ol>
              </div>
            </div>
          );
        })}
      </div>

      <div className="inquiry-footer">
        <div className="inquiry-guide-step">
          <span className="step-num">1</span>
          <div>
            <strong>Pelajari Data</strong>
            <p>Periksa kembali angka realisasi dan tautan sumber resmi di bawah.</p>
          </div>
        </div>
        <div className="inquiry-guide-step">
          <span className="step-num">2</span>
          <div>
            <strong>Bawa ke Forum Resmi</strong>
            <p>Gunakan pertanyaan di atas saat Musrenbang atau RDP Komisi DPRD.</p>
          </div>
        </div>
        <div className="inquiry-guide-step">
          <span className="step-num">3</span>
          <div>
            <strong>Ajukan KIP / SP4N-LAPOR!</strong>
            <p>Minta rincian proyek melalui PPID bila data rinci belum terbuka.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
