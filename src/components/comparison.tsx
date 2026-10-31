"use client";

import { useState } from "react";
import { Check, Plus, Scale } from "lucide-react";
import Link from "next/link";
import type { Dataset } from "@/lib/types";
import { months, regions } from "@/lib/regions";
import { compactMoney, fullMoney, percent } from "@/lib/format";
import { percentage } from "@/lib/data-core";
import {
  yearEndModalFlag,
  formatFlagShare,
  YEAR_END_THRESHOLD,
} from "@/lib/indicators";
import {
  DownloadButton,
  EmptyState,
  InfoNote,
  PeriodControls,
  ShareButton,
  SourceNote,
  UnavailablePeriod,
  kindLabel,
  useFilters,
} from "./shared";
import {
  ChartLegend,
  ComparisonRateChart,
  SpendingChart,
  chartColors,
} from "./charts";

export function Comparison({ dataset }: { dataset: Dataset }) {
  const [chartMode, setChartMode] = useState<"nominal" | "serapan">("nominal");
  const { year, month, params, update, period, invalidPeriod } = useFilters();
  if (invalidPeriod) return <UnavailablePeriod />;
  const completeYear = Math.max(
    ...dataset.snapshots.filter((s) => s.month === 12).map((s) => s.year),
  );
  const requested = params.get("daerah");
  const codes =
    requested === null
      ? ["0215", "0214"]
      : [
          ...new Set(
            requested
              .split(",")
              .filter((code) => regions.some((region) => region.code === code)),
          ),
        ].slice(0, 3);
  const snapshots = codes
    .map((code) =>
      dataset.snapshots.find(
        (row) =>
          row.regionCode === code && row.year === year && row.month === month,
      ),
    )
    .filter((row) => row !== undefined);
  const mixed =
    new Set(
      codes.map((code) => regions.find((region) => region.code === code)?.type),
    ).size > 1;
  function toggle(code: string) {
    update({
      daerah: codes.includes(code)
        ? codes.filter((value) => value !== code).join(",") || "kosong"
        : [...codes, code].slice(0, 3).join(","),
    });
  }
  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <p className="eyebrow">
            <Scale size={13} /> Lihat dalam konteks
          </p>
          <h1>Bandingkan daerah.</h1>
          <p>Angka berdampingan, periode yang sama, gambaran lebih jelas.</p>
        </div>
        <div className="page-actions">
          <ShareButton />
          {codes.length >= 2 && (
            <DownloadButton codes={codes} year={year} month={month} />
          )}
        </div>
      </div>

      <div className="stack">
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Pilih daerah pembanding</h2>
              <p className="card__sub">
                Pilih dua hingga tiga daerah, lalu periksa angkanya
                berdampingan.
              </p>
            </div>
            <div className="section-head__actions">
              <PeriodControls year={year} month={month} onChange={update} />
            </div>
          </div>
          <div className="card__body">
            <div className="picker">
              {regions.map((region) => {
                const selected = codes.includes(region.code);
                return (
                  <button
                    key={region.code}
                    onClick={() => toggle(region.code)}
                    disabled={!selected && codes.length >= 3}
                    aria-pressed={selected}
                    className={
                      selected ? "region-option is-selected" : "region-option"
                    }
                  >
                    <span className="region-option__text">
                      <strong>{region.shortName}</strong>
                      <small>{kindLabel(region.type)}</small>
                    </span>
                    <span className="region-option__box">
                      {selected ? <Check size={13} /> : <Plus size={13} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {mixed && (
          <InfoNote>
            Kamu membandingkan kota dan kabupaten. Kewenangan, kebutuhan
            layanan, dan kondisi wilayahnya dapat berbeda. Angka ini bukan
            peringkat kinerja.
          </InfoNote>
        )}

        {codes.length < 2 ? (
          <EmptyState title="Tambahkan satu daerah lagi">
            Perbandingan membutuhkan sedikitnya dua daerah pada periode yang
            sama.
          </EmptyState>
        ) : (
          <>
            <section className="card">
              <div className="table-wrap">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th>
                        <span className="eyebrow">Periode pelaporan</span>
                        <strong style={{ display: "block", marginTop: 4 }}>
                          {months[month]} {year}
                        </strong>
                      </th>
                      {snapshots.map((row) => (
                        <th key={row.regionCode}>
                          <Link href={`/daerah/${row.regionCode}?${period}`}>
                            {
                              regions.find(
                                (region) => region.code === row.regionCode,
                              )?.name
                            }
                          </Link>
                          <span>Sumatera Utara</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="is-key">
                      <th>
                        Pagu belanja<small>Rencana satu tahun</small>
                      </th>
                      {snapshots.map((row) => (
                        <td
                          key={row.regionCode}
                          title={fullMoney(row.total.budget)}
                        >
                          {compactMoney(row.total.budget)}
                        </td>
                      ))}
                    </tr>
                    <tr className="is-key">
                      <th>
                        Realisasi belanja
                        <small>Akumulasi sampai periode terpilih</small>
                      </th>
                      {snapshots.map((row) => (
                        <td
                          key={row.regionCode}
                          className="is-accent"
                          title={fullMoney(row.total.realized)}
                        >
                          {compactMoney(row.total.realized)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th>
                        Serapan anggaran<small>Realisasi dibagi pagu</small>
                      </th>
                      {snapshots.map((row) => (
                        <td key={row.regionCode}>
                          <strong>
                            {percent(
                              percentage(row.total.realized, row.total.budget),
                            )}
                          </strong>
                        </td>
                      ))}
                    </tr>
                    <tr className="table__section">
                      <th colSpan={snapshots.length + 1}>
                        Komposisi realisasi belanja
                        <span>
                          Porsi dari total realisasi, bukan dari pagu.
                        </span>
                      </th>
                    </tr>
                    {snapshots[0]?.categories.map((line, index) => (
                      <tr key={line.code}>
                        <th>
                          <span
                            className={`dot dot--${line.code}`}
                            style={{
                              display: "inline-block",
                              marginRight: 8,
                              verticalAlign: "1px",
                            }}
                          />
                          {line.label}
                        </th>
                        {snapshots.map((row) => (
                          <td key={row.regionCode}>
                            <strong>
                              {percent(
                                percentage(
                                  row.categories[index].realized,
                                  row.total.realized,
                                ),
                              )}
                            </strong>
                            <small
                              title={fullMoney(row.categories[index].realized)}
                            >
                              {compactMoney(row.categories[index].realized)}
                            </small>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card">
              <div className="card__head">
                <div>
                  <h2 className="card__title">
                    {chartMode === "nominal"
                      ? "Pagu dan realisasi, berdampingan"
                      : "Tingkat serapan anggaran, berdampingan"}
                  </h2>
                  <p className="card__sub">
                    {chartMode === "nominal"
                      ? "Nilai nominal dalam triliun rupiah. Perhatikan perbedaan skala anggaran tiap daerah."
                      : "Persentase realisasi terhadap pagu (0–100%), agar setiap daerah dibaca setara."}
                  </p>
                </div>
                <div
                  className="segmented"
                  role="group"
                  aria-label="Pilihan skala grafik"
                >
                  <button
                    type="button"
                    className={`segmented__item ${chartMode === "nominal" ? "is-active" : ""}`}
                    onClick={() => setChartMode("nominal")}
                  >
                    Nominal (Rp)
                  </button>
                  <button
                    type="button"
                    className={`segmented__item ${chartMode === "serapan" ? "is-active" : ""}`}
                    onClick={() => setChartMode("serapan")}
                  >
                    Serapan (%)
                  </button>
                </div>
              </div>
              <div className="card__body">
                {chartMode === "nominal" ? (
                  <>
                    <SpendingChart snapshots={snapshots} layout="horizontal" />
                    <ChartLegend
                      items={[
                        { label: "Pagu belanja", color: chartColors.budget },
                        { label: "Realisasi", color: chartColors.realized },
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <ComparisonRateChart snapshots={snapshots} />
                    <ChartLegend
                      items={[
                        {
                          label: "Serapan terhadap pagu",
                          color: chartColors.realized,
                        },
                      ]}
                    />
                  </>
                )}
              </div>
            </section>

            <section className="card">
              <div className="card__head">
                <div>
                  <h2 className="card__title">
                    Penanda akhir tahun berdampingan
                  </h2>
                  <p className="card__sub">
                    Perbandingan lonjakan pencairan belanja modal fisik pada dua
                    bulan penutup tahun anggaran.
                  </p>
                </div>
                <span className="chip chip--sunk">
                  Ambang {YEAR_END_THRESHOLD}%
                </span>
              </div>
              <div className="card__body">
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Daerah</th>
                        <th>Tahun</th>
                        <th className="is-num">November–Desember</th>
                        <th>Penanda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((code) => {
                        const availableYears = dataset.snapshots
                          .filter(
                            (s) => s.month === 12 && s.regionCode === code,
                          )
                          .map((s) => s.year);
                        const october = dataset.snapshots.find(
                          (s) =>
                            s.regionCode === code &&
                            s.year === completeYear &&
                            s.month === 10,
                        );
                        const december = dataset.snapshots.find(
                          (s) =>
                            s.regionCode === code &&
                            s.year === completeYear &&
                            s.month === 12,
                        );
                        const flag = yearEndModalFlag(october, december);
                        return (
                          <tr key={code}>
                            <th>
                              <Link
                                className="link link--quiet"
                                href={`/daerah/${code}?${period}`}
                              >
                                {regions.find((r) => r.code === code)?.name}
                              </Link>
                            </th>
                            <td>
                              {availableYears.includes(completeYear)
                                ? completeYear
                                : "Belum tersedia"}
                            </td>
                            <td className="is-num">
                              {formatFlagShare(flag.share)}
                            </td>
                            <td>
                              {flag.status === "ditandai" ? (
                                <span className="chip chip--warn chip--square">
                                  Perlu ditanyakan
                                </span>
                              ) : flag.status === "wajar" ? (
                                <span className="chip chip--ok chip--square">
                                  Di bawah ambang
                                </span>
                              ) : flag.status === "tidak-konsisten" ? (
                                <span className="chip chip--square">
                                  Data tidak konsisten
                                </span>
                              ) : (
                                <span className="chip chip--square">
                                  Belum tersedia
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card__foot">
                <InfoNote>
                  Ambang {YEAR_END_THRESHOLD}% merupakan pilihan metodologi,
                  bukan batas hukum atau bukti pelanggaran. Perbedaan jadwal
                  proyek dapat memengaruhi hasil. Buka profil untuk pertanyaan
                  dan sumber Oktober serta Desember.
                </InfoNote>
              </div>
            </section>

            {snapshots[0] && <SourceNote snapshot={snapshots[0]} />}

            <InfoNote>
              Persentase serapan atau komposisi yang lebih tinggi tidak otomatis
              berarti layanan lebih baik. Pertimbangkan kebutuhan warga,
              kewenangan daerah, dan data hasil layanan.
            </InfoNote>
          </>
        )}
      </div>
    </>
  );
}
