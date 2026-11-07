"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  FileQuestion,
  Info,
  Megaphone,
  MessageCircle,
  Printer,
  TriangleAlert,
} from "lucide-react";
import type { Dataset, Region, Snapshot } from "@/lib/types";
import { generateInquiryBrief } from "@/lib/indicators";
import { compactMoney, percent, periodLabel } from "@/lib/format";
import { percentage } from "@/lib/data-core";
import { generateLaporReport } from "@/lib/advocacy";
import { GlossaryTerm } from "./shared";

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
  const [laporToast, setLaporToast] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  function toggleCard(id: string) {
    setCollapsedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

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

  function reportToLapor() {
    const report = generateLaporReport({
      region,
      currentSnapshot,
      items,
      octoberSnapshot: october,
      decemberSnapshot: december,
    });

    navigator.clipboard.writeText(report.fullText).then(() => {
      setLaporToast(true);
      setTimeout(() => setLaporToast(false), 5000);
    });

    window.open("https://www.lapor.go.id/", "_blank", "noopener,noreferrer");
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

          <div
            className="advocacy-glossary-strip no-print"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              padding: "7px 12px",
              background: "var(--sunk)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm, 7px)",
              marginTop: "12px",
              fontSize: "0.75rem",
              color: "var(--ink-2)",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: "var(--ink)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Info size={13} style={{ color: "var(--accent)" }} />
              Kamus Istilah APBD & Advokasi:
            </span>
            <GlossaryTerm term="pagu">Pagu</GlossaryTerm>
            <span style={{ color: "var(--line-3)" }}>·</span>
            <GlossaryTerm term="realisasi">Realisasi</GlossaryTerm>
            <span style={{ color: "var(--line-3)" }}>·</span>
            <GlossaryTerm term="belanja-modal">Belanja Modal</GlossaryTerm>
            <span style={{ color: "var(--line-3)" }}>·</span>
            <GlossaryTerm term="belanja-pegawai">Belanja Pegawai</GlossaryTerm>
            <span style={{ color: "var(--line-3)" }}>·</span>
            <GlossaryTerm term="uu-hkpd">UU HKPD (No. 1/2022)</GlossaryTerm>
            <span style={{ color: "var(--line-3)" }}>·</span>
            <GlossaryTerm term="silpa">SiLPA</GlossaryTerm>
          </div>

          {laporToast && (
            <div
              role="status"
              className="no-print"
              style={{
                marginTop: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "var(--r-sm)",
                backgroundColor: "var(--ok-bg)",
                border: "1px solid var(--ok-line)",
                color: "var(--ok-ink)",
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              <CheckCircle2 size={14} style={{ color: "var(--ok-solid)", flexShrink: 0 }} />
              <span>Naskah aduan disalin! Mengalihkan ke SP4N-LAPOR!...</span>
            </div>
          )}
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
            onClick={reportToLapor}
            aria-label="Laporkan temuan APBD via portal resmi SP4N-LAPOR!"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
              color: "var(--alert-ink, #8e3a24)",
              backgroundColor: "var(--alert-bg, #fcf1ee)",
              borderColor: "var(--alert-line, #f0d6cd)",
            }}
          >
            <Megaphone size={15} style={{ color: "var(--alert-solid, #b14a2c)", flexShrink: 0 }} />
            <span>Laporkan via SP4N-LAPOR!</span>
            <ExternalLink size={12} style={{ opacity: 0.75, flexShrink: 0 }} />
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
            const isCollapsed = Boolean(collapsedCards[item.id]);
            return (
              <article
                key={item.id}
                className={`inquiry-card ${
                  isAtensi
                    ? "inquiry-card--atensi"
                    : isKonteks
                      ? "inquiry-card--konteks"
                      : ""
                } ${isCollapsed ? "is-collapsed" : "is-expanded"}`}
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
                  <button
                    type="button"
                    className="inquiry-card__toggle"
                    onClick={() => toggleCard(item.id)}
                    aria-expanded={!isCollapsed}
                    aria-controls={`inquiry-content-${item.id}`}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
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
                    <span
                      className="inquiry-card__chevron no-print"
                      aria-hidden="true"
                      style={{ marginLeft: "10px" }}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </button>
                </div>

                <div
                  id={`inquiry-content-${item.id}`}
                  className="inquiry-card__disclosure"
                >
                  <div className="inquiry-card__disclosure-inner">
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
                                fontVariantNumeric: "tabular-nums lining-nums",
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
                Periksa kembali angka <GlossaryTerm term="pagu">pagu</GlossaryTerm> dan <GlossaryTerm term="realisasi">realisasi</GlossaryTerm> serta tautan sumber resmi di
                bawah.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step__num" style={{ fontWeight: 600, color: "var(--ink)" }}>2</span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Bawa ke forum resmi</strong>
              <p style={{ color: "var(--ink-2)" }}>
                Gunakan rekomendasi pertanyaan kritis di atas saat Musrenbang atau RDP komisi DPRD.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step__num" style={{ fontWeight: 600, color: "var(--ink)" }}>3</span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Laporkan via SP4N-LAPOR! atau Permohonan KIP</strong>
              <p style={{ color: "var(--ink-2)" }}>
                Kirim naskah aduan resmi ke SP4N-LAPOR! dengan tombol di atas, atau minta rincian dokumen BAST proyek fisik melalui PPID bila data belum dibuka ke publik, berlandaskan mandat <GlossaryTerm term="uu-hkpd">UU HKPD</GlossaryTerm> dan evaluasi saldo <GlossaryTerm term="silpa">SiLPA</GlossaryTerm>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {laporToast && (
        <div
          role="status"
          aria-live="polite"
          className="toast-notification no-print"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "var(--paper)",
            color: "var(--ink)",
            border: "1px solid var(--accent)",
            boxShadow: "0 8px 24px rgba(20, 57, 94, 0.16)",
            borderRadius: "var(--r)",
            padding: "12px 18px",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} style={{ color: "var(--ok-solid)", flexShrink: 0 }} />
          <span>Naskah aduan disalin! Mengalihkan ke SP4N-LAPOR!...</span>
        </div>
      )}
    </section>
  );
}
