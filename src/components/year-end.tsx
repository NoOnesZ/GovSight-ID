import type { Dataset } from "@/lib/types";
import {
  yearEndModalFlag,
  formatFlagShare,
  YEAR_END_THRESHOLD,
} from "@/lib/indicators";
import { fullMoney } from "@/lib/format";
import { SectionHeading } from "./shared";
import { AlertTriangle, CheckCircle2, Download, Info } from "lucide-react";

export function YearEnd({ dataset, code }: { dataset: Dataset; code: string }) {
  const years = [
    ...new Set(
      dataset.snapshots
        .filter((s) => s.regionCode === code && s.month === 10)
        .map((s) => s.year),
    ),
  ].sort((a, b) => b - a);

  return (
    <section className="panel year-end-panel" style={{ marginTop: 24 }}>
      <SectionHeading
        title="Audit Lonjakan Belanja Modal Akhir Tahun"
        subtitle="Pemeriksaan konsentrasi pencairan modal pada November–Desember terhadap arsip resmi DJPK."
      />
      <div className="audit-years-grid">
        {years.map((year) => {
          const october = dataset.snapshots.find(
            (s) => s.regionCode === code && s.year === year && s.month === 10,
          );
          const december = dataset.snapshots.find(
            (s) => s.regionCode === code && s.year === year && s.month === 12,
          );
          const flag = yearEndModalFlag(october, december);
          const isDitandai = flag.status === "ditandai";

          return (
            <div
              key={year}
              className={`audit-year-card ${isDitandai ? "audit-flagged" : "audit-normal"}`}
            >
              <div className="audit-card-top">
                <span
                  className={`audit-status-badge ${isDitandai ? "badge-alert" : "badge-clean"}`}
                >
                  {isDitandai ? (
                    <AlertTriangle size={13} />
                  ) : flag.status === "wajar" ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <Info size={13} />
                  )}
                  {isDitandai
                    ? "Terkonsentrasi di Akhir Tahun"
                    : flag.status === "wajar"
                      ? "Distribusi Sesuai Ambang"
                      : "Data Belum Lengkap"}
                </span>
                <span className="audit-year-label">TA {year}</span>
              </div>

              <div className="audit-share-row">
                <div className="audit-share-value">
                  <strong>
                    {flag.share !== null
                      ? formatFlagShare(flag.share)
                      : "—"}
                  </strong>
                  <span>porsi modal di 2 bulan akhir</span>
                </div>
                <div className="audit-threshold-note">
                  Ambang batas wajar: <strong>{YEAR_END_THRESHOLD}%</strong>
                  <small>(Laju normal merata ~16,67%)</small>
                </div>
              </div>

              {october && december && (
                <div className="audit-data-points">
                  <div className="audit-point">
                    <span className="audit-point-label">Realisasi s.d. Oktober</span>
                    <strong className="audit-point-val">
                      {fullMoney(
                        october.categories.find((c) => c.code === "modal")
                          ?.realized ?? null,
                      )}
                    </strong>
                  </div>
                  <div className="audit-point">
                    <span className="audit-point-label">Realisasi s.d. Desember</span>
                    <strong className="audit-point-val">
                      {fullMoney(
                        december.categories.find((c) => c.code === "modal")
                          ?.realized ?? null,
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <div className="audit-sources-row">
                <span className="audit-sources-label">Bukti Berkas Asli SIKD:</span>
                <div className="audit-links">
                  {october && (
                    <a
                      className="audit-download-link"
                      href={october.source.rawPath}
                      download
                      title={`Unduh berkas XML laporan Oktober ${year}`}
                    >
                      <Download size={12} /> Unduh Oktober
                    </a>
                  )}
                  {december && (
                    <a
                      className="audit-download-link"
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
      <p className="audit-disclaimer">
        *Penanda konsentrasi akhir tahun adalah indikator analitis untuk mengidentifikasi potensi penumpukan pencairan fisik di pengujung tahun anggaran, bukan vonis pelanggaran hukum. Penyaluran akhir tahun dapat memiliki alasan kontraktual termin proyek yang sah.
      </p>
    </section>
  );
}
