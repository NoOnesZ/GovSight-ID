"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
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
  FileText,
  Globe,
  HardDrive,
  Info,
  Key,
  Landmark,
  Layers,
  MapPin,
  Scale,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Wallet,
  Zap,
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
// BLUEPRINT ARSITEKTUR 3 TIER (Sumut 33 -> Sumatra 154 -> Nasional 552)
// ============================================================================

export function ScalabilityBlueprint3Tier({
  activeTier,
}: {
  activeTier?: 1 | 2 | 3;
}) {
  return (
    <section
      className="card"
      style={{
        padding: "22px 24px",
        borderRadius: "var(--r)",
        border: "1px solid var(--line)",
        background: "var(--paper)",
        marginBottom: "var(--gap)",
      }}
      aria-labelledby="scalability-blueprint-heading"
    >
      {/* Header Blueprint */}
      <div style={{ marginBottom: "18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          <span className="chip chip--accent chip--square">
            <Layers size={13} /> Blueprint Arsitektur Skalabilitas
          </span>
          <span className="chip chip--sunk chip--square">
            Sumut 33 → Sumatera 154 → Nasional 552 Pemda
          </span>
          <span className="chip chip--ok chip--square">
            <ShieldCheck size={13} /> Integritas SHA-256
          </span>
        </div>
        <h2
          id="scalability-blueprint-heading"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            margin: "0 0 6px",
            lineHeight: 1.35,
          }}
        >
          Cetak Biru Rekayasa Skalabilitas GovSight ID
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--ink-2)",
            lineHeight: 1.55,
            margin: 0,
            maxWidth: "840px",
          }}
        >
          Transisi teknis dari sistem baseline 33 daerah di Sumatera Utara menuju pemrosesan ingestion modular 154 kabupaten/kota regional Sumatera dan konsolidasi 552 pemda se-Indonesia. Dirancang dengan presisi rupiah mutlak dan efisiensi payload perangkat seluler warga.
        </p>
      </div>

      {/* 3 Tier Cards: Flattened, Calm Visual Hierarchy */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        {/* Tier 1: Sumatera Utara */}
        <div
          style={{
            padding: "16px 18px",
            background: activeTier === 1 ? "var(--canvas)" : "var(--paper)",
            border: activeTier === 1 ? "2px solid var(--accent)" : "1px solid var(--line)",
            borderRadius: "var(--r)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--ink-3)",
                  display: "block",
                }}
              >
                Tier 1 · Baseline
              </span>
              <strong style={{ fontSize: "1rem", color: "var(--ink)", display: "block", marginTop: "2px" }}>
                Sumatera Utara
              </strong>
            </div>
            <span className="chip chip--ok chip--square" style={{ fontSize: "0.6875rem" }}>
              <CheckCircle2 size={11} /> 100% Aktif
            </span>
          </div>

          <div style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
            <span style={{ display: "block", color: "var(--ink)", fontWeight: 600 }}>
              33 Pemda (8 Kota · 25 Kabupaten)
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", display: "block" }}>
              Pagu APBD: Rp 63,2 Triliun · 350+ Snapshot
            </span>
          </div>

          <div
            style={{
              paddingTop: "10px",
              borderTop: "1px solid var(--line-2)",
              fontSize: "0.75rem",
              color: "var(--ink-2)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div>
              <strong style={{ color: "var(--ink)" }}>Arsitektur:</strong> In-Memory JSON Chunk (&lt;450 KB)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Integritas:</strong> SHA-256 Checksum per Berkas XML/CSV
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Evaluasi:</strong> Risiko Lonjakan Akhir Tahun &amp; Mandat Modal
            </div>
          </div>
        </div>

        {/* Tier 2: Regional Pulau Sumatera */}
        <div
          style={{
            padding: "16px 18px",
            background: activeTier === 2 ? "var(--canvas)" : "var(--paper)",
            border: activeTier === 2 ? "2px solid var(--accent)" : "1px solid var(--line)",
            borderRadius: "var(--r)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--ink-3)",
                  display: "block",
                }}
              >
                Tier 2 · Regional
              </span>
              <strong style={{ fontSize: "1rem", color: "var(--ink)", display: "block", marginTop: "2px" }}>
                Pulau Sumatera
              </strong>
            </div>
            <span className="chip chip--info chip--square" style={{ fontSize: "0.6875rem" }}>
              <Clock size={11} /> 33 Live · 121 Staged
            </span>
          </div>

          <div style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
            <span style={{ display: "block", color: "var(--ink)", fontWeight: 600 }}>
              154 Pemda (10 Provinsi Se-Sumatera)
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", display: "block" }}>
              Pagu Agregat: Rp 296,8 Triliun · ~5.544 Snapshot
            </span>
          </div>

          <div
            style={{
              paddingTop: "10px",
              borderTop: "1px solid var(--line-2)",
              fontSize: "0.75rem",
              color: "var(--ink-2)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div>
              <strong style={{ color: "var(--ink)" }}>Arsitektur:</strong> Partition Chunks per Provinsi (&lt;180 KB)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Integritas:</strong> Worker Pool Rate-Limited (5 req/s)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Evaluasi:</strong> Disparitas Fiskal Wilayah &amp; Serapan Modal
            </div>
          </div>
        </div>

        {/* Tier 3: Skalabilitas Nasional */}
        <div
          style={{
            padding: "16px 18px",
            background: activeTier === 3 ? "var(--canvas)" : "var(--paper)",
            border: activeTier === 3 ? "2px solid var(--accent)" : "1px solid var(--line)",
            borderRadius: "var(--r)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--ink-3)",
                  display: "block",
                }}
              >
                Tier 3 · Nasional
              </span>
              <strong style={{ fontSize: "1rem", color: "var(--ink)", display: "block", marginTop: "2px" }}>
                Seluruh Indonesia
              </strong>
            </div>
            <span className="chip chip--square" style={{ fontSize: "0.6875rem", background: "var(--canvas)", border: "1px solid var(--line)" }}>
              <Globe size={11} /> 552 Pemda Otonom
            </span>
          </div>

          <div style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
            <span style={{ display: "block", color: "var(--ink)", fontWeight: 600 }}>
              514 Kab/Kota + 38 Provinsi (6 Gugus)
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", display: "block" }}>
              Pagu Nasional: Rp 1,15 Kuadriliun · ~59.000 Snapshot
            </span>
          </div>

          <div
            style={{
              paddingTop: "10px",
              borderTop: "1px solid var(--line-2)",
              fontSize: "0.75rem",
              color: "var(--ink-2)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div>
              <strong style={{ color: "var(--ink)" }}>Arsitektur:</strong> Neon Serverless PostgreSQL + Meta-Index (&lt;50 KB)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Integritas:</strong> Rantai Audit Publik Terbuka &amp; CDN Edge (&lt;80ms)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Evaluasi:</strong> Mandat Pasal 146 &amp; 147 UU HKPD No. 1/2022
            </div>
          </div>
        </div>
      </div>

      {/* Diagram Representasi Alur Data (Data Flow Pipeline) */}
      <div
        style={{
          padding: "16px",
          background: "var(--canvas)",
          borderRadius: "var(--r)",
          border: "1px solid var(--line)",
          overflow: "hidden",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--ink-3)",
              display: "block",
            }}
          >
            Alur Pemrosesan Data Kriptografis (End-to-End Pipeline)
          </span>
          <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", margin: "2px 0 0" }}>
            Transisi data dari pengambilan arsip primer pemerintah hingga presentasi analitis tanpa galat pembulatan.
          </p>
        </div>

        {/* Responsive Pipeline Steps: Wraps cleanly on mobile without horizontal scroll */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "10px",
            width: "100%",
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              padding: "12px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="chip chip--square" style={{ fontSize: "0.6875rem", padding: "1px 6px" }}>
                01. Sumber
              </span>
              <Server size={13} style={{ color: "var(--ink-3)" }} />
            </div>
            <strong style={{ fontSize: "0.8125rem", color: "var(--ink)", marginTop: "2px" }}>
              SIKD DJPK Kemenkeu
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", lineHeight: 1.4 }}>
              Ekstraksi berkas XML &amp; CSV resmi secara bertahap via Token Bucket.
            </span>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: "12px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="chip chip--ok chip--square" style={{ fontSize: "0.6875rem", padding: "1px 6px" }}>
                02. Integrity
              </span>
              <Key size={13} style={{ color: "var(--ok)" }} />
            </div>
            <strong style={{ fontSize: "0.8125rem", color: "var(--ink)", marginTop: "2px" }}>
              Vault SHA-256
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", lineHeight: 1.4 }}>
              Komputasi sidik jari digital sebelum berkas mentah disimpan permanen.
            </span>
          </div>

          {/* Step 3 */}
          <div
            style={{
              padding: "12px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="chip chip--accent chip--square" style={{ fontSize: "0.6875rem", padding: "1px 6px" }}>
                03. Precision
              </span>
              <Scale size={13} style={{ color: "var(--accent)" }} />
            </div>
            <strong style={{ fontSize: "0.8125rem", color: "var(--ink)", marginTop: "2px" }}>
              Decimal.js Engine
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", lineHeight: 1.4 }}>
              Aritmetika presisi 20 digit tanpa risiko galat pembulatan floating-point.
            </span>
          </div>

          {/* Step 4 */}
          <div
            style={{
              padding: "12px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="chip chip--square" style={{ fontSize: "0.6875rem", padding: "1px 6px" }}>
                04. Partition
              </span>
              <Database size={13} style={{ color: "var(--ink-3)" }} />
            </div>
            <strong style={{ fontSize: "0.8125rem", color: "var(--ink)", marginTop: "2px" }}>
              Modular 3 Tier
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", lineHeight: 1.4 }}>
              Partisi regional (Sumut 33 → 154 → 552) dan Meta-Index ringan (&lt;50 KB).
            </span>
          </div>

          {/* Step 5 */}
          <div
            style={{
              padding: "12px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="chip chip--square" style={{ fontSize: "0.6875rem", padding: "1px 6px" }}>
                05. Delivery
              </span>
              <Smartphone size={13} style={{ color: "var(--ink-3)" }} />
            </div>
            <strong style={{ fontSize: "0.8125rem", color: "var(--ink)", marginTop: "2px" }}>
              Edge Caching &amp; Advokasi
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", lineHeight: 1.4 }}>
              Respons cepat (&lt;80ms) di ponsel warga plus integrasi SP4N-LAPOR!.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

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
      {/* 3-Tier Blueprint Component at top */}
      <ScalabilityBlueprint3Tier activeTier={2} />

      {/* Banner Arsitektur Modular Sumatera (Flattened & Calm) */}
      <section
        className="card"
        style={{
          padding: "20px 22px",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          background: "var(--paper)",
          borderLeft: "4px solid var(--accent)",
        }}
        aria-labelledby="banner-sumatera-heading"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
          <span className="chip chip--accent chip--square">
            <Layers size={13} /> Arsitektur Skalabilitas Tier 2
          </span>
          <span className="chip chip--info chip--square">
            Preview Regional Sumatera
          </span>
          <span className="chip chip--sunk chip--square">
            10 Provinsi Terpetakan
          </span>
        </div>
        <h2 id="banner-sumatera-heading" style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px", color: "var(--ink)", lineHeight: 1.3 }}>
          Cakupan Regional Sumatera: 154 Kabupaten/Kota dalam proses ingestion modular per provinsi
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--ink-2)", lineHeight: 1.55, margin: "0 0 16px", maxWidth: "820px" }}>
          GovSight ID memperluas jangkauan pemantauan belanja publik dari Sumatera Utara menuju 10 provinsi di seluruh Pulau Sumatera.
          Sistem ingestion modular memproses 154 APBD kabupaten/kota dengan standardisasi skema SIKD Kementerian Keuangan dan verifikasi integritas data SHA-256.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
            gap: "12px",
            paddingTop: "14px",
            borderTop: "1px solid var(--line-2)",
          }}
        >
          <div style={{ padding: "10px 12px", background: "var(--canvas)", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-3)", display: "block" }}>
              Cakupan Wilayah
            </span>
            <strong style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)", display: "block", margin: "2px 0 1px" }}>
              10 Provinsi
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              154 Daerah ({totalKota} Kota · {totalKab} Kab)
            </span>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--canvas)", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-3)", display: "block" }}>
              Total Agregat APBD
            </span>
            <strong style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)", display: "block", margin: "2px 0 1px" }} title={fullMoney(totalPagu.toString())}>
              {compactMoney(totalPagu.toString())}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Akumulasi pagu se-Sumatera
            </span>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--canvas)", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-3)", display: "block" }}>
              Rata-rata Serapan Modal
            </span>
            <strong style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ok)", display: "block", margin: "2px 0 1px" }}>
              {percent(avgSerapanModal)}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Target UU HKPD: ≥40%
            </span>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--canvas)", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-3)", display: "block" }}>
              Status Ingestion
            </span>
            <strong style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent)", display: "block", margin: "2px 0 1px" }}>
              33 Live · 121 Staged
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Sumut aktif penuh, 9 provinsi staging
            </span>
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

          {/* Desktop Table View with smooth touch scrolling */}
          <div className="table-wrap" style={{ WebkitOverflowScrolling: "touch" }}>
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
                {filteredProvinces.map((p) => (
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

          {/* Mobile Cards for Provinces (Flattened) */}
          <div className="region-cards">
            {filteredProvinces.map((p) => (
              <div key={p.code} className="provinsi-card" style={{ border: "1px solid var(--line)", borderRadius: "var(--r)", background: "var(--paper)", padding: "14px 16px" }}>
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

      {/* 3 Regional Insights Cards (Calm Visual Hierarchy, Non-Gimmick) */}
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
              <span className="chip chip--square" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
                Analisis Agregat
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Konsentrasi Anggaran Terbesar
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
              <strong>Sumatera Utara ({compactMoney("63240000000000")})</strong> dan{" "}
              <strong>Sumatera Selatan ({compactMoney("44280000000000")})</strong> mengelola lebih dari 36% dari seluruh total APBD di Pulau Sumatera. Pengawasan publik di kedua provinsi ini memiliki dampak sistemik terhadap stabilitas perekonomian regional.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
                Kinerja Realisasi
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Serapan Belanja Modal Tertinggi
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
              <strong>Kepulauan Riau (21,1%)</strong> dan{" "}
              <strong>Bangka Belitung (20,3%)</strong> mencatatkan proporsi realisasi modal fisik terbaik. Sebaliknya, Bengkulu (16,4%) dan Aceh (16,8%) membutuhkan akselerasi lelang proyek dini demi mencegah kejar tayang akhir tahun.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--ok chip--square" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
                Audit Integritas
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Standarisasi Checksum SHA-256
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
              Setiap berkas XML/CSV dari 154 daerah melewati validasi checksum SHA-256 yang identik dengan standar Sumatera Utara, menjamin seluruh angka belanja publik dapat diaudit ulang secara independen oleh masyarakat sipil.
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
      {/* 3-Tier Blueprint Component at top */}
      <ScalabilityBlueprint3Tier activeTier={3} />

      {/* Header Banner Nasional (Flattened & Calm, No Gimmick) */}
      <section
        className="card"
        style={{
          padding: "20px 22px",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          background: "var(--paper)",
          borderLeft: "4px solid var(--accent)",
        }}
        aria-labelledby="banner-nasional-heading"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
          <span className="chip chip--square">
            <Globe size={13} /> Arsitektur Skalabilitas Tier 3
          </span>
          <span className="chip chip--accent chip--square">
            Roadmap Nasional
          </span>
          <span className="chip chip--sunk chip--square">
            38 Provinsi · 514 Daerah
          </span>
        </div>
        <h2 id="banner-nasional-heading" style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px", color: "var(--ink)", lineHeight: 1.3 }}>
          Roadmap Skalabilitas Nasional: 38 Provinsi · 514 Pemda Seluruh Indonesia
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--ink-2)", lineHeight: 1.55, margin: "0 0 16px", maxWidth: "820px" }}>
          Membuka transparansi Rp 1,15 Kuadriliun belanja publik daerah di seluruh Indonesia — dari Sabang sampai Merauke.
          GovSight ID dirancang dengan arsitektur desentralistik untuk memetakan kepatuhan belanja modal terhadap amanat Undang-Undang HKPD No. 1/2022 di seluruh 6 gugus kepulauan Nusantara.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
            gap: "12px",
            paddingTop: "14px",
            borderTop: "1px solid var(--line-2)",
          }}
        >
          <div style={{ padding: "10px 12px", background: "var(--canvas)", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-3)", display: "block" }}>
              Cakupan Nasional
            </span>
            <strong style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)", display: "block", margin: "2px 0 1px" }}>
              514 Pemda
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              38 Provinsi ({summary.totalKota} Kota · {summary.totalKabupaten} Kab)
            </span>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--canvas)", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-3)", display: "block" }}>
              Konsolidasi APBD Nasional
            </span>
            <strong style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)", display: "block", margin: "2px 0 1px" }} title={fullMoney(summary.totalAggregateBudget.toString())}>
              Rp 1,15 Kuadriliun
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Pagu belanja publik se-Indonesia
            </span>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--canvas)", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-3)", display: "block" }}>
              Gugus Kepulauan
            </span>
            <strong style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)", display: "block", margin: "2px 0 1px" }}>
              6 Gugus
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Sumatera, Jawa, Kalimantan, Sulawesi, Nusra, Papua
            </span>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--canvas)", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-3)", display: "block" }}>
              Potensi Akselerasi Modal
            </span>
            <strong style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ok)", display: "block", margin: "2px 0 1px" }}>
              &gt;Rp 120 Triliun
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Pencegahan pola kejar tayang
            </span>
          </div>
        </div>
      </section>

      {/* 6 Gugus Kepulauan Roadmap Matrix (Flattened Cards) */}
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
              <div key={gugus.id} className="island-card" style={{ border: "1px solid var(--line)", borderRadius: "var(--r)", background: "var(--paper)" }}>
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

      {/* UU HKPD Compliance Analysis Section (Flattened Containers) */}
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
              gap: 16,
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
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-3)", margin: "0 0 12px", lineHeight: 1.5 }}>
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
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-3)", margin: "0 0 12px", lineHeight: 1.5 }}>
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

      {/* Proyeksi Dampak Pengawasan Publik (Calm Civic Tech Tone) */}
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
              <span className="chip chip--square" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
                Pengawasan Proyek
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Mitigasi Risiko Pelaksanaan Proyek Akhir Tahun
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
              Dengan mendeteksi lonjakan belanja modal &gt;40% di akhir tahun anggaran, pengawasan publik dapat menyelamatkan kualitas fisik proyek infrastruktur senilai Rp 126,8 Triliun secara nasional dari risiko pekerjaan terburu-buru di musim hujan.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
                Efisiensi Anggaran
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Optimalisasi Alokasi Belanja Pegawai Sesuai Mandat HKPD
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
              Penurunan bertahap porsi belanja pegawai menuju ambang batas 30% berpotensi membebaskan ruang fiskal hingga Rp 52,7 Triliun per tahun untuk dialihkan langsung ke subsidi kesehatan warga, beasiswa pendidikan, dan program pengentasan kemiskinan ekstrem.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--square chip--ok" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
                Integritas Terbuka
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Standardisasi Audit Kriptografis 552 Pemda
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
              Standar kriptografi SHA-256 membekali jurnalis, akademisi, dan organisasi masyarakat sipil dengan data primer yang sah secara metodologis, memutus asimetri informasi antara penyelenggara anggaran dan pembayar pajak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
