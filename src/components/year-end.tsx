import type { Dataset } from "@/lib/types";
import {
  yearEndModalFlag,
  formatFlagShare,
  YEAR_END_THRESHOLD,
} from "@/lib/indicators";
import { fullMoney } from "@/lib/format";

export function YearEnd({ dataset, code }: { dataset: Dataset; code: string }) {
  return (
    <section className="panel composition-panel" style={{ marginTop: 24 }}>
      <h2>Yang perlu dipertanyakan</h2>
      <p>Penumpukan realisasi belanja modal pada November–Desember.</p>
      {[
        ...new Set(
          dataset.snapshots
            .filter((s) => s.regionCode === code && s.month === 10)
            .map((s) => s.year),
        ),
      ]
        .sort((a, b) => b - a)
        .map((year) => {
          const october = dataset.snapshots.find(
            (s) => s.regionCode === code && s.year === year && s.month === 10,
          );
          const december = dataset.snapshots.find(
            (s) => s.regionCode === code && s.year === year && s.month === 12,
          );
          const flag = yearEndModalFlag(october, december);
          return (
            <div
              className={`info-note year-end-card ${flag.status === "ditandai" ? "year-end-flagged" : ""}`}
              key={year}
            >
              <div>
                <strong>
                  {flag.status === "ditandai"
                    ? "⚠ Perlu ditanyakan"
                    : flag.status === "wajar"
                      ? "✓ Di bawah ambang"
                      : "ⓘ Data belum dapat dihitung"}{" "}
                  · {year}
                </strong>
                <p>
                  {flag.share !== null
                    ? `Selisih laporan Oktober dan Desember setara ${formatFlagShare(flag.share)} realisasi modal setahun; ambang penanda ${YEAR_END_THRESHOLD}%. Jika merata sepanjang tahun, sekitar 16,67% terjadi pada dua bulan terakhir.`
                    : flag.status === "tidak-konsisten"
                      ? "Realisasi kumulatif menurun; periksa revisi sumber."
                      : `Penanda ${year} dihitung setelah data Oktober dan Desember tersedia.`}
                </p>
                {october && december && (
                  <p>
                    Realisasi modal: Oktober{" "}
                    {fullMoney(
                      october.categories.find((c) => c.code === "modal")
                        ?.realized ?? null,
                    )}
                    ; Desember{" "}
                    {fullMoney(
                      december.categories.find((c) => c.code === "modal")
                        ?.realized ?? null,
                    )}
                    .
                  </p>
                )}
                {flag.status === "ditandai" && (
                  <p>
                    <strong>Pertanyaan:</strong> Proyek apa saja yang dibayar
                    pada dua bulan terakhir, dan apakah sudah diserahterimakan
                    dalam kondisi baik?
                  </p>
                )}
                {october && (
                  <a
                    className="text-link"
                    href={october.source.rawPath}
                    download
                  >
                    Unduh Oktober
                  </a>
                )}
                {october && december && " · "}
                {december && (
                  <a
                    className="text-link"
                    href={december.source.rawPath}
                    download
                  >
                    Unduh Desember
                  </a>
                )}
              </div>
            </div>
          );
        })}
      <p>
        Penanda menunjukkan pola yang perlu ditanyakan, bukan bukti pelanggaran.
        Pembayaran akhir tahun dapat memiliki alasan yang sah. Selisih laporan
        juga dapat dipengaruhi revisi data.
      </p>
    </section>
  );
}
