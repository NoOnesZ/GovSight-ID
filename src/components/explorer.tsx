"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Filter,
  Globe,
  Landmark,
  Layers,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import type { Dataset, Snapshot } from "@/lib/types";
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
  RegionalSumateraMatrix,
  NationalRoadmapView,
} from "./scalability-views";
import {
  CivicSummaryShareButton,
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

function LazySpendingChart({
  snapshots,
  isScrollViewport,
}: {
  snapshots: Snapshot[];
  isScrollViewport: boolean;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return;
    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div
      ref={containerRef}
      className={isScrollViewport ? "chart-scroll-viewport" : undefined}
      style={{ minHeight: "260px" }}
    >
      {shouldRender ? (
        <SpendingChart snapshots={snapshots} />
      ) : (
        <div
          style={{
            height: "260px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: "var(--canvas)",
            borderRadius: "var(--r)",
            border: "1px dashed var(--line)",
            color: "var(--ink-3)",
            fontSize: "0.8125rem",
          }}
        >
          <BarChart3 size={22} style={{ opacity: 0.4 }} />
          <span>Grafik dimuat saat mendekati area pandang…</span>
        </div>
      )}
    </div>
  );
}

export function Explorer({ dataset }: { dataset: Dataset }) {
  const [urgencyExpanded, setUrgencyExpanded] = useState(true);
  const [chartDisplayMode, setChartDisplayMode] = useState<
    "top10" | "bottom10" | "all"
  >("top10");
  const { year, month, params, update, period, invalidPeriod } = useFilters();
  const query = params.get("q") ?? "";
  const kind = params.get("jenis") ?? "semua";
  const fokus = params.get("fokus") ?? "semua";
  const zona = params.get("zona") ?? "semua";
  const rawTier = params.get("tier");
  const tier = rawTier === "2" || rawTier === "3" ? rawTier : "1";
  const rawSort = params.get("urut");
  const sort =
    rawSort === "realisasi" || rawSort === "penumpukan" ? rawSort : "nama";
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | "all">(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, kind, fokus, zona, sort]);
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
  const prioritasCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.statusAudit === "audit-penuh";
  }).length;
  const kotaCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.type === "kota";
  }).length;
  const kabCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.type === "kabupaten";
  }).length;

  const mebidangroCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.zones?.includes("mebidangro");
  }).length;
  const tapanuliCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.zones?.includes("tapanuli");
  }).length;
  const pantaiTimurCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.zones?.includes("pantai-timur");
  }).length;
  const dataranTinggiCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.zones?.includes("dataran-tinggi");
  }).length;
  const niasCount = snapshots.filter((s) => {
    const r = regions.find((item) => item.code === s.regionCode);
    return r?.zones?.includes("nias");
  }).length;

  const visible = snapshots
    .filter((row) => {
      const region = regions.find((region) => region.code === row.regionCode)!;
      const matchesQuery =
        region.name.toLowerCase().includes(query.toLowerCase()) ||
        region.shortName.toLowerCase().includes(query.toLowerCase());
      const matchesKind =
        kind === "semua"
          ? true
          : kind === "prioritas"
            ? region.statusAudit === "audit-penuh"
            : region.type === kind;
      const matchesZona =
        zona === "semua" ||
        (region.zones && region.zones.includes(zona as any));
      const matchesFokus =
        fokus === "penanda"
          ? flagFor(row.regionCode).status === "ditandai"
          : true;
      return matchesQuery && matchesKind && matchesZona && matchesFokus;
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

  const effectivePageSize = pageSize === "all" ? visible.length : pageSize;
  const totalPages = Math.max(
    1,
    Math.ceil(
      visible.length /
        (typeof pageSize === "number" ? pageSize : visible.length || 1),
    ),
  );
  const paginatedVisible = useMemo(() => {
    if (pageSize === "all") return visible;
    const start = (currentPage - 1) * pageSize;
    return visible.slice(start, start + pageSize);
  }, [visible, currentPage, pageSize]);

  const startDisplay =
    visible.length === 0
      ? 0
      : pageSize === "all"
        ? 1
        : (currentPage - 1) * pageSize + 1;
  const endDisplay =
    pageSize === "all"
      ? visible.length
      : Math.min(currentPage * pageSize, visible.length);

  // Metrik kolektif seluruh daerah terpantau pada periode aktif
  const totalCollectiveBudget = sumAmounts(
    snapshots.map((s) => s.total.budget),
  );
  const totalCollectiveRealized = sumAmounts(
    snapshots.map((s) => s.total.realized),
  );
  const collectiveAbsorptionRate = percentage(
    totalCollectiveRealized,
    totalCollectiveBudget,
  );

  // Daerah dengan lonjakan belanja modal akhir tahun tertinggi di antara seluruh daerah terpantau
  const highestYearEndCollective = [...snapshots]
    .map((s) => {
      const flag = flagFor(s.regionCode);
      const region = regions.find((r) => r.code === s.regionCode)!;
      return { region, flag };
    })
    .filter((item) => item.flag.share !== null)
    .sort((a, b) => (b.flag.share ?? 0) - (a.flag.share ?? 0))[0];

  // Komposisi realisasi belanja kolektif untuk seluruh daerah terpantau
  const collectiveCategories = [
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
      snapshots.map(
        (s) => s.categories.find((c) => c.code === code)?.budget ?? null,
      ),
    );
    const sumRealized = sumAmounts(
      snapshots.map(
        (s) => s.categories.find((c) => c.code === code)?.realized ?? null,
      ),
    );
    const shareOfRealized = percentage(sumRealized, totalCollectiveRealized);
    return {
      code,
      label: labelMap[code],
      budget: sumBudget,
      realized: sumRealized,
      share: shareOfRealized,
    };
  });

  // Metrik untuk daerah yang sedang ditampilkan (sesuai filter)
  const totalBudget = sumAmounts(visible.map((row) => row.total.budget));
  const totalRealized = sumAmounts(visible.map((row) => row.total.realized));

  // Komposisi realisasi per kategori untuk daerah yang sedang ditampilkan
  const visibleCategories = ["pegawai", "barang-jasa", "modal", "lainnya"].map(
    (code) => {
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
    },
  );

  // Data daerah untuk grafik perbandingan pagu & realisasi (dengan pilihan densitas 10 Terbesar / 10 Terkecil / Semua)
  const displayedSpending = useMemo(() => {
    if (visible.length <= 10) return visible;
    if (chartDisplayMode === "top10") {
      return [...visible]
        .sort(
          (a, b) => Number(b.total.budget ?? 0) - Number(a.total.budget ?? 0),
        )
        .slice(0, 10);
    }
    if (chartDisplayMode === "bottom10") {
      return [...visible]
        .sort(
          (a, b) => Number(a.total.budget ?? 0) - Number(b.total.budget ?? 0),
        )
        .slice(0, 10);
    }
    return visible;
  }, [visible, chartDisplayMode]);

  // Prioritas Pengawasan Publik (Fokus Telaah Kritis)
  const topFlaggedRegions = visible
    .map((s) => ({
      region: regions.find((r) => r.code === s.regionCode)!,
      flag: flagFor(s.regionCode),
      persistence: persistenceMap.get(s.regionCode),
    }))
    .filter(
      (item) => item.flag.status === "ditandai" && item.flag.share !== null,
    )
    .sort((a, b) => (b.flag.share ?? 0) - (a.flag.share ?? 0));

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
          <h1>Pemda mana yang perlu ditanya soal belanjanya?</h1>
          <p className="hero__lead">
            Pantau alokasi dan realisasi Rp63,2 Triliun APBD 33 kabupaten/kota
            se-Sumatera Utara. Kami membaca data APBD resmi, lalu menandai pola
            belanja yang patut ditanyakan — dengan rumus yang terbuka dan berkas
            asli yang bisa kamu unduh.
          </p>
          <p className="hero__byline">
            Inisiatif Independen Pengawasan Anggaran Publik Sumatera Utara ·
            Berbasis Data Terbuka Resmi SIKD Kemenkeu RI dengan Verifikasi SHA-256
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#jelajah">
              Mulai jelajahi 33 Daerah <ArrowDown size={15} />
            </a>
            <Link className="btn btn--secondary" href="/metodologi">
              <CircleHelp size={15} /> Cara membaca data
            </Link>
          </div>
        </div>

        <div className="hero__panel">
          <div className="spotlight">
            <div className="spotlight__head">
              <div>
                <strong>Denyut Fiskal Sumatera Utara</strong>
                <span>
                  {regions.length} Pemda Terpantau · {periodLabel(year, month)}
                </span>
              </div>
              <span className="chip chip--ok chip--square">
                Konsolidasi Resmi SIKD
              </span>
            </div>

            <div
              className="spotlight__body"
              style={{
                flexDirection: "column",
                alignItems: "stretch",
                gap: "16px",
                padding: "18px 18px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--ink-3)",
                      display: "block",
                    }}
                  >
                    Total Realisasi Kolektif
                  </span>
                  <strong
                    style={{
                      fontSize: "1.45rem",
                      fontWeight: 700,
                      letterSpacing: "-0.025em",
                      fontVariantNumeric: "tabular-nums lining-nums",
                      display: "block",
                      margin: "4px 0 2px",
                      lineHeight: 1.15,
                    }}
                    title={fullMoney(totalCollectiveRealized)}
                  >
                    {compactMoney(totalCollectiveRealized)}
                  </strong>
                  <span
                    style={{ fontSize: "0.8125rem", color: "var(--ink-3)" }}
                  >
                    dari pagu {compactMoney(totalCollectiveBudget)}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--ink-3)",
                      display: "block",
                    }}
                  >
                    Rata-rata Penyerapan
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "6px",
                      margin: "4px 0 6px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "1.45rem",
                        fontWeight: 700,
                        letterSpacing: "-0.025em",
                        fontVariantNumeric: "tabular-nums lining-nums",
                        lineHeight: 1.15,
                      }}
                    >
                      {percent(collectiveAbsorptionRate)}
                    </strong>
                    <span
                      style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}
                    >
                      terserap
                    </span>
                  </div>
                  <div className="meter meter--thin">
                    <span
                      style={{
                        width: `${Math.min(collectiveAbsorptionRate ?? 0, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {highestYearEndCollective && (
                <div
                  style={{
                    padding: "10px 12px",
                    background: "var(--canvas)",
                    borderRadius: "var(--r)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--ink-3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <TriangleAlert
                        size={12}
                        style={{ color: "var(--warn-ink)" }}
                      />
                      Sorotan Penanda Kritis ({latestCompleteYear})
                    </span>
                    <strong
                      style={{
                        fontSize: "0.875rem",
                        display: "block",
                        marginTop: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {highestYearEndCollective.region.name} ·{" "}
                      {formatFlagShare(highestYearEndCollective.flag.share)}{" "}
                      modal akhir TA
                    </strong>
                  </div>
                  <Link
                    className="icon-link"
                    href={`/daerah/${highestYearEndCollective.region.code}?${period}#lembar-advokasi`}
                    aria-label={`Buka telaah kritis ${highestYearEndCollective.region.name}`}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            <div className="spotlight__foot">
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Komposisi Realisasi Belanja Kolektif
              </span>
              <div
                className="stack-bar"
                role="img"
                aria-label="Komposisi realisasi belanja kolektif"
                style={{ marginBottom: "8px" }}
              >
                {collectiveCategories.map((cat) => (
                  <span
                    key={cat.code}
                    className={`seg--${cat.code}`}
                    style={{ width: `${Math.max(cat.share ?? 0, 0)}%` }}
                    title={`${cat.label}: ${percent(cat.share)} (${compactMoney(cat.realized)})`}
                  />
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px 14px",
                  fontSize: "0.75rem",
                  color: "var(--ink-2)",
                }}
              >
                {collectiveCategories.map((cat) => (
                  <span
                    key={cat.code}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span className={`dot dot--${cat.code}`} />
                    <span>{cat.label}</span>
                    <strong
                      style={{ fontVariantNumeric: "tabular-nums lining-nums" }}
                    >
                      {percent(cat.share)}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Komponen Visual Urgensi & Latar Belakang Publik */}
      <section
        className="urgency-panel"
        aria-labelledby="urgensi-pengawasan-heading"
      >
        <div className="urgency-panel__head">
          <div className="urgency-panel__titles">
            <h2
              id="urgensi-pengawasan-heading"
              className="urgency-panel__title"
            >
              Mengapa Pengawasan Belanja Daerah Mendesak?
            </h2>
            <p className="urgency-panel__lead">
              Anggaran pendapatan dan belanja daerah (APBD) adalah mandat
              pelayanan publik dari keringat warga. Tanpa transparansi dan
              partisipasi aktif, alokasi raksasa ini rentan bocor, salah arah,
              atau dipaksakan di pengujung tahun anggaran.
            </p>
          </div>
          <div className="urgency-panel__actions">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setUrgencyExpanded((prev) => !prev)}
              aria-expanded={urgencyExpanded}
              aria-controls="urgensi-pillars-grid"
            >
              <span>
                {urgencyExpanded ? "Ringkas tampilan" : "Buka 3 pilar urgensi"}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transform: urgencyExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </button>
          </div>
        </div>

        {urgencyExpanded ? (
          <div
            id="urgensi-pillars-grid"
            className="urgency-grid"
            role="region"
            aria-label="Tiga Pilar Urgensi Pengawasan Belanja Daerah"
          >
            {/* Pilar 1: Skala Anggaran Raksasa */}
            <div className="urgency-card">
              <div className="urgency-card__top">
                <span className="chip chip--square chip--sunk">Pilar 1</span>
                <span className="urgency-card__icon" aria-hidden="true">
                  <Wallet size={16} />
                </span>
              </div>
              <div className="urgency-card__metric">
                &gt;Rp 70 Triliun
                <span className="urgency-card__metric-sub">/tahun</span>
              </div>
              <h3 className="urgency-card__title">Skala Anggaran Raksasa</h3>
              <p className="urgency-card__text">
                Akumulasi pagu 33 daerah pantauan di Sumut melampaui Rp 70
                Triliun/tahun. Tanpa pengawasan publik yang aktif, alokasi
                raksasa ini rentan tidak tepat sasaran.
              </p>
              <div className="urgency-card__foot">
                <span className="dot dot--budget" />
                <span>Konsolidasi 33 APBD daerah se-Sumut</span>
              </div>
            </div>

            {/* Pilar 2: Pola Anomali Akhir Tahun */}
            <div className="urgency-card">
              <div className="urgency-card__top">
                <span className="chip chip--square chip--warn">Pilar 2</span>
                <span
                  className="urgency-card__icon urgency-card__icon--warn"
                  aria-hidden="true"
                >
                  <CalendarRange size={16} />
                </span>
              </div>
              <div className="urgency-card__metric urgency-card__metric--warn">
                &gt;30% di Nov–Des
                <span className="urgency-card__metric-sub">
                  lonjakan belanja modal
                </span>
              </div>
              <h3 className="urgency-card__title">Pola Anomali Akhir Tahun</h3>
              <p className="urgency-card__text">
                Tren realisasi belanja modal fisik kerap melonjak drastis pada
                November–Desember (&gt;30% dari total realisasi setahun), memicu
                risiko proyek kejar tayang dan penurunan kualitas fisik
                infrastruktur.
              </p>
              <div className="urgency-card__foot">
                <span className="dot dot--modal" />
                <span>Risiko kejar tayang & penurunan kualitas fisik</span>
              </div>
            </div>

            {/* Pilar 3: Menegakkan Amanat UU HKPD No. 1/2022 */}
            <div className="urgency-card">
              <div className="urgency-card__top">
                <span className="chip chip--square chip--ok">Pilar 3</span>
                <span
                  className="urgency-card__icon urgency-card__icon--ok"
                  aria-hidden="true"
                >
                  <Scale size={16} />
                </span>
              </div>
              <div className="urgency-card__metric urgency-card__metric--ok">
                Modal ≥40% · Pegawai ≤30%
              </div>
              <h3 className="urgency-card__title">
                Menegakkan Amanat UU HKPD No. 1/2022
              </h3>
              <p className="urgency-card__text">
                Regulasi nasional mewajibkan belanja modal infrastruktur minimal
                40% dan membatasi belanja pegawai maksimal 30%. GovSight ID
                mengaudit kepatuhan ini secara objektif.
              </p>
              <div className="urgency-card__foot">
                <span className="dot dot--pegawai" />
                <span>Mandat nasional Pasal 146 & 147 UU HKPD</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="urgency-collapsed-bar">
            <div className="urgency-collapsed-bar__summary">
              <span className="chip chip--square chip--warn">
                3 Fakta Kritis:
              </span>
              <span className="urgency-collapsed-bar__text">
                Pagu agregat &gt;Rp 70T/tahun se-Sumut · Lonjakan modal akhir
                tahun &gt;30% · Audit mandat UU HKPD No. 1/2022 (Infrastruktur
                40% & Pegawai 30%)
              </span>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setUrgencyExpanded(true)}
            >
              Buka 3 pilar urgensi →
            </button>
          </div>
        )}
      </section>

      {/* Scope Switcher: Cakupan Wilayah Multi-Tier */}
      <section
        id="cakupan-wilayah"
        className="scope-switcher"
        aria-label="Pemilih Cakupan Wilayah Multi-Tier"
      >
        <div className="scope-switcher__head">
          <div className="scope-switcher__title-row">
            <h2 className="scope-switcher__heading">
              <Layers size={15} /> Cakupan Pengawasan Wilayah
            </h2>
            <span className="scope-switcher__hint">
              Pilih tingkatan cakupan wilayah pengawasan APBD:
            </span>
          </div>
        </div>

        <div className="scope-switcher__grid" role="tablist">
          {/* Tier 1 Card */}
          <button
            type="button"
            role="tab"
            aria-selected={tier === "1"}
            className={`scope-card ${tier === "1" ? "is-active" : ""}`}
            onClick={() => update({ tier: null })}
          >
            <div className="scope-card__top">
              <span className="scope-card__tier">Tier 1 · Baseline</span>
              <span className="chip chip--ok chip--square">
                <span className="dot dot--budget" /> Aktif Penuh
              </span>
            </div>
            <strong className="scope-card__title">Sumatera Utara</strong>
            <span className="scope-card__meta">
              33 Daerah (8 Kota · 25 Kabupaten)
            </span>
            <p className="scope-card__desc">
              Audit granular SIKD: 10 prioritas audit SHA-256 dan 23 pemda
              ekspansi modular tahap 2.
            </p>
          </button>

          {/* Tier 2 Card */}
          <button
            type="button"
            role="tab"
            aria-selected={tier === "2"}
            className={`scope-card ${tier === "2" ? "is-active" : ""}`}
            onClick={() => update({ tier: "2" })}
          >
            <div className="scope-card__top">
              <span className="scope-card__tier">Tier 2 · Regional</span>
              <span className="chip chip--info chip--square">
                <span className="dot dot--info" /> Preview Regional
              </span>
            </div>
            <strong className="scope-card__title">Pulau Sumatera</strong>
            <span className="scope-card__meta">10 Provinsi · 154 Daerah</span>
            <p className="scope-card__desc">
              Matriks komparasi fiskal 10 provinsi se-Sumatera dan status
              pipeline ingestion modular.
            </p>
          </button>

          {/* Tier 3 Card */}
          <button
            type="button"
            role="tab"
            aria-selected={tier === "3"}
            className={`scope-card ${tier === "3" ? "is-active" : ""}`}
            onClick={() => update({ tier: "3" })}
          >
            <div className="scope-card__top">
              <span className="scope-card__tier">Tier 3 · Nasional</span>
              <span className="chip chip--accent chip--square">
                <span className="dot dot--modal" /> Roadmap Nasional
              </span>
            </div>
            <strong className="scope-card__title">Seluruh Indonesia</strong>
            <span className="scope-card__meta">38 Provinsi · 514 Daerah</span>
            <p className="scope-card__desc">
              Roadmap pengawasan agregat APBD Rp 1,15 Kuadriliun di 6 gugus
              kepulauan Nusantara.
            </p>
          </button>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "var(--sunk)",
            borderRadius: "var(--r)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            fontSize: "0.8125rem",
            color: "var(--ink-2)",
          }}
        >
          <span>
            <strong>Informasi Cakupan:</strong> Beranda ini aktif penuh
            menampilkan data APBD 33 Kabupaten/Kota di Sumatera Utara (Tier 1 Baseline).
          </span>
        </div>
      </section>

      <section id="jelajah">
        <SectionHeading
          title={
            tier === "2"
              ? "Matrix Fiskal Pulau Sumatera (10 Provinsi)"
              : tier === "3"
                ? "Roadmap Skalabilitas Nasional (38 Provinsi · 514 Pemda)"
                : "Jelajahi Belanja Daerah (Sumatera Utara)"
          }
          subtitle={
            tier === "2"
              ? "Preview regional 154 kabupaten/kota dan perbandingan penyerapan modal se-Sumatera."
              : tier === "3"
                ? "Konsolidasi pagu nasional Rp 1,15 Kuadriliun di 6 gugus kepulauan Nusantara."
                : "33 Daerah: 10 prioritas audit kriptografis SHA-256 dan 23 pemda ekspansi modular."
          }
        >
          <ShareButton />
          {tier === "1" && (
            <DownloadButton
              codes={visible.map((row) => row.regionCode)}
              year={year}
              month={month}
            />
          )}
        </SectionHeading>

        {tier === "2" ? (
          <RegionalSumateraMatrix
            showBlueprintCards={false}
            onSelectTier={(t) => update({ tier: String(t) as "1" | "2" | "3" })}
          />
        ) : tier === "3" ? (
          <NationalRoadmapView
            showBlueprintCards={false}
            onSelectTier={(t) => update({ tier: String(t) as "1" | "2" | "3" })}
          />
        ) : (
          <>
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
                <label
                  className="field field--compact"
                  style={{ margin: 0, flexShrink: 0 }}
                >
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
                    <option value="nama">Urut: nama daerah</option>
                    <option value="realisasi">Urut: realisasi terbesar</option>
                    <option value="penumpukan">
                      Urut: penumpukan akhir tahun
                    </option>
                  </select>
                  <ChevronDown size={14} className="field__caret" />
                </label>
                <PeriodControls year={year} month={month} onChange={update} />
              </div>
            </div>

            {/* Unified Filter Panel */}
            <div
              className="filter-panel"
              role="region"
              aria-label="Filter Daerah Terpantau"
            >
              {/* Group 1: Jenis Administratif */}
              <div className="filter-group">
                <span className="filter-group__label">
                  <Building2 size={13} /> Jenis:
                </span>
                <div
                  className="filter-pills"
                  role="group"
                  aria-label="Filter jenis daerah"
                >
                  <button
                    type="button"
                    className={`filter-pill ${fokus === "semua" && kind === "semua" ? "is-active" : ""}`}
                    onClick={() => update({ jenis: null, fokus: null })}
                  >
                    Semua <span className="count">{snapshots.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${fokus !== "penanda" && kind === "prioritas" ? "is-active" : ""}`}
                    onClick={() => update({ jenis: "prioritas", fokus: null })}
                    title="10 Daerah pantauan utama dengan verifikasi kriptografis SHA-256"
                  >
                    <ShieldCheck size={12} /> Prioritas SNA{" "}
                    <span className="count">{prioritasCount}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${fokus !== "penanda" && kind === "kota" ? "is-active" : ""}`}
                    onClick={() => update({ jenis: "kota", fokus: null })}
                  >
                    <Building2 size={12} /> Kota{" "}
                    <span className="count">{kotaCount}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${fokus !== "penanda" && kind === "kabupaten" ? "is-active" : ""}`}
                    onClick={() => update({ jenis: "kabupaten", fokus: null })}
                  >
                    <Landmark size={12} /> Kabupaten{" "}
                    <span className="count">{kabCount}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill filter-pill--warn ${fokus === "penanda" ? "is-active is-warn" : ""}`}
                    onClick={() =>
                      update({ fokus: fokus === "penanda" ? null : "penanda" })
                    }
                    title="8 Daerah dengan indikasi penumpukan belanja modal fisik akhir tahun >40%"
                  >
                    <TriangleAlert size={12} /> Anomali Akhir Tahun{" "}
                    <span className="count">{flaggedCount}</span>
                  </button>
                </div>
              </div>

              {/* Hairline divider */}
              <div className="filter-panel__divider" />

              {/* Group 2: Zona Geografis */}
              <div className="filter-group">
                <span className="filter-group__label">
                  <MapPin size={13} /> Zona:
                </span>
                <div
                  className="filter-pills"
                  role="group"
                  aria-label="Filter zona wilayah"
                >
                  <button
                    type="button"
                    className={`filter-pill ${zona === "semua" ? "is-active" : ""}`}
                    onClick={() => update({ zona: null })}
                  >
                    Semua Zona <span className="count">{snapshots.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${zona === "mebidangro" ? "is-active" : ""}`}
                    onClick={() =>
                      update({
                        zona: zona === "mebidangro" ? null : "mebidangro",
                      })
                    }
                  >
                    Mebidangro <span className="count">{mebidangroCount}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${zona === "tapanuli" ? "is-active" : ""}`}
                    onClick={() =>
                      update({
                        zona: zona === "tapanuli" ? null : "tapanuli",
                      })
                    }
                  >
                    Tapanuli <span className="count">{tapanuliCount}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${zona === "pantai-timur" ? "is-active" : ""}`}
                    onClick={() =>
                      update({
                        zona: zona === "pantai-timur" ? null : "pantai-timur",
                      })
                    }
                  >
                    Pantai Timur{" "}
                    <span className="count">{pantaiTimurCount}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${zona === "dataran-tinggi" ? "is-active" : ""}`}
                    onClick={() =>
                      update({
                        zona:
                          zona === "dataran-tinggi" ? null : "dataran-tinggi",
                      })
                    }
                  >
                    Dataran Tinggi{" "}
                    <span className="count">{dataranTinggiCount}</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${zona === "nias" ? "is-active" : ""}`}
                    onClick={() =>
                      update({ zona: zona === "nias" ? null : "nias" })
                    }
                  >
                    Kepulauan Nias <span className="count">{niasCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {fokus === "penanda" && (
              <div
                className="note note--warn note--block"
                style={{
                  margin: "12px 0 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div>
                  <strong>
                    <TriangleAlert
                      size={14}
                      style={{ verticalAlign: "-2px", marginRight: 6 }}
                    />
                    Menampilkan 8 Daerah Anomali Akhir Tahun ({latestCompleteYear}):
                  </strong>{" "}
                  Konsentrasi pencairan belanja modal fisik di Triwulan IV melampaui
                  ambang kewajaran 40%.
                </div>
                <button
                  type="button"
                  className="btn btn--secondary"
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    height: "auto",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => update({ fokus: null })}
                >
                  Tampilkan Semua 33 Daerah
                </button>
              </div>
            )}

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
                    <span
                      className="summary__value"
                      title={fullMoney(totalBudget)}
                    >
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

                <div className="card regions">
                  <div className="card__head">
                    <div>
                      <h3 className="card__title">
                        Daftar Daerah Terpantau{" "}
                        <span className="count">{visible.length}</span>
                      </h3>
                      <p className="card__sub">
                        Pagu APBD, realisasi belanja, dan indikator penanda
                        belanja modal fisik akhir tahun {latestCompleteYear}.
                        {visible.length > 10 && pageSize !== "all" && (
                          <span className="muted">
                            {" "}
                            · Halaman {currentPage} dari {totalPages}{" "}
                            (menampilkan {startDisplay}–{endDisplay})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="table-wrap">
                    <table className="region-table">
                      <thead>
                        <tr>
                          <th style={{ width: "22%" }}>Daerah</th>
                          <th style={{ width: "16%" }}>Status Audit</th>
                          <th className="is-num" style={{ width: "20%" }}>
                            Pagu / Realisasi
                          </th>
                          <th className="is-num" style={{ width: "18%" }}>
                            Tingkat Serapan
                          </th>
                          <th style={{ width: "20%" }}>
                            Penanda Belanja Akhir Tahun ({latestCompleteYear})
                          </th>
                          <th style={{ width: "4%" }}>
                            <span className="sr-only">Profil</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedVisible.map((snapshot) => {
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
                              <td>
                                {region.statusAudit === "audit-penuh" ? (
                                  <span
                                    className="chip chip--ok chip--square"
                                    title="Terverifikasi berkas resmi SIKD Kemenkeu dengan hash SHA-256"
                                    style={{
                                      fontSize: "0.6875rem",
                                      padding: "2px 6px",
                                    }}
                                  >
                                    <ShieldCheck size={12} /> Audit SHA-256
                                  </span>
                                ) : (
                                  <span
                                    className="chip chip--sunk chip--square"
                                    title="Data pagu & realisasi terpetakan dalam pipeline ekspansi modular tahap 2"
                                    style={{
                                      fontSize: "0.6875rem",
                                      padding: "2px 6px",
                                    }}
                                  >
                                    <Sparkles size={12} /> Ekspansi Tahap 2
                                  </span>
                                )}
                              </td>
                              <td className="is-num">
                                <span className="money-pair">
                                  <strong
                                    title={fullMoney(snapshot.total.realized)}
                                  >
                                    {compactMoney(snapshot.total.realized)}
                                  </strong>
                                  <span
                                    title={fullMoney(snapshot.total.budget)}
                                  >
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
                    {paginatedVisible.map((snapshot) => {
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
                          <div className="region-card__top">
                            <div>
                              <strong className="region-cell__name">
                                {region.shortName}
                              </strong>
                              <span className="region-cell__kind">
                                {kindLabel(region.type)}
                              </span>
                              <div style={{ marginTop: 4 }}>
                                {region.statusAudit === "audit-penuh" ? (
                                  <span
                                    className="chip chip--ok chip--square"
                                    style={{
                                      fontSize: "0.6875rem",
                                      padding: "1px 6px",
                                    }}
                                  >
                                    <ShieldCheck size={11} /> Audit SHA-256
                                  </span>
                                ) : (
                                  <span
                                    className="chip chip--sunk chip--square"
                                    style={{
                                      fontSize: "0.6875rem",
                                      padding: "1px 6px",
                                    }}
                                  >
                                    <Sparkles size={11} /> Ekspansi Tahap 2
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowUpRight size={16} />
                          </div>
                          <div className="region-card__grid">
                            <div className="region-card__item">
                              <span>Realisasi</span>
                              <strong>
                                {compactMoney(snapshot.total.realized)}
                              </strong>
                            </div>
                            <div className="region-card__item">
                              <span>Pagu</span>
                              <strong>
                                {compactMoney(snapshot.total.budget)}
                              </strong>
                            </div>
                            <div className="region-card__item">
                              <span>Serapan</span>
                              <strong className={over ? "is-over" : ""}>
                                {percent(rowRate)}
                              </strong>
                            </div>
                            <div className="region-card__item">
                              <span>Penanda {latestCompleteYear}</span>
                              <strong>{formatFlagShare(flag.share)}</strong>
                            </div>
                          </div>
                          <div className="region-card__flags">
                            {over && (
                              <span className="chip chip--warn chip--square">
                                Realisasi &gt;100% pagu
                              </span>
                            )}
                            {persistenceChip(region.code)}
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="card__foot">
                    {visible.length > 10 && (
                      <div
                        className="pagination"
                        role="navigation"
                        aria-label="Navigasi halaman daftar daerah"
                      >
                        <div className="pagination__info">
                          Menampilkan {startDisplay}–{endDisplay} dari{" "}
                          {visible.length} daerah
                        </div>
                        <div className="pagination__controls">
                          <button
                            type="button"
                            className="pagination__btn"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage <= 1}
                            aria-label="Halaman sebelumnya"
                          >
                            <ChevronLeft size={14} /> Sebelumnya
                          </button>
                          <div
                            className="pagination__page-numbers"
                            role="group"
                            aria-label="Nomor halaman"
                          >
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1,
                            ).map((pageNum) => (
                              <button
                                key={pageNum}
                                type="button"
                                className={`pagination__btn ${currentPage === pageNum ? "is-active" : ""}`}
                                onClick={() => setCurrentPage(pageNum)}
                                aria-current={
                                  currentPage === pageNum ? "page" : undefined
                                }
                              >
                                {pageNum}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="pagination__btn"
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage >= totalPages}
                            aria-label="Halaman selanjutnya"
                          >
                            Berikutnya <ChevronRight size={14} />
                          </button>
                        </div>
                        <div
                          className="pagination__size"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--ink-3)",
                              fontWeight: 500,
                            }}
                          >
                            Baris:
                          </span>
                          <div
                            className="segmented"
                            role="group"
                            aria-label="Jumlah daerah per halaman"
                          >
                            <button
                              type="button"
                              className={`segmented__btn ${pageSize === 10 ? "is-active" : ""}`}
                              onClick={() => {
                                setPageSize(10);
                                setCurrentPage(1);
                              }}
                            >
                              10
                            </button>
                            <button
                              type="button"
                              className={`segmented__btn ${pageSize === 25 ? "is-active" : ""}`}
                              onClick={() => {
                                setPageSize(25);
                                setCurrentPage(1);
                              }}
                            >
                              25
                            </button>
                            <button
                              type="button"
                              className={`segmented__btn ${pageSize === "all" ? "is-active" : ""}`}
                              onClick={() => {
                                setPageSize("all");
                                setCurrentPage(1);
                              }}
                            >
                              Semua
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <InfoNote>
                      Serapan menunjukkan bagian pagu yang sudah dibelanjakan,
                      bukan penilaian mutu layanan.
                    </InfoNote>
                  </div>
                </div>

                {topFlaggedRegions.length > 0 && (
                  <div
                    className="card card--warn-alert"
                    style={{
                      border: "1px solid var(--warn-line)",
                      background: "var(--paper)",
                    }}
                  >
                    <div
                      className="card__head"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                        padding: "14px 18px",
                        borderBottom: "1px solid var(--line)",
                        background: "var(--warn-bg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "var(--r)",
                            background: "var(--paper)",
                            border: "1px solid var(--warn-line)",
                            display: "grid",
                            placeItems: "center",
                            color: "var(--warn-ink)",
                            flexShrink: 0,
                          }}
                        >
                          <TriangleAlert size={15} />
                        </div>
                        <div>
                          <h3
                            className="card__title"
                            style={{ fontSize: "0.9375rem", margin: 0 }}
                          >
                            Fokus Pengawasan Publik: Anomali Akhir Tahun
                          </h3>
                          <p
                            className="card__sub"
                            style={{ margin: "2px 0 0" }}
                          >
                            Konsentrasi pencairan belanja modal fisik di akhir
                            tahun melampaui ambang kewajaran 40%.
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="chip chip--warn">
                          Catatan Telaah Kritis
                        </span>
                        <button
                          type="button"
                          className="btn btn--secondary"
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 10px",
                            height: "auto",
                            background: "var(--paper)",
                          }}
                          onClick={() => {
                            update({ fokus: "penanda" });
                            document
                              .getElementById("jelajah")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          title="Saring tabel daerah di atas hanya menampilkan 8 daerah anomali ini"
                        >
                          <Filter size={12} /> Saring di Tabel Atas ↑
                        </button>
                      </div>
                    </div>

                    <div
                      className="card__body"
                      style={{ padding: "14px 18px" }}
                    >
                      <div className="priority-grid">
                        {topFlaggedRegions.map((item, idx) => (
                          <Link
                            key={item.region.code}
                            href={`/daerah/${item.region.code}?${period}#lembar-advokasi`}
                            className="priority-card"
                          >
                            <div className="priority-card__head">
                              <div className="priority-card__title-wrap">
                                <span
                                  className="priority-card__rank"
                                  aria-label={`Peringkat ${idx + 1}`}
                                >
                                  {idx + 1}
                                </span>
                                <strong className="priority-card__name">
                                  {item.region.name}
                                </strong>
                              </div>
                              <div className="priority-card__badge-wrap">
                                {persistenceChip(item.region.code)}
                              </div>
                            </div>

                            <div className="priority-card__metric">
                              <div className="priority-card__metric-val">
                                <span className="priority-card__percent">
                                  {formatFlagShare(item.flag.share)}
                                </span>
                                <span className="priority-card__metric-label">
                                  modal akhir TA
                                </span>
                              </div>
                              <div
                                className="priority-card__bar-track"
                                role="progressbar"
                                aria-valuenow={Math.round(
                                  (item.flag.share ?? 0) * 100,
                                )}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <div
                                  className="priority-card__bar-fill"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, (item.flag.share ?? 0) * 100))}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <div className="priority-card__foot">
                              <span className="priority-card__cta">
                                <span>Buka telaah &amp; pertanyaan publik</span>
                                <ArrowRight size={12} />
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                    gap: "var(--gap)",
                  }}
                >
                  <div className="card">
                    <div className="card__head">
                      <div>
                        <h3 className="card__title">
                          Komposisi realisasi belanja
                        </h3>
                        <p className="card__sub">
                          Porsi per kategori dari total realisasi{" "}
                          {compactMoney(totalRealized)} ({visible.length} daerah
                          terpilih)
                        </p>
                      </div>
                    </div>
                    <div className="card__body">
                      <div
                        className="stack-bar"
                        role="img"
                        aria-label="Komposisi realisasi belanja kumulatif daerah yang ditampilkan"
                      >
                        {visibleCategories.map((cat) => (
                          <span
                            key={cat.code}
                            className={`seg--${cat.code}`}
                            style={{ width: `${Math.max(cat.share ?? 0, 0)}%` }}
                            title={`${cat.label}: ${percent(cat.share)} (${compactMoney(cat.realized)})`}
                          />
                        ))}
                      </div>
                      <div className="legend">
                        {visibleCategories.map((cat) => (
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

                  <div className="card">
                    <div
                      className="card__head"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                        <h3 className="card__title">Rencana dan realisasi</h3>
                        <p className="card__sub">
                          {chartDisplayMode === "top10" && visible.length > 10
                            ? `10 Daerah pagu terbesar dari ${visible.length} daerah terpilih (triliun rupiah).`
                            : chartDisplayMode === "bottom10" &&
                                visible.length > 10
                              ? `10 Daerah pagu terkecil dari ${visible.length} daerah terpilih (triliun rupiah).`
                              : `Perbandingan pagu dan realisasi APBD ${visible.length} daerah terpilih (triliun rupiah).`}
                        </p>
                      </div>
                      {visible.length > 10 && (
                        <div
                          className="segmented"
                          role="tablist"
                          aria-label="Pilihan tampilan grafik daerah"
                          style={{ flexShrink: 0 }}
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={chartDisplayMode === "top10"}
                            className={`segmented__btn ${chartDisplayMode === "top10" ? "is-active" : ""}`}
                            onClick={() => setChartDisplayMode("top10")}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0 9px",
                              height: "26px",
                            }}
                          >
                            10 Terbesar
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={chartDisplayMode === "bottom10"}
                            className={`segmented__btn ${chartDisplayMode === "bottom10" ? "is-active" : ""}`}
                            onClick={() => setChartDisplayMode("bottom10")}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0 9px",
                              height: "26px",
                            }}
                          >
                            10 Terkecil
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={chartDisplayMode === "all"}
                            className={`segmented__btn ${chartDisplayMode === "all" ? "is-active" : ""}`}
                            onClick={() => setChartDisplayMode("all")}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0 9px",
                              height: "26px",
                            }}
                          >
                            Semua ({visible.length})
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="card__body">
                      <LazySpendingChart
                        snapshots={displayedSpending}
                        isScrollViewport={
                          chartDisplayMode === "all" && visible.length > 10
                        }
                      />
                      <ChartLegend
                        items={[
                          { label: "Pagu belanja", color: chartColors.budget },
                          { label: "Realisasi", color: chartColors.realized },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <SourceNote snapshot={visible[0]} />
              </div>
            ) : (
              <EmptyState title="Daerah tidak ditemukan">
                Coba cari {regionListLabel}, atau ubah filter jenis daerah.
              </EmptyState>
            )}
          </>
        )}
      </section>

      <p className="footnote">
        Cakupan versi awal: {regionListLabel}. Data diperiksa{" "}
        {dateLabel(dataset.generatedAt)}. Pembaruan mengikuti publikasi sumber.
      </p>
    </>
  );
}
