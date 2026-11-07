"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
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
import { compactMoney, fullMoney, percent, periodLabel } from "@/lib/format";
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
  const [exported, setExported] = useState(false);
  const [waShared, setWaShared] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  }

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

  function getAdvocacyDraftText(): string {
    const rate = percentage(
      currentSnapshot.total.realized,
      currentSnapshot.total.budget,
    );

    const lines: string[] = [
      `========================================================================`,
      `LEMBAR PENGAWASAN PUBLIK — TELAAH KRITIS PELAKSANAAN APBD`,
      `Bahan Telaah Rapat Dengar Pendapat (RDP) DPRD, Jurnalisme Warga, & Advokasi Publik`,
      `========================================================================`,
      ``,
      `I. IDENTITAS KAJIAN DAERAH`,
      `   Daerah Otonom       : ${region.name} (Provinsi Sumatera Utara)`,
      `   Tahun Anggaran      : ${currentSnapshot.year}`,
      `   Periode Analisis    : ${periodLabel(currentSnapshot.year, currentSnapshot.month)}`,
      `   Status Pelaporan    : Data Resmi Sistem Informasi Keuangan Daerah (SIKD)`,
      `   Sumber Data Primer  : DJPK Kementerian Keuangan Republik Indonesia`,
      `   Platform Telaah     : GovSight ID (Pantauan & Advokasi APBD Terbuka)`,
      ``,
      `II. LANDASAN HUKUM PENGAWASAN & ADVOKASI PUBLIK`,
      `   1. UU No. 1 Tahun 2022 tentang Hubungan Keuangan antara Pemerintah Pusat`,
      `      dan Pemerintahan Daerah (UU HKPD):`,
      `      - Pasal 146 ayat (1): Alokasi belanja pegawai dibatasi maksimal 30% dari APBD.`,
      `      - Pasal 147 ayat (1): Belanja infrastruktur pelayanan publik diarahkan minimal 40% dari APBD.`,
      `   2. UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik (UU KIP):`,
      `      - Hak masyarakat memperoleh dokumen publik, rincian DPA/RKA, dan Berita Acara Serah Terima (BAST).`,
      `   3. UU No. 23 Tahun 2014 tentang Pemerintahan Daerah:`,
      `      - Hak pengawasan legislatif DPRD dan partisipasi pengawasan warga masyarakat.`,
      ``,
      `III. RINGKASAN KUANTITATIF ANGGARAN`,
      `   • Pagu Belanja Total     : Rp ${fullMoney(currentSnapshot.total.budget)} (${compactMoney(currentSnapshot.total.budget)})`,
      `   • Realisasi Belanja Total: Rp ${fullMoney(currentSnapshot.total.realized)} (${compactMoney(currentSnapshot.total.realized)})`,
      `   • Tingkat Serapan        : ${percent(rate)} terserap`,
      ``,
      `IV. DAFTAR TELAAH KRITIS & REKOMENDASI PERTANYAAN PENGAWASAN`,
      `------------------------------------------------------------------------`,
    ];

    items.forEach((item, idx) => {
      lines.push(``);
      lines.push(`[POKOK TELAAH ${idx + 1}] ${item.title.toUpperCase()}`);
      lines.push(`Kategori & Status  : ${item.badgeLabel} (${item.period})`);
      lines.push(`Temuan Data Kritis : ${item.observation}`);
      lines.push(`Rekomendasi Pertanyaan Pengawasan:`);
      item.questions.forEach((q, qIdx) => {
        lines.push(`  (${String.fromCharCode(97 + qIdx)}) ${q}`);
      });
      lines.push(`------------------------------------------------------------------------`);
    });

    lines.push(``);
    lines.push(`V. PANDUAN AKSI PENGAWASAN PUBLIK`);
    lines.push(`   1. Musrenbang & RDP Komisi: Bawa rekomendasi pertanyaan di atas langsung ke rapat dengar pendapat DPRD.`);
    lines.push(`   2. Permohonan Informasi PPID: Ajukan permohonan resmi uji petik dokumen BAST/PHO berlandaskan UU KIP.`);
    lines.push(`   3. Pengaduan SP4N-LAPOR!: Sampaikan laporan resmi ke portal lapor.go.id bila terindikasi anomali anggaran.`);
    lines.push(``);
    lines.push(`Lembar pengawasan publik ini disusun secara independen melalui GovSight ID.`);
    lines.push(`Tautan Verifikasi Data Interaktif: ${typeof window !== "undefined" ? window.location.href : ""}`);

    return lines.join("\n");
  }

  function copyQuestions() {
    const text = getAdvocacyDraftText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast("Draf pertanyaan berhasil disalin ke clipboard! Siap digunakan untuk RDP / KIP.");
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function exportText() {
    const text = getAdvocacyDraftText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Telaah-Pengawasan-APBD-${region.code.toLowerCase()}-${currentSnapshot.year}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExported(true);
    showToast("Berkas teks telaah (.txt) berhasil diunduh!");
    setTimeout(() => setExported(false), 2500);
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
      `🏛️ *LEMBAR PENGAWASAN PUBLIK APBD*`,
      `*${region.name.toUpperCase()} (SUMATERA UTARA)*`,
      `_Landasan: UU No. 1/2022 (HKPD) & UU No. 14/2008 (KIP)_`,
      `─────────────────────────`,
      `📊 *Ringkasan Anggaran:*`,
      `• Pagu Belanja: Rp ${compactMoney(currentSnapshot.total.budget)}`,
      `• Realisasi: Rp ${compactMoney(currentSnapshot.total.realized)} (${percent(rate)} terserap)`,
      `• Posisi Data: ${periodLabel(currentSnapshot.year, currentSnapshot.month)}`,
      ``,
      `🔍 *Temuan Kritis & Rekomendasi Pertanyaan:*`,
    ];

    items.forEach((item, idx) => {
      textLines.push(``);
      textLines.push(`*${idx + 1}. ${item.title}*`);
      textLines.push(`📌 _Temuan:_ ${item.observation}`);
      if (item.questions && item.questions.length > 0) {
        textLines.push(`❓ _Pertanyaan Advokasi/RDP:_`);
        item.questions.forEach((q, qIdx) => {
          textLines.push(`   (${String.fromCharCode(97 + qIdx)}) ${q}`);
        });
      }
    });

    textLines.push(``);
    textLines.push(`─────────────────────────`);
    textLines.push(`📢 Gunakan telaah ini untuk bahan RDP DPRD, permohonan dokumen PPID (KIP), atau aduan SP4N-LAPOR!.`);
    textLines.push(`🔗 Buka data & lembar telaah lengkap: ${typeof window !== "undefined" ? window.location.href : ""}`);

    setWaShared(true);
    showToast("Membuka WhatsApp untuk membagikan ringkasan telaah...");
    setTimeout(() => setWaShared(false), 2500);

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
      showToast("Naskah aduan disalin! Mengalihkan ke SP4N-LAPOR!...");
    });

    window.open("https://www.lapor.go.id/", "_blank", "noopener,noreferrer");
  }

  return (
    <section className="card" id="lembar-advokasi">
      <div className="card__head">
        <div className="section-head__text">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span
              className="chip chip--info"
              style={{
                fontWeight: 600,
                color: "var(--info-ink)",
                backgroundColor: "var(--info-bg)",
                borderColor: "var(--info-line)",
                fontSize: "0.75rem",
              }}
            >
              Telaah Kritis DPRD & Warga
            </span>
            <span
              className="chip chip--ghost"
              style={{
                fontWeight: 500,
                color: "var(--ink-2)",
                borderColor: "var(--line)",
                fontSize: "0.75rem",
              }}
            >
              Mandat UU No. 1/2022 HKPD & UU KIP
            </span>
          </div>
          <h2 className="inquiry-title" style={{ margin: "0 0 6px 0" }}>
            Lembar Pengawasan Publik & Telaah Kritis APBD
          </h2>
          <p className="card__sub" style={{ margin: 0, color: "var(--ink-2)" }}>
            Daftar telaah independen berbasis data APBD resmi untuk bahan Rapat Dengar
            Pendapat (RDP) DPRD, investigasi jurnalis, atau audiensi warga berlandaskan amanat UU No. 1/2022 (HKPD) dan UU No. 14/2008 (KIP).
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
        </div>

        <div className="page-actions no-print" style={{ gap: "8px" }}>
          <button
            type="button"
            className={`btn ${waShared ? "btn--primary" : "btn--secondary"}`}
            onClick={shareToWhatsApp}
            aria-label="Bagikan ringkasan telaah kritis ke WhatsApp"
            style={{
              minHeight: "44px",
              minWidth: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 500,
              color: waShared ? "#fff" : "var(--ink)",
              borderColor: waShared ? "var(--ok-solid)" : "var(--line-2)",
              backgroundColor: waShared ? "var(--ok-solid)" : undefined,
            }}
          >
            <MessageCircle size={16} style={{ color: waShared ? "#fff" : "var(--ok-solid)", flexShrink: 0 }} />
            <span>{waShared ? "Membuka WhatsApp..." : "Bagikan ke WhatsApp"}</span>
          </button>

          <button
            type="button"
            className={`btn ${copied ? "btn--primary" : "btn--secondary"}`}
            onClick={copyQuestions}
            aria-label="Salin draf pertanyaan advokasi ke clipboard"
            style={{
              minHeight: "44px",
              minWidth: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 500,
              borderColor: copied ? "var(--ink)" : "var(--line-2)",
            }}
          >
            {copied ? (
              <Check size={16} style={{ flexShrink: 0 }} />
            ) : (
              <Copy size={16} style={{ flexShrink: 0 }} />
            )}
            <span>{copied ? "Tersalin ke Clipboard!" : "Salin Draf Pertanyaan"}</span>
          </button>

          <button
            type="button"
            className={`btn ${exported ? "btn--primary" : "btn--secondary"}`}
            onClick={exportText}
            aria-label="Ekspor draf pertanyaan sebagai berkas teks .txt"
            style={{
              minHeight: "44px",
              minWidth: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 500,
              borderColor: exported ? "var(--ink)" : "var(--line-2)",
            }}
          >
            {exported ? (
              <Check size={16} style={{ flexShrink: 0 }} />
            ) : (
              <Download size={16} style={{ flexShrink: 0 }} />
            )}
            <span>{exported ? "File Teks Diunduh!" : "Ekspor Teks (.txt)"}</span>
          </button>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={reportToLapor}
            aria-label="Laporkan temuan APBD via portal resmi SP4N-LAPOR!"
            style={{
              minHeight: "44px",
              minWidth: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 500,
              color: "var(--alert-ink, #8e3a24)",
              backgroundColor: "var(--alert-bg, #fcf1ee)",
              borderColor: "var(--alert-line, #f0d6cd)",
            }}
          >
            <Megaphone size={16} style={{ color: "var(--alert-solid, #b14a2c)", flexShrink: 0 }} />
            <span>Laporkan via SP4N-LAPOR!</span>
            <ExternalLink size={13} style={{ opacity: 0.75, flexShrink: 0 }} />
          </button>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={handlePrint}
            aria-label="Cetak lembar pengawasan publik atau simpan sebagai PDF"
            style={{
              minHeight: "44px",
              minWidth: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 500,
              color: "var(--ink)",
              borderColor: "var(--line-2)",
            }}
          >
            <Printer size={16} style={{ flexShrink: 0 }} />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      <div className="card__body" style={{ padding: 0 }}>
        <div className="inquiry-grid" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {items.map((item, itemIdx) => {
            const isAtensi = item.badge === "atensi";
            const isKonteks = item.badge === "konteks";
            const isCollapsed = Boolean(collapsedCards[item.id]);
            const isLast = itemIdx === items.length - 1;

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
                  background: "transparent",
                  border: "none",
                  borderBottom: isLast ? "none" : "1px solid var(--line)",
                  borderRadius: 0,
                  boxShadow: "none",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  className="inquiry-card__head"
                  style={{
                    padding: 0,
                    background: "transparent",
                    borderBottom: "none",
                  }}
                >
                  <button
                    type="button"
                    className="inquiry-card__toggle"
                    onClick={() => toggleCard(item.id)}
                    aria-expanded={!isCollapsed}
                    aria-controls={`inquiry-content-${item.id}`}
                    style={{
                      minHeight: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "4px 0",
                      cursor: "pointer",
                      color: "inherit",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: "12px" }}>
                      <div
                        className="inquiry-card__meta"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "8px",
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
                            <TriangleAlert size={12} style={{ flexShrink: 0 }} />
                          ) : isKonteks ? (
                            <Info size={12} style={{ flexShrink: 0 }} />
                          ) : (
                            <CheckCircle2 size={12} style={{ flexShrink: 0 }} />
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
                          fontSize: "1rem",
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
                      style={{
                        minWidth: "44px",
                        minHeight: "44px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "8px",
                        color: "var(--ink-3)",
                        flexShrink: 0,
                        transition: "transform var(--duration-fast) var(--ease-out)",
                        transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                      }}
                    >
                      <ChevronDown size={20} />
                    </span>
                  </button>
                </div>

                <div
                  id={`inquiry-content-${item.id}`}
                  className="inquiry-card__disclosure"
                  style={{
                    display: isCollapsed ? "none" : "block",
                    paddingTop: "12px",
                  }}
                >
                  <div className="inquiry-card__disclosure-inner">
                    <div
                      className="inquiry-card__observation"
                      style={{
                        padding: "12px 16px",
                        background: isAtensi ? "var(--warn-bg)" : "var(--sunk)",
                        borderLeft: isAtensi
                          ? "3px solid var(--warn-solid)"
                          : isKonteks
                            ? "3px solid var(--accent)"
                            : "3px solid var(--ok-solid)",
                        borderBottom: "none",
                        borderRadius: "0 var(--r-xs, 4px) var(--r-xs, 4px) 0",
                        marginBottom: "14px",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: isAtensi ? "var(--warn-ink)" : "var(--ink-2)",
                          marginBottom: "4px",
                        }}
                      >
                        Temuan Data APBD
                      </span>
                      <p
                        style={{
                          fontSize: "0.84375rem",
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
                        padding: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "var(--ink-2)",
                          marginBottom: "8px",
                        }}
                      >
                        <FileQuestion size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        <span>Rekomendasi Pertanyaan untuk Pengawasan / RDP:</span>
                      </div>
                      <div
                        className="qlist"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {item.questions.map((q, qIdx) => {
                          const isLastQ = qIdx === item.questions.length - 1;
                          return (
                            <div
                              key={qIdx}
                              className="qitem"
                              style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "flex-start",
                                padding: "11px 0",
                                borderBottom: isLastQ ? "none" : "1px solid var(--line)",
                              }}
                            >
                              <span
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  minWidth: "24px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "6px",
                                  background: "var(--sunk)",
                                  border: "1px solid var(--line-2)",
                                  color: "var(--ink)",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  fontVariantNumeric: "tabular-nums lining-nums",
                                  flexShrink: 0,
                                  marginTop: "1px",
                                }}
                              >
                                {qIdx + 1}
                              </span>
                              <p
                                style={{
                                  fontSize: "0.84375rem",
                                  color: "var(--ink)",
                                  lineHeight: 1.6,
                                  margin: 0,
                                  flex: 1,
                                }}
                              >
                                {q}
                              </p>
                            </div>
                          );
                        })}
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
          Alur Advokasi Warga Berdaya (Landasan UU HKPD & UU KIP)
        </h3>
        <div className="steps">
          <div className="step">
            <span className="step__num" style={{ fontWeight: 600, color: "#fff" }}>1</span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Pelajari data & landasan hukum</strong>
              <p style={{ color: "var(--ink-2)" }}>
                Periksa kembali angka <GlossaryTerm term="pagu">pagu</GlossaryTerm> dan <GlossaryTerm term="realisasi">realisasi</GlossaryTerm> serta tautan sumber resmi SIKD DJPK Kemenkeu di bawah.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step__num" style={{ fontWeight: 600, color: "#fff" }}>2</span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Bawa ke forum resmi DPRD</strong>
              <p style={{ color: "var(--ink-2)" }}>
                Gunakan rekomendasi pertanyaan kritis di atas saat Musrenbang daerah atau Rapat Dengar Pendapat (RDP) komisi DPRD.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step__num" style={{ fontWeight: 600, color: "#fff" }}>3</span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Laporkan via SP4N-LAPOR! atau Permohonan KIP</strong>
              <p style={{ color: "var(--ink-2)" }}>
                Kirim naskah aduan resmi ke SP4N-LAPOR! dengan tombol di atas, atau minta rincian dokumen BAST/PHO proyek fisik melalui PPID bila data belum dibuka ke publik, berlandaskan mandat <GlossaryTerm term="uu-hkpd">UU HKPD No. 1/2022</GlossaryTerm> dan <GlossaryTerm term="silpa">SiLPA</GlossaryTerm>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
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
            maxWidth: "calc(100vw - 48px)",
          }}
        >
          <CheckCircle2 size={18} style={{ color: "var(--ok-solid)", flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
}
