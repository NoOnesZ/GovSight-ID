"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code,
  Compass,
  Cpu,
  Database,
  Download,
  FileCheck2,
  FileText,
  Globe,
  HardDrive,
  Layers,
  Server,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import type { Dataset } from "@/lib/types";
import {
  sumateraProvinces,
  nationalIslandsGroups,
} from "@/lib/scalability-data";
import {
  ScalabilityBlueprint3Tier,
  RegionalSumateraMatrix,
  NationalRoadmapView,
} from "./scalability-views";

const scalabilityPhases = [
  {
    step: "01",
    phaseKey: "tahap-1",
    title: "Tahap 1: 10 Pemda Sumut (Pilot Terverifikasi)",
    shortTitle: "10 Daerah Sumut",
    badge: "Aktif Penuh (100% Lulus Uji)",
    badgeVariant: "chip--ok",
    icon: Database,
    scope: "10 Kab/Kota Sumatera Utara",
    scopeDesc:
      "Medan, Binjai, Deli Serdang, Karo, Langkat, Pematangsiantar, Simalungun, Asahan, Tebing Tinggi, Dairi",
    snapshots: "350 Snapshot (2023–2026)",
    rawSize: "~450 KB (JSON Tunggal)",
    clientPayload: "450 KB (Gzip: ~68 KB)",
    latencyTarget: "< 50 ms (TTFB)",
    throughputTarget: "50 – 100 req/s",
    storageArch: "Static In-Memory JSON (data/snapshots.json)",
    partitionStrategy: "Monolitik Lokal (Cakupan Terbatas)",
    computeModel: "Next.js SSG Build-time + Decimal.js Arbitrary Precision",
    edgeDelivery: "Cloudflare/Vercel Edge Network Cache (Global CDN)",
    summary:
      "Fase pilot aktif dengan 350 snapshot tervalidasi SHA-256 dan 31 rangkaian uji otomatis.",
    rationale:
      "Pada skala 10 daerah, satu berkas JSON terkompresi masih efisien (<70KB). Seluruh agregasi dan audit ambang batas UU HKPD Pasal 146 & 147 dihitung secara instan di sisi klien tanpa latensi jaringan.",
    storageBullets: [
      {
        label: "Format Penyimpanan",
        desc: "Satu berkas statis snapshots.json tervalidasi kriptografis SHA-256",
      },
      {
        label: "Partisi Data",
        desc: "Belum dipartisi (seluruh snapshot 10 daerah dimuat sekaligus saat awal)",
      },
      {
        label: "Verifikasi Integritas",
        desc: "Pencocokan hash SHA-256 berkas XML asli terhadap portal SIKD DJPK",
      },
      {
        label: "Strategi Caching",
        desc: "Edge Caching dengan revalidasi otomatis pada deployment CI/CD",
      },
    ],
    computeBullets: [
      {
        label: "Engine Komputasi",
        desc: "Decimal.js dengan presisi rupiah mutlak bebas galat floating-point",
      },
      {
        label: "Model Eksekusi",
        desc: "Static Site Generation (SSG) dengan pra-render halaman di server Edge",
      },
      {
        label: "Beban Jaringan Mobile",
        desc: "Unduhan awal ~68KB Gzip (sangat ringan pada koneksi 3G/4G)",
      },
      {
        label: "Toleransi Kegagalan",
        desc: "Penyajian fallback data lokal jika portal DJPK sedang tidak dapat diakses",
      },
    ],
  },
  {
    step: "02",
    phaseKey: "tahap-2",
    title: "Tahap 2: 154 Pemda Se-Sumatera (Ekspansi Regional)",
    shortTitle: "154 Daerah Sumatera",
    badge: "Cetak Biru Partisi Regional",
    badgeVariant: "chip--accent",
    icon: Layers,
    scope: "154 Kab/Kota di 10 Provinsi Sumatera",
    scopeDesc:
      "Aceh (23), Sumut (33), Sumbar (19), Riau (12), Kepri (7), Jambi (11), Sumsel (17), Babel (7), Bengkulu (10), Lampung (15)",
    snapshots: "~5.544 Snapshot Bulanan",
    rawSize: "~6,5 MB (Terpartisi 10 Wilayah)",
    clientPayload: "Index ~15 KB + Chunk ~180 KB",
    latencyTarget: "< 80 ms (TTFB)",
    throughputTarget: "500 – 1.000 req/s",
    storageArch:
      "Partitioned Static JSON Chunks per Provinsi + Ingestion Queue",
    partitionStrategy:
      "Horizontal Partitioning per Kode Provinsi (data/chunks/[prov].json)",
    computeModel:
      "Next.js ISR 24 Jam + Server Actions untuk Filter Lintas Wilayah",
    edgeDelivery:
      "Edge Cache dengan Header Stale-While-Revalidate (PoPs Jakarta & SG)",
    summary:
      "Ekspansi regional pertama dengan partisi berkas horizontal per provinsi, mencegah lonjakan ukuran data.",
    rationale:
      "Jika 154 daerah disatukan dalam satu file monolitik, ukurannya mencapai ~6,5 MB. Dengan partisi regional, warga di Padang hanya mengunduh chunk Sumbar (~180 KB), memangkas konsumsi bandwidth hingga 95%.",
    storageBullets: [
      {
        label: "Format Penyimpanan",
        desc: "10 berkas partisi provinsi independen (sumut.json, aceh.json, dll.)",
      },
      {
        label: "Partisi Data",
        desc: "Horizontal Partitioning berdasarkan kode provinsi BPS/Kemendagri",
      },
      {
        label: "Indeks Pencarian",
        desc: "Search manifest ultra-ringan (~15 KB) untuk pencarian instan seluruh Sumatera",
      },
      {
        label: "Strategi Caching",
        desc: "Edge CDN PoPs Jakarta & Singapura dengan TTL revalidasi berkala 24 jam",
      },
    ],
    computeBullets: [
      {
        label: "Engine Komputasi",
        desc: "Decimal.js Core + Next.js Server Components on Node/Edge Runtime",
      },
      {
        label: "Model Eksekusi",
        desc: "Incremental Static Regeneration (ISR) dengan regenerasi halaman per provinsi",
      },
      {
        label: "Beban Jaringan Mobile",
        desc: "Warga hanya mengunduh data provinsi aktif, hemat kuota seluler pedesaan",
      },
      {
        label: "Toleransi Kegagalan",
        desc: "Circuit breaker dengan antrean asinkronus (Queue Worker) saat sinkronisasi DJPK",
      },
    ],
  },
  {
    step: "03",
    phaseKey: "tahap-3",
    title: "Tahap 3: 514 Pemda Nasional (Skala Penuh 38 Provinsi)",
    shortTitle: "514 Daerah Nasional",
    badge: "Spesifikasi DDL Database Siap Produksi",
    badgeVariant: "chip--sunk",
    icon: Globe,
    scope: "514 Kab/Kota + 38 Pemprov (552 Pemda)",
    scopeDesc:
      "Seluruh kabupaten, kota, dan provinsi di 6 gugus pulau: Sumatera, Jawa, Kalimantan, Sulawesi, Bali-Nusa Tenggara, Maluku-Papua",
    snapshots: "~59.000 Snapshot Historis (3 Tahun)",
    rawSize: "~75 MB (Tersimpan di Relational Database)",
    clientPayload: "Index <50 KB + Detail Daerah ~18 KB",
    latencyTarget: "< 100 ms (P95 Nasional)",
    throughputTarget: "5.000+ req/s (Elastis Auto-Scale)",
    storageArch:
      "Neon Serverless PostgreSQL (List Partitioning) + Global Search Index",
    partitionStrategy:
      "Declarative Partitioning PostgreSQL 15+ per province_code & year",
    computeModel:
      "Distributed Ingestion Worker Pool + Edge Serverless Dynamic Engine",
    edgeDelivery:
      "Anycast Edge CDN PoPs + Local IndexedDB Storage di Browser Warga",
    summary:
      "Arsitektur cloud-native skala penuh dengan kluster database terpartisi dan optimasi payload ponsel pelosok.",
    rationale:
      "Menghindari bencana memori monolitik 25MB+ di smartphone beranggaran rendah. Pencarian daerah menggunakan meta-indeks <50KB, dan detail ditarik secara on-demand (~18KB) dengan response time <15ms berkat partition pruning.",
    storageBullets: [
      {
        label: "Format Penyimpanan",
        desc: "Tabel terpartisi apbd_snapshots di Neon Serverless PostgreSQL",
      },
      {
        label: "Partisi Data",
        desc: "PostgreSQL Native List Partitioning per province_code & Range per year",
      },
      {
        label: "Indeks Pencarian",
        desc: "Global Search Meta-Index (<50 KB) terkompresi Brotli di seluruh Edge CDN",
      },
      {
        label: "Strategi Caching",
        desc: "Multi-tier: Browser IndexedDB -> Edge CDN Cache -> Neon Connection Pool",
      },
    ],
    computeBullets: [
      {
        label: "Engine Komputasi",
        desc: "Worker Pool mandiri dengan Token Bucket Rate Limiter (maks 5 req/s)",
      },
      {
        label: "Model Eksekusi",
        desc: "Hybrid ISR + Edge Server Actions dengan Partition Pruning query runtime <15ms",
      },
      {
        label: "Beban Jaringan Mobile",
        desc: "Zero Bloat: Total konsumsi kuota <70KB bahkan untuk navigasi multi-daerah",
      },
      {
        label: "Toleransi Kegagalan",
        desc: "Zero Single Point of Failure: Isolasi partisi database, read replicas, dan quarantine queue",
      },
    ],
  },
];

