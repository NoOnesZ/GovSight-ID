"use client";

import Link from "next/link";
import Decimal from "decimal.js";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Info,
  MapPin,
  Scale,
  TriangleAlert,
  Wallet,
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
  ShareButton,
  SourceNote,
  UnavailablePeriod,
  kindLabel,
  useFilters,
} from "./shared";
import { ChartLegend, HistoryChart, MonthlyChart, chartColors } from "./charts";
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
  const over = rate !== null && rate > 100;
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
      <Link className="back-link no-print" href={`/?${period}`}>
        <ArrowLeft size={14} /> Kembali ke jelajah
      </Link>

      <div className="print-header" aria-hidden="true">
        <h2>GovSight ID — Lembar telaah anggaran daerah</h2>
        <p>
          Daerah: {region.name} · Periode laporan: {months[month]} {year} ·
          Sumber: data resmi DJPK Kementerian Keuangan
        </p>
      </div>

      <div className="page-head">
        <div className="page-head__text">
          <p className="eyebrow">
            <MapPin size={13} /> Sumatera Utara · {kindLabel(region.type)}
          </p>
          <h1>{region.name}</h1>
          <p>Kenali rencana dan realisasi belanja daerah ini.</p>
        </div>
        <div className="page-actions">
          <a className="btn btn--secondary" href="#lembar-advokasi">
            <Scale size={15} /> Panduan advokasi
          </a>
          <ShareButton />
          <DownloadButton codes={[region.code]} year={year} month={month} />
        </div>
      </div>

      <div className="filter-row">
        <SourceNote snapshot={snapshot} />
        <PeriodControls year={year} month={month} onChange={update} />
      </div>

      <div className="stack">
        <div className="metrics">
          <div className="metric">
            <span className="metric__label">
              <Wallet size={14} /> Total pagu belanja
            </span>
            <strong
              className="metric__value"
              title={fullMoney(snapshot.total.budget)}
            >
              {compactMoney(snapshot.total.budget)}
            </strong>
            <small className="metric__hint">Rencana belanja satu tahun</small>
          </div>
          <div className="metric">
            <span className="metric__label">
              <BarChart3 size={14} /> Realisasi belanja
            </span>
            <strong
              className="metric__value metric__value--accent"
              title={fullMoney(snapshot.total.realized)}
            >
              {compactMoney(snapshot.total.realized)}
            </strong>
            <small className="metric__hint">
              Akumulasi s.d. {months[month]} {year}
            </small>
          </div>
          <div className="metric">
            <span className="metric__label">
              <Scale size={14} /> Tingkat serapan
            </span>
            <span className="metric__row">
              <strong className="metric__value">{percent(rate)}</strong>
              {over && (
                <span
                  className="chip chip--warn chip--square"
                  title="Realisasi melampaui pagu awal di SIKD (umumnya karena pagu APBD-P belum tersinkronisasi di pusat data)"
                >
                  &gt;100% pagu
                </span>
              )}
            </span>
            <span className="meter">
              <span
                className={over ? "is-over" : ""}
                style={{ width: `${Math.min(rate ?? 0, 100)}%` }}
              />
            </span>
            <small className="metric__hint">
              Realisasi dibagi pagu tahunan
            </small>
          </div>
        </div>

        {over && (
          <div className="note note--warn note--block" role="status">
            <strong>
              <TriangleAlert
                size={15}
                style={{ verticalAlign: "-2px", marginRight: 6 }}
              />
              Catatan GovSight ID: kemungkinan penyebab realisasi tercatat{" "}
              {percent(rate)} melampaui pagu
            </strong>
            <p>
              Pada portal SIKD DJPK Kementerian Keuangan, realisasi belanja
              dapat melebihi pagu tercatat karena penetapan APBD Perubahan
              (APBD-P) belum selesai disinkronisasikan ke sistem pusat data,
              sehingga realisasi dibandingkan dengan pagu induk awal. Dapat juga
              terdapat pengesahan belanja mendahului perubahan anggaran. Tim
              GovSight ID menyajikan data apa adanya sesuai dokumen publikasi
              DJPK tanpa modifikasi angka.
            </p>
          </div>
        )}

        {year === runningYear && (
          <InfoNote>
            Ini data tahun berjalan, bukan hasil akhir tahun. Angka dapat
            berubah mengikuti pelaporan atau revisi sumber.
          </InfoNote>
        )}

        <YearEnd dataset={dataset} code={region.code} />

        <InquiryToolkit
          region={region}
          currentSnapshot={snapshot}
          dataset={dataset}
        />

        <div className="split">
          <section className="card">
            <div className="card__head">
              <div>
                <h2 className="card__title">Belanjanya untuk apa?</h2>
                <p className="card__sub">
                  Porsi setiap kategori dari total realisasi belanja.
                </p>
              </div>
            </div>
            <div className="card__body">
              <Composition snapshot={snapshot} />
              <div className="cat-rows">
                {snapshot.categories.map((cat) => {
                  const catRate = percentage(cat.realized, cat.budget);
                  return (
                    <div key={cat.code} className="cat-row">
                      <div className="cat-row__top">
                        <span className="cat-row__name">
                          <span className={`dot dot--${cat.code}`} />
                          {cat.label}
                        </span>
                        <span className="chip chip--sunk chip--square">
                          {catRate !== null
                            ? `${percent(catRate)} terserap`
                            : "—"}
                        </span>
                      </div>
                      <div className="cat-row__meta">
                        <span>
                          Realisasi{" "}
                          <strong>{compactMoney(cat.realized)}</strong>
                        </span>
                        <span>Pagu {compactMoney(cat.budget)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card__foot">
              <InfoNote>
                Belanja pegawai juga mencakup tenaga pelayanan publik. Belanja
                modal tidak otomatis menunjukkan mutu pembangunan.
              </InfoNote>
            </div>
          </section>

          <section className="reading-card">
            <span className="reading-card__mark">
              <Info size={19} />
            </span>
            <h2>Membaca angka dengan konteks.</h2>
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
              <div className="sim">
                <div className="sim__head">
                  <span className="eyebrow">Simulasi daya beli fiskal</span>
                  <span className="chip chip--square chip--ghost">
                    Pilih salah satu, bukan akumulasi
                  </span>
                </div>
                <p className="sim__intro">
                  Total realisasi modal{" "}
                  <strong>{compactMoney(modalRealized)}</strong> setara dengan
                  salah satu alternatif berikut bila dialokasikan penuh:
                </p>
                <div className="sim__items">
                  <div className="sim__item">
                    <span className="chip chip--square chip--sunk">
                      Alternatif A
                    </span>
                    <strong>~{kmJalan.toLocaleString("id-ID")} km</strong>
                    <span>Peningkatan jalan mantap</span>
                    <small>
                      Asumsi model ~Rp1,5 M/km (pemeliharaan berkala jalan dua
                      lajur, standar kebinamargaan)
                    </small>
                  </div>
                  <div className="sim__item">
                    <span className="chip chip--square chip--sunk">
                      Alternatif B
                    </span>
                    <strong>~{unitFaskes.toLocaleString("id-ID")} unit</strong>
                    <span>Puskesmas pembantu (Pustu)</span>
                    <small>
                      Asumsi model ~Rp2,0 M/unit (rujukan prototipe fisik faskes
                      pembantu Kemenkes RI)
                    </small>
                  </div>
                  <div className="sim__item">
                    <span className="chip chip--square chip--sunk">
                      Alternatif C
                    </span>
                    <strong>~{ruangKelas.toLocaleString("id-ID")} ruang</strong>
                    <span>Rehabilitasi kelas sekolah</span>
                    <small>
                      Asumsi model ~Rp150 jt/ruang (rujukan menu rehabilitasi
                      DAK Fisik pendidikan dasar)
                    </small>
                  </div>
                </div>
                <div className="sim__foot">
                  <small>
                    Simulasi di atas adalah asumsi model estimasi tim GovSight
                    ID untuk menggambarkan kapasitas fiskal bila belanja modal
                    dialokasikan penuh pada salah satu alternatif, bukan
                    akumulasi ketiganya. Biaya riil di lapangan dipengaruhi
                    indeks kemahalan konstruksi dan HSPK ketetapan kepala daerah
                    setempat.
                  </small>
                </div>
              </div>
            )}

            <Link className="link" href="/metodologi">
              Pelajari metodologi <ArrowUpRight size={14} />
            </Link>
          </section>
        </div>

        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">
                Pagu dan realisasi menurut jenis belanja
              </h2>
              <p className="card__sub">
                Komposisi pada periode {months[month]} {year}.
              </p>
            </div>
          </div>
          <div className="card__body">
            <div className="table-wrap">
              <table className="table table--rows">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th className="is-num">Porsi pagu</th>
                    <th className="is-num">Porsi realisasi</th>
                  </tr>
                </thead>
                <tbody>
                  {["modal", "pegawai"].map((code) => {
                    const shares = categoryShares(snapshot, code);
                    return (
                      <tr key={code}>
                        <th>
                          {code === "modal"
                            ? "Belanja modal"
                            : "Belanja pegawai"}
                        </th>
                        <td className="is-num">
                          {formatFlagShare(shares.budget)}
                        </td>
                        <td className="is-num">
                          {formatFlagShare(shares.realized)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="hkpd">
              <div className="hkpd__head">
                <h4>Konteks komposisi anggaran dan regulasi</h4>
                <span className="eyebrow">Rujukan UU No. 1/2022 (HKPD)</span>
              </div>
              <div className="hkpd__grid">
                <div className="hkpd__item">
                  <strong>
                    Belanja pegawai {formatFlagShare(sharesPegawai.budget)} dari
                    pagu
                  </strong>
                  <span className="chip chip--square chip--sunk">
                    Peringkat #{pegawaiRank} tertinggi dari{" "}
                    {periodSnapshots.length} daerah pantauan
                  </span>
                  <p>
                    Pasal 146 ayat (1) mengarahkan belanja pegawai maksimal 30%
                    APBD, dengan masa transisi bertahap hingga 2027. Formula
                    resmi HKPD mengecualikan tunjangan guru DAK Nonfisik dan
                    bagi hasil atau transfer desa, sehingga persentase belanja
                    pegawai pada data APBD ini belum dapat disamakan langsung
                    dengan kepatuhan hukum HKPD.
                  </p>
                </div>
                <div className="hkpd__item">
                  <strong>
                    Belanja modal {formatFlagShare(sharesModal.budget)} dari
                    pagu
                  </strong>
                  <span className="chip chip--square chip--sunk">
                    Peringkat #{modalRank} tertinggi dari{" "}
                    {periodSnapshots.length} daerah pantauan
                  </span>
                  <p>
                    Belanja modal mencerminkan alokasi aset fisik (klasifikasi
                    ekonomi). Kategori ini berbeda dari mandat belanja
                    infrastruktur pelayanan publik minimal 40% pada Pasal 147
                    ayat (1) HKPD yang berbasis klasifikasi fungsi dan mencakup
                    pula pemeliharaan sarana umum lintas dinas.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="card__foot">
            <InfoNote>
              Persentase pagu dan realisasi memakai total yang berbeda. Keduanya
              tidak langsung menunjukkan kepatuhan terhadap batas hukum atau
              mutu layanan.
            </InfoNote>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Serapan belanja bulanan</h2>
              <p className="card__sub">
                Tahun {year}: realisasi kumulatif dibagi pagu pada setiap
                laporan.
              </p>
            </div>
          </div>
          <div className="card__body">
            {monthly.length > 1 ? (
              <>
                <MonthlyChart snapshots={monthly} />
                <ChartLegend
                  items={[
                    { label: "Serapan kumulatif", color: chartColors.realized },
                    {
                      label: "Garis merata (ilustrasi)",
                      color: chartColors.reference,
                      dashed: true,
                    },
                  ]}
                />
                <div className="table-wrap" style={{ marginTop: 20 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Periode</th>
                        <th className="is-num">Pagu laporan</th>
                        <th className="is-num">Realisasi kumulatif</th>
                        <th className="is-num">Serapan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.map((row) => (
                        <tr key={row.month}>
                          <th>
                            {months[row.month]} {row.year}
                          </th>
                          <td
                            className="is-num"
                            title={fullMoney(row.total.budget)}
                          >
                            {compactMoney(row.total.budget)}
                          </td>
                          <td
                            className="is-num"
                            title={fullMoney(row.total.realized)}
                          >
                            {compactMoney(row.total.realized)}
                          </td>
                          <td className="is-num">
                            {percent(monthlyAbsorption(row))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="muted">
                Data bulanan belum tersedia untuk tahun ini.
              </p>
            )}
          </div>
          <div className="card__foot">
            <InfoNote>
              Garis merata adalah ilustrasi pembagian selama 12 bulan, bukan
              target atau bukti keterlambatan. Pagu dapat berubah antar laporan.
            </InfoNote>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">
                Porsi realisasi modal tiga tahun terakhir
              </h2>
              <p className="card__sub">
                Tahun lengkap berurutan; persentase dibulatkan ke dua desimal.
              </p>
            </div>
          </div>
          <div className="card__body">
            <p className="muted" style={{ fontSize: "0.875rem" }}>
              {threeYearTrend(completeYears)
                ? `Porsi ${threeYearTrend(completeYears)} selama tiga tahun berurutan.`
                : "Pola tiga tahun belum dapat dihitung dari data yang tersedia."}
            </p>

            <div className="filter-row" style={{ marginTop: 16 }}>
              <label className="field-label">
                Acuan perbandingan pilihanmu (%)
                <span className="field field--number">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={reference}
                    onChange={(e) => update({ acuan: e.target.value || null })}
                    placeholder="Contoh: 20"
                  />
                </span>
              </label>
              {reference !== "" && (
                <span className="chip chip--sunk" role="status">
                  {belowThreeYearReference(completeYears, Number(reference)) ===
                  null
                    ? "Masukkan angka 0–100 dan pastikan data tiga tahun lengkap."
                    : belowThreeYearReference(completeYears, Number(reference))
                      ? "Ketiga tahun berada di bawah acuan pilihanmu."
                      : "Tidak semua tahun berada di bawah acuan pilihanmu."}
                </span>
              )}
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tahun</th>
                    <th className="is-num">Porsi belanja modal</th>
                    <th>Sumber</th>
                  </tr>
                </thead>
                <tbody>
                  {completeYears.map((row) => (
                    <tr key={row.year}>
                      <th>{row.year}</th>
                      <td className="is-num">
                        {formatFlagShare(categoryShares(row, "modal").realized)}
                      </td>
                      <td>
                        <a
                          className="file-link"
                          href={row.source.rawPath}
                          download
                        >
                          Unduh Desember {row.year}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card__foot">
            <InfoNote>
              Acuan pilihanmu bukan batas hukum. Angka ini menunjukkan
              komposisi, bukan nilai kinerja. Kebutuhan daerah dan klasifikasi
              belanja dapat berbeda.
            </InfoNote>
          </div>
        </section>

        <section id="riwayat-tahunan" className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">
                Melihat belanja dari waktu ke waktu
              </h2>
              <p className="card__sub">
                Semua tahun memakai realisasi sampai {months[month]}, agar
                periodenya setara.
              </p>
            </div>
            <span className="chip chip--sunk">
              <BarChart3 size={13} /> {history.length} tahun
            </span>
          </div>
          <div className="card__body">
            <HistoryChart snapshots={history} />
            <ChartLegend
              items={[
                { label: "Realisasi", color: chartColors.realized },
                { label: "Pagu", color: chartColors.reference, dashed: true },
              ]}
            />
            <div className="table-wrap" style={{ marginTop: 20 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Tahun dan periode</th>
                    <th className="is-num">Pagu tahunan</th>
                    <th className="is-num">Realisasi</th>
                    <th className="is-num">Serapan</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.year}>
                      <th>
                        {months[row.month]} {row.year}
                        {row.year === runningYear && (
                          <small> · tahun berjalan</small>
                        )}
                      </th>
                      <td
                        className="is-num"
                        title={fullMoney(row.total.budget)}
                      >
                        {compactMoney(row.total.budget)}
                      </td>
                      <td
                        className="is-num"
                        title={fullMoney(row.total.realized)}
                      >
                        {compactMoney(row.total.realized)}
                      </td>
                      <td className="is-num">
                        {percent(
                          percentage(row.total.realized, row.total.budget),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="profile-cta no-print">
          <div>
            <h3>Ingin melihat perbandingannya?</h3>
            <p>Lihat daerah lain pada periode yang sama.</p>
          </div>
          <Link
            className="btn btn--primary"
            href={`/bandingkan?daerah=${region.code},${peer}&${period}`}
          >
            Bandingkan daerah <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      <div className="source-actions">
        <ExternalSource snapshot={snapshot} />
        <a href={snapshot.source.rawPath} download className="link link--quiet">
          Unduh berkas sumber <ArrowUpRight size={13} />
        </a>
      </div>
    </>
  );
}
