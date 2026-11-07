"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Database,
  Globe,
  Landmark,
  Layers,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import {
  sumateraProvinces,
  nationalIslandsGroups,
  nationalFiscalSummary,
  type ProvinsiSumatera,
  type GugusKepulauan,
} from "@/lib/scalability-data";
import { compactMoney, fullMoney, percent } from "@/lib/format";
import { InfoNote } from "./shared";

// ============================================================================
// TIER 2: Regional Pulau Sumatera (10 Provinsi · 154 Daerah)
// ============================================================================

export function RegionalSumateraMatrix() {
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<"nama" | "pagu" | "serapan">("pagu");

  const totalDaerah = useMemo(
    () => sumateraProvinces.reduce((acc, p) => acc + p.daerahCount, 0),
    [],
  );
  const totalKota = useMemo(
    () => sumateraProvinces.reduce((acc, p) => acc + p.kotaCount, 0),
    [],
  );
  const totalKab = useMemo(
    () => sumateraProvinces.reduce((acc, p) => acc + p.kabCount, 0),
    [],
  );
  const totalPagu = useMemo(
    () => sumateraProvinces.reduce((acc, p) => acc + p.aggregateBudget, 0),
    [],
  );
  const avgSerapanModal = useMemo(() => {
    const sum = sumateraProvinces.reduce((acc, p) => acc + p.modalAbsorptionRate, 0);
    return Number((sum / sumateraProvinces.length).toFixed(1));
  }, []);

  const filteredProvinces = useMemo(() => {
    return sumateraProvinces
      .filter((p) => {
        const matchesQuery =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.featuredDaerah.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus =
          filterStatus === "semua"
            ? true
            : filterStatus === "aktif"
              ? p.statusIngestion === "Aktif Penuh"
              : filterStatus === "progress"
                ? p.statusIngestion === "In Progress"
                : p.statusIngestion === "Pipeline Rujukan";
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === "pagu") return b.aggregateBudget - a.aggregateBudget;
        if (sortField === "serapan") return b.modalAbsorptionRate - a.modalAbsorptionRate;
        return a.name.localeCompare(b.name, "id");
      });
  }, [searchQuery, filterStatus, sortField]);

  return (
    <div className="stack" style={{ marginTop: "var(--gap)" }}>
      {/* Banner Arsitektur Modular Sumatera */}
      <section className="tier-banner tier-banner--info" aria-labelledby="banner-sumatera-heading">
        <div className="tier-banner__badges">
          <span className="chip chip--accent chip--square">
            <Layers size={13} /> Arsitektur Skalabilitas Tier 2
          </span>
          <span className="chip chip--info chip--square">
            <span className="dot dot--info" /> Preview Regional
          </span>
          <span className="chip chip--sunk chip--square">
            10 Provinsi Terpetakan
          </span>
        </div>
        <h2 id="banner-sumatera-heading" className="tier-banner__title">
          Cakupan Regional Sumatera: 154 Kabupaten/Kota dalam proses ingestion modular per provinsi
        </h2>
        <p className="tier-banner__lead">
          GovSight ID memperluas pemantauan belanja publik melintasi batas Sumatera Utara menuju 10 provinsi di seluruh Pulau Sumatera.
          Sistem ingestion modular memproses 154 APBD kabupaten/kota dengan standarisasi skema SIKD Kementerian Keuangan dan validasi integritas data SHA-256.
        </p>

        <div className="tier-banner__stats">
          <div className="tier-banner__stat">
            <span className="tier-banner__stat-label">Cakupan Wilayah</span>
            <strong className="tier-banner__stat-val">10 Provinsi</strong>
            <span className="tier-banner__stat-sub">154 Daerah ({totalKota} Kota · {totalKab} Kab)</span>
          </div>

          <div className="tier-banner__stat">
            <span className="tier-banner__stat-label">Total Agregat APBD</span>
            <strong className="tier-banner__stat-val" title={fullMoney(totalPagu.toString())}>
              {compactMoney(totalPagu.toString())}
            </strong>
            <span className="tier-banner__stat-sub">Akumulasi pagu se-Sumatera</span>
          </div>

          <div className="tier-banner__stat">
            <span className="tier-banner__stat-label">Rata-rata Serapan Modal</span>
            <strong className="tier-banner__stat-val" style={{ color: "var(--ok)" }}>
              {percent(avgSerapanModal)}
            </strong>
            <span className="tier-banner__stat-sub">Target UU HKPD: ≥40%</span>
          </div>

          <div className="tier-banner__stat">
            <span className="tier-banner__stat-label">Status Ingestion</span>
            <strong className="tier-banner__stat-val" style={{ color: "var(--accent)" }}>
              33 Live · 121 Staged
            </strong>
            <span className="tier-banner__stat-sub">Sumut aktif penuh, 9 provinsi staging</span>
          </div>
        </div>
      </section>

      {/* Toolbar & Filter Matrix */}
      <div className="card">
        <div className="card__head">
          <div>
            <h3 className="card__title">
              Matrix Fiskal 10 Provinsi Se-Pulau Sumatera{" "}
              <span className="count">{filteredProvinces.length}</span>
            </h3>
            <p className="card__sub">
              Perbandingan pagu APBD, rata-rata serapan belanja modal infrastruktur, dan kesiapan pipeline ingestion data.
            </p>
          </div>
          <div className="section-head__actions">
            <label className="field">
              <span className="sr-only">Urutkan provinsi</span>
              <select
                aria-label="Urutkan provinsi"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
              >
                <option value="pagu">Urut: Pagu Terbesar</option>
                <option value="serapan">Urut: Serapan Modal Tertinggi</option>
                <option value="nama">Urut: Nama Provinsi</option>
              </select>
              <ChevronDown size={14} className="field__caret" />
            </label>
          </div>
        </div>

        <div className="card__body">
          <div className="toolbar" style={{ marginTop: 0, marginBottom: 12 }}>
            <label className="field field--search">
              <Search size={16} />
              <span className="sr-only">Cari provinsi atau ibukota</span>
              <input
                aria-label="Cari provinsi atau ibukota"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari provinsi, ibukota, atau daerah rujukan…"
              />
            </label>
            <div className="toolbar__group toolbar__group--end">
              <div className="segmented" role="group" aria-label="Filter status ingestion">
                <button
                  type="button"
                  className={`segmented__item ${filterStatus === "semua" ? "is-active" : ""}`}
                  onClick={() => setFilterStatus("semua")}
                >
                  Semua (10)
                </button>
                <button
                  type="button"
                  className={`segmented__item ${filterStatus === "aktif" ? "is-active" : ""}`}
                  onClick={() => setFilterStatus("aktif")}
                >
                  <CheckCircle2 size={13} /> Aktif (1)
                </button>
                <button
                  type="button"
                  className={`segmented__item ${filterStatus === "progress" ? "is-active" : ""}`}
                  onClick={() => setFilterStatus("progress")}
                >
                  <Clock size={13} /> In Progress (3)
                </button>
                <button
                  type="button"
                  className={`segmented__item ${filterStatus === "pipeline" ? "is-active" : ""}`}
                  onClick={() => setFilterStatus("pipeline")}
                >
                  <Database size={13} /> Pipeline (6)
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="table-wrap">
            <table className="region-table">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Provinsi &amp; Ibukota</th>
                  <th style={{ width: "16%" }}>Cakupan Daerah</th>
                  <th className="is-num" style={{ width: "18%" }}>Estimasi Agregat APBD</th>
                  <th style={{ width: "22%" }}>Serapan Belanja Modal</th>
                  <th style={{ width: "12%" }}>Porsi Pegawai</th>
                  <th style={{ width: "10%" }}>Pipeline Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProvinces.map((p, idx) => (
                  <tr key={p.code}>
                    <td>
                      <div className="region-cell">
                        <span className="region-cell__name">
                          {p.name}
                        </span>
                        <span className="region-cell__kind">
                          Ibukota: {p.capital}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "var(--ink)" }}>
                        <strong>{p.daerahCount}</strong> Daerah
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--ink-3)", display: "block" }}>
                        {p.kotaCount} Kota · {p.kabCount} Kabupaten
                      </span>
                    </td>
                    <td className="is-num">
                      <strong title={fullMoney(p.aggregateBudget.toString())}>
                        {compactMoney(p.aggregateBudget.toString())}
                      </strong>
                    </td>
                    <td>
                      <div className="rate-cell">
                        <span className="rate-cell__top">
                          <strong>{percent(p.modalAbsorptionRate)}</strong>
                          <span style={{ fontSize: "0.6875rem", color: "var(--ink-4)" }}>
                            (Target UU &ge;40%)
                          </span>
                        </span>
                        <span className="meter meter--thin">
                          <span
                            style={{
                              width: `${Math.min(p.modalAbsorptionRate, 100)}%`,
                              background:
                                p.modalAbsorptionRate >= 20
                                  ? "var(--ok)"
                                  : p.modalAbsorptionRate >= 17
                                    ? "var(--accent)"
                                    : "var(--warn-solid)",
                            }}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "var(--ink)" }}>
                        {percent(p.pegawaiAbsorptionRate)}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          display: "block",
                          color: p.pegawaiAbsorptionRate > 30 ? "var(--warn-ink)" : "var(--ok-ink)",
                        }}
                      >
                        {p.pegawaiAbsorptionRate > 30 ? "> Batas 30%" : "Sesuai UU"}
                      </span>
                    </td>
                    <td>
                      {p.statusIngestion === "Aktif Penuh" ? (
                        <span className="chip chip--ok chip--square" style={{ fontSize: "0.6875rem" }}>
                          <ShieldCheck size={11} /> Aktif (100%)
                        </span>
                      ) : p.statusIngestion === "In Progress" ? (
                        <span className="chip chip--info chip--square" style={{ fontSize: "0.6875rem" }}>
                          <Clock size={11} /> {p.progressPercent}%
                        </span>
                      ) : (
                        <span className="chip chip--sunk chip--square" style={{ fontSize: "0.6875rem" }}>
                          <Database size={11} /> Staged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards for Provinces */}
          <div className="region-cards">
            {filteredProvinces.map((p) => (
              <div key={p.code} className="provinsi-card">
                <div className="provinsi-card__head">
                  <div>
                    <h4 className="provinsi-card__name">{p.name}</h4>
                    <span className="provinsi-card__cap">Ibukota: {p.capital}</span>
                  </div>
                  {p.statusIngestion === "Aktif Penuh" ? (
                    <span className="chip chip--ok chip--square">Aktif Penuh</span>
                  ) : p.statusIngestion === "In Progress" ? (
                    <span className="chip chip--info chip--square">{p.progressPercent}% Ingestion</span>
                  ) : (
                    <span className="chip chip--sunk chip--square">Pipeline Rujukan</span>
                  )}
                </div>

                <div className="provinsi-card__metrics">
                  <div className="provinsi-card__metric-item">
                    <span>Estimasi Pagu Agregat</span>
                    <strong title={fullMoney(p.aggregateBudget.toString())}>
                      {compactMoney(p.aggregateBudget.toString())}
                    </strong>
                  </div>
                  <div className="provinsi-card__metric-item">
                    <span>Cakupan Wilayah</span>
                    <strong>{p.daerahCount} Daerah ({p.kotaCount} Kota, {p.kabCount} Kab)</strong>
                  </div>
                  <div className="provinsi-card__metric-item">
                    <span>Serapan Modal Fisik</span>
                    <strong style={{ color: "var(--ok)" }}>{percent(p.modalAbsorptionRate)}</strong>
                  </div>
                  <div className="provinsi-card__metric-item">
                    <span>Porsi Belanja Pegawai</span>
                    <strong>{percent(p.pegawaiAbsorptionRate)}</strong>
                  </div>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
                  <span>Daerah rujukan: </span>
                  <span style={{ color: "var(--ink-2)" }}>{p.featuredDaerah.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card__foot">
          <InfoNote>
            Estimasi agregat APBD se-Sumatera dihimpun dari konsolidasi data publik DJPK Kementerian Keuangan.
            Pembaruan ingestion modular dirilis bertahap per batch provinsi.
          </InfoNote>
        </div>
      </div>

      {/* 3 Regional Insights Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "var(--gap)",
        }}
      >
        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square chip--accent" style={{ marginBottom: 6 }}>
                Fiskal Raksasa
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Konsentrasi Anggaran Terbesar
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>
              <strong>Sumatera Utara ({compactMoney("63240000000000")})</strong> dan{" "}
              <strong>Sumatera Selatan ({compactMoney("44280000000000")})</strong> mengelola lebih dari 36% dari seluruh total APBD di Pulau Sumatera. Pengawasan publik di kedua provinsi ini memiliki dampak sistemik terhadap perekonomian regional.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square chip--ok" style={{ marginBottom: 6 }}>
                Efisiensi Modal
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Serapan Belanja Modal Tertinggi
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>
              <strong>Kepulauan Riau (21,1%)</strong> dan{" "}
              <strong>Bangka Belitung (20,3%)</strong> mencatatkan proporsi realisasi modal fisik terbaik. Sebaliknya, Bengkulu (16,4%) dan Aceh (16,8%) membutuhkan akselerasi lelang proyek dini demi mencegah kejar tayang akhir tahun.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square chip--info" style={{ marginBottom: 6 }}>
                Integritas Modular
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Pipeline Ingestion Otomatis
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>
              Setiap berkas XML/CSV dari 154 daerah melewati checksum SHA-256 yang identik dengan standar Sumatera Utara, menjamin seluruh angka belanja publik dapat diaudit ulang secara independen oleh masyarakat sipil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 3: Roadmap Skalabilitas Nasional (38 Provinsi · 514 Pemda)
// ============================================================================

export function NationalRoadmapView() {
  const summary = nationalFiscalSummary;

  return (
    <div className="stack" style={{ marginTop: "var(--gap)" }}>
      {/* Header Banner Nasional */}
      <section className="tier-banner tier-banner--purple" aria-labelledby="banner-nasional-heading">
        <div className="tier-banner__badges">
          <span className="chip chip--square" style={{ background: "#7C3AED", color: "#FFF" }}>
            <Globe size={13} /> Arsitektur Skalabilitas Tier 3
          </span>
          <span className="chip chip--accent chip--square">
            <span className="dot dot--modal" /> Roadmap Nasional
          </span>
          <span className="chip chip--sunk chip--square">
            38 Provinsi · 514 Daerah
          </span>
        </div>
        <h2 id="banner-nasional-heading" className="tier-banner__title">
          Roadmap Skalabilitas Nasional: 38 Provinsi · 514 Pemda Seluruh Indonesia
        </h2>
        <p className="tier-banner__lead">
          Membuka transparansi Rp 1,15 Kuadriliun belanja publik daerah di seluruh Indonesia — dari Sabang sampai Merauke.
          GovSight ID dirancang dengan arsitektur desentralistik untuk memetakan kepatuhan belanja modal terhadap amanat Undang-Undang HKPD No. 1/2022 di seluruh 6 gugus kepulauan Nusantara.
        </p>

        <div className="tier-banner__stats">
          <div className="tier-banner__stat">
            <span className="tier-banner__stat-label">Cakupan Nasional</span>
            <strong className="tier-banner__stat-val">514 Pemda</strong>
            <span className="tier-banner__stat-sub">38 Provinsi ({summary.totalKota} Kota · {summary.totalKabupaten} Kab)</span>
          </div>

          <div className="tier-banner__stat">
            <span className="tier-banner__stat-label">Konsolidasi APBD Nasional</span>
            <strong className="tier-banner__stat-val" title={fullMoney(summary.totalAggregateBudget.toString())}>
              Rp 1,15 Kuadriliun
            </strong>
            <span className="tier-banner__stat-sub">Pagu belanja publik se-Indonesia</span>
          </div>

          <div className="tier-banner__stat">
            <span className="tier-banner__stat-label">Gugus Kepulauan</span>
            <strong className="tier-banner__stat-val" style={{ color: "#7C3AED" }}>
              6 Gugus
            </strong>
            <span className="tier-banner__stat-sub">Sumatera, Jawa, Kalimantan, Sulawesi, Nusra, Papua</span>
          </div>

          <div className="tier-banner__stat">
            <span className="tier-banner__stat-label">Potensi Akselerasi Modal</span>
            <strong className="tier-banner__stat-val" style={{ color: "var(--ok)" }}>
              &gt;Rp 120 Triliun
            </strong>
            <span className="tier-banner__stat-sub">Pencegahan pola kejar tayang</span>
          </div>
        </div>
      </section>

      {/* 6 Gugus Kepulauan Roadmap Matrix */}
      <div className="card">
        <div className="card__head">
          <div>
            <h3 className="card__title">
              Distribusi Fiskal 6 Gugus Kepulauan Nusantara
            </h3>
            <p className="card__sub">
              Peta implementasi bertahap pengawasan APBD di 514 kabupaten dan kota di seluruh Indonesia.
            </p>
          </div>
          <span className="chip chip--accent">514 Daerah Terpetakan</span>
        </div>

        <div className="card__body">
          <div className="island-group-grid">
            {nationalIslandsGroups.map((gugus) => (
              <div key={gugus.id} className="island-card">
                <div className="island-card__head">
                  <div>
                    <h4 className="island-card__title">{gugus.name}</h4>
                    <span className="island-card__meta">
                      {gugus.provincesCount} Provinsi · {gugus.daerahCount} Daerah
                    </span>
                  </div>
                  <span
                    className={
                      gugus.phase.includes("Aktif")
                        ? "chip chip--ok chip--square"
                        : gugus.phase.includes("Q2")
                          ? "chip chip--info chip--square"
                          : "chip chip--sunk chip--square"
                    }
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {gugus.phase}
                  </span>
                </div>

                <div className="island-card__grid">
                  <div className="island-card__stat">
                    <span>Estimasi Pagu Agregat</span>
                    <strong title={fullMoney(gugus.aggregateBudget.toString())}>
                      {compactMoney(gugus.aggregateBudget.toString())}
                    </strong>
                  </div>
                  <div className="island-card__stat">
                    <span>Rata-rata Serapan Modal</span>
                    <strong style={{ color: "var(--ok)" }}>
                      {percent(gugus.modalAbsorptionRate)}
                    </strong>
                  </div>
                  <div className="island-card__stat">
                    <span>Porsi Belanja Pegawai</span>
                    <strong>{percent(gugus.pegawaiShareRate)}</strong>
                  </div>
                  <div className="island-card__stat">
                    <span>Lonjakan Akhir Tahun</span>
                    <strong style={{ color: "var(--warn-ink)" }}>
                      {gugus.yearEndModalSpikeRate}% Pemda
                    </strong>
                  </div>
                </div>

                <div className="island-card__foot">
                  <span>Status: <strong style={{ color: "var(--ink)" }}>{gugus.status}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card__foot">
          <InfoNote>
            Setiap gugus kepulauan memiliki karakteristik fiskal yang unik, dari dominasi kawasan metropolitan di Jawa hingga alokasi otonomi khusus dan tantangan geografis di Maluku-Papua.
          </InfoNote>
        </div>
      </div>

      {/* UU HKPD Compliance Analysis Section */}
      <div className="card" style={{ borderLeft: "4px solid var(--warn-solid)" }}>
        <div className="card__head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Scale size={16} style={{ color: "var(--warn-ink)" }} />
              <h3 className="card__title">
                Kepatuhan Mandat Nasional UU HKPD No. 1/2022
              </h3>
            </div>
            <p className="card__sub">
              Perbandingan rata-rata alokasi belanja daerah nasional terhadap batas hukum yang diwajibkan negara.
            </p>
          </div>
          <span className="chip chip--warn">Analisis Kesenjangan Fiskal</span>
        </div>

        <div className="card__body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 20,
            }}
          >
            {/* Belanja Modal: Mandat >= 40% */}
            <div
              style={{
                padding: "16px",
                background: "var(--canvas)",
                borderRadius: "var(--r)",
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <strong style={{ fontSize: "0.9375rem" }}>Belanja Modal Infrastruktur Publik</strong>
                <span className="chip chip--warn chip--square">Kesenjangan -21,8%</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-3)", margin: "0 0 12px" }}>
                Pasal 147 UU HKPD mewajibkan alokasi belanja modal infrastruktur pelayanan publik minimal <strong>40%</strong> dari total APBD.
              </p>

              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 4 }}>
                  <span>Realisasi Rata-rata Nasional: <strong>18,2%</strong></span>
                  <span style={{ color: "var(--ok-ink)", fontWeight: 600 }}>Target Hukum: &ge;40%</span>
                </div>
                <div className="meter" style={{ height: 10 }}>
                  <span style={{ width: "18.2%", background: "var(--warn-solid)" }} />
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--warn-ink)", fontWeight: 500 }}>
                Hanya segelintir daerah yang telah memenuhi mandat 40%. Mayoritas masih tertahan di rentang 15%–22%.
              </span>
            </div>

            {/* Belanja Pegawai: Batas <= 30% */}
            <div
              style={{
                padding: "16px",
                background: "var(--canvas)",
                borderRadius: "var(--r)",
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <strong style={{ fontSize: "0.9375rem" }}>Batas Maksimal Belanja Pegawai</strong>
                <span className="chip chip--warn chip--square">Melebihi Batas +4,6%</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-3)", margin: "0 0 12px" }}>
                Pasal 146 UU HKPD membatasi belanja aparatur/pegawai maksimal <strong>30%</strong> demi menjaga ruang belanja langsung bagi warga.
              </p>

              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 4 }}>
                  <span>Rata-rata Nasional: <strong>34,6%</strong></span>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>Batas Maksimal: &le;30%</span>
                </div>
                <div className="meter" style={{ height: 10 }}>
                  <span style={{ width: "34.6%", background: "var(--accent)" }} />
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
                Kelebihan alokasi belanja pegawai menekan kapasitas daerah dalam membangun rumah sakit, sekolah, dan jalan mantap.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Proyeksi Dampak Pengawasan Publik */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "var(--gap)",
        }}
      >
        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square chip--warn" style={{ marginBottom: 6 }}>
                Dampak 1
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Pencegahan Kejar Tayang Rp 126,8T
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>
              Dengan mendeteksi lonjakan belanja modal &gt;40% di akhir tahun anggaran, pengawasan publik dapat menyelamatkan kualitas fisik proyek infrastruktur senilai Rp 126,8 Triliun secara nasional dari risiko pekerjaan terburu-buru di musim hujan.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square chip--ok" style={{ marginBottom: 6 }}>
                Dampak 2
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Efisiensi Aparatur Rp 52,7T
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>
              Penurunan bertahap porsi belanja pegawai menuju ambang 30% berpotensi membebaskan ruang fiskal hingga Rp 52,7 Triliun per tahun untuk dialihkan langsung ke subsidi kesehatan warga, beasiswa, dan pengentasan kemiskinan ekstrem.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square chip--accent" style={{ marginBottom: 6 }}>
                Dampak 3
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Audit Terbuka 514 Pemda
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>
              Standar kriptografi SHA-256 membekali jurnalis, mahasiswa, dan komunitas warga dengan data primer yang sah secara metodologis, memutus asimetri informasi antara penyelenggara anggaran dan pembayar pajak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
