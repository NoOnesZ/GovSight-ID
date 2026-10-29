"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BarChart3, Info, MapPin } from "lucide-react";
import type { Dataset, Region } from "@/lib/types";
import { months } from "@/lib/regions";
import { runningYear } from "@/lib/periods";
import { compactMoney, fullMoney, percent } from "@/lib/format";
import { percentage } from "@/lib/data-core";
import {
  Composition,
  DownloadButton,
  EmptyState,
  ExternalSource,
  InfoNote,
  PeriodControls,
  SectionHeading,
  ShareButton,
  SourceNote,
  UnavailablePeriod,
  useFilters,
} from "./shared";
import { HistoryChart } from "./charts";

export function Profile({
  dataset,
  region,
}: {
  dataset: Dataset;
  region: Region;
}) {
  const { year, month, update, period, invalidPeriod } = useFilters();
  if (invalidPeriod) return <UnavailablePeriod />;
  const snapshot = dataset.snapshots.find(
    (row) =>
      row.regionCode === region.code &&
      row.year === year &&
      row.month === month,
  );
  const history = dataset.snapshots.filter(
    (row) => row.regionCode === region.code && row.month === month,
  );
  if (!snapshot) return <EmptyState />;
  const rate = percentage(snapshot.total.realized, snapshot.total.budget);
  const peer = region.code === "0215" ? "0214" : "0215";
  return (
    <>
      <Link className="back-link" href={`/?${period}`}>
        <ArrowLeft size={15} /> Kembali ke jelajah
      </Link>
      <div className="page-title-row">
        <div>
          <span className="location-label">
            <MapPin size={14} /> Sumatera Utara
          </span>
          <h1>{region.name}</h1>
          <p>Kenali rencana dan realisasi belanja daerah ini.</p>
        </div>
        <div className="heading-actions">
          <ShareButton />
          <DownloadButton codes={[region.code]} year={year} month={month} />
        </div>
      </div>
      <div className="profile-filter-row">
        <SourceNote snapshot={snapshot} compact />
        <PeriodControls year={year} month={month} onChange={update} />
      </div>
      <div className="profile-metrics">
        <div>
          <span>Total pagu belanja</span>
          <strong title={fullMoney(snapshot.total.budget)}>
            {compactMoney(snapshot.total.budget)}
          </strong>
          <small>Rencana belanja satu tahun</small>
        </div>
        <div>
          <span>Realisasi belanja</span>
          <strong
            className="blue-text"
            title={fullMoney(snapshot.total.realized)}
          >
            {compactMoney(snapshot.total.realized)}
          </strong>
          <small>
            Akumulasi s.d. {months[month]} {year}
          </small>
        </div>
        <div>
          <span>Tingkat serapan</span>
          <strong>{percent(rate)}</strong>
          <span className="large-progress">
            <span style={{ width: `${Math.min(rate ?? 0, 100)}%` }} />
          </span>
          <small>Realisasi dibagi pagu tahunan</small>
        </div>
      </div>
      {year === runningYear && (
        <InfoNote>
          Ini data tahun berjalan, bukan hasil akhir tahun. Angka dapat berubah
          mengikuti pelaporan atau revisi sumber.
        </InfoNote>
      )}
      <div className="profile-grid">
        <section className="panel composition-panel">
          <SectionHeading
            title="Belanjanya untuk apa?"
            subtitle="Porsi setiap kategori dari total realisasi belanja."
          />
          <Composition snapshot={snapshot} />
          <InfoNote>
            Belanja pegawai juga mencakup tenaga pelayanan publik. Belanja modal
            tidak otomatis menunjukkan mutu pembangunan.
          </InfoNote>
        </section>
        <section className="panel reading-panel">
          <div className="feature-icon">
            <Info size={22} />
          </div>
          <h2>
            Membaca angka
            <br />
            dengan konteks.
          </h2>
          <p>
            Dari setiap Rp100 pagu belanja, sekitar{" "}
            <strong>
              {rate === null
                ? "jumlah yang belum tersedia"
                : `Rp${Math.round(rate).toLocaleString("id-ID")}`}
            </strong>{" "}
            sudah direalisasikan sampai {months[month]}.
          </p>
          <p>
            Angka ini menjelaskan pelaksanaan anggaran. Untuk menilai
            manfaatnya, kita masih perlu data hasil pembangunan dan layanan.
          </p>
          <Link className="text-link" href="/metodologi">
            Pelajari metodologi <ArrowUpRight size={15} />
          </Link>
        </section>
      </div>
      <section className="panel history-panel">
        <SectionHeading
          title="Melihat belanja dari waktu ke waktu"
          subtitle={`Semua tahun menggunakan realisasi sampai ${months[month]}, agar periodenya setara.`}
        >
          <span className="pill">
            <BarChart3 size={14} /> {history.length} tahun
          </span>
        </SectionHeading>
        <HistoryChart snapshots={history} />
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tahun & periode</th>
                <th>Pagu tahunan</th>
                <th>Realisasi</th>
                <th>Serapan</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.year}>
                  <th>
                    {months[row.month]} {row.year}
                    {row.year === runningYear && (
                      <small className="year-badge">Tahun berjalan</small>
                    )}
                  </th>
                  <td title={fullMoney(row.total.budget)}>
                    {compactMoney(row.total.budget)}
                  </td>
                  <td title={fullMoney(row.total.realized)}>
                    {compactMoney(row.total.realized)}
                  </td>
                  <td>
                    {percent(percentage(row.total.realized, row.total.budget))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="profile-bottom">
        <div>
          <h3>Ingin melihat perbandingannya?</h3>
          <p>Lihat daerah lain pada periode yang sama.</p>
        </div>
        <Link
          className="button button-primary"
          href={`/bandingkan?daerah=${region.code},${peer}&${period}`}
        >
          Bandingkan daerah <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="source-actions">
        <ExternalSource snapshot={snapshot} />
        <a href={snapshot.source.rawPath} download className="text-link">
          Unduh berkas sumber <ArrowUpRight size={14} />
        </a>
      </div>
    </>
  );
}
