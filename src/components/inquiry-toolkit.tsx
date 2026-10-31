"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  FileQuestion,
  Info,
  MessageCircle,
  Printer,
  TriangleAlert,
} from "lucide-react";
import type { Dataset, Region, Snapshot } from "@/lib/types";
import { generateInquiryBrief } from "@/lib/indicators";
import { compactMoney, percent, periodLabel } from "@/lib/format";
import { percentage } from "@/lib/data-core";

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

  // Tahun lengkap terakhir yang memiliki snapshot Oktober dan Desember
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
      textLines.push(
        `[${idx + 1}] ${item.title.toUpperCase()} (${item.period})`,
      );
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

  function shareToWhatsApp() {
    const rate = percentage(
      currentSnapshot.total.realized,
      currentSnapshot.total.budget,
    );
    const textLines = [
      `*Telaah Kritis APBD ${region.name} — GovSight ID*`,
      `Periode: ${periodLabel(currentSnapshot.year, currentSnapshot.month)}`,
      `Realisasi: ${compactMoney(currentSnapshot.total.realized)} (${percent(rate)} terserap)`,
      ``,
      `*Temuan Kunci Advokasi:*`,
    ];
    items.forEach((item, idx) => {
      textLines.push(`${idx + 1}. *${item.title}*`);
      textLines.push(`   ${item.observation}`);
    });
    textLines.push(``);
    textLines.push(
      `Buka lembar telaah & data lengkap di: ${typeof window !== "undefined" ? window.location.href : ""}`,
    );
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textLines.join("\n"))}`;
    window.open(url, "_blank");
  }

  return (
    <section className="card" id="lembar-advokasi">
      <div className="card__head">
        <div className="section-head__text">
          <span className="chip chip--warn">Decision Support System</span>
          <h2 className="inquiry-title">
            Panduan advokasi & lembar pertanyaan publik
          </h2>
          <p className="card__sub">
            Daftar telaah otomatis berbasis data APBD untuk bahan Rapat Dengar
            Pendapat DPRD, liputan jurnalis, atau audiensi warga.
          </p>
        </div>
        <div className="page-actions no-print">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={shareToWhatsApp}
            aria-label="Bagikan ringkasan telaah ke WhatsApp"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={copyQuestions}
            aria-label="Salin naskah pertanyaan ke clipboard"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? "Naskah tersalin" : "Salin naskah"}</span>
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handlePrint}
            aria-label="Cetak lembar telaah atau simpan sebagai PDF"
          >
            <Printer size={15} />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      <div className="card__body">
        <div className="inquiry-grid">
          {items.map((item) => {
            const isAtensi = item.badge === "atensi";
            const isKonteks = item.badge === "konteks";
            return (
              <article
                key={item.id}
                className={`inquiry-card ${
                  isAtensi
                    ? "inquiry-card--atensi"
                    : isKonteks
                      ? "inquiry-card--konteks"
                      : ""
                }`}
              >
                <div className="inquiry-card__head">
                  <div className="inquiry-card__meta">
                    <span
                      className={`chip chip--square ${
                        isAtensi
                          ? "chip--warn"
                          : isKonteks
                            ? "chip--info"
                            : "chip--ok"
                      }`}
                    >
                      {isAtensi ? (
                        <TriangleAlert size={11} />
                      ) : isKonteks ? (
                        <Info size={11} />
                      ) : (
                        <CheckCircle2 size={11} />
                      )}
                      {item.badgeLabel}
                    </span>
                    <span className="chip chip--square chip--ghost">
                      {item.period}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                </div>

                <div className="inquiry-card__observation">
                  <span>Temuan data</span>
                  <p>{item.observation}</p>
                </div>

                <div className="inquiry-card__questions">
                  <div>
                    <FileQuestion size={13} />
                    Rekomendasi pertanyaan untuk pengawasan
                  </div>
                  <div className="qlist">
                    {item.questions.map((q, idx) => (
                      <div key={idx} className="qitem">
                        <span>{idx + 1}</span>
                        <p>{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="card__foot">
        <p className="eyebrow">Alur advokasi warga berdaya</p>
        <div className="steps" style={{ marginTop: 14 }}>
          <div className="step">
            <span className="step__num">1</span>
            <div>
              <strong>Pelajari data</strong>
              <p>
                Periksa kembali angka realisasi dan tautan sumber resmi di
                bawah.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step__num">2</span>
            <div>
              <strong>Bawa ke forum resmi</strong>
              <p>
                Gunakan pertanyaan di atas saat Musrenbang atau RDP komisi DPRD.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step__num">3</span>
            <div>
              <strong>Ajukan KIP atau SP4N-LAPOR!</strong>
              <p>
                Minta rincian proyek melalui PPID bila data rinci belum terbuka.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
