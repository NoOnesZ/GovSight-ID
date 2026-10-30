"use client";

import Link from "next/link";
import Decimal from "decimal.js";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Info,
  MapPin,
  Sparkles,
} from "lucide-react";
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
  const periodSnapshots = dataset.snapshots.filter(
    (s) => s.year === year && s.month === month,
  );
  const sharesPegawai = categoryShares(snapshot, "pegawai");
  const sharesModal = categoryShares(snapshot, "modal");

  const rankedPegawai = [...periodSnapshots]
    .map((s) => ({
      code: s.regionCode,
      share: categoryShares(s, "pegawai").budget ?? -1,
    }))
    .sort((a, b) => b.share - a.share);
  const pegawaiRank =
    rankedPegawai.findIndex((item) => item.code === region.code) + 1;

  const rankedModal = [...periodSnapshots]
    .map((s) => ({
      code: s.regionCode,
      share: categoryShares(s, "modal").budget ?? -1,
    }))
    .sort((a, b) => b.share - a.share);
  const modalRank =
    rankedModal.findIndex((item) => item.code === region.code) + 1;

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
          Daerah: {region.name} · Periode Laporan: {months[month]} {year} ·
          Sumber: Data Resmi DJPK Kementerian Keuangan
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
          <div className="rate-value-row">
            <strong
              className={rate !== null && rate > 100 ? "rate-overflow" : ""}
            >
              {percent(rate)}
            </strong>
            {rate !== null && rate > 100 && (
              <span
                className="overflow-tag"
                title="Realisasi melampaui pagu awal di SIKD (umumnya karena pagu APBD-P belum tersinkronisasi di pusat data)"
              >
                ⚠ &gt;100% Pagu
              </span>
            )}
          </div>
          <span className="large-progress">
            <span
              className={rate !== null && rate > 100 ? "progress-overflow" : ""}
              style={{ width: `${Math.min(rate ?? 0, 100)}%` }}
            />
          </span>
          <small>Realisasi dibagi pagu tahunan</small>
        </div>
      </div>
      {rate !== null && rate > 100 && (
        <div className="anomaly-notice" role="status">
          <AlertTriangle size={18} className="anomaly-icon" />
          <div>
            <strong>
              Catatan GovSight ID: Kemungkinan Penyebab Realisasi Tercatat{" "}
              {percent(rate)} Melampaui Pagu
            </strong>
            <p>
              Pada portal SIKD DJPK Kementerian Keuangan, terdapat kemungkinan
              realisasi belanja melebihi pagu tercatat akibat penetapan APBD
              Perubahan (APBD-P) belum selesai disinkronisasikan ke sistem pusat
              data sehingga realisasi dibandingkan dengan pagu induk awal, atau
              terdapat pengesahan belanja mendahului perubahan anggaran. Tim
              GovSight ID menyajikan data apa adanya sesuai dokumen publikasi
              DJPK tanpa modifikasi angka.
            </p>
          </div>
        </div>
      )}
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
          <div className="cat-breakdown-list">
            {snapshot.categories.map((cat) => {
              const catRate = percentage(cat.realized, cat.budget);
              return (
                <div key={cat.code} className="cat-breakdown-row">
                  <div className="cat-breakdown-header">
                    <div className="cat-name-group">
                      <span className={`cat-dot ${cat.code}`} />
                      <strong>{cat.label}</strong>
                    </div>
                    <span className="cat-rate-tag">
                      {catRate !== null ? `${percent(catRate)} terserap` : "—"}
                    </span>
                  </div>
                  <div className="cat-breakdown-meta">
                    <span className="cat-realized-val">
                      Realisasi: <strong>{compactMoney(cat.realized)}</strong>
                    </span>
                    <span className="cat-budget-val">
                      Pagu: {compactMoney(cat.budget)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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
              <div className="impact-box-top">
                <span className="small-label">Simulasi Daya Beli Fiskal</span>
                <span className="impact-mode-pill">
                  Pilihan Rujukan (Salah Satu / Atau)
                </span>
              </div>
              <p className="impact-intro">
                Total realisasi modal{" "}
                <strong>{compactMoney(modalRealized)}</strong> setara jika
                dialokasikan penuh untuk salah satu alternatif simulasi model
                berikut:
              </p>
              <div className="impact-items">
                <div className="impact-item">
                  <span className="impact-opt-badge">Alternatif A</span>
                  <strong>~{kmJalan.toLocaleString("id-ID")} km</strong>
                  <span>Peningkatan jalan mantap</span>
                  <small>
                    Asumsi model ~Rp1,5 M/km (Pemeliharaan berkala jalan 2
                    lajur, standar kebinamargaan)
                  </small>
                </div>
                <div className="impact-item">
                  <span className="impact-opt-badge">Alternatif B</span>
                  <strong>~{unitFaskes.toLocaleString("id-ID")} unit</strong>
                  <span>Puskesmas Pembantu (Pustu)</span>
                  <small>
                    Asumsi model ~Rp2,0 M/unit (Rujukan prototipe fisik faskes
                    pembantu Kemenkes RI)
                  </small>
                </div>
                <div className="impact-item">
                  <span className="impact-opt-badge">Alternatif C</span>
                  <strong>~{ruangKelas.toLocaleString("id-ID")} ruang</strong>
                  <span>Rehabilitasi kelas sekolah</span>
                  <small>
                    Asumsi model ~Rp150 Jt/ruang (Rujukan menu rehabilitasi DAK
                    Fisik pendidikan dasar)
                  </small>
                </div>
              </div>
              <div className="impact-disclaimer-block">
                <small className="impact-disclaimer">
                  *Simulasi di atas merupakan asumsi model estimasi tim GovSight
                  ID untuk memberikan gambaran konkret kapasitas fiskal jika
                  belanja modal dialokasikan penuh untuk salah satu alternatif
                  (atau), bukan akumulasi ketiganya sekaligus. Biaya riil di
                  lapangan dipengaruhi oleh indeks kemahalan konstruksi dan HSPK
                  ketetapan kepala daerah setempat.
                </small>
              </div>
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
        <div className="hkpd-context-card">
          <div className="hkpd-context-header">
            <h4>Konteks Komposisi Anggaran & Regulasi</h4>
            <span className="small-label">Rujukan UU No. 1/2022 (HKPD)</span>
          </div>
          <div className="hkpd-context-grid">
            <div className="hkpd-context-item">
              <div className="hkpd-item-top">
                <strong>
                  Belanja Pegawai: {formatFlagShare(sharesPegawai.budget)} pagu
                </strong>
                <span className="hkpd-rank-pill">
                  Peringkat #{pegawaiRank} tertinggi dari{" "}
                  {periodSnapshots.length} daerah pantauan
                </span>
              </div>
              <p>
                UU HKPD Pasal 146 ayat (1) mengarahkan belanja pegawai maksimal
                30% APBD (masa transisi bertahap hingga 2027). Formula resmi
                HKPD mengecualikan tunjangan guru DAK Nonfisik dan bagi
                hasil/transfer desa, sehingga persentase belanja pegawai murni
                pada data APBD ini belum dapat disamakan langsung dengan
                kepatuhan hukum HKPD.
              </p>
            </div>
            <div className="hkpd-context-item">
              <div className="hkpd-item-top">
                <strong>
                  Belanja Modal: {formatFlagShare(sharesModal.budget)} pagu
                </strong>
                <span className="hkpd-rank-pill">
                  Peringkat #{modalRank} tertinggi dari {periodSnapshots.length}{" "}
                  daerah pantauan
                </span>
              </div>
              <p>
                Belanja modal mencerminkan alokasi aset fisik (klasifikasi
                ekonomi). Kategori ini berbeda dengan mandat belanja
                infrastruktur pelayanan publik minimal 40% pada Pasal 147 ayat
                (1) HKPD yang berbasis klasifikasi fungsi dan mencakup pula
                pemeliharaan sarana umum lintas dinas.
              </p>
            </div>
          </div>
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
