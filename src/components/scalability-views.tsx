"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
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
  X,
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

const pipelineStepsData = [
  {
    step: "01",
    name: "01. Sumber",
    title: "SIKD DJPK Kemenkeu",
    icon: Server,
    summary:
      "Ekstraksi berkas XML & CSV resmi secara bertahap via Token Bucket.",
    chipClass: "chip--square",
    spec: "Endpoint SIKD Portal (djpk.kemenkeu.go.id)",
    details:
      "Pengambilan data menggunakan mekanisme Token Bucket (maksimal 5 request/detik) dengan fallback retry eksponensial. Memastikan beban server portal kementerian tetap aman tanpa terpicu 429 Too Many Requests.",
    code: "GET /portal/data/apbd?tahun={year}&kodedaerah={code}\nFormat: Raw XML/CSV · Token Bucket: 5 req/s · Timeout: 8000ms",
  },
  {
    step: "02",
    name: "02. Integrity",
    title: "Vault SHA-256",
    icon: Key,
    summary:
      "Komputasi sidik jari digital sebelum berkas mentah disimpan permanen.",
    chipClass: "chip--ok chip--square",
    spec: "SHA-256 Cryptographic Checksum Engine",
    details:
      "Setiap berkas mentah yang diunduh langsung dihitung cryptographic hash SHA-256 (256-bit digest) di tingkat ingestion. Jika isi berkas berubah 1 byte pun di masa mendatang, checksum otomatis mismatch dan menggagalkan pipeline demi integritas audit publik.",
    code: "crypto.createHash('sha256').update(fileBuffer).digest('hex')\nIntegritas: 100% snapshot terverifikasi against SHA-256 registry",
  },
  {
    step: "03",
    name: "03. Precision",
    title: "Decimal.js Engine",
    icon: Scale,
    summary:
      "Aritmetika presisi 20 digit tanpa risiko galat pembulatan floating-point.",
    chipClass: "chip--accent chip--square",
    spec: "Arbitrary-Precision Decimal Arithmetic",
    details:
      "Uang publik menolak galat floating-point IEEE-754 (seperti 0.1 + 0.2 = 0.30000000000000004). Seluruh kalkulasi serapan, pagu, realisasi, dan selisih belanja dihitung dengan presisi mutlak 20 digit Decimal.js sebelum format tampilan.",
    code: "const rate = new Decimal(realized).dividedBy(budget).times(100).toDecimalPlaces(2);\nPresisi: Eksak hingga satuan rupiah terkecil tanpa distorsi kalkulasi",
  },
  {
    step: "04",
    name: "04. Partition",
    title: "Modular 3 Tier",
    icon: Database,
    summary:
      "Partisi regional (Sumut 33 → 154 → 552) dan Meta-Index ringan (<50 KB).",
    chipClass: "chip--square",
    spec: "Declarative Regional Chunk Partitioning",
    details:
      "Arsitektur monolitik 25MB ditolak karena menyebabkan OOM crash di ponsel ber-RAM 2GB–3GB. Data dipartisi per wilayah (Sumatera, Jawa, dsb.) dan tahun; pengguna hanya mengunduh search index awal <50 KB dan data daerah on-demand ~18 KB.",
    code: "Search Index: 48 KB (Gzip) · Region Detail: ~18 KB on-demand\nPencegahan OOM: 0 browser crash pada smartphone low-end",
  },
  {
    step: "05",
    name: "05. Delivery",
    title: "Edge Caching & Advokasi",
    icon: Smartphone,
    summary:
      "Respons cepat (<80ms) di ponsel warga plus integrasi SP4N-LAPOR!.",
    chipClass: "chip--square",
    spec: "Global Edge CDN & Citizen Inquiry Generator",
    details:
      "Respons data disajikan melalui Edge CDN dengan cache tag invalidation (<80ms). Dilengkapi fitur langsung: 1-click salin naskah telaah kritis dan draf pengaduan resmi terstruktur untuk portal aduan SP4N-LAPOR! Ombudsman/KemenPAN-RB.",
    code: "Cache-Control: public, s-maxage=86400, stale-while-revalidate=3600\nCivic Advocacy: Format Aduan Resmi SP4N-LAPOR! (UU No. 25/2009)",
  },
];

