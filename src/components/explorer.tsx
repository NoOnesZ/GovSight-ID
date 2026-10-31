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
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileText,
  Info,
  Landmark,
  MapPin,
  Search,
  Target,
  TriangleAlert,
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
import { ChartLegend, SpendingChart, chartColors } from "./charts";
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
  kindLabel,
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
      pegawai: "Belanja pegawai",
      "barang-jasa": "Barang & jasa",
      modal: "Belanja modal",
      lainnya: "Belanja lainnya",
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

  // Daerah dengan serapan tertinggi & terendah di antara yang tampil
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

  // Penumpukan akhir tahun tertinggi di antara yang tampil
  const highestYearEnd = [...visible]
    .map((s) => {
      const flag = flagFor(s.regionCode);
      const region = regions.find((r) => r.code === s.regionCode)!;
      return { region, flag };
    })
    .filter((item) => item.flag.share !== null)
    .sort((a, b) => (b.flag.share ?? 0) - (a.flag.share ?? 0))[0];

  // Prioritas telaah warga (DSS)
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

  function persistenceChip(code: string) {
    const status = persistenceMap.get(code)?.status;
    if (status === "dua-tahun-beruntun")
      return (
        <span
          className="chip chip--warn chip--square"
          title={`Lonjakan belanja modal >40% berulang pada ${latestCompleteYear - 1} dan ${latestCompleteYear}`}
        >
          2 tahun beruntun
        </span>
      );
    if (status === "baru-2025" || status === "baru-tahun-ini")
      return (
        <span
          className="chip chip--info chip--square"
          title={`Baru melampaui ambang 40% pada ${latestCompleteYear}`}
        >
          Baru {latestCompleteYear}
        </span>
      );
    if (status === "konsisten-wajar")
      return (
        <span
          className="chip chip--ok chip--square"
          title={`Di bawah ambang 40% pada ${latestCompleteYear - 1} dan ${latestCompleteYear}`}
        >
          Di bawah ambang
        </span>
      );
    return null;
  }

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">
            <MapPin size={13} /> Sumatera Utara · {regions.length} pemda
          </p>
          <h1>Pemda mana yang perlu ditanya soal belanjanya?</h1>
          <p className="hero__lead">
            Kami membaca data APBD resmi, lalu menandai pola belanja yang patut
            ditanyakan — dengan rumus yang terbuka dan sumber yang bisa kamu
            unduh.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#jelajah">
              Mulai jelajahi <ArrowDown size={15} />
            </a>
            <Link className="btn btn--secondary" href="/metodologi">
              <CircleHelp size={15} /> Cara membaca data
            </Link>
          </div>
          <p className="hero__trust">
            <span>
              <Check size={14} /> Sumber resmi DJPK
            </span>
            <span>
              <Check size={14} /> Metode terbuka
            </span>
            <span>
              <Check size={14} /> Tanpa akun
            </span>
          </p>
        </div>
        {featured && featuredRegion && (
          <div className="hero__panel">
            <div className="spotlight">
              <div className="spotlight__head">
                <div>
                  <strong>{featuredRegion.name}</strong>
                  <span>Realisasi belanja TA {year}</span>
                </div>
                <Link
                  className="icon-link"
                  href={`/daerah/${featuredRegion.code}?${period}`}
                  aria-label={`Lihat profil ${featuredRegion.name}`}
                >
                  <ArrowUpRight size={17} />
                </Link>
              </div>
              <div className="spotlight__body">
                <div className="spotlight__amount">
                  <span className="eyebrow">Sudah dibelanjakan</span>
                  <strong title={fullMoney(featured.total.realized)}>
                    {compactMoney(featured.total.realized)}
                  </strong>
                  <p>
                    dari pagu {compactMoney(featured.total.budget)} ·{" "}
                    {periodLabel(year, month)}
                  </p>
                </div>
                <div className="gauge">
                  <svg viewBox="0 0 108 108" aria-hidden="true">
                    <circle
                      cx="54"
                      cy="54"
                      r="47"
                      fill="none"
                      stroke="#eceae6"
                      strokeWidth="7"
                    />
                    <circle
                      cx="54"
                      cy="54"
                      r="47"
                      fill="none"
                      stroke={chartColors.realized}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(rate ?? 0, 100) * 2.953} 295.3`}
                      transform="rotate(-90 54 54)"
                    />
                  </svg>
                  <span className="gauge__value">
                    <strong>{percent(rate)}</strong>
                    <small>terserap</small>
                  </span>
                </div>
              </div>
              <div className="spotlight__foot">
                <span className="eyebrow">Komposisi realisasi</span>
                <Composition snapshot={featured} showAmounts={false} />
              </div>
            </div>
            <p className="spotlight__note">
              <Check size={13} /> Setiap angka punya berkas sumber yang bisa
              kamu buka.
            </p>
          </div>
        )}
      </section>

      <section id="jelajah">
        <SectionHeading
          title="Jelajahi belanja daerah"
          subtitle="Mulai dari daerahmu, lalu baca gambaran yang lebih utuh."
        >
          <ShareButton />
          <DownloadButton
            codes={visible.map((row) => row.regionCode)}
            year={year}
            month={month}
          />
        </SectionHeading>

        <div className="toolbar">
          <label className="field field--search">
            <Search size={17} />
            <span className="sr-only">Cari daerah</span>
            <input
              aria-label="Cari daerah"
              value={query}
              onChange={(event) => update({ q: event.target.value })}
              placeholder="Cari kota atau kabupaten…"
            />
          </label>
          <div className="toolbar__group toolbar__group--end">
            <PeriodControls year={year} month={month} onChange={update} />
          </div>
        </div>

        <div className="filter-strip">
          <div
            className="segmented"
            role="group"
            aria-label="Filter cepat daerah"
          >
            <button
              type="button"
              className={`segmented__item ${fokus === "semua" && kind === "semua" ? "is-active" : ""}`}
              onClick={() => update({ jenis: null, fokus: null })}
            >
              Semua <span className="count">{snapshots.length}</span>
            </button>
            <button
              type="button"
              className={`segmented__item ${fokus !== "penanda" && kind === "kota" ? "is-active" : ""}`}
              onClick={() => update({ jenis: "kota", fokus: null })}
            >
              <Building2 size={13} /> Kota{" "}
              <span className="count">{kotaCount}</span>
            </button>
            <button
              type="button"
              className={`segmented__item ${fokus !== "penanda" && kind === "kabupaten" ? "is-active" : ""}`}
              onClick={() => update({ jenis: "kabupaten", fokus: null })}
            >
              <Landmark size={13} /> Kabupaten{" "}
              <span className="count">{kabCount}</span>
            </button>
            <button
              type="button"
              className={`segmented__item ${fokus === "penanda" ? "is-active is-warn" : ""}`}
              onClick={() =>
                update({ fokus: fokus === "penanda" ? null : "penanda" })
              }
            >
              <TriangleAlert size={13} /> Ditandai{" "}
              <span className="count">{flaggedCount}</span>
            </button>
          </div>
          <label className="field">
            <span className="sr-only">Urutkan daerah</span>
            <select
              aria-label="Urutkan daerah"
              value={sort}
              onChange={(event) =>
                update({
                  urut:
                    event.target.value === "nama" ? null : event.target.value,
                })
              }
            >
              <option value="nama">Urut: nama daerah</option>
              <option value="realisasi">Urut: realisasi terbesar</option>
              <option value="penumpukan">Urut: penumpukan akhir tahun</option>
            </select>
            <ChevronDown size={14} className="field__caret" />
          </label>
        </div>

        {visible.length ? (
          <div className="stack" style={{ marginTop: "var(--gap)" }}>
            <div className="summary">
              <div className="summary__item">
                <span className="summary__label">
                  <Building2 size={14} /> Daerah ditampilkan
                </span>
                <span className="summary__value">
                  {visible.length}
                  <small> dari {snapshots.length}</small>
                </span>
              </div>
              <div className="summary__item">
                <span className="summary__label">
                  <Wallet size={14} /> Total pagu belanja
                </span>
                <span className="summary__value" title={fullMoney(totalBudget)}>
                  {compactMoney(totalBudget)}
                </span>
              </div>
              <div className="summary__item summary__item--accent">
                <span className="summary__label">
                  <BarChart3 size={14} /> Total realisasi
                </span>
                <span
                  className="summary__value"
                  title={fullMoney(totalRealized)}
                >
                  {compactMoney(totalRealized)}
                </span>
              </div>
              <div className="summary__item">
                <span className="summary__label">
                  <CalendarRange size={14} /> Periode laporan
                </span>
                <span className="summary__value summary__value--sm">
                  {periodLabel(year, month)}
                  <small>
                    {" "}
                    · {year === runningYear ? "tahun berjalan" : "historis"}
                  </small>
                </span>
              </div>
            </div>

            <div className="split">
              <div className="card regions">
                <div className="card__head">
                  <div>
                    <h3 className="card__title">
                      Daerah pilihanmu{" "}
                      <span className="count">{visible.length}</span>
                    </h3>
                    <p className="card__sub">
                      Pagu, realisasi, dan penanda akhir tahun{" "}
                      {latestCompleteYear}.
                    </p>
                  </div>
                </div>

                <div className="table-wrap">
                  <table className="region-table">
                    <thead>
                      <tr>
                        <th>Daerah</th>
                        <th className="is-num">Pagu / realisasi</th>
                        <th className="is-num">Serapan</th>
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
                        const rowRate = percentage(
                          snapshot.total.realized,
                          snapshot.total.budget,
                        );
                        const over = rowRate !== null && rowRate > 100;
                        return (
                          <tr key={region.code}>
                            <td>
                              <Link
                                className="region-cell"
                                href={`/daerah/${region.code}?${period}`}
                              >
                                <span className="region-cell__name">
                                  {region.shortName}
                                </span>
                                <span className="region-cell__kind">
                                  {kindLabel(region.type)}
                                </span>
                              </Link>
                            </td>
                            <td className="is-num">
                              <span className="money-pair">
                                <strong
                                  title={fullMoney(snapshot.total.realized)}
                                >
                                  {compactMoney(snapshot.total.realized)}
                                </strong>
                                <span title={fullMoney(snapshot.total.budget)}>
                                  pagu {compactMoney(snapshot.total.budget)}
                                </span>
                              </span>
                            </td>
                            <td className="is-num">
                              <span className="rate-cell">
                                <span className="rate-cell__top">
                                  <strong className={over ? "is-over" : ""}>
                                    {percent(rowRate)}
                                  </strong>
                                  {over && (
                                    <span
                                      className="chip chip--warn chip--square"
                                      title="Realisasi melampaui pagu tercatat di SIKD (umumnya karena APBD-P belum tersinkronisasi di pusat data)"
                                    >
                                      &gt;100%
                                    </span>
                                  )}
                                </span>
                                <span className="meter meter--thin">
                                  <span
                                    className={over ? "is-over" : ""}
                                    style={{
                                      width: `${Math.min(rowRate ?? 0, 100)}%`,
                                    }}
                                  />
                                </span>
                              </span>
                            </td>
                            <td>
                              {flagFor(region.code).share === null ? (
                                <span className="muted">Belum tersedia</span>
                              ) : (
                                <span className="flag-cell">
                                  <span className="flag-cell__top">
                                    <span className="flag-cell__share">
                                      {formatFlagShare(
                                        flagFor(region.code).share,
                                      )}
                                    </span>
                                    <span className="flag-cell__rank">
                                      #{rankMap.get(region.code)} dari{" "}
                                      {regions.length}
                                    </span>
                                  </span>
                                  {persistenceChip(region.code)}
                                </span>
                              )}
                            </td>
                            <td>
                              <Link
                                className="icon-link"
                                href={`/daerah/${region.code}?${period}`}
                                aria-label={`Lihat profil ${region.name}`}
                              >
                                <ArrowUpRight size={16} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="region-cards">
                  {visible.map((snapshot) => {
                    const region = regions.find(
                      (item) => item.code === snapshot.regionCode,
                    )!;
                    const rowRate = percentage(
                      snapshot.total.realized,
                      snapshot.total.budget,
                    );
                    const over = rowRate !== null && rowRate > 100;
                    const flag = flagFor(region.code);
                    return (
                      <Link
                        key={region.code}
                        className="region-card"
                        href={`/daerah/${region.code}?${period}`}
                      >
                        <span className="region-card__top">
                          <span>
                            <span className="region-cell__name">
                              {region.shortName}
                            </span>
                            <span className="region-cell__kind">
                              {kindLabel(region.type)}
                            </span>
                          </span>
                          <ArrowUpRight size={16} />
                        </span>
                        <span className="region-card__grid">
                          <span className="region-card__item">
                            <span>Realisasi</span>
                            <strong>
                              {compactMoney(snapshot.total.realized)}
                            </strong>
                          </span>
                          <span className="region-card__item">
                            <span>Pagu</span>
                            <strong>
                              {compactMoney(snapshot.total.budget)}
                            </strong>
                          </span>
                          <span className="region-card__item">
                            <span>Serapan</span>
                            <strong className={over ? "is-over" : ""}>
                              {percent(rowRate)}
                            </strong>
                          </span>
                          <span className="region-card__item">
                            <span>Penanda {latestCompleteYear}</span>
                            <strong>{formatFlagShare(flag.share)}</strong>
                          </span>
                        </span>
                        <span className="region-card__flags">
                          {over && (
                            <span className="chip chip--warn chip--square">
                              Realisasi &gt;100% pagu
                            </span>
                          )}
                          {persistenceChip(region.code)}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div className="card__foot">
                  <InfoNote>
                    Serapan menunjukkan bagian pagu yang sudah dibelanjakan,
                    bukan penilaian mutu layanan.
                  </InfoNote>
                </div>
              </div>

              <div className="stack">
                <div className="card">
                  <div className="card__head">
                    <div>
                      <h3 className="card__title">
                        <Target size={16} /> Sorotan data
                      </h3>
                      <p className="card__sub">
                        {visible.length} daerah · {periodLabel(year, month)}
                      </p>
                    </div>
                  </div>
                  <div className="card__body">
                    <div className="highlights">
                      {highestAbsorption && (
                        <Link
                          href={`/daerah/${highestAbsorption.region.code}?${period}`}
                          className="highlight"
                        >
                          <span className="chip chip--ok chip--square">
                            <CheckCircle2 size={11} /> Serapan tertinggi
                          </span>
                          <strong>{highestAbsorption.region.shortName}</strong>
                          <span className="highlight__value">
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
                            className="highlight"
                          >
                            <span className="chip chip--info chip--square">
                              <Info size={11} /> Serapan terendah
                            </span>
                            <strong>{lowestAbsorption.region.shortName}</strong>
                            <span className="highlight__value">
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
                          className="highlight"
                        >
                          <span className="chip chip--warn chip--square">
                            <TriangleAlert size={11} /> Lonjakan Nov–Des
                          </span>
                          <strong>{highestYearEnd.region.shortName}</strong>
                          <span className="highlight__value">
                            {formatFlagShare(highestYearEnd.flag.share)}
                          </span>
                          <small>
                            #{rankMap.get(highestYearEnd.region.code)} dari{" "}
                            {regions.length} ·{" "}
                            {persistenceMap.get(highestYearEnd.region.code)
                              ?.label ?? "2 bulan akhir"}
                          </small>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card__head">
                    <div>
                      <h3 className="card__title">Komposisi kolektif</h3>
                      <p className="card__sub">
                        Porsi dari total realisasi {compactMoney(totalRealized)}
                      </p>
                    </div>
                  </div>
                  <div className="card__body">
                    <div
                      className="stack-bar"
                      role="img"
                      aria-label="Komposisi realisasi belanja kumulatif seluruh daerah yang ditampilkan"
                    >
                      {aggregateCategories.map((cat) => (
                        <span
                          key={cat.code}
                          className={`seg--${cat.code}`}
                          style={{ width: `${Math.max(cat.share ?? 0, 0)}%` }}
                          title={`${cat.label}: ${percent(cat.share)} (${compactMoney(cat.realized)})`}
                        />
                      ))}
                    </div>
                    <div className="legend">
                      {aggregateCategories.map((cat) => (
                        <div key={cat.code} className="legend__row">
                          <span className={`dot dot--${cat.code}`} />
                          <span className="legend__name">{cat.label}</span>
                          <span className="legend__value">
                            <strong>{percent(cat.share)}</strong>
                            <small title={fullMoney(cat.realized)}>
                              {compactMoney(cat.realized)}
                            </small>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {topFlaggedRegions.length > 0 && (
                  <div className="card">
                    <div className="card__head">
                      <div>
                        <h3 className="card__title">Prioritas telaah warga</h3>
                        <p className="card__sub">
                          Konsentrasi pencairan modal fisik di akhir tahun di
                          atas ambang 40%.
                        </p>
                      </div>
                      <span className="chip chip--warn">DSS</span>
                    </div>
                    <div className="card__body">
                      <div className="priority">
                        {topFlaggedRegions.map((item, idx) => (
                          <Link
                            key={item.region.code}
                            href={`/daerah/${item.region.code}?${period}#lembar-advokasi`}
                            className="priority__item"
                          >
                            <span className="priority__rank">{idx + 1}</span>
                            <span className="priority__body">
                              <span className="priority__name">
                                <strong>{item.region.name}</strong>
                                <span className="priority__share">
                                  {formatFlagShare(item.flag.share)} modal akhir
                                  TA
                                </span>
                              </span>
                              <span className="priority__meta">
                                <span className="chip chip--warn chip--square">
                                  {item.persistence?.label ??
                                    "2 tahun beruntun"}
                                </span>
                                <span className="priority__cta">
                                  Buka pertanyaan publik{" "}
                                  <ArrowRight size={11} />
                                </span>
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card__head">
                <div>
                  <h3 className="card__title">Rencana dan realisasi</h3>
                  <p className="card__sub">
                    Nilai nominal dalam triliun rupiah. Perhatikan perbedaan
                    skala anggaran antardaerah.
                  </p>
                </div>
              </div>
              <div className="card__body">
                <SpendingChart snapshots={visible} />
                <ChartLegend
                  items={[
                    { label: "Pagu belanja", color: chartColors.budget },
                    { label: "Realisasi", color: chartColors.realized },
                  ]}
                />
              </div>
            </div>

            <SourceNote snapshot={visible[0]} />
          </div>
        ) : (
          <EmptyState title="Daerah tidak ditemukan">
            Coba cari {regionListLabel}, atau ubah filter jenis daerah.
          </EmptyState>
        )}
      </section>

      <section className="next-cards">
        <Link
          href={`/bandingkan?tahun=${year}&bulan=${month}`}
          className="next-card"
        >
          <span className="next-card__mark">
            <BarChart3 size={20} />
          </span>
          <div>
            <h3>Beda daerah, bagaimana belanjanya?</h3>
            <p>Bandingkan angka pada periode yang sama.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link href="/metodologi" className="next-card">
          <span className="next-card__mark">
            <FileText size={20} />
          </span>
          <div>
            <h3>Datanya dari mana?</h3>
            <p>Buka sumber dan pahami cara menghitungnya.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
      </section>

      <p className="footnote">
        Cakupan versi awal: {regionListLabel}. Data diperiksa{" "}
        {dateLabel(dataset.generatedAt)}. Pembaruan mengikuti publikasi sumber.
      </p>
    </>
  );
}
