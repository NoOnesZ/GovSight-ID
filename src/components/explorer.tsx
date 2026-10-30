"use client";

import { useMemo } from "react";
import Link from "next/link";
import Decimal from "decimal.js";
import {
  yearEndModalFlag,
  yearEndPersistence,
  formatFlagShare,
} from "@/lib/indicators";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileText,
  Info,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { Dataset } from "@/lib/types";
import { regionListLabel, regions } from "@/lib/regions";
import { runningYear } from "@/lib/periods";
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
  const fokus = params.get("fokus") ?? "semua";
  const rawSort = params.get("urut");
  const sort =
    rawSort === "realisasi" || rawSort === "penumpukan" ? rawSort : "nama";
  const latestCompleteYear = Math.max(
    ...dataset.snapshots.filter((s) => s.month === 12).map((s) => s.year),
  );
  const { flagMap, rankMap, persistenceMap } = useMemo(() => {
    const fMap = new Map<string, ReturnType<typeof yearEndModalFlag>>();
    const fPriorMap = new Map<string, ReturnType<typeof yearEndModalFlag>>();
    const pMap = new Map<string, ReturnType<typeof yearEndPersistence>>();
    const rMap = new Map<string, number>();

    const oct25 = new Map<string, (typeof dataset.snapshots)[0]>();
    const dec25 = new Map<string, (typeof dataset.snapshots)[0]>();
    const oct24 = new Map<string, (typeof dataset.snapshots)[0]>();
    const dec24 = new Map<string, (typeof dataset.snapshots)[0]>();

    for (const s of dataset.snapshots) {
      if (s.year === latestCompleteYear) {
        if (s.month === 10) oct25.set(s.regionCode, s);
        else if (s.month === 12) dec25.set(s.regionCode, s);
      } else if (s.year === latestCompleteYear - 1) {
        if (s.month === 10) oct24.set(s.regionCode, s);
        else if (s.month === 12) dec24.set(s.regionCode, s);
      }
    }

    for (const r of regions) {
      const f25 = yearEndModalFlag(oct25.get(r.code), dec25.get(r.code));
      const f24 = yearEndModalFlag(oct24.get(r.code), dec24.get(r.code));
      fMap.set(r.code, f25);
      fPriorMap.set(r.code, f24);
      pMap.set(r.code, yearEndPersistence(f24, f25));
    }

    const sortedByShare = [...regions]
      .map((r) => ({ code: r.code, share: fMap.get(r.code)?.share ?? -1 }))
      .sort((a, b) => b.share - a.share);

    sortedByShare.forEach((item, index) => {
      if (item.share >= 0) {
        rMap.set(item.code, index + 1);
      }
    });

    return { flagMap: fMap, rankMap: rMap, persistenceMap: pMap };
  }, [dataset.snapshots, latestCompleteYear]);

  const flagFor = (code: string) =>
    flagMap.get(code) ?? {
      regionCode: code,
      year: latestCompleteYear,
      share: null,
      status: "belum-tersedia" as const,
    };
  if (invalidPeriod) return <UnavailablePeriod />;
  const snapshots = dataset.snapshots.filter(
    (row) => row.year === year && row.month === month,
  );
  const flaggedCount = snapshots.filter(
    (s) => flagFor(s.regionCode).status === "ditandai",
  ).length;
  const kotaCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.type === "kota";
  }).length;
  const kabCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.type === "kabupaten";
  }).length;
  const visible = snapshots
    .filter((row) => {
      const region = regions.find((region) => region.code === row.regionCode)!;
      const matchesQuery = region.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesKind = kind === "semua" || region.type === kind;
      const matchesFokus =
        fokus === "penanda"
          ? flagFor(row.regionCode).status === "ditandai"
          : true;
      return matchesQuery && matchesKind && matchesFokus;
    })
    .sort((a, b) =>
      sort === "penumpukan"
        ? (flagFor(b.regionCode).share ?? -1) -
          (flagFor(a.regionCode).share ?? -1)
        : sort === "realisasi"
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
  const featuredRegion = featured
    ? regions.find((region) => region.code === featured.regionCode)
    : undefined;
  const rate = featured
    ? percentage(featured.total.realized, featured.total.budget)
    : null;

  // Hitung total realisasi per kategori untuk daerah yang sedang ditampilkan
  const aggregateCategories = [
    "pegawai",
    "barang-jasa",
    "modal",
    "lainnya",
  ].map((code) => {
    const labelMap: Record<string, string> = {
      pegawai: "Belanja Pegawai",
      "barang-jasa": "Barang & Jasa",
      modal: "Belanja Modal",
      lainnya: "Belanja Lainnya",
    };
    const sumBudget = sumAmounts(
      visible.map(
        (s) => s.categories.find((c) => c.code === code)?.budget ?? null,
      ),
    );
    const sumRealized = sumAmounts(
      visible.map(
        (s) => s.categories.find((c) => c.code === code)?.realized ?? null,
      ),
    );
    const shareOfRealized = percentage(sumRealized, totalRealized);
    return {
      code,
      label: labelMap[code],
      budget: sumBudget,
      realized: sumRealized,
      share: shareOfRealized,
    };
  });

  // Hitung daerah dengan serapan tertinggi & terendah di visible
  const absorptionList = visible
    .map((s) => {
      const rate = percentage(s.total.realized, s.total.budget);
      const region = regions.find((r) => r.code === s.regionCode)!;
      return { region, rate, snapshot: s };
    })
    .filter((item) => item.rate !== null)
    .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));

  const highestAbsorption = absorptionList[0];
  const lowestAbsorption = absorptionList[absorptionList.length - 1];

  // Cari daerah dengan penumpukan akhir tahun tertinggi di visible
  const highestYearEnd = [...visible]
    .map((s) => {
      const flag = flagFor(s.regionCode);
      const region = regions.find((r) => r.code === s.regionCode)!;
      return { region, flag };
    })
    .filter((item) => item.flag.share !== null)
    .sort((a, b) => (b.flag.share ?? 0) - (a.flag.share ?? 0))[0];

  // Prioritas daerah dengan penumpukan modal di akhir tahun untuk telaah warga (DSS)
  const topFlaggedRegions = visible
    .map((s) => ({
      region: regions.find((r) => r.code === s.regionCode)!,
      flag: flagFor(s.regionCode),
      persistence: persistenceMap.get(s.regionCode),
    }))
    .filter(
      (item) => item.flag.status === "ditandai" && item.flag.share !== null,
    )
    .sort((a, b) => (b.flag.share ?? 0) - (a.flag.share ?? 0))
    .slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="location-label">
            <MapPin size={14} /> Sumatera Utara <span /> Data terbuka untuk
            warga
          </span>
          <h1>Pemda mana yang perlu ditanya soal belanjanya?</h1>
          <p>
            Kami membaca data APBD resmi dan menandai pola yang perlu
            ditanyakan, dengan metode terbuka.
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
        {featured && featuredRegion && (
          <div className="hero-visual">
            <div className="preview-card">
              <div className="preview-heading">
                <span className="preview-icon">
                  <Building2 size={18} />
                </span>
                <div>
                  <strong>{featuredRegion.name}</strong>
                  <span>Realisasi belanja {year}</span>
                </div>
                <Link
                  href={`/daerah/${featuredRegion.code}?${period}`}
                  aria-label={`Lihat profil ${featuredRegion.name}`}
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
        <div
          className="quick-filter-pills"
          role="tablist"
          aria-label="Filter cepat perspektif"
        >
          <button
            type="button"
            className={`pill-button ${fokus === "semua" && kind === "semua" ? "active" : ""}`}
            onClick={() => update({ jenis: "semua", fokus: null })}
          >
            Semua ({snapshots.length})
          </button>
          <button
            type="button"
            className={`pill-button ${fokus === "penanda" ? "active amber" : ""}`}
            onClick={() =>
              update({ fokus: fokus === "penanda" ? null : "penanda" })
            }
          >
            <AlertTriangle size={13} /> Ditandai Akhir Tahun ({flaggedCount})
          </button>
          <button
            type="button"
            className={`pill-button ${fokus !== "penanda" && kind === "kota" ? "active" : ""}`}
            onClick={() => update({ jenis: "kota", fokus: null })}
          >
            <Building2 size={13} /> Kota ({kotaCount})
          </button>
          <button
            type="button"
            className={`pill-button ${fokus !== "penanda" && kind === "kabupaten" ? "active" : ""}`}
            onClick={() => update({ jenis: "kabupaten", fokus: null })}
          >
            <MapPin size={13} /> Kabupaten ({kabCount})
          </button>
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
                    {year === runningYear
                      ? "Tahun berjalan"
                      : "Periode historis"}
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
                    <p className="table-hint">
                      Geser tabel ke samping untuk melihat penanda.
                    </p>
                  </div>
                  <label className="sort-control">
                    <span className="sr-only">Urutkan daerah</span>
                    <select
                      aria-label="Urutkan daerah"
                      value={sort}
                      onChange={(event) =>
                        update({
                          urut:
                            event.target.value === "nama"
                              ? null
                              : event.target.value,
                        })
                      }
                    >
                      <option value="nama">Nama daerah</option>
                      <option value="realisasi">Realisasi terbesar</option>
                      <option value="penumpukan">
                        Penumpukan akhir tahun tertinggi
                      </option>
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
                        <th>Penanda {latestCompleteYear}</th>
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
                                <span className="mobile-budget-label">Pagu </span>
                                {compactMoney(snapshot.total.budget)}
                              </div>
                              <div
                                className="table-realized"
                                title={fullMoney(snapshot.total.realized)}
                              >
                                <span className="mobile-budget-label">Realisasi </span>
                                {compactMoney(snapshot.total.realized)}
                              </div>
                            </td>
                            <td>
                              <div className="table-rate-wrap">
                                <strong
                                  className={`table-rate ${rate !== null && rate > 100 ? "rate-overflow" : ""}`}
                                >
                                  {percent(rate)}
                                </strong>
                                {rate !== null && rate > 100 && (
                                  <span
                                    className="overflow-tag"
                                    title="Realisasi melampaui pagu tercatat di SIKD (umumnya karena APBD-P belum tersinkronisasi di pusat data)"
                                  >
                                    ⚠ &gt;100%
                                  </span>
                                )}
                              </div>
                              <span className="mini-progress">
                                <span
                                  className={
                                    rate !== null && rate > 100
                                      ? "progress-overflow"
                                      : ""
                                  }
                                  style={{
                                    width: `${Math.min(rate ?? 0, 100)}%`,
                                  }}
                                />
                              </span>
                            </td>
                            <td>
                              {flagFor(region.code).share === null ? (
                                <span className="muted">Belum tersedia</span>
                              ) : (
                                <div className="table-flag-cell">
                                  <div className="table-flag-top">
                                    <strong className="table-flag-share">
                                      {formatFlagShare(
                                        flagFor(region.code).share,
                                      )}
                                    </strong>
                                    <span className="table-flag-rank">
                                      #{rankMap.get(region.code)}/10
                                    </span>
                                  </div>
                                  <div className="table-flag-bottom">
                                    {persistenceMap.get(region.code)?.status ===
                                      "dua-tahun-beruntun" && (
                                      <span
                                        className="persistence-tag recurring"
                                        title={`Lonjakan belanja modal >40% berulang 2 tahun anggaran terakhir (${latestCompleteYear - 1} & ${latestCompleteYear})`}
                                      >
                                        2 Th Beruntun
                                      </span>
                                    )}
                                    {(persistenceMap.get(region.code)
                                      ?.status === "baru-2025" ||
                                      persistenceMap.get(region.code)
                                        ?.status === "baru-tahun-ini") && (
                                      <span
                                        className="persistence-tag new"
                                        title={`Baru melampaui ambang 40% pada tahun ${latestCompleteYear}, tahun sebelumnya di bawah ambang`}
                                      >
                                        Baru {latestCompleteYear}
                                      </span>
                                    )}
                                    {persistenceMap.get(region.code)?.status ===
                                      "konsisten-wajar" && (
                                      <span
                                        className="persistence-tag normal"
                                        title={`Konsisten di bawah ambang 40% pada tahun ${latestCompleteYear - 1} dan ${latestCompleteYear}`}
                                      >
                                        Di Bawah Ambang
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
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

                <div className="chart-highlights-section">
                  <div className="chart-highlights-header">
                    <h4>
                      <TrendingUp size={15} /> Sorotan Data ({visible.length}{" "}
                      Daerah)
                    </h4>
                    <span className="small-label">
                      {periodLabel(year, month)}
                    </span>
                  </div>

                  <div className="highlights-grid">
                    {highestAbsorption && (
                      <Link
                        href={`/daerah/${highestAbsorption.region.code}?${period}`}
                        className="highlight-card"
                      >
                        <span className="highlight-tag green">
                          <CheckCircle2 size={11} /> Serapan Tertinggi
                        </span>
                        <strong>{highestAbsorption.region.shortName}</strong>
                        <span className="highlight-value">
                          {percent(highestAbsorption.rate)}
                        </span>
                        <small>
                          pagu{" "}
                          {compactMoney(
                            highestAbsorption.snapshot.total.budget,
                          )}
                        </small>
                      </Link>
                    )}

                    {lowestAbsorption &&
                      lowestAbsorption.region.code !==
                        highestAbsorption?.region.code && (
                        <Link
                          href={`/daerah/${lowestAbsorption.region.code}?${period}`}
                          className="highlight-card"
                        >
                          <span className="highlight-tag blue">
                            <Info size={11} /> Serapan Terendah
                          </span>
                          <strong>{lowestAbsorption.region.shortName}</strong>
                          <span className="highlight-value">
                            {percent(lowestAbsorption.rate)}
                          </span>
                          <small>
                            pagu{" "}
                            {compactMoney(
                              lowestAbsorption.snapshot.total.budget,
                            )}
                          </small>
                        </Link>
                      )}

                    {highestYearEnd && (
                      <Link
                        href={`/daerah/${highestYearEnd.region.code}?${period}`}
                        className="highlight-card alert"
                      >
                        <span className="highlight-tag amber">
                          <AlertTriangle size={11} /> Lonjakan Nov–Des
                        </span>
                        <strong>{highestYearEnd.region.shortName}</strong>
                        <span className="highlight-value">
                          {formatFlagShare(highestYearEnd.flag.share)}
                        </span>
                        <small>
                          #{rankMap.get(highestYearEnd.region.code)}/10 ·{" "}
                          {persistenceMap.get(highestYearEnd.region.code)
                            ?.label ?? "2 bulan akhir"}
                        </small>
                      </Link>
                    )}
                  </div>

                  <div className="aggregate-composition-box">
                    <div className="aggregate-composition-header">
                      <span>Komposisi Realisasi Kolektif</span>
                      <strong>Total {compactMoney(totalRealized)}</strong>
                    </div>

                    <div
                      className="aggregate-bar"
                      role="img"
                      aria-label="Komposisi realisasi belanja kumulatif seluruh daerah yang ditampilkan"
                    >
                      {aggregateCategories.map((cat) => {
                        const width = Math.max(cat.share ?? 0, 0);
                        return (
                          <div
                            key={cat.code}
                            className={`aggregate-bar-segment ${cat.code}`}
                            style={{ width: `${width}%` }}
                            title={`${cat.label}: ${percent(cat.share)} (${compactMoney(cat.realized)})`}
                          />
                        );
                      })}
                    </div>

                    <div className="aggregate-list">
                      {aggregateCategories.map((cat) => (
                        <div key={cat.code} className="aggregate-row">
                          <div className="aggregate-row-name">
                            <span className={`legend-dot ${cat.code}`} />
                            <span className="legend-label">{cat.label}</span>
                          </div>
                          <div className="aggregate-row-stats">
                            <strong className="aggregate-row-percent">
                              {percent(cat.share)}
                            </strong>
                            <span className="aggregate-row-amount">
                              {compactMoney(cat.realized)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {topFlaggedRegions.length > 0 && (
                    <div className="dss-priority-box">
                      <div className="dss-priority-header">
                        <div className="dss-priority-title">
                          <Sparkles size={14} className="dss-icon" />
                          <h5>Prioritas Telaah Pengawasan Warga</h5>
                        </div>
                        <span className="dss-badge">DSS Rekomendasi</span>
                      </div>
                      <p className="dss-priority-desc">
                        Daerah dengan konsentrasi pencairan modal fisik di akhir tahun (&gt;40%) berturut-turut yang paling mendesak untuk ditelaah:
                      </p>
                      <div className="dss-priority-list">
                        {topFlaggedRegions.map((item, idx) => (
                          <Link
                            key={item.region.code}
                            href={`/daerah/${item.region.code}?${period}#pertanyaan`}
                            className="dss-priority-item"
                          >
                            <span className="dss-priority-num">{idx + 1}</span>
                            <div className="dss-priority-info">
                              <div className="dss-priority-name-row">
                                <strong>{item.region.name}</strong>
                                <span className="dss-priority-share">
                                  {formatFlagShare(item.flag.share)} modal akhir TA
                                </span>
                              </div>
                              <div className="dss-priority-meta">
                                <span className="persistence-tag recurring small">
                                  {item.persistence?.label ?? "2 Th Beruntun"}
                                </span>
                                <span className="dss-action-text">
                                  Buka Pertanyaan Publik <ArrowRight size={11} />
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <SourceNote snapshot={visible[0]} />
          </>
        ) : (
          <EmptyState title="Daerah tidak ditemukan">
            Coba cari {regionListLabel}, atau ubah filter jenis daerah.
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
        Cakupan versi awal: {regionListLabel}. Data diperiksa{" "}
        {dateLabel(dataset.generatedAt)}. Pembaruan mengikuti publikasi sumber.
      </p>
    </>
  );
}