export function ScalabilityBlueprint3Tier({
  activeTier = 1,
  onSelectTier,
}: {
  activeTier?: 1 | 2 | 3;
  onSelectTier?: (tier: 1 | 2 | 3) => void;
}) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <section
      className="blueprint-card"
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
          <span className="chip chip--accent chip--square chip--responsive">
            <Layers size={13} style={{ flexShrink: 0 }} />{" "}
            <span className="label-desktop">
              Blueprint Arsitektur Skalabilitas
            </span>
            <span className="label-mobile">Blueprint Arsitektur</span>
          </span>
          <span className="chip chip--sunk chip--square chip--responsive">
            <span className="label-desktop">
              Sumut 33 → Sumatera 154 → Nasional 552 Pemda
            </span>
            <span className="label-mobile">
              33 Sumut → 154 Sumatera → 552 Nasional
            </span>
          </span>
          <span className="chip chip--ok chip--square chip--responsive">
            <ShieldCheck size={13} style={{ flexShrink: 0 }} /> Integritas
            SHA-256
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
          Transisi teknis dari sistem baseline 33 daerah di Sumatera Utara
          menuju pemrosesan ingestion modular 154 kabupaten/kota regional
          Sumatera dan konsolidasi 552 pemda se-Indonesia. Ketuk salah satu
          kartu tier di bawah untuk beralih mode cakupan atau kembali ke daerah
          asal.
        </p>
      </div>

      {/* 3 Tier Cards: Interactive Buttons that Apply Tier Selection */}
      <div
        className="blueprint-tiers-grid"
        role="tablist"
        aria-label="Pilihan Tingkat Skalabilitas GovSight ID"
      >
        {/* Tier 1: Sumatera Utara */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTier === 1}
          className={`blueprint-tier-card ${activeTier === 1 ? "is-active" : ""}`}
          onClick={() => onSelectTier?.(1)}
        >
          <div className="blueprint-tier-card__top">
            <div>
              <span className="blueprint-tier-card__tier">
                Tier 1 · Baseline
              </span>
              <strong className="blueprint-tier-card__name">
                Sumatera Utara
              </strong>
            </div>
            {activeTier === 1 ? (
              <span
                className="chip chip--ok chip--square"
                style={{ fontSize: "0.6875rem" }}
              >
                <CheckCircle2 size={11} /> 100% Aktif
              </span>
            ) : (
              <span
                className="chip chip--sunk chip--square"
                style={{ fontSize: "0.6875rem" }}
              >
                Kembali ke Sumut
              </span>
            )}
          </div>

          <div className="blueprint-tier-card__body">
            <strong>33 Pemda (8 Kota · 25 Kabupaten)</strong>
            <span>Pagu APBD: Rp 63,2 Triliun · 350+ Snapshot</span>
          </div>

          <div className="blueprint-tier-card__specs">
            <div>
              <strong style={{ color: "var(--ink)" }}>Arsitektur:</strong>{" "}
              In-Memory JSON Chunk (&lt;450 KB)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Integritas:</strong>{" "}
              SHA-256 Checksum per Berkas XML/CSV
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Evaluasi:</strong> Risiko
              Lonjakan Akhir Tahun &amp; Mandat Modal
            </div>
          </div>

          {activeTier !== 1 ? (
            <div className="blueprint-tier-card__cta">
              <ArrowLeft size={12} />
              <span>Tap untuk kembali ke 33 Pemda Sumut</span>
            </div>
          ) : (
            <div className="blueprint-tier-card__cta">
              <CheckCircle2 size={12} />
              <span>Sedang Ditampilkan (Home Base)</span>
            </div>
          )}
        </button>

        {/* Tier 2: Pulau Sumatera */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTier === 2}
          className={`blueprint-tier-card ${activeTier === 2 ? "is-active" : ""}`}
          onClick={() => onSelectTier?.(2)}
        >
          <div className="blueprint-tier-card__top">
            <div>
              <span className="blueprint-tier-card__tier">
                Tier 2 · Regional
              </span>
              <strong className="blueprint-tier-card__name">
                Pulau Sumatera
              </strong>
            </div>
            {activeTier === 2 ? (
              <span
                className="chip chip--info chip--square"
                style={{ fontSize: "0.6875rem" }}
              >
                <Clock size={11} /> Sedang Aktif
              </span>
            ) : (
              <span
                className="chip chip--sunk chip--square"
                style={{ fontSize: "0.6875rem" }}
              >
                33 Live · 121 Staged
              </span>
            )}
          </div>

          <div className="blueprint-tier-card__body">
            <strong>154 Pemda (10 Provinsi Se-Sumatera)</strong>
            <span>Pagu Agregat: Rp 296,8 Triliun · ~5.544 Snapshot</span>
          </div>

          <div className="blueprint-tier-card__specs">
            <div>
              <strong style={{ color: "var(--ink)" }}>Arsitektur:</strong>{" "}
              Partition Chunks per Provinsi (&lt;180 KB)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Integritas:</strong>{" "}
              Worker Pool Rate-Limited (5 req/s)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Evaluasi:</strong>{" "}
              Disparitas Fiskal Wilayah &amp; Serapan Modal
            </div>
          </div>

          {activeTier === 2 ? (
            <div className="blueprint-tier-card__cta">
              <CheckCircle2 size={12} />
              <span>Sedang Aktif (Preview Regional)</span>
            </div>
          ) : (
            <div className="blueprint-tier-card__cta">
              <span>Buka Matriks Sumatera (Tier 2)</span>
              <ArrowRight size={12} />
            </div>
          )}
        </button>

        {/* Tier 3: Seluruh Indonesia */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTier === 3}
          className={`blueprint-tier-card ${activeTier === 3 ? "is-active" : ""}`}
          onClick={() => onSelectTier?.(3)}
        >
          <div className="blueprint-tier-card__top">
            <div>
              <span className="blueprint-tier-card__tier">
                Tier 3 · Nasional
              </span>
              <strong className="blueprint-tier-card__name">
                Seluruh Indonesia
              </strong>
            </div>
            {activeTier === 3 ? (
              <span
                className="chip chip--accent chip--square"
                style={{ fontSize: "0.6875rem" }}
              >
                <Globe size={11} /> Sedang Aktif
              </span>
            ) : (
              <span
                className="chip chip--sunk chip--square"
                style={{ fontSize: "0.6875rem" }}
              >
                552 Pemda Otonom
              </span>
            )}
          </div>

          <div className="blueprint-tier-card__body">
            <strong>514 Kab/Kota + 38 Provinsi (6 Gugus)</strong>
            <span>Pagu Nasional: Rp 1,15 Kuadriliun · ~59.000 Snapshot</span>
          </div>

          <div className="blueprint-tier-card__specs">
            <div>
              <strong style={{ color: "var(--ink)" }}>Arsitektur:</strong> Neon
              Serverless PostgreSQL + Meta-Index (&lt;50 KB)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Integritas:</strong>{" "}
              Rantai Audit Publik Terbuka &amp; CDN Edge (&lt;80ms)
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Evaluasi:</strong> Mandat
              Pasal 146 &amp; 147 UU HKPD No. 1/2022
            </div>
          </div>

          {activeTier === 3 ? (
            <div className="blueprint-tier-card__cta">
              <CheckCircle2 size={12} />
              <span>Sedang Aktif (Roadmap Nasional)</span>
            </div>
          ) : (
            <div className="blueprint-tier-card__cta">
              <span>Buka Roadmap Nasional (Tier 3)</span>
              <ArrowRight size={12} />
            </div>
          )}
        </button>
      </div>

      {/* Diagram Representasi Alur Data (Interactive Data Flow Pipeline) */}
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
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
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
              Alur Pemrosesan Data Kriptografis (End-to-End Pipeline)
            </span>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--ink-2)",
                margin: "2px 0 0",
              }}
            >
              Ketuk salah satu langkah alur data di bawah untuk melihat
              spesifikasi teknis dan jaminan integritasnya:
            </p>
          </div>
          {expandedStep !== null && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setExpandedStep(null)}
              style={{ fontSize: "0.75rem", padding: "2px 8px", gap: "4px" }}
            >
              <X size={12} /> Tutup Detail
            </button>
          )}
        </div>

        {/* Interactive Pipeline Step Buttons */}
        <div
          className="blueprint-pipeline-grid"
          role="group"
          aria-label="5 Tahap Pipeline Data"
        >
          {pipelineStepsData.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            const isCurrent = expandedStep === idx;
            return (
              <button
                key={stepItem.step}
                type="button"
                className={`pipeline-step-btn ${isCurrent ? "is-active" : ""}`}
                onClick={() => setExpandedStep(isCurrent ? null : idx)}
                aria-expanded={isCurrent}
                aria-label={`Lihat detail ${stepItem.name}: ${stepItem.title}`}
              >
                <div className="pipeline-step-btn__head">
                  <span
                    className={`chip ${stepItem.chipClass}`}
                    style={{ fontSize: "0.6875rem", padding: "1px 6px" }}
                  >
                    {stepItem.name}
                  </span>
                  <Icon
                    size={13}
                    style={{
                      color: isCurrent ? "var(--accent)" : "var(--ink-3)",
                    }}
                  />
                </div>
                <strong className="pipeline-step-btn__title">
                  {stepItem.title}
                </strong>
                <span className="pipeline-step-btn__desc">
                  {stepItem.summary}
                </span>
              </button>
            );
          })}
        </div>

        {/* Technical Inspector Drawer (Toggles open/close on tap) */}
        {expandedStep !== null && (
          <div
            className="pipeline-drawer"
            role="region"
            aria-label="Spesifikasi Teknis Tahap Terpilih"
          >
            {(() => {
              const currentItem = pipelineStepsData[expandedStep];
              const CurrentIcon = currentItem.icon;
              return (
                <>
                  <div className="pipeline-drawer__head">
                    <h4 className="pipeline-drawer__title">
                      <CurrentIcon
                        size={16}
                        style={{ color: "var(--accent)" }}
                      />
                      <span>
                        {currentItem.name} · {currentItem.title} (
                        {currentItem.spec})
                      </span>
                    </h4>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => setExpandedStep(null)}
                      style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                    >
                      <X size={12} /> Kembali ke Tampilan Standar
                    </button>
                  </div>
                  <p className="pipeline-drawer__body" style={{ margin: 0 }}>
                    {currentItem.details}
                  </p>
                  <pre className="pipeline-drawer__code">
                    <code>{currentItem.code}</code>
                  </pre>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// TIER 2: Regional Pulau Sumatera (10 Provinsi · 154 Daerah)
// ============================================================================

export function RegionalSumateraMatrix({
  onSelectTier,
  showBlueprintCards = true,
}: {
  onSelectTier?: (tier: 1 | 2 | 3) => void;
  showBlueprintCards?: boolean;
} = {}) {
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<"nama" | "pagu" | "serapan">(
    "pagu",
  );

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
    const sum = sumateraProvinces.reduce(
      (acc, p) => acc + p.modalAbsorptionRate,
      0,
    );
    return Number((sum / sumateraProvinces.length).toFixed(1));
  }, []);

  const filteredProvinces = useMemo(() => {
    return sumateraProvinces
      .filter((p) => {
        const matchesQuery =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.featuredDaerah.some((d) =>
            d.toLowerCase().includes(searchQuery.toLowerCase()),
          );
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
        if (sortField === "serapan")
          return b.modalAbsorptionRate - a.modalAbsorptionRate;
        return a.name.localeCompare(b.name, "id");
      });
  }, [searchQuery, filterStatus, sortField]);

  return (
    <div className="stack" style={{ marginTop: "var(--gap)" }}>
      {/* Multi-Tier Back Navigation Bar */}
      <div className="tier-nav-bar">
        <button
          type="button"
          className="btn btn--secondary btn--sm tier-nav-btn"
          onClick={() => onSelectTier?.(1)}
          aria-label="Kembali ke Jelajah Anggaran 33 Pemda Sumut"
        >
          <ArrowLeft size={14} style={{ flexShrink: 0 }} />
          <span className="tier-nav-btn__text">Kembali ke 33 Pemda Sumut</span>
        </button>
        <div className="tier-nav-status">
          <span className="dot dot--info" style={{ flexShrink: 0 }} />
          <span>Mode Regional: 10 Provinsi · 154 Daerah Se-Sumatera</span>
        </div>
      </div>

      {/* 3-Tier Blueprint Component at top */}
      {showBlueprintCards && (
        <ScalabilityBlueprint3Tier activeTier={2} onSelectTier={onSelectTier} />
      )}

      {/* Banner Arsitektur Modular Sumatera (Flattened & Calm) */}
      <section
        className="card"
        style={{
          padding: "20px 22px",
          border: "1px solid var(--accent-line, #cbd5e1)",
          borderRadius: "var(--r)",
          background: "var(--paper)",
        }}
        aria-labelledby="banner-sumatera-heading"
      >
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
            <Layers size={13} /> Arsitektur Skalabilitas Tier 2
          </span>
          <span className="chip chip--info chip--square">
            Preview Regional Sumatera
          </span>
          <span className="chip chip--sunk chip--square">
            10 Provinsi Terpetakan
          </span>
        </div>
        <h2
          id="banner-sumatera-heading"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--ink)",
            lineHeight: 1.3,
          }}
        >
          Cakupan Regional Sumatera: 154 Kabupaten/Kota dalam proses ingestion
          modular per provinsi
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--ink-2)",
            lineHeight: 1.55,
            margin: "0 0 16px",
            maxWidth: "820px",
          }}
        >
          GovSight ID memperluas jangkauan pemantauan belanja publik dari
          Sumatera Utara menuju 10 provinsi di seluruh Pulau Sumatera. Sistem
          ingestion modular memproses 154 APBD kabupaten/kota dengan
          standardisasi skema SIKD Kementerian Keuangan dan verifikasi
          integritas data SHA-256.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
            gap: "12px",
            paddingTop: "14px",
            borderTop: "1px solid var(--line-2)",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              background: "var(--canvas)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-2)",
            }}
          >
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
              Cakupan Wilayah
            </span>
            <strong
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--ink)",
                display: "block",
                margin: "2px 0 1px",
              }}
            >
              10 Provinsi
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              154 Daerah ({totalKota} Kota · {totalKab} Kab)
            </span>
          </div>

          <div
            style={{
              padding: "10px 12px",
              background: "var(--canvas)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-2)",
            }}
          >
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
              Total Agregat APBD
            </span>
            <strong
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--ink)",
                display: "block",
                margin: "2px 0 1px",
              }}
              title={fullMoney(totalPagu.toString())}
            >
              {compactMoney(totalPagu.toString())}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Akumulasi pagu se-Sumatera
            </span>
          </div>

          <div
            style={{
              padding: "10px 12px",
              background: "var(--canvas)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-2)",
            }}
          >
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
              Rata-rata Serapan Modal
            </span>
            <strong
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--ok)",
                display: "block",
                margin: "2px 0 1px",
              }}
            >
              {percent(avgSerapanModal)}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Target UU HKPD: ≥40%
            </span>
          </div>

          <div
            style={{
              padding: "10px 12px",
              background: "var(--canvas)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-2)",
            }}
          >
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
              Status Ingestion
            </span>
            <strong
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--accent)",
                display: "block",
                margin: "2px 0 1px",
              }}
            >
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
              Matrix Fiskal Provinsi Se-Pulau Sumatera{" "}
              <span className="count">{filteredProvinces.length}</span>
            </h3>
            <p className="card__sub">
              Perbandingan pagu APBD, rata-rata serapan belanja modal
              infrastruktur, dan kesiapan pipeline ingestion data.
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
              <div
                className="segmented"
                role="group"
                aria-label="Filter status ingestion"
              >
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
          <div
            className="table-wrap matrix-table-wrap"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <table className="region-table">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Provinsi &amp; Ibukota</th>
                  <th style={{ width: "16%" }}>Cakupan Daerah</th>
                  <th className="is-num" style={{ width: "18%" }}>
                    Estimasi Agregat APBD
                  </th>
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
                        <span className="region-cell__name">{p.name}</span>
                        <span className="region-cell__kind">
                          Ibukota: {p.capital}
                        </span>
                        {p.code === "12" && onSelectTier && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => onSelectTier(1)}
                            style={{
                              marginTop: 6,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: "0.6875rem",
                              padding: "2px 7px",
                            }}
                            title="Buka 33 Daerah Terpantau Sumatera Utara"
                          >
                            <ArrowLeft size={11} /> Buka 33 Daerah Sumut
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{ fontSize: "0.8125rem", color: "var(--ink)" }}
                      >
                        <strong>{p.daerahCount}</strong> Daerah
                      </span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--ink-3)",
                          display: "block",
                        }}
                      >
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
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--ink-4)",
                            }}
                          >
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
                      <span
                        style={{ fontSize: "0.8125rem", color: "var(--ink)" }}
                      >
                        {percent(p.pegawaiAbsorptionRate)}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          display: "block",
                          color:
                            p.pegawaiAbsorptionRate > 30
                              ? "var(--warn-ink)"
                              : "var(--ok-ink)",
                        }}
                      >
                        {p.pegawaiAbsorptionRate > 30
                          ? "> Batas 30%"
                          : "Sesuai UU"}
                      </span>
                    </td>
                    <td>
                      {p.statusIngestion === "Aktif Penuh" ? (
                        <span
                          className="chip chip--ok chip--square"
                          style={{ fontSize: "0.6875rem" }}
                        >
                          <ShieldCheck size={11} /> Aktif (100%)
                        </span>
                      ) : p.statusIngestion === "In Progress" ? (
                        <span
                          className="chip chip--info chip--square"
                          style={{ fontSize: "0.6875rem" }}
                        >
                          <Clock size={11} /> {p.progressPercent}%
                        </span>
                      ) : (
                        <span
                          className="chip chip--sunk chip--square"
                          style={{ fontSize: "0.6875rem" }}
                        >
                          <Database size={11} /> Staged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards for Provinces (Touch-Friendly) */}
          <div className="matrix-cards">
            {filteredProvinces.map((p) => (
              <div
                key={p.code}
                className="provinsi-card"
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r)",
                  background: "var(--paper)",
                  padding: "14px 16px",
                }}
              >
                <div className="provinsi-card__head">
                  <div>
                    <h4 className="provinsi-card__name">{p.name}</h4>
                    <span className="provinsi-card__cap">
                      Ibukota: {p.capital}
                    </span>
                  </div>
                  {p.statusIngestion === "Aktif Penuh" ? (
                    <span className="chip chip--ok chip--square">
                      Aktif Penuh
                    </span>
                  ) : p.statusIngestion === "In Progress" ? (
                    <span className="chip chip--info chip--square">
                      {p.progressPercent}% Ingestion
                    </span>
                  ) : (
                    <span className="chip chip--sunk chip--square">
                      Pipeline Rujukan
                    </span>
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
                    <strong>
                      {p.daerahCount} Daerah ({p.kotaCount} Kota, {p.kabCount}{" "}
                      Kab)
                    </strong>
                  </div>
                  <div className="provinsi-card__metric-item">
                    <span>Serapan Modal Fisik</span>
                    <strong style={{ color: "var(--ok)" }}>
                      {percent(p.modalAbsorptionRate)}
                    </strong>
                  </div>
                  <div className="provinsi-card__metric-item">
                    <span>Porsi Belanja Pegawai</span>
                    <strong>{percent(p.pegawaiAbsorptionRate)}</strong>
                  </div>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
                  <span>Daerah rujukan: </span>
                  <span style={{ color: "var(--ink-2)" }}>
                    {p.featuredDaerah.join(", ")}
                  </span>
                </div>

                {p.code === "12" && onSelectTier && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: "1px dashed var(--line)",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => onSelectTier(1)}
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        gap: 6,
                        fontSize: "0.8125rem",
                      }}
                    >
                      <ArrowLeft size={13} /> Buka Jelajah 33 Pemda Sumut (Home
                      Base)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card__foot">
          <InfoNote>
            Estimasi agregat APBD se-Sumatera dihimpun dari konsolidasi data
            publik DJPK Kementerian Keuangan. Pembaruan ingestion modular
            dirilis bertahap per batch provinsi.
          </InfoNote>
        </div>
      </div>

      {/* 3 Regional Insights Cards (Calm Visual Hierarchy, Non-Gimmick) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "var(--gap)",
        }}
      >
        <div className="card">
          <div className="card__head">
            <div>
              <span
                className="chip chip--square"
                style={{ marginBottom: 6, fontSize: "0.6875rem" }}
              >
                Analisis Agregat
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Konsentrasi Anggaran Terbesar
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--ink-2)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              <strong>Sumatera Utara ({compactMoney("63240000000000")})</strong>{" "}
              dan{" "}
              <strong>
                Sumatera Selatan ({compactMoney("44280000000000")})
              </strong>{" "}
              mengelola lebih dari 36% dari seluruh total APBD di Pulau
              Sumatera. Pengawasan publik di kedua provinsi ini memiliki dampak
              sistemik terhadap stabilitas perekonomian regional.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span
                className="chip chip--square"
                style={{ marginBottom: 6, fontSize: "0.6875rem" }}
              >
                Kinerja Realisasi
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Serapan Belanja Modal Tertinggi
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--ink-2)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              <strong>Kepulauan Riau (21,1%)</strong> dan{" "}
              <strong>Bangka Belitung (20,3%)</strong> mencatatkan proporsi
              realisasi modal fisik terbaik. Sebaliknya, Bengkulu (16,4%) dan
              Aceh (16,8%) membutuhkan akselerasi lelang proyek dini demi
              mencegah kejar tayang akhir tahun.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span
                className="chip chip--ok chip--square"
                style={{ marginBottom: 6, fontSize: "0.6875rem" }}
              >
                Audit Integritas
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Standarisasi Checksum SHA-256
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--ink-2)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Setiap berkas XML/CSV dari 154 daerah melewati validasi checksum
              SHA-256 yang identik dengan standar Sumatera Utara, menjamin
              seluruh angka belanja publik dapat diaudit ulang secara independen
              oleh masyarakat sipil.
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

export function NationalRoadmapView({
  onSelectTier,
  showBlueprintCards = true,
}: {
  onSelectTier?: (tier: 1 | 2 | 3) => void;
  showBlueprintCards?: boolean;
} = {}) {
  const summary = nationalFiscalSummary;

  return (
    <div className="stack" style={{ marginTop: "var(--gap)" }}>
      {/* Multi-Tier Back Navigation Bar */}
      <div className="tier-nav-bar">
        <button
          type="button"
          className="btn btn--secondary btn--sm tier-nav-btn"
          onClick={() => onSelectTier?.(1)}
          aria-label="Kembali ke Jelajah Anggaran 33 Pemda Sumut"
        >
          <ArrowLeft size={14} style={{ flexShrink: 0 }} />
          <span className="tier-nav-btn__text">Kembali ke 33 Pemda Sumut</span>
        </button>
        <div className="tier-nav-status">
          <span className="dot dot--accent" style={{ flexShrink: 0 }} />
          <span>Mode Nasional: 38 Provinsi · 514 Daerah Seluruh Indonesia</span>
        </div>
      </div>

      {/* 3-Tier Blueprint Component at top */}
      {showBlueprintCards && (
        <ScalabilityBlueprint3Tier activeTier={3} onSelectTier={onSelectTier} />
      )}

      {/* Header Banner Nasional (Flattened & Calm, No Gimmick) */}
      <section
        className="card"
        style={{
          padding: "20px 22px",
          border: "1px solid var(--accent-line, #cbd5e1)",
          borderRadius: "var(--r)",
          background: "var(--paper)",
        }}
        aria-labelledby="banner-nasional-heading"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
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
        <h2
          id="banner-nasional-heading"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--ink)",
            lineHeight: 1.3,
          }}
        >
          Roadmap Skalabilitas Nasional: 38 Provinsi · 514 Pemda Seluruh
          Indonesia
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--ink-2)",
            lineHeight: 1.55,
            margin: "0 0 16px",
            maxWidth: "820px",
          }}
        >
          Membuka transparansi Rp 1,15 Kuadriliun belanja publik daerah di
          seluruh Indonesia — dari Sabang sampai Merauke. GovSight ID dirancang
          dengan arsitektur desentralistik untuk memetakan kepatuhan belanja
          modal terhadap amanat Undang-Undang HKPD No. 1/2022 di seluruh 6 gugus
          kepulauan Nusantara.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
            gap: "12px",
            paddingTop: "14px",
            borderTop: "1px solid var(--line-2)",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              background: "var(--canvas)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-2)",
            }}
          >
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
              Cakupan Nasional
            </span>
            <strong
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--ink)",
                display: "block",
                margin: "2px 0 1px",
              }}
            >
              514 Pemda
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              38 Provinsi ({summary.totalKota} Kota · {summary.totalKabupaten}{" "}
              Kab)
            </span>
          </div>

          <div
            style={{
              padding: "10px 12px",
              background: "var(--canvas)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-2)",
            }}
          >
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
              Konsolidasi APBD Nasional
            </span>
            <strong
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--ink)",
                display: "block",
                margin: "2px 0 1px",
              }}
              title={fullMoney(summary.totalAggregateBudget.toString())}
            >
              Rp 1,15 Kuadriliun
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Pagu belanja publik se-Indonesia
            </span>
          </div>

          <div
            style={{
              padding: "10px 12px",
              background: "var(--canvas)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-2)",
            }}
          >
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
              Gugus Kepulauan
            </span>
            <strong
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--ink)",
                display: "block",
                margin: "2px 0 1px",
              }}
            >
              6 Gugus
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Sumatera, Jawa, Kalimantan, Sulawesi, Nusra, Papua
            </span>
          </div>

          <div
            style={{
              padding: "10px 12px",
              background: "var(--canvas)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-2)",
            }}
          >
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
              Potensi Akselerasi Modal
            </span>
            <strong
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--ok)",
                display: "block",
                margin: "2px 0 1px",
              }}
            >
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
              Peta implementasi bertahap pengawasan APBD di 514 kabupaten dan
              kota di seluruh Indonesia.
            </p>
          </div>
          <span className="chip chip--accent">514 Daerah Terpetakan</span>
        </div>

        <div className="card__body">
          <div className="island-group-grid">
            {nationalIslandsGroups.map((gugus) => (
              <div
                key={gugus.id}
                className="island-card"
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r)",
                  background: "var(--paper)",
                }}
              >
                <div className="island-card__head">
                  <div>
                    <h4 className="island-card__title">{gugus.name}</h4>
                    <span className="island-card__meta">
                      {gugus.provincesCount} Provinsi · {gugus.daerahCount}{" "}
                      Daerah
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
                  <span>
                    Status:{" "}
                    <strong style={{ color: "var(--ink)" }}>
                      {gugus.status}
                    </strong>
                  </span>
                </div>

                {gugus.name === "Sumatera" && onSelectTier && (
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "1px dashed var(--line)",
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => onSelectTier(2)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      Buka Matriks Sumatera (Tier 2) →
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => onSelectTier(1)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <ArrowLeft size={12} /> Kembali ke Sumut (Tier 1)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card__foot">
          <InfoNote>
            Setiap gugus kepulauan memiliki karakteristik fiskal yang unik, dari
            dominasi kawasan metropolitan di Jawa hingga alokasi otonomi khusus
            dan tantangan geografis di Maluku-Papua.
          </InfoNote>
        </div>
      </div>

      {/* UU HKPD Compliance Analysis Section (Flattened Containers) */}
      <div
        className="card"
        style={{ border: "1px solid var(--warn-line, #fde68a)" }}
      >
        <div className="card__head">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Scale size={16} style={{ color: "var(--warn-ink)" }} />
              <h3 className="card__title">
                Kepatuhan Mandat Nasional UU HKPD No. 1/2022
              </h3>
            </div>
            <p className="card__sub">
              Perbandingan rata-rata alokasi belanja daerah nasional terhadap
              batas hukum yang diwajibkan negara.
            </p>
          </div>
          <span className="chip chip--warn">Analisis Kesenjangan Fiskal</span>
        </div>

        <div className="card__body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <strong style={{ fontSize: "0.9375rem" }}>
                  Belanja Modal Infrastruktur Publik
                </strong>
                <span className="chip chip--warn chip--square">
                  Kesenjangan -21,8%
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--ink-3)",
                  margin: "0 0 12px",
                  lineHeight: 1.5,
                }}
              >
                Pasal 147 UU HKPD mewajibkan alokasi belanja modal infrastruktur
                pelayanan publik minimal <strong>40%</strong> dari total APBD.
              </p>

              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    marginBottom: 4,
                  }}
                >
                  <span>
                    Realisasi Rata-rata Nasional: <strong>18,2%</strong>
                  </span>
                  <span style={{ color: "var(--ok-ink)", fontWeight: 600 }}>
                    Target Hukum: &ge;40%
                  </span>
                </div>
                <div className="meter" style={{ height: 10 }}>
                  <span
                    style={{ width: "18.2%", background: "var(--warn-solid)" }}
                  />
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--warn-ink)",
                  fontWeight: 500,
                }}
              >
                Hanya segelintir daerah yang telah memenuhi mandat 40%.
                Mayoritas masih tertahan di rentang 15%–22%.
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <strong style={{ fontSize: "0.9375rem" }}>
                  Batas Maksimal Belanja Pegawai
                </strong>
                <span className="chip chip--warn chip--square">
                  Melebihi Batas +4,6%
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--ink-3)",
                  margin: "0 0 12px",
                  lineHeight: 1.5,
                }}
              >
                Pasal 146 UU HKPD membatasi belanja aparatur/pegawai maksimal{" "}
                <strong>30%</strong> demi menjaga ruang belanja langsung bagi
                warga.
              </p>

              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    marginBottom: 4,
                  }}
                >
                  <span>
                    Rata-rata Nasional: <strong>34,6%</strong>
                  </span>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                    Batas Maksimal: &le;30%
                  </span>
                </div>
                <div className="meter" style={{ height: 10 }}>
                  <span
                    style={{ width: "34.6%", background: "var(--accent)" }}
                  />
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
                Kelebihan alokasi belanja pegawai menekan kapasitas daerah dalam
                membangun rumah sakit, sekolah, dan jalan mantap.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Proyeksi Dampak Pengawasan Publik (Calm Civic Tech Tone) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "var(--gap)",
        }}
      >
        <div className="card">
          <div className="card__head">
            <div>
              <span
                className="chip chip--square"
                style={{ marginBottom: 6, fontSize: "0.6875rem" }}
              >
                Pengawasan Proyek
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Mitigasi Risiko Pelaksanaan Proyek Akhir Tahun
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--ink-2)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Dengan mendeteksi lonjakan belanja modal &gt;40% di akhir tahun
              anggaran, pengawasan publik dapat menyelamatkan kualitas fisik
              proyek infrastruktur senilai Rp 126,8 Triliun secara nasional dari
              risiko pekerjaan terburu-buru di musim hujan.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span
                className="chip chip--square"
                style={{ marginBottom: 6, fontSize: "0.6875rem" }}
              >
                Efisiensi Anggaran
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Optimalisasi Alokasi Belanja Pegawai Sesuai Mandat HKPD
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--ink-2)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Penurunan bertahap porsi belanja pegawai menuju ambang batas 30%
              berpotensi membebaskan ruang fiskal hingga Rp 52,7 Triliun per
              tahun untuk dialihkan langsung ke subsidi kesehatan warga,
              beasiswa pendidikan, dan program pengentasan kemiskinan ekstrem.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <span
                className="chip chip--square chip--ok"
                style={{ marginBottom: 6, fontSize: "0.6875rem" }}
              >
                Integritas Terbuka
              </span>
              <h3 className="card__title" style={{ fontSize: "0.9375rem" }}>
                Standardisasi Audit Kriptografis 552 Pemda
              </h3>
            </div>
          </div>
          <div className="card__body">
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--ink-2)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Standar kriptografi SHA-256 membekali jurnalis, akademisi, dan
              organisasi masyarakat sipil dengan data primer yang sah secara
              metodologis, memutus asimetri informasi antara penyelenggara
              anggaran dan pembayar pajak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
