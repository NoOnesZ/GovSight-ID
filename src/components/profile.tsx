"use client";

import Link from "next/link";
import Decimal from "decimal.js";
import { ArrowLeft, ArrowUpRight, BarChart3, Info, MapPin } from "lucide-react";
import type { Dataset, Region } from "@/lib/types";
import { months, regions } from "@/lib/regions";
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
import { HistoryChart, MonthlyChart } from "./charts";
import {
  categoryShares,
  monthlyAbsorption,
  threeYearTrend,
  formatFlagShare,
  belowThreeYearReference,
} from "@/lib/indicators";
import { YearEnd } from "./year-end";
import { InquiryToolkit } from "./inquiry-toolkit";
import { Sparkles } from "lucide-react";

export function Profile({
  dataset,
  region,
}: {
  dataset: Dataset;
  region: Region;
}) {
  const { year, month, update, period, invalidPeriod, params } = useFilters();
  const reference = params.get("acuan") ?? "";
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
  const monthly = dataset.snapshots
    .filter((row) => row.regionCode === region.code && row.year === year)
    .sort((a, b) => a.month - b.month);
  const completeYears = dataset.snapshots
    .filter((row) => row.regionCode === region.code && row.month === 12)
    .sort((a, b) => b.year - a.year)
    .slice(0, 3)
    .reverse();
  if (!snapshot) return <EmptyState />;
  const rate = percentage(snapshot.total.realized, snapshot.total.budget);
  const modalRealized =
    snapshot.categories.find((c) => c.code === "modal")?.realized ?? null;
  const modalNum = modalRealized ? new Decimal(modalRealized).toNumber() : 0;
  const kmJalan = Math.round(modalNum / 1_500_000_000);
  const unitFaskes = Math.round(modalNum / 2_000_000_000);
  const ruangKelas = Math.round(modalNum / 150_000_000);
  const peer =
    regions.find((r) => r.type === region.type && r.code !== region.code)
      ?.code ?? (region.code === "0215" ? "0214" : "0215");
  return (
    <>
      <Link className="back-link" href={`/?${period}`}>
        <ArrowLeft size={15} /> Kembali ke jelajah
      </Link>
      <div className="print-header" aria-hidden="true">
        <h2>GovSight ID — Lembar Telaah Anggaran Daerah</h2>
        <p>
          Daerah: {region.name} · Periode Laporan: {months[month]} {year} · Sumber: Data Resmi DJPK Kementerian Keuangan
        </p>
      </div>
      <div className="page-title-row">
        <div>
          <span className="location-label">
            <MapPin size={14} /> Sumatera Utara
          </span>
          <h1>{region.name}</h1>
          <p>Kenali rencana dan realisasi belanja daerah ini.</p>
        </div>
        <div className="heading-actions">
          <a
            className="button button-secondary action-advocacy-link"
            href="#lembar-advokasi"
          >
            <Sparkles size={14} /> Panduan Advokasi
          </a>
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
      <YearEnd dataset={dataset} code={region.code} />
      <InquiryToolkit
        region={region}
        currentSnapshot={snapshot}
        dataset={dataset}
      />
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
          {modalNum > 0 && (
            <div className="impact-box">
              <span className="small-label">Kapasitas Belanja Modal</span>
              <p className="impact-intro">
                Realisasi modal {compactMoney(modalRealized)} setara dengan daya
                pembangunan fisik rujukan warga:
              </p>
              <div className="impact-items">
                <div className="impact-item">
                  <strong>~{kmJalan.toLocaleString("id-ID")} km</strong>
                  <span>Peningkatan jalan mantap</span>
                </div>
                <div className="impact-item">
                  <strong>~{unitFaskes.toLocaleString("id-ID")} unit</strong>
                  <span>Puskesmas / faskes pembantu</span>
                </div>
                <div className="impact-item">
                  <strong>~{ruangKelas.toLocaleString("id-ID")} ruang</strong>
                  <span>Rehabilitasi kelas sekolah</span>
                </div>
              </div>
              <small className="impact-disclaimer">
                *Estimasi ilustratif daya beli fiskal berdasarkan standar
                rujukan biaya konstruksi kementerian (PU/Kemendikbud/Kemenkes).
              </small>
            </div>
          )}
          <Link className="text-link" href="/metodologi">
            Pelajari metodologi <ArrowUpRight size={15} />
          </Link>
        </section>
      </div>
      <section className="panel composition-panel" style={{ marginTop: 24 }}>
        <SectionHeading
          title="Pagu dan realisasi menurut jenis belanja"
          subtitle={`Komposisi pada periode ${months[month]} ${year}.`}
        />
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Porsi pagu</th>
                <th>Porsi realisasi</th>
              </tr>
            </thead>
            <tbody>
              {["modal", "pegawai"].map((code) => {
                const shares = categoryShares(snapshot, code);
                return (
                  <tr key={code}>
                    <th>
                      {code === "modal" ? "Belanja modal" : "Belanja pegawai"}
                    </th>
                    <td>{formatFlagShare(shares.budget)}</td>
                    <td>{formatFlagShare(shares.realized)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <InfoNote>
          Persentase pagu dan realisasi memakai total yang berbeda. Keduanya
          tidak langsung menunjukkan kepatuhan terhadap batas hukum atau mutu
          layanan.
        </InfoNote>
      </section>
      <section className="panel history-panel">
        <SectionHeading
          title="Serapan belanja bulanan"
          subtitle={`Tahun ${year}: realisasi kumulatif dibagi pagu pada setiap laporan.`}
        />
        {monthly.length > 1 ? (
          <>
            <MonthlyChart snapshots={monthly} />
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Periode</th>
                    <th>Pagu laporan</th>
                    <th>Realisasi kumulatif</th>
                    <th>Serapan</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((row) => (
                    <tr key={row.month}>
                        <th>
                          {months[row.month]} {row.year}
                        </th>
                        <td title={fullMoney(row.total.budget)}>
                          {compactMoney(row.total.budget)}
                        </td>
                        <td title={fullMoney(row.total.realized)}>
                          {compactMoney(row.total.realized)}
                        </td>
                        <td>{percent(monthlyAbsorption(row))}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>Data bulanan belum tersedia untuk tahun ini.</p>
        )}
        <InfoNote>
          Garis merata adalah ilustrasi pembagian selama 12 bulan, bukan target
          atau bukti keterlambatan. Pagu dapat berubah antar laporan.
        </InfoNote>
      </section>
      <section className="panel history-panel">
        <SectionHeading
          title="Porsi realisasi modal tiga tahun terakhir"
          subtitle="Tahun lengkap berurutan; persentase dibulatkan ke dua desimal."
        />
        <p>
          {threeYearTrend(completeYears)
            ? `Porsi ${threeYearTrend(completeYears)} selama tiga tahun berurutan.`
            : "Pola tiga tahun belum dapat dihitung dari data yang tersedia."}
        </p>
        <label className="reference-input">
          Acuan perbandingan pilihanmu (%){" "}
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={reference}
            onChange={(e) => update({ acuan: e.target.value || null })}
            placeholder="Contoh: 20"
          />
        </label>
        {reference !== "" && (
          <p role="status">
            {belowThreeYearReference(completeYears, Number(reference)) === null
              ? "Masukkan angka 0–100 dan pastikan data tiga tahun lengkap."
              : belowThreeYearReference(completeYears, Number(reference))
                ? "Ketiga tahun berada di bawah acuan pilihanmu."
                : "Tidak semua tahun berada di bawah acuan pilihanmu."}
          </p>
        )}
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tahun</th>
                <th>Porsi belanja modal</th>
                <th>Sumber</th>
              </tr>
            </thead>
            <tbody>
              {completeYears.map((row) => (
                <tr key={row.year}>
                  <th>{row.year}</th>
                  <td>
                    {formatFlagShare(categoryShares(row, "modal").realized)}
                  </td>
                  <td>
                    <a className="text-link" href={row.source.rawPath} download>
                      Unduh Desember {row.year}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <InfoNote>
          Acuan pilihanmu bukan batas hukum. Angka ini menunjukkan komposisi,
          bukan nilai kinerja. Kebutuhan daerah dan klasifikasi belanja dapat
          berbeda.
        </InfoNote>
      </section>
      <section id="riwayat-tahunan" className="panel history-panel">
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