const pipelineStages = [
  {
    step: "01",
    phase: "Ingestion",
    title: "Data Asli & Keterbukaan",
    badge: "Sumber Terverifikasi",
    summary: "DJPK Kemenkeu RI (350 snapshot terverifikasi SHA-256)",
    icon: Database,
    bullets: [
      {
        label: "Sumber Resmi",
        desc: "DJPK Kemenkeu RI (350 snapshot terverifikasi SHA-256)",
      },
      {
        label: "Format Data",
        desc: "XML & CSV resmi tanpa modifikasi sepihak",
      },
    ],
    technicalDetails: {
      headline: "Ingestion Data Tanpa Modifikasi & Validasi Kriptografis",
      description:
        "GovSight ID mengumpulkan berkas APBD langsung dari portal SIKD DJPK Kementerian Keuangan RI. Setiap berkas diuji keasliannya dan disimpan dalam format aslinya agar dapat diverifikasi ulang oleh publik secara independen.",
      highlights: [
        {
          term: "Cakupan Snapshot",
          value: "350 snapshot APBD (2023 s.d. 2026) dari 10 daerah Sumut",
        },
        {
          term: "Verifikasi Integritas",
          value: "Checksum SHA-256 dihitung dan dicocokkan pada tiap unduhan",
        },
        {
          term: "Format Asli",
          value: "XML & CSV resmi pemerintah tanpa normalisasi sepihak",
        },
      ],
      actionLink: {
        label: "Periksa bukti hash SHA-256 di Metodologi",
        href: "/metodologi#sumber-data",
      },
    },
  },
  {
    step: "02",
    phase: "Data Core",
    title: "Komputasi Presisi & Mesin Indikator",
    badge: "Decimal.js Engine",
    summary: "Decimal.js (Presisi mutlak rupiah tanpa rounding mengambang)",
    icon: Cpu,
    bullets: [
      {
        label: "Engine Komputasi",
        desc: "Decimal.js (Presisi mutlak rupiah tanpa rounding mengambang)",
      },
      {
        label: "Indikator Audit",
        desc: "Audit batas Pasal 146 & 147 UU HKPD serta ambang lonjakan belanja modal akhir tahun",
      },
    ],
    technicalDetails: {
      headline: "Arsitektur Komputasi Keuangan Bebas Galat Floating-Point",
      description:
        "Perhitungan anggaran triliunan rupiah tidak boleh terdistorsi oleh galat pembulatan floating-point bawaan JavaScript (seperti 0.1 + 0.2 ≠ 0.3). Seluruh formula keuangan dihitung dengan pustaka Decimal.js presisi arbitrer.",
      highlights: [
        {
          term: "Engine Presisi",
          value:
            "Decimal.js untuk seluruh agregasi, rasio serapan, dan selisih rupiah",
        },
        {
          term: "Pasal 146 UU HKPD",
          value: "Batas belanja pegawai maksimal 30% dari total APBD",
        },
        {
          term: "Pasal 147 UU HKPD",
          value: "Kewajiban belanja modal infrastruktur minimal 40%",
        },
        {
          term: "Ambang Modal Akhir TA",
          value:
            "Deteksi lonjakan belanja modal >40% dalam 61 hari terakhir (Nov–Des)",
        },
      ],
      actionLink: {
        label: "Pelajari rumus detail serapan & modal di Metodologi",
        href: "/metodologi#rumus-indikator",
      },
    },
  },
  {
    step: "03",
    phase: "Navigation & Surfaces",
    title: "Ruang Eksplorasi Publik",
    badge: "Sitemap 4 Halaman",
    summary:
      "Jelajah (/), Profil Daerah (/daerah/[kode]), Komparasi (/bandingkan), Peta Arsitektur (/arsitektur)",
    icon: Compass,
    bullets: [
      {
        label: "Jelajah 33 Daerah (/)",
        desc: "Ringkasan fiskal makro, pagination, dan filter penanda kritis",
      },
      {
        label: "Profil Lengkap (/daerah/[kode])",
        desc: "Segmented Reader 3 tab, riwayat belanja, dan toolkit advokasi",
      },
      {
        label: "Komparasi Berdampingan (/bandingkan)",
        desc: "Perbandingan paralel 2–3 daerah dengan preset kawasan 1-klik",
      },
    ],
    technicalDetails: {
      headline: "Sitemap Terstruktur untuk Eksplorasi Multi-Sudut Pandang",
      description:
        "GovSight ID membagi antarmuka menjadi 4 ruang eksplorasi terpadu yang saling terhubung melalui parameter periode URL yang sinkron:",
      surfaces: [
        {
          title: "Jelajah Anggaran",
          path: "/",
          desc: "Tabel konsolidasi 33 pemda, pemfilteran kota/kabupaten, dan ringkasan fiskal makro.",
        },
        {
          title: "Profil Lengkap Daerah",
          path: "/daerah/0215",
          desc: "Segmented Reader 3 tab, riwayat belanja modal, dan toolkit pertanyaan kritis warga.",
        },
        {
          title: "Komparasi Berdampingan",
          path: "/bandingkan",
          desc: "Matriks perbandingan metrik fiskal berdampingan antara 2 hingga 3 daerah secara bersamaan.",
        },
        {
          title: "Peta Arsitektur & Cetak Biru",
          path: "/arsitektur",
          desc: "Dokumentasi rekayasa sistem, alur pipeline ingestion data, dan skema partisi database.",
        },
      ],
      actionLink: {
        label: "Kunjungi halaman Jelajah Anggaran",
        href: "/",
      },
    },
  },
  {
    step: "04",
    phase: "Actionable Output",
    title: "Advokasi & Tindak Lanjut Nyata",
    badge: "Actionable Output",
    summary:
      "Unduh CSV diaudit, Cetak Lembar Pertanyaan PDF, Integrasi SP4N-LAPOR!",
    icon: FileCheck2,
    bullets: [
      {
        label: "Unduh CSV Diaudit",
        desc: "Dataset tabular tervalidasi siap olah untuk jurnalis data & peneliti",
      },
      {
        label: "Cetak Lembar Pertanyaan PDF",
        desc: "Brief advokasi siap cetak untuk forum reses DPRD & musrenbang",
      },
      {
        label: "Integrasi SP4N-LAPOR!",
        desc: "Rujukan rekening belanja & nominal bukti untuk aduan resmi lapor.go.id",
      },
    ],
    technicalDetails: {
      headline: "Mengubah Angka Kering Menjadi Daya Tawar Advokasi Warga",
      description:
        "GovSight ID dirancang bukan sekadar sebagai dashboard pasif, melainkan instrumen aksi warga dan parlemen lokal:",
      highlights: [
        {
          term: "Data Terbuka Diaudit",
          value: "Ekspor CSV konsisten tanpa pembulatan mata uang",
        },
        {
          term: "Instrumen Pengawasan Dewan",
          value: "Lembar telaah kritis otomatis ramah cetak (Print/PDF)",
        },
        {
          term: "Aduan Publik Berbasis Bukti",
          value: "Kanal aduan resmi SP4N-LAPOR! dengan rujukan data akurat",
        },
      ],
      actionLink: {
        label: "Pelajari kanal partisipasi warga di Metodologi",
        href: "/metodologi#kanal-aduan",
      },
    },
  },
];

