"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Amount, Dataset } from "@/lib/types";
import { regions } from "@/lib/regions";
import {
  yearEndModalFlag,
  formatFlagShare,
  YEAR_END_THRESHOLD,
} from "@/lib/indicators";
import { fullMoney, compactMoney } from "@/lib/format";
import { CheckCircle2, Download, Info, TriangleAlert, ArrowUpRight } from "lucide-react";

export function YearEnd({ dataset, code }: { dataset: Dataset; code: string }) {
  const years = useMemo(() => {
    return [
      ...new Set(
        dataset.snapshots
          .filter((s) => s.regionCode === code && s.month === 10)
          .map((s) => s.year),
      ),
    ].sort((a, b) => b - a);
  }, [dataset.snapshots, code]);

  const runningYears = useMemo(() => {
    return years.filter((y) => {
      const dec = dataset.snapshots.find(
        (s) => s.regionCode === code && s.year === y && s.month === 12,
      );
      return !dec;
    });
  }, [years, dataset.snapshots, code]);

  const completeYears = useMemo(() => {
    return years.filter((y) => {
      const dec = dataset.snapshots.find(
        (s) => s.regionCode === code && s.year === y && s.month === 12,
      );
      return !!dec;
    });
  }, [years, dataset.snapshots, code]);

  // Tahun lengkap terakhir untuk perbandingan lonjakan kuartal IV se-Sumatera Utara
  const latestCompleteYear = useMemo(() => {
    const yearsWithDec = dataset.snapshots
      .filter((s) => s.month === 12)
      .map((s) => s.year);
    return yearsWithDec.length > 0 ? Math.max(...yearsWithDec) : (completeYears[0] ?? 2025);
  }, [dataset.snapshots, completeYears]);

  // Daftar daerah yang mengalami lonjakan belanja modal kuartal IV (Nov–Des >= 40%)
  const flaggedRegions = useMemo(() => {
    const list: Array<{
      region: (typeof regions)[number];
      year: number;
      october?: (typeof dataset.snapshots)[number];
      december?: (typeof dataset.snapshots)[number];
      flag: ReturnType<typeof yearEndModalFlag>;
      octoberVal: Amount;
      decemberVal: Amount;
      spikeVal: number;
    }> = [];

    for (const r of regions) {
      const october = dataset.snapshots.find(
        (s) => s.regionCode === r.code && s.year === latestCompleteYear && s.month === 10,
      );
      const december = dataset.snapshots.find(
        (s) => s.regionCode === r.code && s.year === latestCompleteYear && s.month === 12,
      );
      if (october && december) {
        const flag = yearEndModalFlag(october, december);
        if (flag.status === "ditandai") {
          const octVal = october.categories.find((c) => c.code === "modal")?.realized ?? null;
          const decVal = december.categories.find((c) => c.code === "modal")?.realized ?? null;
          const octNum = octVal ? Number(octVal) : 0;
          const decNum = decVal ? Number(decVal) : 0;
          const spikeVal = Math.max(0, decNum - octNum);
          list.push({
            region: r,
            year: latestCompleteYear,
            october,
            december,
            flag,
            octoberVal: octVal,
            decemberVal: decVal,
            spikeVal,
          });
        }
      }
    }

    return list.sort((a, b) => (b.flag.share ?? 0) - (a.flag.share ?? 0));
  }, [dataset.snapshots, latestCompleteYear]);

  return (
    <section className="card" aria-labelledby="year-end-heading">
      <div className="card__head">
        <div>
          <h2 id="year-end-heading" className="card__title">
            Audit lonjakan belanja modal akhir tahun
          </h2>
          <p className="card__sub">
            Konsentrasi pencairan modal pada November–Desember, diperiksa
            terhadap arsip resmi DJPK Kementerian Keuangan.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span className="chip chip--warn chip--square">
            <TriangleAlert size={12} />
            Risiko Lonjakan Fiskal Akhir Tahun
          </span>
          <span className="chip chip--sunk">
            Ambang wajar {YEAR_END_THRESHOLD}%
          </span>
        </div>
      </div>

      <div className="card__body">
        {runningYears.map((year) => {
          const october = dataset.snapshots.find(
            (s) => s.regionCode === code && s.year === year && s.month === 10,
          );
          return (
            <div
              key={year}
              className="audit-card audit-card--running"
              style={{
                padding: "18px 20px",
                border: "1px dashed var(--line)",
                borderRadius: "var(--r)",
                background: "var(--canvas)",
                marginBottom: "16px",
              }}
            >
              <div
                className="audit-card__top"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span className="chip chip--info chip--square">
                  <Info size={12} />
                  Menunggu laporan penutup Desember
                </span>
                <span
                  className="audit-card__year"
                  style={{ color: "var(--ink-3)", fontWeight: 600, fontSize: "0.8125rem" }}
                >
                  TA {year} · Tahun Berjalan
                </span>
              </div>
              <div
                className="audit-running"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8125rem",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                    maxWidth: "60ch",
                  }}
                >
                  Realisasi modal s.d. Oktober {year} tercatat{" "}
                  <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                    {fullMoney(
                      october?.categories.find((c) => c.code === "modal")
                        ?.realized ?? null,
                    )}
                  </strong>
                  . Indikasi lonjakan dua bulan penutup baru dapat dihitung
                  setelah berkas penutupan TA {year} dipublikasikan DJPK
                  Kemenkeu.
                </p>
                {october && (
                  <a
                    className="file-link"
                    href={october.source.rawPath}
                    download
                    title={`Unduh berkas XML laporan Oktober ${year}`}
                  >
                    <Download size={12} /> Unduh XML Oktober
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {/* Audit Cards Per Tahun Lengkap (Flattened Layout) */}
        <div className="audit-grid" style={{ gap: "16px" }}>
          {completeYears.map((year) => {
            const october = dataset.snapshots.find(
              (s) => s.regionCode === code && s.year === year && s.month === 10,
            );
            const december = dataset.snapshots.find(
              (s) => s.regionCode === code && s.year === year && s.month === 12,
            );
            const flag = yearEndModalFlag(october, december);
            const flagged = flag.status === "ditandai";

            return (
              <div
                key={year}
                className={
                  flagged ? "audit-card audit-card--flagged" : "audit-card"
                }
                style={{
                  padding: "20px",
                  borderRadius: "var(--r)",
                  border: flagged
                    ? "1px solid var(--warn-line)"
                    : "1px solid var(--line)",
                  background: flagged ? "var(--warn-bg)" : "var(--paper)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  className="audit-card__top"
                  style={{
                    margin: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    className={
                      flagged
                        ? "chip chip--warn chip--square"
                        : flag.status === "wajar"
                          ? "chip chip--ok chip--square"
                          : "chip chip--sunk chip--square"
                    }
                  >
                    {flagged ? (
                      <TriangleAlert size={12} />
                    ) : flag.status === "wajar" ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Info size={12} />
                    )}
                    {flagged
                      ? "Risiko Lonjakan Fiskal Akhir Tahun"
                      : flag.status === "wajar"
                        ? "Pola serapan wajar"
                        : "Data belum lengkap"}
                  </span>
                  <span
                    className="audit-card__year"
                    style={{
                      color: "var(--ink-2)",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                    }}
                  >
                    TA {year}
                  </span>
                </div>

                <div
                  className="audit-card__share"
                  style={{
                    paddingBottom: "14px",
                    borderBottom: flagged
                      ? "1px solid var(--warn-line)"
                      : "1px solid var(--line)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: "1.875rem",
                        fontWeight: 700,
                        color: "var(--ink)",
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        fontVariantNumeric: "tabular-nums lining-nums",
                      }}
                    >
                      {flag.share !== null ? formatFlagShare(flag.share) : "—"}
                    </strong>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--ink-2)",
                        marginTop: "5px",
                        display: "block",
                      }}
                    >
                      porsi modal dicairkan di dua bulan akhir (Nov–Des)
                    </span>
                  </div>
                  <div
                    className="audit-card__threshold"
                    style={{ textAlign: "right" }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--ink-2)",
                        fontWeight: 500,
                      }}
                    >
                      ambang {YEAR_END_THRESHOLD}%
                    </span>
                    <small
                      style={{
                        display: "block",
                        fontSize: "0.6875rem",
                        color: "var(--ink-4)",
                        marginTop: "2px",
                      }}
                    >
                      laju merata ~16,67%
                    </small>
                  </div>
                </div>

                {october && december && (
                  <div
                    className="audit-card__points"
                    style={{
                      padding: "12px 0",
                      borderBottom: flagged
                        ? "1px solid var(--warn-line)"
                        : "1px solid var(--line)",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div className="audit-card__point">
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--ink-3)",
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                        }}
                      >
                        Realisasi s.d. Oktober
                      </span>
                      <strong
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--ink)",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums lining-nums",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {fullMoney(
                          october.categories.find((c) => c.code === "modal")
                            ?.realized ?? null,
                        )}
                      </strong>
                    </div>
                    <div className="audit-card__point">
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--ink-3)",
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                        }}
                      >
                        Realisasi s.d. Desember
                      </span>
                      <strong
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--ink)",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums lining-nums",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {fullMoney(
                          december.categories.find((c) => c.code === "modal")
                            ?.realized ?? null,
                        )}
                      </strong>
                    </div>
                  </div>
                )}

                <div
                  className="audit-card__sources"
                  style={{ paddingTop: "10px" }}
                >
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--ink-3)",
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Bukti berkas asli SIKD
                  </span>
                  <div
                    className="audit-links"
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {october && (
                      <a
                        className="file-link"
                        href={october.source.rawPath}
                        download
                        title={`Unduh berkas XML laporan Oktober ${year}`}
                      >
                        <Download size={12} /> Unduh XML Oktober
                      </a>
                    )}
                    {december && (
                      <a
                        className="file-link"
                        href={december.source.rawPath}
                        download
                        title={`Unduh berkas XML laporan Desember ${year}`}
                      >
                        <Download size={12} /> Unduh XML Desember
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Flattened Table: Daftar Daerah Lonjakan Belanja Kuartal IV */}
        {flaggedRegions.length > 0 && (
          <div
            style={{
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                    margin: "0 0 3px",
                  }}
                >
                  Daftar Daerah dengan Lonjakan Belanja Kuartal IV (TA {latestCompleteYear})
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--ink-2)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Pemeriksaan komparatif daerah di Sumatera Utara yang mencatat konsentrasi pencairan modal &gt;40% di akhir tahun.
                </p>
              </div>
              <span className="chip chip--warn chip--square">
                <TriangleAlert size={12} /> Risiko Lonjakan Fiskal Akhir Tahun: {flaggedRegions.length} Daerah
              </span>
            </div>

            {/* Table Wrap with smooth touch scrolling */}
            <div
              className="table-wrap"
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                borderRadius: "var(--r)",
                border: "1px solid var(--line)",
                background: "var(--paper)",
              }}
            >
              <table
                className="table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.8125rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "var(--canvas)",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <th style={{ padding: "9px 12px", textAlign: "left", width: "40px" }}>#</th>
                    <th style={{ padding: "9px 12px", textAlign: "left" }}>Pemerintah Daerah</th>
                    <th className="is-num" style={{ padding: "9px 12px", textAlign: "right" }}>Porsi Kuartal IV</th>
                    <th className="is-num" style={{ padding: "9px 12px", textAlign: "right" }}>Realisasi Okt</th>
                    <th className="is-num" style={{ padding: "9px 12px", textAlign: "right" }}>Realisasi Des</th>
                    <th className="is-num" style={{ padding: "9px 12px", textAlign: "right" }}>Lonjakan 2 Bulan</th>
                    <th style={{ padding: "9px 12px", textAlign: "center", width: "230px" }}>Status Penilaian</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedRegions.map((item, idx) => {
                    const isCurrent = item.region.code === code;
                    return (
                      <tr
                        key={item.region.code}
                        style={{
                          borderBottom: "1px solid var(--line)",
                          background: isCurrent ? "var(--canvas)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "9px 12px", color: "var(--ink-3)", fontWeight: 600 }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "9px 12px" }}>
                          <Link
                            href={`/daerah/${item.region.code}?year=${latestCompleteYear}`}
                            className="link link--quiet"
                            style={{
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? "var(--ink)" : "var(--accent)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>{item.region.name}</span>
                            {isCurrent ? (
                              <span
                                className="chip chip--accent chip--square"
                                style={{ fontSize: "0.6875rem", padding: "1px 6px" }}
                              >
                                Daerah ini
                              </span>
                            ) : (
                              <ArrowUpRight size={13} style={{ opacity: 0.7 }} />
                            )}
                          </Link>
                        </td>
                        <td
                          className="is-num"
                          style={{
                            padding: "9px 12px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: "var(--warn-ink)",
                          }}
                        >
                          {formatFlagShare(item.flag.share)}
                        </td>
                        <td
                          className="is-num"
                          style={{
                            padding: "9px 12px",
                            textAlign: "right",
                            color: "var(--ink-2)",
                            fontVariantNumeric: "tabular-nums lining-nums",
                          }}
                        >
                          {fullMoney(item.octoberVal)}
                        </td>
                        <td
                          className="is-num"
                          style={{
                            padding: "9px 12px",
                            textAlign: "right",
                            color: "var(--ink)",
                            fontWeight: 600,
                            fontVariantNumeric: "tabular-nums lining-nums",
                          }}
                        >
                          {fullMoney(item.decemberVal)}
                        </td>
                        <td
                          className="is-num"
                          style={{
                            padding: "9px 12px",
                            textAlign: "right",
                            color: "var(--ink)",
                            fontVariantNumeric: "tabular-nums lining-nums",
                          }}
                        >
                          +{compactMoney(item.spikeVal.toString())}
                        </td>
                        <td style={{ padding: "9px 12px", textAlign: "center" }}>
                          <span
                            className="chip chip--warn chip--square"
                            style={{ fontSize: "0.6875rem", display: "inline-flex" }}
                          >
                            <TriangleAlert size={11} /> Risiko Lonjakan Fiskal Akhir Tahun
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="footnote" style={{ marginTop: "20px" }}>
          <strong>Catatan Telaah Kritis:</strong> Penanda lonjakan akhir tahun
          merupakan indikator anomali analitis untuk mendeteksi potensi
          penumpukan pencairan fisik di pengujung tahun anggaran, bukan vonis
          pelanggaran hukum. Penyaluran akhir tahun dapat memiliki alasan
          kontraktual termin pembayaran proyek yang sah.
        </p>
      </div>
    </section>
  );
}
