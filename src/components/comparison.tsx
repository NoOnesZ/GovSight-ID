"use client";

import { Building2, Check, Plus, Scale, X } from "lucide-react";
import Link from "next/link";
import type { Dataset } from "@/lib/types";
import { months, regions } from "@/lib/regions";
import { compactMoney, fullMoney, percent } from "@/lib/format";
import { percentage } from "@/lib/data-core";
import { yearEndModalFlag, formatFlagShare, YEAR_END_THRESHOLD } from "@/lib/indicators";
import {
  DownloadButton,
  EmptyState,
  InfoNote,
  PeriodControls,
  ShareButton,
  SourceNote,
  UnavailablePeriod,
  useFilters,
} from "./shared";
import { SpendingChart } from "./charts";

export function Comparison({ dataset }: { dataset: Dataset }) {
  const { year, month, params, update, period, invalidPeriod } = useFilters();
  if (invalidPeriod) return <UnavailablePeriod />;
  const completeYear = Math.max(
    ...dataset.snapshots
      .filter((s) => s.month === 12)
      .map((s) => s.year),
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
      <div className="page-title-row">
        <div>
          <span className="location-label">
            <Scale size={15} /> Lihat dalam konteks
          </span>
          <h1>Bandingkan daerah.</h1>
          <p>Angka berdampingan. Periode yang sama. Gambaran lebih jelas.</p>
        </div>
        <div className="heading-actions">
          <ShareButton />
          {codes.length >= 2 && (
            <DownloadButton codes={codes} year={year} month={month} />
          )}
        </div>
      </div>
      <section className="panel compare-picker">
        <div className="compare-picker-heading">
          <div>
            <h2>Pilih daerah pembanding</h2>
            <p>Pilih dua hingga tiga daerah untuk mulai membandingkan.</p>
          </div>
          <PeriodControls year={year} month={month} onChange={update} />
        </div>
        <div className="region-options">
          {regions.map((region) => (
            <button
              key={region.code}
              onClick={() => toggle(region.code)}
              disabled={!codes.includes(region.code) && codes.length >= 3}
              aria-pressed={codes.includes(region.code)}
              className={
                codes.includes(region.code)
                  ? "region-option selected"
                  : "region-option"
              }
            >
              <span className="region-option-icon">
                <Building2 size={20} />
              </span>
              <span>
                <strong>{region.shortName}</strong>
                <small>{region.type === "kota" ? "Kota" : "Kabupaten"}</small>
              </span>
              <span className="checkbox-icon">
                {codes.includes(region.code) ? (
                  <Check size={14} />
                ) : (
                  <Plus size={14} />
                )}
              </span>
            </button>
          ))}
        </div>
      </section>
      {mixed && (
        <InfoNote>
          Kamu membandingkan kota dan kabupaten. Kewenangan, kebutuhan layanan,
          dan kondisi wilayahnya dapat berbeda. Angka ini bukan peringkat
          kinerja.
        </InfoNote>
      )}
      {codes.length < 2 ? (
        <EmptyState title="Tambahkan satu daerah lagi">
          Perbandingan membutuhkan sedikitnya dua daerah pada periode yang sama.
        </EmptyState>
      ) : (
        <>
          <section className="panel compare-table-panel">
            <div className="table-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>
                      <span className="small-label">Periode pelaporan</span>
                      <strong>
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
                        <span className="comparison-subtitle">
                          Sumatera Utara
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="comparison-highlight">
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
                  <tr className="comparison-highlight">
                    <th>
                      Realisasi belanja
                      <small>Akumulasi sampai periode terpilih</small>
                    </th>
                    {snapshots.map((row) => (
                      <td
                        key={row.regionCode}
                        className="blue-text"
                        title={fullMoney(row.total.realized)}
                      >
                        {compactMoney(row.total.realized)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>
                      Serapan anggaran<small>Realisasi ÷ pagu</small>
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
                  <tr className="table-section-row">
                    <th colSpan={snapshots.length + 1}>
                      Komposisi realisasi belanja{" "}
                      <span>Porsi dari total realisasi, bukan dari pagu.</span>
                    </th>
                  </tr>
                  {snapshots[0]?.categories.map((line, index) => (
                    <tr key={line.code}>
                      <th>{line.label}</th>
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
          <section className="panel compare-chart-panel">
            <div className="section-heading">
              <div>
                <h2>Pagu dan realisasi, berdampingan</h2>
                <p>
                  Nilai nominal dalam triliun rupiah. Perhatikan perbedaan skala
                  anggaran tiap daerah.
                </p>
              </div>
            </div>
            <SpendingChart snapshots={snapshots} />
          </section>
          <section className="panel compare-chart-panel">
            <h2>Penanda akhir tahun berdampingan</h2>
            <p>
              Penanda menggunakan tahun lengkap terakhir yang tersedia, terpisah
              dari filter periode di atas.
            </p>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Daerah</th>
                    <th>Tahun</th>
                    <th>November–Desember</th>
                    <th>Penanda</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => {
                    const availableYears = dataset.snapshots
                      .filter((s) => s.month === 12 && s.regionCode === code)
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
                            className="text-link"
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
                        <td>{formatFlagShare(flag.share)}</td>
                        <td>
                          {flag.status === "ditandai"
                            ? "⚠ Perlu ditanyakan"
                            : flag.status === "wajar"
                              ? "✓ Di bawah ambang"
                              : flag.status === "tidak-konsisten"
                                ? "Data tidak konsisten"
                                : "Belum tersedia"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <InfoNote>
              Ambang {YEAR_END_THRESHOLD}% merupakan pilihan metodologi, bukan
              batas hukum atau bukti pelanggaran. Perbedaan jadwal proyek dapat
              memengaruhi hasil. Buka profil untuk pertanyaan dan sumber Oktober
              serta Desember.
            </InfoNote>
          </section>
          {snapshots[0] && <SourceNote snapshot={snapshots[0]} />}
          <InfoNote>
            Persentase serapan atau komposisi yang lebih tinggi tidak otomatis
            berarti layanan lebih baik. Pertimbangkan kebutuhan warga,
            kewenangan daerah, dan data hasil layanan.
          </InfoNote>
        </>
      )}
    </>
  );
}
