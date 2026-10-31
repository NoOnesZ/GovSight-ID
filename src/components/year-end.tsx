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
            <div key={year} className="audit-card audit-card--running">
              <div className="audit-card__top">
                <span className="chip chip--info">
                  <Info size={12} />
                  Menunggu laporan penutup Desember
                </span>
                <span className="audit-card__year">TA {year} · aktif</span>
              </div>
              <div className="audit-running">
                <p>
                  Realisasi modal s.d. Oktober {year} tercatat{" "}
                  <strong>
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

        <div className="audit-grid">
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
              >
                <div className="audit-card__top">
                  <span
                    className={
                      flagged
                        ? "chip chip--warn"
                        : flag.status === "wajar"
                          ? "chip chip--ok"
                          : "chip"
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
                      ? "Terkonsentrasi di akhir tahun"
                      : flag.status === "wajar"
                        ? "Distribusi sesuai ambang"
                        : "Data belum lengkap"}
                  </span>
                  <span className="audit-card__year">TA {year}</span>
                </div>

                <div className="audit-card__share">
                  <div>
                    <strong>
                      {flag.share !== null ? formatFlagShare(flag.share) : "—"}
                    </strong>
                    <span>porsi modal di dua bulan akhir</span>
                  </div>
                  <div className="audit-card__threshold">
                    ambang {YEAR_END_THRESHOLD}%
                    <small>laju merata ~16,67%</small>
                  </div>
                </div>

                {october && december && (
                  <div className="audit-card__points">
                    <div className="audit-card__point">
                      <span>Realisasi s.d. Oktober</span>
                      <strong>
                        {fullMoney(
                          october.categories.find((c) => c.code === "modal")
                            ?.realized ?? null,
                        )}
                      </strong>
                    </div>
                    <div className="audit-card__point">
                      <span>Realisasi s.d. Desember</span>
                      <strong>
                        {fullMoney(
                          december.categories.find((c) => c.code === "modal")
                            ?.realized ?? null,
                        )}
                      </strong>
                    </div>
                  </div>
                )}

                <div className="audit-card__sources">
                  <span>Bukti berkas asli SIKD</span>
                  <div className="audit-links">
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

        <p className="footnote">
          Penanda konsentrasi akhir tahun adalah indikator analitis untuk
          melihat potensi penumpukan pencairan fisik di pengujung tahun
          anggaran, bukan vonis pelanggaran hukum. Penyaluran akhir tahun dapat
          memiliki alasan kontraktual termin proyek yang sah.
        </p>
      </div>
    </section>
  );
}
