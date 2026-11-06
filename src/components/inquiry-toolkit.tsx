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
      `Dicetak/disalin melalui GovSight ID (Panduan Advokasi & Lembar Pertanyaan Publik APBD).`,
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span
              className="chip chip--info"
              style={{
                fontWeight: 600,
                color: "var(--info-ink)",
                backgroundColor: "var(--info-bg)",
                borderColor: "var(--info-line)",
              }}
            >
              Bahan Telaah RDP & Musrenbang
            </span>
          </div>
          <h2 className="inquiry-title" style={{ margin: "0 0 6px 0" }}>
            Panduan Advokasi & Lembar Pertanyaan Publik
          </h2>
          <p className="card__sub" style={{ margin: 0, color: "var(--ink-2)" }}>
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
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
              color: "var(--ink)",
              borderColor: "var(--line-2)",
            }}
          >
            <MessageCircle size={15} style={{ color: "var(--ok-solid)", flexShrink: 0 }} />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            className={`btn ${copied ? "btn--primary" : "btn--secondary"}`}
            onClick={copyQuestions}
            aria-label="Salin naskah pertanyaan ke clipboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
              borderColor: copied ? "var(--ink)" : "var(--line-2)",
            }}
          >
            {copied ? (
              <Check size={15} style={{ flexShrink: 0 }} />
            ) : (
              <Copy size={15} style={{ flexShrink: 0 }} />
            )}
            <span>{copied ? "Naskah tersalin" : "Salin Naskah"}</span>
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handlePrint}
            aria-label="Cetak lembar telaah atau simpan sebagai PDF"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
              color: "var(--ink)",
              borderColor: "var(--line-2)",
            }}
          >
            <Printer size={15} style={{ flexShrink: 0 }} />
            <span>Cetak PDF</span>
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
                style={{
                  background: "var(--paper)",
                  border: isAtensi
                    ? "1px solid var(--warn-line)"
                    : isKonteks
                      ? "1px solid var(--info-line)"
                      : "1px solid var(--line)",
                  borderRadius: "var(--r)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  className="inquiry-card__head"
                  style={{
                    padding: "14px 16px 12px",
                    background: "transparent",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <div
                    className="inquiry-card__meta"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      className={`chip chip--square ${
                        isAtensi
                          ? "chip--warn"
                          : isKonteks
                            ? "chip--info"
                            : "chip--ok"
                      }`}
                      style={{
                        fontWeight: 600,
                        backgroundColor: isAtensi
                          ? "var(--warn-bg)"
                          : isKonteks
                            ? "var(--info-bg)"
                            : "var(--ok-bg)",
                        borderColor: isAtensi
                          ? "var(--warn-line)"
                          : isKonteks
                            ? "var(--info-line)"
                            : "var(--ok-line)",
                        color: isAtensi
                          ? "var(--warn-ink)"
                          : isKonteks
                            ? "var(--info-ink)"
                            : "var(--ok-ink)",
                      }}
                    >
                      {isAtensi ? (
                        <TriangleAlert size={11} style={{ flexShrink: 0 }} />
                      ) : isKonteks ? (
                        <Info size={11} style={{ flexShrink: 0 }} />
                      ) : (
                        <CheckCircle2 size={11} style={{ flexShrink: 0 }} />
                      )}
                      {item.badgeLabel}
                    </span>
                    <span
                      className="chip chip--square chip--ghost"
                      style={{
                        color: "var(--ink-2)",
                        borderColor: "var(--line-2)",
                        fontWeight: 500,
                      }}
                    >
                      {item.period}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--ink)",
                      margin: 0,
                      letterSpacing: "-0.015em",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </h3>
                </div>

                <div
                  className="inquiry-card__observation"
                  style={{
                    padding: "12px 16px",
                    background: "transparent",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--ink-2)",
                      marginBottom: "4px",
                    }}
                  >
                    Temuan data
                  </span>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--ink)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {item.observation}
                  </p>
                </div>

                <div
                  className="inquiry-card__questions"
                  style={{
                    padding: "14px 16px 16px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--ink-2)",
                      marginBottom: "12px",
                    }}
                  >
                    <FileQuestion size={13} style={{ color: "var(--ink-2)", flexShrink: 0 }} />
                    <span>Rekomendasi pertanyaan untuk pengawasan</span>
                  </div>
                  <div
                    className="qlist"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {item.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="qitem"
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            width: "20px",
                            height: "20px",
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "5px",
                            background: "var(--sunk)",
                            border: "1px solid var(--line-2)",
                            color: "var(--ink)",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {idx + 1}
                        </span>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--ink)",
                            lineHeight: 1.55,
                            margin: 0,
                          }}
                        >
                          {q}
                        </p>
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
        <h3
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
            margin: "0 0 12px 0",
          }}
        >
          Alur Advokasi Warga Berdaya
        </h3>
        <div className="steps">
          <div className="step">
            <span className="step__num" style={{ fontWeight: 600, color: "var(--ink)" }}>1</span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Pelajari data</strong>
              <p style={{ color: "var(--ink-2)" }}>
                Periksa kembali angka realisasi dan tautan sumber resmi di
                bawah.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step__num" style={{ fontWeight: 600, color: "var(--ink)" }}>2</span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Bawa ke forum resmi</strong>
              <p style={{ color: "var(--ink-2)" }}>
                Gunakan pertanyaan di atas saat Musrenbang atau RDP komisi DPRD.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step__num" style={{ fontWeight: 600, color: "var(--ink)" }}>3</span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Ajukan KIP atau SP4N-LAPOR!</strong>
              <p style={{ color: "var(--ink-2)" }}>
                Minta rincian proyek melalui PPID bila data rinci belum terbuka.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