const ddlSchemaSnippet = `-- Skema Database Relasional PostgreSQL 15+ untuk Skala 514 Daerah
-- Partisi Deklaratif Dua Tingkat: LIST (Kode Provinsi) + RANGE (Tahun Anggaran)

CREATE TABLE apbd_snapshots (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    region_code VARCHAR(4) NOT NULL,
    province_code VARCHAR(2) NOT NULL,
    fiscal_year SMALLINT NOT NULL,
    fiscal_month SMALLINT NOT NULL,
    budget_total NUMERIC(18, 2) NOT NULL,
    realized_total NUMERIC(18, 2) NOT NULL,
    personnel_budget NUMERIC(18, 2),
    personnel_realized NUMERIC(18, 2),
    goods_services_budget NUMERIC(18, 2),
    goods_services_realized NUMERIC(18, 2),
    capital_infra_budget NUMERIC(18, 2),
    capital_infra_realized NUMERIC(18, 2),
    sha256_hash CHAR(64) NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (region_code, fiscal_year, fiscal_month, province_code)
) PARTITION BY LIST (province_code);

-- Partisi Provinsi Sumatera Utara (Kode 02)
CREATE TABLE apbd_snapshots_sumut PARTITION OF apbd_snapshots
    FOR VALUES IN ('02')
    PARTITION BY RANGE (fiscal_year);

-- Sub-partisi Tahunan Sumut
CREATE TABLE apbd_snapshots_sumut_2024 PARTITION OF apbd_snapshots_sumut
    FOR VALUES FROM (2024) TO (2025);
CREATE TABLE apbd_snapshots_sumut_2025 PARTITION OF apbd_snapshots_sumut
    FOR VALUES FROM (2025) TO (2026);

-- Indeks Performa untuk Partition Pruning (<15ms Query)
CREATE INDEX idx_snapshots_audit ON apbd_snapshots (region_code, fiscal_year, fiscal_month);
CREATE INDEX idx_snapshots_sha256 ON apbd_snapshots (sha256_hash);`;

