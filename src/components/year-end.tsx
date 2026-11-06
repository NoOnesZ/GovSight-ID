import type { Dataset } from "@/lib/types";
import {
  yearEndModalFlag,
  formatFlagShare,
  YEAR_END_THRESHOLD,
} from "@/lib/indicators";
import { fullMoney } from "@/lib/format";
import { CheckCircle2, Download, Info, TriangleAlert } from "lucide-react";

export function YearEnd({ dataset, code }: { dataset: Dataset; code: string }) {
  const years = [
    ...new Set(
      dataset.snapshots
        .filter((s) => s.regionCode === code && s.month === 10)
        .map((s) => s.year),
    ),
  ].sort((a, b) => b - a);

  const runningYears = years.filter((y) => {
    const dec = dataset.snapshots.find(
      (s) => s.regionCode === code && s.year === y && s.month === 12,
    );
    return !dec;
  });

  const completeYears = years.filter((y) => {
    const dec = dataset.snapshots.find(
      (s) => s.regionCode === code && s.year === y && s.month === 12,
    );
    return !!dec;
  });

  return (
    <section className="card">
      <div className="card__head">
        <div>
          <h2 className="card__title">
            Audit lonjakan belanja modal akhir tahun
          </h2>
          <p className="card__sub">
            Konsentrasi pencairan modal pada November–Desember, diperiksa
            terhadap arsip resmi DJPK.
          </p>
        </div>
        <span className="chip chip--sunk">
          Ambang wajar {YEAR_END_THRESHOLD}%
        </span>
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
                padding: "20px",
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
                  marginBottom: "12px",
                }}
              >
                <span className="chip chip--info">
                  <Info size={12} />
                  Menunggu laporan penutup Desember
                </span>
                <span
                  className="audit-card__year"
                  style={{ color: "var(--ink-3)", fontWeight: 600 }}
                >
                  TA {year} · Aktif
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
                    <Download size={12} /> Unduh Oktober
                  </a>
                )}
              </div>
            </div>
          );
        })}

        <div className="audit-grid" style={{ gap: "20px" }}>
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
                  padding: "22px",
                  borderRadius: "var(--r)",
                  border: flagged
                    ? "1px solid var(--warn-line)"
                    : "1px solid var(--line)",
                  background: flagged ? "var(--warn-bg)" : "var(--paper)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
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
                        ? "chip chip--warn"
                        : flag.status === "wajar"
                          ? "chip chip--ok"
                          : "chip chip--sunk"
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
                      ? "Indikator Anomali: Lonjakan akhir tahun"
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
                    paddingBottom: "16px",
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
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--ink)",
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {flag.share !== null ? formatFlagShare(flag.share) : "—"}
                    </strong>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--ink-2)",
                        marginTop: "6px",
                        display: "block",
                      }}
                    >
                      porsi modal di dua bulan akhir
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
                      padding: "16px 0",
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
                          fontVariantNumeric: "tabular-nums",
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
                          fontVariantNumeric: "tabular-nums",
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
                  style={{ paddingTop: "14px" }}
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
                        <Download size={12} /> Unduh Oktober
                      </a>
                    )}
                    {december && (
                      <a
                        className="file-link"
                        href={december.source.rawPath}
                        download
                        title={`Unduh berkas XML laporan Desember ${year}`}
                      >
                        <Download size={12} /> Unduh Desember
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="footnote" style={{ marginTop: "24px" }}>
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
