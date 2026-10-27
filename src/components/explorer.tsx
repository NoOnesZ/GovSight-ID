"use client";

import Link from "next/link";
import Decimal from "decimal.js";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  MapPin,
  Search,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type { Dataset } from "@/lib/types";
import { regions } from "@/lib/regions";
import {
  compactMoney,
  dateLabel,
  fullMoney,
  percent,
  periodLabel,
} from "@/lib/format";
import { percentage, sumAmounts } from "@/lib/data-core";
import { SpendingChart } from "./charts";
import {
  Composition,
  DownloadButton,
  EmptyState,
  InfoNote,
  PeriodControls,
  SectionHeading,
  ShareButton,
  SourceNote,
  UnavailablePeriod,
  useFilters,
} from "./shared";

export function Explorer({ dataset }: { dataset: Dataset }) {
  const { year, month, params, update, period, invalidPeriod } = useFilters();
  const query = params.get("q") ?? "";
  const kind = params.get("jenis") ?? "semua";
  const [sort, setSort] = useState("nama");
  if (invalidPeriod) return <UnavailablePeriod />;
  const snapshots = dataset.snapshots.filter(
    (row) => row.year === year && row.month === month,
  );
  const visible = snapshots
    .filter((row) => {
      const region = regions.find((region) => region.code === row.regionCode)!;
      return (
        region.name.toLowerCase().includes(query.toLowerCase()) &&
        (kind === "semua" || region.type === kind)
      );
    })
    .sort((a, b) =>
      sort === "realisasi"
        ? new Decimal(b.total.realized ?? 0).comparedTo(a.total.realized ?? 0)
        : regions
            .find((region) => region.code === a.regionCode)!
            .name.localeCompare(
              regions.find((region) => region.code === b.regionCode)!.name,
              "id",
            ),
    );
  const featured =
    snapshots.find((row) => row.regionCode === "0215") ?? snapshots[0];
  const totalBudget = sumAmounts(visible.map((row) => row.total.budget));
  const totalRealized = sumAmounts(visible.map((row) => row.total.realized));
  const rate = featured
    ? percentage(featured.total.realized, featured.total.budget)
    : null;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="location-label">
            <MapPin size={14} /> Sumatera Utara <span /> Data terbuka untuk
            warga
          </span>
          <h1>
            Uang daerahmu,
            <br />
            untuk apa saja?
          </h1>
          <p>
            Kenali rencana belanja, lihat realisasinya, dan bandingkan daerahmu.
            Angka publik, dijelaskan dengan sederhana.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#jelajah">
              Mulai jelajahi <ArrowDown size={16} />
            </a>
            <Link className="hero-secondary" href="/metodologi">
              <CircleHelp size={16} /> Cara membaca data
            </Link>
          </div>
          <div className="hero-trust">
            <Check size={14} /> Sumber resmi <span />
            <Check size={14} /> Metode terbuka <span />
            <Check size={14} /> Tanpa akun
          </div>
        </div>
        {featured && (
          <div className="hero-visual">
            <div className="preview-card">
              <div className="preview-heading">
                <span className="preview-icon">
                  <Building2 size={18} />
                </span>
                <div>
                  <strong>Kota Medan</strong>
                  <span>Realisasi belanja {year}</span>
                </div>
                <Link
                  href={`/daerah/0215?${period}`}
                  aria-label="Lihat profil Kota Medan"
                >
                  <ArrowUpRight size={19} />
                </Link>
              </div>
              <div className="preview-main">
                <div>
                  <span className="small-label">Sudah dibelanjakan</span>
                  <strong className="preview-amount">
                    {compactMoney(featured.total.realized)}
                  </strong>
                  <span className="preview-budget">
                    dari pagu {compactMoney(featured.total.budget)}
                  </span>
                  <span className="preview-period">
                    {periodLabel(year, month)}
                  </span>
                </div>
                <div className="progress-ring">
                  <svg viewBox="0 0 108 108" aria-hidden="true">
                    <circle
                      cx="54"
                      cy="54"
                      r="45"
                      fill="none"
                      stroke="#E8EEFC"
                      strokeWidth="9"
                    />
                    <circle
                      cx="54"
                      cy="54"
                      r="45"
                      fill="none"
                      stroke="#2457E7"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(rate ?? 0, 100) * 2.827} 282.7`}
                      transform="rotate(-90 54 54)"
                    />
                  </svg>
                  <span>
                    <strong>{percent(rate)}</strong>
                    <small>terserap</small>
                  </span>
                </div>
              </div>
              <div className="preview-composition">
                <span className="small-label">Komposisi realisasi</span>
                <Composition snapshot={featured} showAmounts={false} />
              </div>
            </div>
            <div className="visual-note">
              <span className="visual-note-check">
                <Check size={12} />
              </span>
              Setiap angka punya sumber yang bisa kamu buka.
            </div>
            <span className="visual-grid" aria-hidden="true" />
          </div>
        )}
      </section>

      <section className="explore-section" id="jelajah">
        <SectionHeading
          title="Jelajahi belanja daerah"
          subtitle="Mulai dari daerahmu. Temukan gambaran yang lebih utuh."
        >
          <div className="heading-actions">
            <ShareButton />
            <DownloadButton
              codes={visible.map((row) => row.regionCode)}
              year={year}
              month={month}
            />
          </div>
        </SectionHeading>
        <div className="filter-bar">
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Cari daerah</span>
            <input
              aria-label="Cari daerah"
              value={query}
              onChange={(event) => update({ q: event.target.value })}
              placeholder="Cari kota atau kabupaten..."
            />
            <span className="search-shortcut" aria-hidden="true">
              Cari
            </span>
          </label>
          <div className="filter-controls">
            <PeriodControls year={year} month={month} onChange={update} />
            <label className="select-control">
              <SlidersHorizontal size={15} />
              <select
                aria-label="Jenis daerah"
                value={kind}
                onChange={(event) => update({ jenis: event.target.value })}
              >
                <option value="semua">Semua daerah</option>
                <option value="kota">Kota</option>
                <option value="kabupaten">Kabupaten</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </div>
        {visible.length ? (
          <>
            <div className="summary-band">
              <div className="summary-item">
                <span className="metric-icon">
                  <Building2 size={20} />
                </span>
                <div>
                  <span>Daerah ditampilkan</span>
                  <strong>
                    {visible.length}
                    <small> daerah</small>
                  </strong>
                </div>
              </div>
              <div className="summary-item">
                <span className="metric-icon">
                  <Wallet size={20} />
                </span>
                <div>
                  <span>Total pagu belanja</span>
                  <strong title={fullMoney(totalBudget)}>
                    {compactMoney(totalBudget)}
                  </strong>
                </div>
              </div>
              <div className="summary-item">
                <span className="metric-icon blue">
                  <BarChart3 size={20} />
                </span>
                <div>
                  <span>Total realisasi belanja</span>
                  <strong title={fullMoney(totalRealized)}>
                    {compactMoney(totalRealized)}
                  </strong>
                </div>
              </div>
              <div className="summary-period">
                <span className="status-dot" />
                <div>
                  <strong>{periodLabel(year, month)}</strong>
                  <span>
                    {year === 2026 ? "Tahun berjalan" : "Periode historis"}
                  </span>
                </div>
              </div>
            </div>
            <div className="explore-grid">
              <div className="panel regions-panel">
                <div className="panel-heading">
                  <div>
                    <h3>
                      Daerah pilihanmu{" "}
                      <span className="count-badge">{visible.length}</span>
                    </h3>
                    <p>Pagu dan realisasi dalam rupiah.</p>
                  </div>
                  <label className="sort-control">
                    <span className="sr-only">Urutkan daerah</span>
                    <select
                      aria-label="Urutkan daerah"
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                    >
                      <option value="nama">Nama daerah</option>
                      <option value="realisasi">Realisasi terbesar</option>
                    </select>
                    <ChevronDown size={13} />
                  </label>
                </div>
                <div className="table-scroll">
                  <table className="region-table">
                    <thead>
                      <tr>
                        <th>Daerah</th>
                        <th>Pagu / Realisasi</th>
                        <th>Serapan</th>
                        <th>
                          <span className="sr-only">Profil</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((snapshot) => {
                        const region = regions.find(
                          (item) => item.code === snapshot.regionCode,
                        )!;
                        const rate = percentage(
                          snapshot.total.realized,
                          snapshot.total.budget,
                        );
                        return (
                          <tr key={region.code}>
                            <td>
                              <Link
                                className="region-name"
                                href={`/daerah/${region.code}?${period}`}
                              >
                                <span className="region-avatar">
                                  <Building2 size={18} />
                                </span>
                                <span>
                                  <strong>{region.shortName}</strong>
                                  <small>
                                    {region.type === "kota"
                                      ? "Kota"
                                      : "Kabupaten"}
                                  </small>
                                </span>
                              </Link>
                            </td>
                            <td>
                              <div
                                className="table-money"
                                title={fullMoney(snapshot.total.budget)}
                              >
                                {compactMoney(snapshot.total.budget)}
                              </div>
                              <div
                                className="table-realized"
                                title={fullMoney(snapshot.total.realized)}
                              >
                                {compactMoney(snapshot.total.realized)}
                              </div>
                            </td>
                            <td>
                              <strong className="table-rate">
                                {percent(rate)}
                              </strong>
                              <span className="mini-progress">
                                <span
                                  style={{
                                    width: `${Math.min(rate ?? 0, 100)}%`,
                                  }}
                                />
                              </span>
                            </td>
                            <td>
                              <Link
                                className="icon-link"
                                href={`/daerah/${region.code}?${period}`}
                                aria-label={`Lihat profil ${region.name}`}
                              >
                                <ArrowUpRight size={17} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="panel-foot">
                  <InfoNote>
                    Serapan menunjukkan bagian pagu yang sudah dibelanjakan,
                    bukan penilaian mutu layanan.
                  </InfoNote>
                </div>
              </div>
              <div className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Rencana & realisasi</h3>
                    <p>Dalam triliun rupiah (T).</p>
                  </div>
                  <BarChart3 size={18} className="muted" />
                </div>
                <SpendingChart snapshots={visible} />
              </div>
            </div>
            <SourceNote snapshot={visible[0]} />
          </>
        ) : (
          <EmptyState title="Daerah tidak ditemukan">
            Coba kata “Medan”, “Binjai”, atau “Deli Serdang”, atau ubah filter
            jenis daerah.
          </EmptyState>
        )}
      </section>
      <section className="bottom-cards">
        <Link
          href={`/bandingkan?tahun=${year}&bulan=${month}`}
          className="feature-link"
        >
          <span className="feature-icon">
            <BarChart3 size={23} />
          </span>
          <div>
            <h3>Beda daerah, bagaimana belanjanya?</h3>
            <p>Bandingkan angka pada periode yang sama.</p>
          </div>
          <ArrowRight size={20} />
        </Link>
        <Link href="/metodologi" className="feature-link">
          <span className="feature-icon neutral">
            <FileText size={23} />
          </span>
          <div>
            <h3>Datanya dari mana?</h3>
            <p>Buka sumber dan pahami cara menghitungnya.</p>
          </div>
          <ArrowRight size={20} />
        </Link>
      </section>
      <p className="coverage-note">
        Cakupan versi awal: Medan, Binjai, dan Deli Serdang. Data diperiksa{" "}
        {dateLabel(dataset.generatedAt)}. Pembaruan mengikuti publikasi sumber.
      </p>
    </>
  );
}
