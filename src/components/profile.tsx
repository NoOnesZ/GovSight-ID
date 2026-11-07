"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Decimal from "decimal.js";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  History,
  Info,
  Layers,
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
  GlossaryTerm,
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

type ProfileTab = "advocacy" | "structure" | "history";

export function Profile({
  dataset,
  region,
}: {
  dataset: Dataset;
  region: Region;
}) {
  const { year, month, update, period, invalidPeriod, params } = useFilters();
  const reference = params.get("acuan") ?? "";
  const paramTab = params.get("tab") as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    if (paramTab === "advocacy" || paramTab === "structure" || paramTab === "history") {
      return paramTab;
    }
    return reference ? "history" : "advocacy";
  });

  useEffect(() => {
    if (paramTab === "advocacy" || paramTab === "structure" || paramTab === "history") {
      setActiveTab(paramTab);
    } else if (reference) {
      setActiveTab("history");
    }
  }, [paramTab, reference]);

  const switchTab = (tabId: ProfileTab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const next = new URLSearchParams(window.location.search);
      next.set("tab", tabId);
      window.history.replaceState(null, "", "?" + next.toString());
    }
  };

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

  const tabs = [
    {
      id: "advocacy" as const,
      label: "Ringkasan & Advokasi",
      icon: Scale,
      badge: "Prioritas",
      meta: "Indikator kunci, telaah kritis, & instrumen advokasi fraksi DPRD",
    },
    {
      id: "structure" as const,
      label: "Struktur & Kepatuhan HKPD",
      icon: Layers,
      badge: "UU 1/2022",
      meta: "Komposisi belanja, batas belanja pegawai 30% & belanja modal",
    },
    {
      id: "history" as const,
      label: "Riwayat & Tren Fiskal",
      icon: History,
      badge: `${history.length} Thn`,
      meta: "Laju serapan bulanan, audit lonjakan akhir tahun, & tren 3 tahun",
    },
  ];
  const activeTabMeta = tabs.find((t) => t.id === activeTab) ?? tabs[0];

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
          <h1 style={{ margin: "0 0 8px" }}>{region.name}</h1>
          <p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontWeight: 500,
                color: "var(--ink-2)",
              }}
            >
              <MapPin size={13} /> Sumatera Utara · {kindLabel(region.type)}
            </span>{" "}
            — Kenali rencana dan realisasi belanja daerah ini.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setActiveTab("advocacy");
              setTimeout(() => {
                document.getElementById("lembar-advokasi")?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
          >
            <Scale size={15} /> Panduan advokasi
          </button>
          <ShareButton />
          <DownloadButton codes={[region.code]} year={year} month={month} />
        </div>
      </div>

      <div className="filter-row">
        <SourceNote snapshot={snapshot} />
        <PeriodControls year={year} month={month} onChange={update} />
      </div>

      {/* Segmented Reader Tabs */}
      <div className="profile-reader-nav no-print" role="tablist" aria-label="Segmen Baca Profil Daerah">
        <div className="profile-reader-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`profile-reader-tab ${isActive ? "is-active" : ""}`}
                onClick={() => switchTab(tab.id)}
              >
                <Icon size={15} className="profile-reader-tab__icon" />
                <span>{tab.label}</span>
                <span className="profile-reader-tab__badge">{tab.badge}</span>
              </button>
            );
          })}
        </div>
        <div className="profile-reader-meta">
          <span>
            Fokus telaah: <strong style={{ color: "var(--ink)" }}>{activeTabMeta.label}</strong> — {activeTabMeta.meta}
          </span>
          <span style={{ fontSize: "0.6875rem", color: "var(--ink-4)" }}>
            APBD {region.name} · SIKD DJPK Kemenkeu
          </span>
        </div>
      </div>

      {/* TAB 1: RINGKASAN & ADVOKASI */}
      {activeTab === "advocacy" && (
        <div id="panel-advocacy" role="tabpanel" aria-labelledby="tab-advocacy" className="stack">
          {/* Kartu KPI Utama */}
          <div className="metrics">
            <div className="metric">
              <span className="metric__label">
                <Wallet size={14} /> Total <GlossaryTerm term="pagu">pagu</GlossaryTerm> belanja
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
                <BarChart3 size={14} /> <GlossaryTerm term="realisasi">Realisasi</GlossaryTerm> belanja
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
                    Indikator Anomali: &gt;100% pagu
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
                <GlossaryTerm term="realisasi">Realisasi</GlossaryTerm> dibagi <GlossaryTerm term="pagu">pagu</GlossaryTerm> tahunan
              </small>
            </div>
          </div>

          {/* Poin Kritis: Telaah Kritis Realisasi Melampaui Pagu */}
          {over && (
            <div className="note note--warn note--block" role="status">
              <strong>
                <TriangleAlert
                  size={15}
                  style={{ verticalAlign: "-2px", marginRight: 6 }}
                />
                Catatan Telaah Kritis: Kemungkinan penyebab realisasi tercatat{" "}
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

          {/* Inquiry Toolkit / Panduan Fraksi DPRD (Prioritas Utama) */}
          <InquiryToolkit
            region={region}
            currentSnapshot={snapshot}
            dataset={dataset}
          />

          {/* Navigasi Pembaca Lintas Segmen */}
          <div
            className="card no-print"
            style={{
              padding: "16px 20px",
              background: "var(--sunk)",
              border: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 3px", color: "var(--ink)" }}>
                  Lanjutkan telaah mendalam daerah ini
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", margin: 0 }}>
                  Periksa kepatuhan mandat batas belanja UU HKPD No. 1/2022 atau telusuri lonjakan akhir tahun.
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setActiveTab("structure");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <Layers size={14} /> Struktur & HKPD
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setActiveTab("history");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <History size={14} /> Riwayat & Tren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STRUKTUR & KEPATUHAN HKPD */}
      {activeTab === "structure" && (
        <div id="panel-structure" role="tabpanel" aria-labelledby="tab-structure" className="stack">
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
                <div
                  className="civic-note"
                  style={{
                    margin: "20px 0 16px",
                    padding: "16px 0",
                    borderTop: "1px solid var(--line)",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Scale size={14} style={{ color: "var(--ink-2)" }} />
                    <h3
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--ink)",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Simulasi Ekuivalensi Kapasitas <GlossaryTerm term="belanja-modal">Belanja Modal</GlossaryTerm>
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--ink-2)",
                      lineHeight: 1.55,
                      margin: "0 0 12px",
                    }}
                  >
                    Simulasi ekuivalensi belanja modal berdasarkan standar biaya umum nasional (catatan: HSPK aktual bervariasi antar wilayah kabupaten/kota di Sumut). Dari realisasi modal sebesar{" "}
                    <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                      {compactMoney(modalRealized)}
                    </strong>
                    , ekuivalensi fisik teoretis dihitung sebagai pembanding akuntabilitas:
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: "0 0 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <li
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "12px",
                        fontSize: "0.8125rem",
                        borderBottom: "1px solid var(--line)",
                        paddingBottom: "8px",
                      }}
                    >
                      <span style={{ color: "var(--ink-2)" }}>
                        Peningkatan jalan mantap dua lajur
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.6875rem",
                            color: "var(--ink-4)",
                            marginTop: "1px",
                          }}
                        >
                          Standar rujukan teknis kebinamargaan ~Rp1,5 M/km
                        </span>
                      </span>
                      <strong
                        style={{
                          color: "var(--ink)",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums lining-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ±{kmJalan.toLocaleString("id-ID")} km
                      </strong>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "12px",
                        fontSize: "0.8125rem",
                        borderBottom: "1px solid var(--line)",
                        paddingBottom: "8px",
                      }}
                    >
                      <span style={{ color: "var(--ink-2)" }}>
                        Puskesmas pembantu (Pustu)
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.6875rem",
                            color: "var(--ink-4)",
                            marginTop: "1px",
                          }}
                        >
                          Standar prototipe sarana faskes Kemenkes RI ~Rp2,0 M/unit
                        </span>
                      </span>
                      <strong
                        style={{
                          color: "var(--ink)",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums lining-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ±{unitFaskes.toLocaleString("id-ID")} unit
                      </strong>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "12px",
                        fontSize: "0.8125rem",
                        paddingBottom: "4px",
                      }}
                    >
                      <span style={{ color: "var(--ink-2)" }}>
                        Rehabilitasi ruang kelas sekolah dasar
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.6875rem",
                            color: "var(--ink-4)",
                            marginTop: "1px",
                          }}
                        >
                          Menu standar rehabilitasi DAK Fisik pendidikan ~Rp150 jt/ruang
                        </span>
                      </span>
                      <strong
                        style={{
                          color: "var(--ink)",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums lining-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ±{ruangKelas.toLocaleString("id-ID")} ruang
                      </strong>
                    </li>
                  </ul>
                  <p
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--ink-4)",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    <em>Catatan metodologi:</em> Ekuivalensi di atas adalah simulasi teoretis jika anggaran modal difokuskan ke satu jenis sarana (bukan alokasi simultan). Alokasi riil di APBD dipengaruhi Indeks Kemahalan Konstruksi (IKK) serta Standar Satuan Harga (HSPK) resmi tiap pemerintah kabupaten/kota.
                  </p>
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
                  <GlossaryTerm term="pagu">Pagu</GlossaryTerm> dan <GlossaryTerm term="realisasi">realisasi</GlossaryTerm> menurut jenis belanja
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
                      <th className="is-num">Porsi <GlossaryTerm term="pagu">pagu</GlossaryTerm></th>
                      <th className="is-num">Porsi <GlossaryTerm term="realisasi">realisasi</GlossaryTerm></th>
                    </tr>
                  </thead>
                  <tbody>
                    {["modal", "pegawai"].map((code) => {
                      const shares = categoryShares(snapshot, code);
                      return (
                        <tr key={code}>
                          <th>
                            {code === "modal" ? (
                              <GlossaryTerm term="belanja-modal">Belanja modal</GlossaryTerm>
                            ) : (
                              <GlossaryTerm term="belanja-pegawai">Belanja pegawai</GlossaryTerm>
                            )}
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

              <div
                className="hkpd-comparison"
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--ink)",
                      margin: 0,
                    }}
                  >
                    Konteks Komposisi Anggaran & Regulasi
                  </h3>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "var(--ink-3)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Rujukan <GlossaryTerm term="uu-hkpd">UU No. 1/2022 (HKPD)</GlossaryTerm>
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "12px",
                        borderBottom: "1px solid var(--line)",
                        paddingBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)" }}>
                        Pasal 146 · <GlossaryTerm term="belanja-pegawai">Belanja Pegawai</GlossaryTerm>
                      </span>
                      <strong
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--ink)",
                          fontVariantNumeric: "tabular-nums lining-nums",
                        }}
                      >
                        {formatFlagShare(sharesPegawai.budget)} dari <GlossaryTerm term="pagu">pagu</GlossaryTerm>
                      </strong>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-3)", fontVariantNumeric: "tabular-nums lining-nums" }}>
                      Peringkat #{pegawaiRank} tertinggi dari {periodSnapshots.length} daerah pantauan
                    </div>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--ink-2)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      Pasal 146 ayat (1) mengarahkan belanja pegawai maksimal 30%
                      APBD, dengan masa transisi bertahap hingga 2027. Formula
                      resmi HKPD mengecualikan tunjangan guru DAK Nonfisik dan
                      bagi hasil atau transfer desa, sehingga persentase belanja
                      pegawai pada data APBD ini belum dapat disamakan langsung
                      dengan kepatuhan hukum HKPD.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "12px",
                        borderBottom: "1px solid var(--line)",
                        paddingBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)" }}>
                        Pasal 147 · <GlossaryTerm term="belanja-modal">Belanja Modal</GlossaryTerm>
                      </span>
                      <strong
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--ink)",
                          fontVariantNumeric: "tabular-nums lining-nums",
                        }}
                      >
                        {formatFlagShare(sharesModal.budget)} dari <GlossaryTerm term="pagu">pagu</GlossaryTerm>
                      </strong>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-3)", fontVariantNumeric: "tabular-nums lining-nums" }}>
                      Peringkat #{modalRank} tertinggi dari {periodSnapshots.length} daerah pantauan
                    </div>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--ink-2)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
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
        </div>
      )}

      {/* TAB 3: RIWAYAT & TREN FISKAL */}
      {activeTab === "history" && (
        <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" className="stack">
          {/* Laju Realisasi Bulanan */}
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
                          <th className="is-num"><GlossaryTerm term="pagu">Pagu</GlossaryTerm> laporan</th>
                          <th className="is-num"><GlossaryTerm term="realisasi">Realisasi</GlossaryTerm> kumulatif</th>
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

          {/* Lonjakan Belanja Modal Akhir Tahun Nov-Des */}
          <YearEnd dataset={dataset} code={region.code} />

          {/* Tren Porsi Modal 3 Tahun */}
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
                      <th className="is-num">Porsi <GlossaryTerm term="belanja-modal">belanja modal</GlossaryTerm></th>
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

          {/* Melihat Belanja dari Waktu ke Waktu (Setara Bulanan) */}
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
                      <th className="is-num"><GlossaryTerm term="pagu">Pagu</GlossaryTerm> tahunan</th>
                      <th className="is-num"><GlossaryTerm term="realisasi">Realisasi</GlossaryTerm></th>
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
        </div>
      )}

      {/* Profil CTA & Sumber Eksternal */}
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

      <div className="source-actions">
        <ExternalSource snapshot={snapshot} />
        <a href={snapshot.source.rawPath} download className="link link--quiet">
          Unduh berkas sumber <ArrowUpRight size={13} />
        </a>
      </div>
    </>
  );
}