export function ArchitectureView({ dataset: _dataset }: { dataset: Dataset }) {
  const [activeTab, setActiveTab] = useState<
    "pipeline" | "blueprint" | "regional" | "schema"
  >("pipeline");
  const [activeStage, setActiveStage] = useState<number>(0);
  const [scalabilityPhase, setScalabilityPhase] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  function copyDDL() {
    navigator.clipboard.writeText(ddlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Header Halaman Khusus Arsitektur */}
      <div className="page-head">
        <div className="page-head__text">
          <h1>Peta Arsitektur & Cetak Biru Rekayasa Skalabilitas</h1>
          <p style={{ maxWidth: "68ch" }}>
            Dokumentasi rekayasa sistem GovSight ID: alur ingestion data terbuka
            SIKD DJPK Kemenkeu, verifikasi kriptografis SHA-256, model partisi
            regional 154 daerah, hingga spesifikasi DDL relational database
            skala 514 daerah nasional.
          </p>
        </div>
        <div className="page-actions">
          <a
            href="/docs/ARSITEKTUR-SKALABILITAS.md"
            download="ARSITEKTUR-SKALABILITAS.md"
            className="btn btn--primary"
            style={{ fontSize: "0.8125rem" }}
          >
            <Download size={14} /> Unduh Cetak Biru (MD)
          </a>
          <Link
            href="/metodologi"
            className="btn btn--secondary"
            style={{ fontSize: "0.8125rem" }}
          >
            Metodologi &amp; Regulasi <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Segmented Control Navigasi Tab Arsitektur */}
      <div
        className="segmented"
        role="tablist"
        aria-label="Pilihan tampilan arsitektur sistem"
        style={{ marginBottom: "var(--gap)", flexWrap: "wrap" }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pipeline"}
          className={`segmented__btn ${activeTab === "pipeline" ? "is-active" : ""}`}
          onClick={() => setActiveTab("pipeline")}
        >
          <Compass size={14} /> 1. Alur Data &amp; Pipeline (4-Tier)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "blueprint"}
          className={`segmented__btn ${activeTab === "blueprint" ? "is-active" : ""}`}
          onClick={() => setActiveTab("blueprint")}
        >
          <Layers size={14} /> 2. Cetak Biru Skalabilitas (3-Tahap)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "schema"}
          className={`segmented__btn ${activeTab === "schema" ? "is-active" : ""}`}
          onClick={() => setActiveTab("schema")}
        >
          <Terminal size={14} /> 3. Skema DDL Database (PostgreSQL 15+)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "regional"}
          className={`segmented__btn ${activeTab === "regional" ? "is-active" : ""}`}
          onClick={() => setActiveTab("regional")}
        >
          <Globe size={14} /> 4. Preview Regional &amp; Nasional
        </button>
      </div>

      {/* TAB 1: PETA ARSITEKTUR, ALUR DATA & SITEMAP */}
      {activeTab === "pipeline" && (
        <section
          id="arsitektur-sitemap"
          className="pipeline-section"
          aria-labelledby="arsitektur-sitemap-heading"
        >
          <div className="pipeline-header">
            <h2
              id="arsitektur-sitemap-heading"
              className="pipeline-header__title"
            >
              Peta Arsitektur, Alur Data &amp; Sitemap GovSight ID
            </h2>
            <p className="pipeline-header__desc" style={{ maxWidth: "68ch" }}>
              Dari unduhan data mentah Kemenkeu hingga instrumen advokasi warga
              di lapangan. Klik salah satu tahapan di bawah untuk menelaah
              spesifikasi teknis dan alur integrasinya.
            </p>
          </div>

          {/* Stepper 4 Tahap Pipeline */}
          <div
            className="pipeline-stepper"
            role="tablist"
            aria-label="Tahapan Alur Data & Sitemap GovSight ID"
          >
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStage === idx;
              return (
                <button
                  key={stage.step}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`pipeline-panel-${stage.step}`}
                  id={`pipeline-tab-${stage.step}`}
                  className={`pipeline-node ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveStage(idx)}
                >
                  <div className="pipeline-node__top">
                    <span className="pipeline-node__step">
                      Tahap {stage.step}
                    </span>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="pipeline-node__phase">{stage.phase}</span>
                    <h3 className="pipeline-node__title">{stage.title}</h3>
                  </div>
                  <div className="pipeline-node__summary">
                    {stage.bullets.map((b, i) => (
                      <div key={i} style={{ marginBottom: 4 }}>
                        <strong
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--ink)",
                          }}
                        >
                          • {b.label}:
                        </strong>{" "}
                        <span style={{ fontSize: "0.72rem" }}>{b.desc}</span>
                      </div>
                    ))}
                  </div>
                  <span className="pipeline-node__badge">{stage.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Detail Panel Tahap Terpilih */}
          {(() => {
            const current = pipelineStages[activeStage];
            const details = current.technicalDetails;
            return (
              <div
                id={`pipeline-panel-${current.step}`}
                role="tabpanel"
                aria-labelledby={`pipeline-tab-${current.step}`}
                className="pipeline-detail"
              >
                <div className="pipeline-detail__top">
                  <div className="pipeline-detail__header-title">
                    <span className="chip chip--accent chip--square">
                      Tahap {current.step} / 04
                    </span>
                    <span className="chip chip--sunk chip--square">
                      {current.phase}
                    </span>
                    <strong
                      style={{ fontSize: "0.9375rem", color: "var(--ink)" }}
                    >
                      {current.title}
                    </strong>
                  </div>
                  <div className="pipeline-detail__nav">
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => setActiveStage((p) => Math.max(0, p - 1))}
                      disabled={activeStage === 0}
                      aria-label="Tahap sebelumnya"
                    >
                      <ArrowLeft size={13} /> Sebelumnya
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() =>
                        setActiveStage((p) =>
                          Math.min(pipelineStages.length - 1, p + 1),
                        )
                      }
                      disabled={activeStage === pipelineStages.length - 1}
                      aria-label="Tahap berikutnya"
                    >
                      Berikutnya <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                <div className="pipeline-detail__content">
                  <div>
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--ink)",
                        margin: "0 0 8px",
                      }}
                    >
                      {details.headline}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.84375rem",
                        color: "var(--ink-2)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {details.description}
                    </p>

                    {"surfaces" in details && details.surfaces && (
                      <div className="surface-list">
                        {details.surfaces.map((s) => (
                          <div key={s.path} className="surface-item">
                            <span className="surface-item__path">{s.path}</span>
                            <span className="surface-item__title">
                              {s.title}
                            </span>
                            <p className="surface-item__desc">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    {"highlights" in details && details.highlights && (
                      <div className="pipeline-spec-card">
                        <span className="pipeline-spec-card__title">
                          <ShieldCheck size={14} /> Karakteristik Teknis &amp;
                          Integritas
                        </span>
                        <ul className="pipeline-spec-list">
                          {details.highlights.map((h, i) => (
                            <li key={i} className="pipeline-spec-item">
                              <span className="pipeline-spec-item__label">
                                {h.term}
                              </span>
                              <span className="pipeline-spec-item__desc">
                                {h.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pipeline-detail__footer">
                  <span className="pipeline-detail__status">
                    <Check size={13} style={{ color: "var(--ok-solid)" }} />{" "}
                    Implementasi aktif &amp; tervalidasi pada kode sumber
                  </span>
                  <Link
                    href={details.actionLink.href}
                    className="pipeline-detail__action"
                  >
                    {details.actionLink.label} <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* TAB 2: CETAK BIRU SKALABILITAS 3-TAHAP */}
      {activeTab === "blueprint" && (
        <section
          id="skalabilitas-nasional"
          className="pipeline-section"
          aria-labelledby="skalabilitas-nasional-heading"
        >
          {/* Blueprint 3-Tier Visualizer Component */}
          <ScalabilityBlueprint3Tier
            activeTier={(scalabilityPhase + 1) as 1 | 2 | 3}
            onSelectTier={(t) => setScalabilityPhase(t - 1)}
          />

          <div className="pipeline-header" style={{ marginTop: 24 }}>
            <h2
              id="skalabilitas-nasional-heading"
              className="pipeline-header__title"
            >
              Blueprint Skalabilitas Nasional (10 → 33 → 154 → 514 Daerah)
            </h2>
            <p className="pipeline-header__desc" style={{ maxWidth: "68ch" }}>
              Dari 10 pemda percontohan di Sumatera Utara menuju pengawasan 514
              kabupaten/kota dan 38 provinsi se-Indonesia. Klik salah satu
              tahapan di bawah untuk mempelajari evolusi arsitektur penyimpanan,
              model komputasi, dan efisiensi seluler.
            </p>
          </div>

          {/* Stepper 3 Tahap Skalabilitas */}
          <div
            className="scalability-stepper"
            role="tablist"
            aria-label="3 Tahap Skalabilitas Nasional GovSight ID"
          >
            {scalabilityPhases.map((phase, idx) => {
              const Icon = phase.icon;
              const isActive = scalabilityPhase === idx;
              return (
                <button
                  key={phase.step}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={"scalability-panel-" + phase.step}
                  id={"scalability-tab-" + phase.step}
                  className={"pipeline-node " + (isActive ? "is-active" : "")}
                  onClick={() => setScalabilityPhase(idx)}
                >
                  <div className="pipeline-node__top">
                    <span className="pipeline-node__step">
                      Tahap {phase.step}
                    </span>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="pipeline-node__phase">
                      {phase.shortTitle}
                    </span>
                    <h3
                      className="pipeline-node__title"
                      style={{ fontSize: "0.9375rem" }}
                    >
                      {phase.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--ink-2)",
                      margin: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    {phase.summary}
                  </p>
                  <span className="pipeline-node__badge">{phase.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Detail Panel Tahap Terpilih */}
          {(() => {
            const currentPhase = scalabilityPhases[scalabilityPhase];
            return (
              <div
                id={"scalability-panel-" + currentPhase.step}
                role="tabpanel"
                aria-labelledby={"scalability-tab-" + currentPhase.step}
                className="pipeline-detail"
              >
                <div className="pipeline-detail__top">
                  <div className="pipeline-detail__header-title">
                    <span className="chip chip--accent chip--square">
                      Tahap {currentPhase.step} / 03
                    </span>
                    <span
                      className={
                        "chip " + currentPhase.badgeVariant + " chip--square"
                      }
                    >
                      {currentPhase.badge}
                    </span>
                    <strong
                      style={{ fontSize: "0.9375rem", color: "var(--ink)" }}
                    >
                      {currentPhase.title}
                    </strong>
                  </div>
                  <div className="pipeline-detail__nav">
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() =>
                        setScalabilityPhase((p) => Math.max(0, p - 1))
                      }
                      disabled={scalabilityPhase === 0}
                      aria-label="Tahap sebelumnya"
                    >
                      <ArrowLeft size={13} /> Sebelumnya
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() =>
                        setScalabilityPhase((p) =>
                          Math.min(scalabilityPhases.length - 1, p + 1),
                        )
                      }
                      disabled={
                        scalabilityPhase === scalabilityPhases.length - 1
                      }
                      aria-label="Tahap berikutnya"
                    >
                      Berikutnya <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* 5 Metrik Kunci Ringkas */}
                <div
                  className="metrics"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    marginBottom: 20,
                  }}
                >
                  <div className="metric">
                    <span className="metric__label">
                      <Globe size={13} /> Cakupan Wilayah
                    </span>
                    <strong
                      className="metric__value metric__value--accent"
                      style={{ fontSize: "1.125rem" }}
                    >
                      {currentPhase.scope}
                    </strong>
                    <span
                      className="metric__hint"
                      style={{ fontSize: "0.72rem" }}
                    >
                      {currentPhase.scopeDesc}
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Database size={13} /> Volume Snapshot
                    </span>
                    <strong
                      className="metric__value"
                      style={{ fontSize: "1.125rem" }}
                    >
                      {currentPhase.snapshots}
                    </strong>
                    <span
                      className="metric__hint"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Raw payload: {currentPhase.rawSize}
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Zap size={13} /> Payload Browser Klien
                    </span>
                    <strong
                      className="metric__value"
                      style={{
                        fontSize: "1.125rem",
                        color: "var(--ok-solid)",
                      }}
                    >
                      {currentPhase.clientPayload}
                    </strong>
                    <span
                      className="metric__hint"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Ramah kuota &amp; seluler pedesaan
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Cpu size={13} /> Target Latensi (TTFB)
                    </span>
                    <strong
                      className="metric__value"
                      style={{ fontSize: "1.125rem" }}
                    >
                      {currentPhase.latencyTarget}
                    </strong>
                    <span
                      className="metric__hint"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Kecepatan respons edge CDN
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Server size={13} /> Throughput Server
                    </span>
                    <strong
                      className="metric__value"
                      style={{ fontSize: "1.125rem" }}
                    >
                      {currentPhase.throughputTarget}
                    </strong>
                    <span
                      className="metric__hint"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Kapasitas beban bersamaan
                    </span>
                  </div>
                </div>

                {/* 2 Kolom Spesifikasi Detail */}
                <div className="pipeline-detail__content">
                  {/* Kolom Kiri: Arsitektur Penyimpanan & Partisi Data */}
                  <div className="pipeline-spec-card">
                    <span className="pipeline-spec-card__title">
                      <HardDrive size={14} /> Arsitektur Penyimpanan &amp;
                      Partisi Data
                    </span>
                    <ul className="pipeline-spec-list">
                      {currentPhase.storageBullets.map((b, i) => (
                        <li key={i} className="pipeline-spec-item is-highlight">
                          <span className="pipeline-spec-item__label">
                            {b.label}
                          </span>
                          <span className="pipeline-spec-item__desc">
                            {b.desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Kolom Kanan: Model Komputasi & Runtime Delivery */}
                  <div className="pipeline-spec-card">
                    <span className="pipeline-spec-card__title">
                      <Cpu size={14} /> Model Komputasi &amp; Runtime Delivery
                    </span>
                    <ul className="pipeline-spec-list">
                      {currentPhase.computeBullets.map((b, i) => (
                        <li key={i} className="pipeline-spec-item is-highlight">
                          <span className="pipeline-spec-item__label">
                            {b.label}
                          </span>
                          <span className="pipeline-spec-item__desc">
                            {b.desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Preview Distribusi Wilayah */}
                {currentPhase.phaseKey === "tahap-2" && (
                  <div style={{ marginTop: 16 }}>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--ink-2)",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Distribusi 10 Provinsi Se-Pulau Sumatera (154 Daerah):
                    </span>
                    <div
                      className="pipeline-pills"
                      style={{ flexWrap: "wrap", gap: 6 }}
                    >
                      {sumateraProvinces.map((prov) => (
                        <span
                          key={prov.code}
                          className="chip chip--sunk"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <strong>{prov.name}</strong> ({prov.daerahCount}{" "}
                          daerah)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentPhase.phaseKey === "tahap-3" && (
                  <div style={{ marginTop: 16 }}>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--ink-2)",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Distribusi 6 Gugus Kepulauan Nasional (514 Daerah / 38
                      Provinsi):
                    </span>
                    <div
                      className="pipeline-pills"
                      style={{ flexWrap: "wrap", gap: 6 }}
                    >
                      {nationalIslandsGroups.map((gugus) => (
                        <span
                          key={gugus.id}
                          className="chip chip--accent"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <strong>{gugus.name}</strong>: {gugus.daerahCount}{" "}
                          daerah ({gugus.provincesCount} prov)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Matriks Perbandingan Ringkas 3 Tahap */}
          <div style={{ marginTop: 24 }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: 10,
              }}
            >
              Matriks Perbandingan Skalabilitas Sistem
            </h3>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Parameter Rekayasa</th>
                    <th>Tahap 1: 10 Daerah Sumut</th>
                    <th>Tahap 2: 154 Daerah Sumatera</th>
                    <th>Tahap 3: 514 Daerah Nasional</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Cakupan Pemda</th>
                    <td>10 Kab/Kota Sumut</td>
                    <td>154 Kab/Kota (10 Provinsi)</td>
                    <td>514 Kab/Kota + 38 Provinsi (552 Pemda)</td>
                  </tr>
                  <tr>
                    <th>Jumlah Snapshot</th>
                    <td>350 Snapshot (2023–2026)</td>
                    <td>~5.544 Snapshot Bulanan</td>
                    <td>~59.000 Snapshot (3 Tahun)</td>
                  </tr>
                  <tr>
                    <th>Ukuran Data Mentah</th>
                    <td>~450 KB (JSON Tunggal)</td>
                    <td>~6,5 MB (Terpartisi 10 Wilayah)</td>
                    <td>~75 MB (Relational Database)</td>
                  </tr>
                  <tr>
                    <th>Payload Klien (Seluler)</th>
                    <td>
                      <strong style={{ color: "var(--ok-solid)" }}>
                        450 KB
                      </strong>{" "}
                      (Gzip ~68 KB)
                    </td>
                    <td>
                      <strong style={{ color: "var(--ok-solid)" }}>
                        Index ~15 KB
                      </strong>{" "}
                      + Chunk ~180 KB
                    </td>
                    <td>
                      <strong style={{ color: "var(--ok-solid)" }}>
                        Index &lt;50 KB
                      </strong>{" "}
                      + Detail ~18 KB
                    </td>
                  </tr>
                  <tr>
                    <th>Target Latensi (TTFB)</th>
                    <td>&lt; 50 ms</td>
                    <td>&lt; 80 ms</td>
                    <td>&lt; 100 ms (P95 Nasional)</td>
                  </tr>
                  <tr>
                    <th>Throughput Server</th>
                    <td>50 – 100 req/s</td>
                    <td>500 – 1.000 req/s</td>
                    <td>5.000+ req/s (Auto-Scale)</td>
                  </tr>
                  <tr>
                    <th>Media Penyimpanan</th>
                    <td>Static In-Memory JSON</td>
                    <td>Partitioned JSON Chunks + ISR</td>
                    <td>Neon Serverless PostgreSQL</td>
                  </tr>
                  <tr>
                    <th>Model Komputasi</th>
                    <td>SSG Build-time + Decimal.js</td>
                    <td>ISR 24 Jam + Server Actions</td>
                    <td>Distributed Worker Pool + Edge</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Callout Mengapa Monolitik 25MB Ditolak */}
          <div
            className="note note--info"
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} style={{ color: "var(--accent)" }} />
              <strong style={{ fontSize: "0.875rem", color: "var(--ink)" }}>
                Mengapa Arsitektur Monolitik 25MB+ Ditolak untuk 514 Daerah?
              </strong>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.8125rem",
                color: "var(--ink-2)",
                lineHeight: 1.6,
                maxWidth: "68ch",
              }}
            >
              Pada skala 514 daerah dengan 36 bulan data historis, satu berkas
              JSON monolitik akan membengkak hingga lebih dari 25 MB. Di
              jaringan 4G pedesaan Indonesia dengan kecepatan rata-rata 2–3
              Mbps, mengunduh 25 MB membutuhkan waktu lebih dari 100 detik serta
              memicu kehabisan memori (OOM browser crash) pada smartphone
              beranggaran rendah (RAM 2GB–3GB). Arsitektur modular GovSight ID
              memangkas beban awal menjadi hanya search index &lt;50 KB dan data
              detail daerah on-demand ~18 KB.
            </p>
          </div>
        </section>
      )}

      {/* TAB 3: SKEMA DDL DATABASE RELASIONAL (POSTGRESQL 15+) */}
      {activeTab === "schema" && (
        <section className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.0625rem",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Code size={18} style={{ color: "var(--accent)" }} />{" "}
                Spesifikasi DDL Database Skala Penuh (PostgreSQL 15+)
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.8125rem",
                  color: "var(--ink-3)",
                }}
              >
                Partisi Deklaratif Dua Tingkat: LIST (Kode Provinsi) + RANGE
                (Tahun Anggaran) untuk Partition Pruning query runtime &lt;15ms.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={copyDDL}
            >
              {copied ? (
                <>
                  <Check size={13} style={{ color: "var(--ok-solid)" }} />{" "}
                  Tersalin!
                </>
              ) : (
                <>Salin DDL SQL</>
              )}
            </button>
          </div>

          <div
            style={{
              background: "#18181b",
              color: "#e4e4e7",
              borderRadius: "var(--r)",
              padding: "16px 18px",
              overflowX: "auto",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
            }}
          >
            <pre style={{ margin: 0 }}>
              <code>{ddlSchemaSnippet}</code>
            </pre>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              background: "var(--canvas)",
              borderRadius: "var(--r)",
              border: "1px solid var(--line)",
              fontSize: "0.8125rem",
              color: "var(--ink-2)",
            }}
          >
            <strong>Catatan Rekayasa Keuangan:</strong> Kolom anggaran
            menggunakan tipe <code>NUMERIC(18, 2)</code> untuk memastikan tidak
            ada distorsi pembulatan pecahan rupiah (floating-point error).
            Checksum <code>sha256_hash</code> memvalidasi keterlacakan data ke
            berkas asli DJPK Kementerian Keuangan.
          </div>
        </section>
      )}

      {/* TAB 4: PREVIEW REGIONAL SUMATERA & NASIONAL */}
      {activeTab === "regional" && (
        <div className="stack" style={{ gap: "var(--gap)" }}>
          <RegionalSumateraMatrix
            onSelectTier={(t) => {
              if (t === 1) {
                window.location.href = "/";
              }
            }}
          />
          <NationalRoadmapView
            onSelectTier={(t) => {
              if (t === 1) {
                window.location.href = "/";
              }
            }}
          />
        </div>
      )}

      {/* Footer Navigasi & Tautan Dokumen */}
      <div
        className="card"
        style={{
          marginTop: "var(--gap)",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          background: "var(--paper)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 10,
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <a
            href="/docs/ARSITEKTUR-SKALABILITAS.md"
            download="ARSITEKTUR-SKALABILITAS.md"
            className="btn btn--primary"
            style={{
              fontSize: "0.8125rem",
              whiteSpace: "normal",
              textAlign: "center",
              justifyContent: "center",
              maxWidth: "100%",
            }}
          >
            <Download size={14} style={{ flexShrink: 0 }} />
            <span>Unduh Cetak Biru Lengkap (.MD)</span>
          </a>
          <a
            href="/docs/ARSITEKTUR-SKALABILITAS.md"
            target="_blank"
            rel="noreferrer"
            className="btn btn--secondary"
            style={{
              fontSize: "0.8125rem",
              whiteSpace: "normal",
              textAlign: "center",
              justifyContent: "center",
              maxWidth: "100%",
            }}
          >
            <FileText size={14} style={{ flexShrink: 0 }} />
            <span>Baca Dokumen Lengkap di Tab Baru</span>
            <ArrowUpRight size={13} style={{ flexShrink: 0 }} />
          </a>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
          Dokumen teknis: <code>docs/ARSITEKTUR-SKALABILITAS.md</code>
        </span>
      </div>
    </>
  );
}
