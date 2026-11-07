"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  Cpu,
  Database,
  Download,
  FileCheck2,
  FileText,
  Globe,
  GraduationCap,
  HardDrive,
  Landmark,
  Layers,
  RefreshCw,
  Scale,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  sumateraProvinces,
  nationalIslandsGroups,
} from "@/lib/scalability-data";
import type { Dataset } from "@/lib/types";
import { dateLabel } from "@/lib/format";
import { regions } from "@/lib/regions";
import { YEAR_END_THRESHOLD } from "@/lib/indicators";
import {
  DownloadButton,
  InfoNote,
  PeriodControls,
  ShareButton,
  UnavailablePeriod,
  useFilters,
} from "./shared";


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
    scopeDesc: "Medan, Binjai, Deli Serdang, Karo, Langkat, Pematangsiantar, Simalungun, Asahan, Tebing Tinggi, Dairi",
    snapshots: "350 Snapshot (2023–2026)",
    rawSize: "~450 KB (JSON Tunggal)",
    clientPayload: "450 KB (Gzip: ~68 KB)",
    latencyTarget: "< 50 ms (TTFB)",
    throughputTarget: "50 – 100 req/s",
    costEstimate: "$0 / bulan (Vercel Free Tier)",
    storageArch: "Static In-Memory JSON (data/snapshots.json)",
    partitionStrategy: "Monolitik Lokal (Cakupan Terbatas)",
    computeModel: "Next.js SSG Build-time + Decimal.js Arbitrary Precision",
    edgeDelivery: "Cloudflare/Vercel Edge Network Cache (Global CDN)",
    summary: "Fase pilot aktif dengan 350 snapshot tervalidasi SHA-256 dan 25 rangkaian uji otomatis.",
    rationale: "Pada skala 10 daerah, satu berkas JSON terkompresi masih efisien (<70KB). Seluruh agregasi dan audit ambang batas UU HKPD Pasal 146 & 147 dihitung secara instan di sisi klien tanpa latensi jaringan.",
    storageBullets: [
      { label: "Format Penyimpanan", desc: "Satu berkas statis snapshots.json tervalidasi kriptografis SHA-256" },
      { label: "Partisi Data", desc: "Belum dipartisi (seluruh snapshot 10 daerah dimuat sekaligus saat awal)" },
      { label: "Verifikasi Integritas", desc: "Pencocokan hash SHA-256 berkas XML asli terhadap portal SIKD DJPK" },
      { label: "Strategi Caching", desc: "Edge Caching dengan revalidasi otomatis pada deployment CI/CD" },
    ],
    computeBullets: [
      { label: "Engine Komputasi", desc: "Decimal.js dengan presisi rupiah mutlak bebas galat floating-point" },
      { label: "Model Eksekusi", desc: "Static Site Generation (SSG) dengan pra-render halaman di server Edge" },
      { label: "Beban Jaringan Mobile", desc: "Unduhan awal ~68KB Gzip (sangat ringan pada koneksi 3G/4G)" },
      { label: "Toleransi Kegagalan", desc: "Penyajian fallback data lokal jika portal DJPK sedang tidak dapat diakses" },
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
    scopeDesc: "Aceh (23), Sumut (33), Sumbar (19), Riau (12), Kepri (7), Jambi (11), Sumsel (17), Babel (7), Bengkulu (10), Lampung (15)",
    snapshots: "~5.544 Snapshot Bulanan",
    rawSize: "~6,5 MB (Terpartisi 10 Wilayah)",
    clientPayload: "Index ~15 KB + Chunk ~180 KB",
    latencyTarget: "< 80 ms (TTFB)",
    throughputTarget: "500 – 1.000 req/s",
    costEstimate: "~$19 / bulan (Vercel Pro + Managed Cache)",
    storageArch: "Partitioned Static JSON Chunks per Provinsi + Ingestion Queue",
    partitionStrategy: "Horizontal Partitioning per Kode Provinsi (data/chunks/[prov].json)",
    computeModel: "Next.js ISR 24 Jam + Server Actions untuk Filter Lintas Wilayah",
    edgeDelivery: "Edge Cache dengan Header Stale-While-Revalidate (PoPs Jakarta & SG)",
    summary: "Ekspansi regional pertama dengan partisi berkas horizontal per provinsi, mencegah lonjakan ukuran data.",
    rationale: "Jika 154 daerah disatukan dalam satu file monolitik, ukurannya mencapai ~6,5 MB. Dengan partisi regional, warga di Padang hanya mengunduh chunk Sumbar (~180 KB), memangkas konsumsi bandwidth hingga 95%.",
    storageBullets: [
      { label: "Format Penyimpanan", desc: "10 berkas partisi provinsi independen (sumut.json, aceh.json, dll.)" },
      { label: "Partisi Data", desc: "Horizontal Partitioning berdasarkan kode provinsi BPS/Kemendagri" },
      { label: "Indeks Pencarian", desc: "Search manifest ultra-ringan (~15 KB) untuk pencarian instan seluruh Sumatera" },
      { label: "Strategi Caching", desc: "Edge CDN PoPs Jakarta & Singapura dengan TTL revalidasi berkala 24 jam" },
    ],
    computeBullets: [
      { label: "Engine Komputasi", desc: "Decimal.js Core + Next.js Server Components on Node/Edge Runtime" },
      { label: "Model Eksekusi", desc: "Incremental Static Regeneration (ISR) dengan regenerasi halaman per provinsi" },
      { label: "Beban Jaringan Mobile", desc: "Warga hanya mengunduh data provinsi aktif, hemat kuota seluler pedesaan" },
      { label: "Toleransi Kegagalan", desc: "Circuit breaker dengan antrean asinkronus (Queue Worker) saat sinkronisasi DJPK" },
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
    scopeDesc: "Seluruh kabupaten, kota, dan provinsi di 6 gugus pulau: Sumatera, Jawa, Kalimantan, Sulawesi, Bali-Nusa Tenggara, Maluku-Papua",
    snapshots: "~59.000 Snapshot Historis (3 Tahun)",
    rawSize: "~75 MB (Tersimpan di Relational Database)",
    clientPayload: "Index <50 KB + Detail Daerah ~18 KB",
    latencyTarget: "< 100 ms (P95 Nasional)",
    throughputTarget: "5.000+ req/s (Elastis Auto-Scale)",
    costEstimate: "~$50 – $120 / bulan (Neon Serverless + Edge)",
    storageArch: "Neon Serverless PostgreSQL (List Partitioning) + Global Search Index",
    partitionStrategy: "Declarative Partitioning PostgreSQL 15+ per province_code & year",
    computeModel: "Distributed Ingestion Worker Pool + Edge Serverless Dynamic Engine",
    edgeDelivery: "Anycast Edge CDN PoPs + Local IndexedDB Storage di Browser Warga",
    summary: "Arsitektur cloud-native skala penuh dengan kluster database terpartisi dan optimasi payload ponsel pelosok.",
    rationale: "Menghindari bencana memori monolitik 25MB+ di smartphone beranggaran rendah. Pencarian daerah menggunakan meta-indeks <50KB, dan detail ditarik secara on-demand (~18KB) dengan response time <15ms berkat partition pruning.",
    storageBullets: [
      { label: "Format Penyimpanan", desc: "Tabel terpartisi apbd_snapshots di Neon Serverless PostgreSQL" },
      { label: "Partisi Data", desc: "PostgreSQL Native List Partitioning per province_code & Range per year" },
      { label: "Indeks Pencarian", desc: "Global Search Meta-Index (<50 KB) terkompresi Brotli di seluruh Edge CDN" },
      { label: "Strategi Caching", desc: "Multi-tier: Browser IndexedDB -> Edge CDN Cache -> Neon Connection Pool" },
    ],
    computeBullets: [
      { label: "Engine Komputasi", desc: "Worker Pool mandiri dengan Token Bucket Rate Limiter (maks 5 req/s)" },
      { label: "Model Eksekusi", desc: "Hybrid ISR + Edge Server Actions dengan Partition Pruning query runtime <15ms" },
      { label: "Beban Jaringan Mobile", desc: "Zero Bloat: Total konsumsi kuota <70KB bahkan untuk navigasi multi-daerah" },
      { label: "Toleransi Kegagalan", desc: "Zero Single Point of Failure: Isolasi partisi database, read replicas, dan quarantine queue" },
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
        label: "Periksa tabel berkas asli & hash di bawah",
        href: "#sumber-data",
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
          value: "Decimal.js untuk seluruh agregasi, rasio serapan, dan selisih rupiah",
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
          value: "Deteksi lonjakan belanja modal >40% dalam 61 hari terakhir (Nov–Des)",
        },
      ],
      actionLink: {
        label: "Pelajari rumus detail serapan & modal",
        href: "#rumus-indikator",
      },
    },
  },
  {
    step: "03",
    phase: "Navigation & Surfaces",
    title: "Ruang Eksplorasi Publik",
    badge: "Sitemap 3 Halaman",
    summary: "Jelajah 10 Daerah (/), Profil Lengkap (/daerah/[kode]), Komparasi (/bandingkan)",
    icon: Compass,
    bullets: [
      {
        label: "Jelajah 10 Daerah (/)",
        desc: "Ringkasan fiskal makro, pencarian, dan filter penanda kritis",
      },
      {
        label: "Profil Lengkap (/daerah/[kode])",
        desc: "Tren bulanan, riwayat modal 3 tahun & lembar telaah kritis",
      },
      {
        label: "Komparasi Berdampingan (/bandingkan)",
        desc: "Perbandingan paralel 2–3 daerah pada periode yang sama",
      },
    ],
    technicalDetails: {
      headline: "Sitemap Terstruktur untuk Eksplorasi Multi-Sudut Pandang",
      description:
        "GovSight ID membagi antarmuka menjadi 3 ruang eksplorasi terpadu yang saling terhubung melalui parameter periode URL yang sinkron:",
      surfaces: [
        {
          title: "Jelajah 10 Daerah",
          path: "/",
          desc: "Tabel konsolidasi 10 pemda, pemfilteran kota/kabupaten, dan ringkasan fiskal makro.",
        },
        {
          title: "Profil Lengkap Daerah",
          path: "/daerah/0215",
          desc: "Grafik serapan per bulan, persentase modal 3 tahun berturut-turut, serta evaluasi ambang HKPD.",
        },
        {
          title: "Komparasi Berdampingan",
          path: "/bandingkan",
          desc: "Matriks perbandingan metrik fiskal berdampingan antara 2 hingga 3 daerah secara bersamaan.",
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
    summary: "Unduh CSV diaudit, Cetak Lembar Pertanyaan PDF, Integrasi SP4N-LAPOR!",
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
        label: "Pelajari 3 kanal partisipasi warga di bawah",
        href: "#kanal-aduan",
      },
    },
  },
];

export function Methodology({ dataset }: { dataset: Dataset }) {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [scalabilityPhase, setScalabilityPhase] = useState<number>(0);
  const { year, month, update, invalidPeriod } = useFilters();
  if (invalidPeriod) return <UnavailablePeriod />;
  const snapshots = dataset.snapshots.filter(
    (row) => row.year === year && row.month === month,
  );

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <h1>Kenali angka di balik layar.</h1>
          <p style={{ maxWidth: "68ch" }}>
            Dari mana datanya, bagaimana dihitung, dan apa batasnya.
          </p>
        </div>
        <div className="page-actions">
          <ShareButton />
        </div>
      </div>

      <div className="stack">
        <div className="method-hero">
          <span className="method-hero__mark">
            <ShieldCheck size={23} />
          </span>
          <div className="method-hero__text">
            <h2>Keterbukaan dimulai dari sumber yang jelas.</h2>
            <p style={{ maxWidth: "68ch", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              GovSight ID mengolah data publik APBD dari DJPK Kementerian
              Keuangan. Kami menghitung indikator dengan rumus terbuka dan
              menandai pola yang perlu dipertanyakan. Penanda bukan vonis dan
              selalu dapat ditelusuri ke sumbernya.
            </p>
          </div>
          <a
            className="btn btn--secondary"
            href="https://djpk.kemenkeu.go.id/portal/data/apbd"
            target="_blank"
            rel="noreferrer"
          >
            Buka portal DJPK <ArrowUpRight size={15} />
          </a>
        </div>

        {/* Peta Arsitektur, Alur Data & Sitemap GovSight ID */}
        <section
          id="arsitektur-sitemap"
          className="pipeline-section"
          aria-labelledby="arsitektur-sitemap-heading"
        >
          <div className="pipeline-header">
            <h2 id="arsitektur-sitemap-heading" className="pipeline-header__title">
              Peta Arsitektur, Alur Data & Sitemap GovSight ID
            </h2>
            <p className="pipeline-header__desc" style={{ maxWidth: "68ch" }}>
              Dari unduhan data mentah Kemenkeu hingga instrumen advokasi warga di lapangan.
              Klik salah satu tahapan di bawah untuk menelaah spesifikasi teknis dan alur integrasinya.
            </p>
          </div>

          {/* Visual Stepper / Timeline Nodes */}
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
                    <span className="pipeline-node__step">Tahap {stage.step}</span>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="pipeline-node__phase">{stage.phase}</span>
                    <h3 className="pipeline-node__title">{stage.title}</h3>
                  </div>
                  <div className="pipeline-node__summary">
                    {stage.bullets.map((b, i) => (
                      <div key={i} style={{ marginBottom: 4 }}>
                        <strong style={{ fontSize: "0.72rem", color: "var(--ink)" }}>• {b.label}:</strong>{" "}
                        <span style={{ fontSize: "0.72rem" }}>{b.desc}</span>
                      </div>
                    ))}
                  </div>
                  <span className="pipeline-node__badge">{stage.badge}</span>
                  {idx < pipelineStages.length - 1 && (
                    <span
                      className="pipeline-node__connector-arrow"
                      aria-hidden="true"
                    >
                      <ArrowRight size={10} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Detail Panel for Focused Stage */}
          {(() => {
            const current = pipelineStages[activeStage];
            const CurrentIcon = current.icon;
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
                    <strong style={{ fontSize: "0.9375rem", color: "var(--ink)" }}>
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
                  {/* Left Column: Specifications & Engine */}
                  <div className="pipeline-spec-card">
                    <span className="pipeline-spec-card__title">
                      <CurrentIcon size={14} /> Ringkasan Alur & Indikator
                    </span>
                    <ul className="pipeline-spec-list">
                      {current.bullets.map((b, i) => (
                        <li key={i} className="pipeline-spec-item is-highlight">
                          <span className="pipeline-spec-item__label">{b.label}</span>
                          <span className="pipeline-spec-item__desc">{b.desc}</span>
                        </li>
                      ))}
                    </ul>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--ink-2)",
                        lineHeight: 1.6,
                        margin: "4px 0 0",
                        maxWidth: "68ch",
                      }}
                    >
                      {current.technicalDetails.description}
                    </p>
                  </div>

                  {/* Right Column: Technical Architecture or Surfaces */}
                  <div className="pipeline-spec-card">
                    <span className="pipeline-spec-card__title">
                      <Check size={14} /> Detail Teknis & Akses Navigasi
                    </span>

                    {current.technicalDetails.surfaces ? (
                      <div className="pipeline-pills" style={{ flexDirection: "column", gap: 8 }}>
                        {current.technicalDetails.surfaces.map((s, idx) => (
                          <Link
                            key={idx}
                            href={s.path}
                            className="pipeline-pill"
                            style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px" }}
                          >
                            <div>
                              <strong style={{ display: "block", fontSize: "0.8125rem", color: "var(--ink)" }}>
                                {s.title}
                              </strong>
                              <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
                                {s.desc}
                              </span>
                            </div>
                            <code>{s.path}</code>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <ul className="pipeline-spec-list">
                        {current.technicalDetails.highlights?.map((h, i) => (
                          <li key={i} className="pipeline-spec-item">
                            <span className="pipeline-spec-item__label">{h.term}</span>
                            <span className="pipeline-spec-item__desc">{h.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {current.technicalDetails.actionLink && (
                      <div style={{ marginTop: "auto", paddingTop: 8 }}>
                        <a
                          href={current.technicalDetails.actionLink.href}
                          className="btn btn--secondary btn--sm"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          {current.technicalDetails.actionLink.label}{" "}
                          <ArrowRight size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Blueprint Skalabilitas Nasional (10 → 33 → 154 → 514 Daerah) */}
        <section
          id="skalabilitas-nasional"
          className="pipeline-section"
          aria-labelledby="skalabilitas-nasional-heading"
        >
          <div className="pipeline-header">
            <h2 id="skalabilitas-nasional-heading" className="pipeline-header__title">
              Blueprint Skalabilitas Nasional (10 → 33 → 154 → 514 Daerah)
            </h2>
            <p className="pipeline-header__desc" style={{ maxWidth: "68ch" }}>
              Dari 10 pemda percontohan di Sumatera Utara menuju pengawasan 514 kabupaten/kota dan 38 provinsi se-Indonesia.
              Klik salah satu tahapan di bawah untuk mempelajari evolusi arsitektur penyimpanan, model komputasi, dan efisiensi seluler.
            </p>
          </div>

          {/* Stepper 3 Tahap */}
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
                    <span className="pipeline-node__step">Tahap {phase.step}</span>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="pipeline-node__phase">{phase.shortTitle}</span>
                    <h3 className="pipeline-node__title" style={{ fontSize: "0.9375rem" }}>
                      {phase.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--ink-2)", margin: 0, lineHeight: 1.45 }}>
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
            const CurrentIcon = currentPhase.icon;
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
                    <span className={"chip " + currentPhase.badgeVariant + " chip--square"}>
                      {currentPhase.badge}
                    </span>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--ink)" }}>
                      {currentPhase.title}
                    </strong>
                  </div>
                  <div className="pipeline-detail__nav">
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => setScalabilityPhase((p) => Math.max(0, p - 1))}
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
                      disabled={scalabilityPhase === scalabilityPhases.length - 1}
                      aria-label="Tahap berikutnya"
                    >
                      Berikutnya <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Deskripsi & Rationale */}
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                    margin: "14px 0 16px",
                    maxWidth: "68ch",
                  }}
                >
                  {currentPhase.rationale}
                </p>

                {/* Grid 6 Metrik Teknis Utama */}
                <div className="metrics" style={{ marginBottom: 18 }}>
                  <div className="metric">
                    <span className="metric__label">
                      <CurrentIcon size={13} /> Cakupan Pemda
                    </span>
                    <strong className="metric__value metric__value--accent" style={{ fontSize: "1.125rem" }}>
                      {currentPhase.scope}
                    </strong>
                    <span className="metric__hint" style={{ fontSize: "0.72rem" }}>
                      {currentPhase.scopeDesc}
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Database size={13} /> Volume Snapshot
                    </span>
                    <strong className="metric__value" style={{ fontSize: "1.125rem" }}>
                      {currentPhase.snapshots}
                    </strong>
                    <span className="metric__hint" style={{ fontSize: "0.72rem" }}>
                      Raw payload: {currentPhase.rawSize}
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Zap size={13} /> Payload Browser Klien
                    </span>
                    <strong className="metric__value" style={{ fontSize: "1.125rem", color: "var(--ok-solid)" }}>
                      {currentPhase.clientPayload}
                    </strong>
                    <span className="metric__hint" style={{ fontSize: "0.72rem" }}>
                      Ramah kuota & seluler pedesaan
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Cpu size={13} /> Target Latensi (TTFB)
                    </span>
                    <strong className="metric__value" style={{ fontSize: "1.125rem" }}>
                      {currentPhase.latencyTarget}
                    </strong>
                    <span className="metric__hint" style={{ fontSize: "0.72rem" }}>
                      Kecepatan respons edge CDN
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Server size={13} /> Throughput Server
                    </span>
                    <strong className="metric__value" style={{ fontSize: "1.125rem" }}>
                      {currentPhase.throughputTarget}
                    </strong>
                    <span className="metric__hint" style={{ fontSize: "0.72rem" }}>
                      Kapasitas beban bersamaan
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric__label">
                      <Scale size={13} /> Estimasi Biaya Infra
                    </span>
                    <strong className="metric__value" style={{ fontSize: "1.125rem" }}>
                      {currentPhase.costEstimate}
                    </strong>
                    <span className="metric__hint" style={{ fontSize: "0.72rem" }}>
                      Civic tech efisiensi maksimal
                    </span>
                  </div>
                </div>

                {/* 2 Kolom Spesifikasi Detail */}
                <div className="pipeline-detail__content">
                  {/* Kolom Kiri: Arsitektur Penyimpanan & Partisi Data */}
                  <div className="pipeline-spec-card">
                    <span className="pipeline-spec-card__title">
                      <HardDrive size={14} /> Arsitektur Penyimpanan & Partisi Data
                    </span>
                    <ul className="pipeline-spec-list">
                      {currentPhase.storageBullets.map((b, i) => (
                        <li key={i} className="pipeline-spec-item is-highlight">
                          <span className="pipeline-spec-item__label">{b.label}</span>
                          <span className="pipeline-spec-item__desc">{b.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Kolom Kanan: Model Komputasi & Efisiensi Seluler */}
                  <div className="pipeline-spec-card">
                    <span className="pipeline-spec-card__title">
                      <Cpu size={14} /> Model Komputasi & Efisiensi Seluler
                    </span>
                    <ul className="pipeline-spec-list">
                      {currentPhase.computeBullets.map((b, i) => (
                        <li key={i} className="pipeline-spec-item is-highlight">
                          <span className="pipeline-spec-item__label">{b.label}</span>
                          <span className="pipeline-spec-item__desc">{b.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Contextual Preview: Pulau Sumatera (Tahap 2) atau 6 Gugus Nasional (Tahap 3) */}
                {currentPhase.phaseKey === "tahap-2" && (
                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 8 }}>
                      Distribusi 10 Provinsi Se-Pulau Sumatera (154 Daerah):
                    </span>
                    <div className="pipeline-pills" style={{ flexWrap: "wrap", gap: 6 }}>
                      {sumateraProvinces.map((prov) => (
                        <span key={prov.code} className="chip chip--sunk" style={{ fontSize: "0.75rem" }}>
                          <strong>{prov.name}</strong> ({prov.daerahCount} daerah)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentPhase.phaseKey === "tahap-3" && (
                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 8 }}>
                      Distribusi 6 Gugus Kepulauan Nasional (514 Daerah / 38 Provinsi):
                    </span>
                    <div className="pipeline-pills" style={{ flexWrap: "wrap", gap: 6 }}>
                      {nationalIslandsGroups.map((gugus) => (
                        <span key={gugus.id} className="chip chip--accent" style={{ fontSize: "0.75rem" }}>
                          <strong>{gugus.name}</strong>: {gugus.daerahCount} daerah ({gugus.provincesCount} prov)
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
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
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
                    <td><strong style={{ color: "var(--ok-solid)" }}>450 KB</strong> (Gzip ~68 KB)</td>
                    <td><strong style={{ color: "var(--ok-solid)" }}>Index ~15 KB</strong> + Chunk ~180 KB</td>
                    <td><strong style={{ color: "var(--ok-solid)" }}>Index &lt;50 KB</strong> + Detail ~18 KB</td>
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
                  <tr>
                    <th>Biaya Infrastruktur</th>
                    <td><strong>$0 / bulan</strong> (Free Tier)</td>
                    <td><strong>~$19 / bulan</strong> (Vercel Pro)</td>
                    <td><strong>~$50 – $120 / bulan</strong></td>
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
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--ink-2)", lineHeight: 1.6, maxWidth: "68ch" }}>
              Pada skala 514 daerah dengan 36 bulan data historis, satu berkas JSON monolitik akan membengkak hingga lebih dari 25 MB.
              Di jaringan 4G pedesaan Indonesia dengan kecepatan rata-rata 2–3 Mbps, mengunduh 25 MB membutuhkan waktu lebih dari 100 detik
              serta memicu kehabisan memori (OOM browser crash) pada smartphone beranggaran rendah (RAM 2GB–3GB).
              Arsitektur modular GovSight ID memangkas beban awal menjadi hanya search index &lt;50 KB dan data detail daerah on-demand ~18 KB.
            </p>
          </div>

          {/* Action / Documentation Links */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <a
                href="/docs/ARSITEKTUR-SKALABILITAS.md"
                download="ARSITEKTUR-SKALABILITAS.md"
                className="btn btn--primary"
              >
                <Download size={14} /> Unduh Cetak Biru Arsitektur (Markdown)
              </a>
              <a
                href="/docs/ARSITEKTUR-SKALABILITAS.md"
                target="_blank"
                rel="noreferrer"
                className="btn btn--secondary"
              >
                <FileText size={14} /> Baca Dokumen Lengkap & Skema DDL <ArrowUpRight size={13} />
              </a>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Dokumen resmi: <code>docs/ARSITEKTUR-SKALABILITAS.md</code>
            </span>
          </div>
        </section>

        <div id="rumus-indikator" className="grid-2">
          <section className="card">
            <div className="card__body">
              <h2 className="inquiry-title">
                Serapan belanja
              </h2>
              <p
                className="muted"
                style={{ fontSize: "0.875rem", maxWidth: "65ch", lineHeight: 1.6 }}
              >
                Berapa bagian rencana belanja tahunan yang sudah direalisasikan
                sampai periode tertentu.
              </p>
              <div className="formula" style={{ margin: "16px 0" }}>
                <span>Realisasi sampai periode terpilih</span>
                <span className="formula__line" />
                <span>Pagu belanja tahunan</span>
                <strong>× 100%</strong>
              </div>
              <p className="formula-example" style={{ maxWidth: "65ch" }}>
                Contoh ilustrasi: realisasi Rp60 miliar dari pagu Rp100 miliar
                berarti serapan <strong>60%</strong>.
              </p>
            </div>
          </section>

          <section className="card">
            <div className="card__body">
              <h2 className="inquiry-title">
                Komposisi realisasi
              </h2>
              <p
                className="muted"
                style={{ fontSize: "0.875rem", maxWidth: "65ch", lineHeight: 1.6 }}
              >
                Berapa porsi suatu kategori dari seluruh belanja yang sudah
                direalisasikan.
              </p>
              <div className="formula" style={{ margin: "16px 0" }}>
                <span>Realisasi suatu kategori</span>
                <span className="formula__line" />
                <span>Total realisasi belanja</span>
                <strong>× 100%</strong>
              </div>
              <p className="formula-example" style={{ maxWidth: "65ch" }}>
                Contoh ilustrasi: belanja modal Rp15 miliar dari total realisasi
                Rp60 miliar berarti porsi modal <strong>25%</strong>.
              </p>
            </div>
          </section>
        </div>

        <section className="card">
          <div className="card__body">
            <h2 className="inquiry-title">
              Penumpukan belanja modal akhir tahun
            </h2>
            <div className="formula" style={{ margin: "18px 0" }}>
              <span>Realisasi modal s.d. Des − realisasi modal s.d. Okt</span>
              <span className="formula__line" />
              <span>Total realisasi modal setahun (s.d. Des)</span>
              <strong>× 100%</strong>
            </div>
            <p
              className="muted"
              style={{ fontSize: "0.875rem", maxWidth: "68ch", lineHeight: 1.6 }}
            >
              Hasil perhitungan dibulatkan ke dua desimal sebelum dibandingkan
              dengan ambang batas <strong>{YEAR_END_THRESHOLD}%</strong>.
            </p>

            <div className="prose" style={{ marginTop: 24, maxWidth: "68ch" }}>
              <h3>Mengapa ambang {YEAR_END_THRESHOLD}% dipilih?</h3>
              <p style={{ lineHeight: 1.65 }}>
                Jika belanja modal terdistribusi proporsional sepanjang 12
                bulan, pengeluaran dua bulan terakhir (November–Desember)
                sewajarnya hanya menyerap sekitar <strong>16,67%</strong> (2/12)
                dari total tahunan. Ambang{" "}
                <strong>{YEAR_END_THRESHOLD}%</strong> menandai lonjakan
                percepatan anggaran lebih dari 2,4 kali laju normal hanya dalam
                rentang 61 hari terakhir.
              </p>
              <h3>
                Mengapa penanda ini penting jika sebagian besar daerah
                terindikasi?
              </h3>
              <p style={{ lineHeight: 1.65 }}>
                Dalam data APBD sepuluh daerah Sumatera Utara yang dianalisis,
                sebanyak <strong>14 dari 20 tahun anggaran (70%)</strong>{" "}
                melampaui ambang {YEAR_END_THRESHOLD}%, bahkan Kabupaten Deli
                Serdang mencapai 73,41% pada tahun 2025. Fakta ini menegaskan
                bahwa penumpukan belanja modal di akhir tahun bukan anomali
                tunggal, melainkan <em>pola struktural sistemik</em> ("belanja
                kejar tayang") dalam tata kelola anggaran daerah.
              </p>
              <p style={{ lineHeight: 1.65, maxWidth: "68ch" }}>
                Sebagai <strong>instrumen telaah berbasis rujukan hukum dan audit resmi (UU No. 1/2022 HKPD)</strong>, penanda ini
                bukan vonis sepihak atau penetapan kesalahan hukum. Status penanda —{" "}
                <em>perlu ditanyakan (ditandai)</em>, <em>di bawah ambang (wajar)</em>,{" "}
                <em>belum tersedia</em>, atau <em>tidak konsisten</em> — berfungsi sebagai{" "}
                <strong>alat uji kepatuhan dan bahan advokasi publik berbasis data</strong>. Instrumen ini
                memperkuat warga, jurnalis data, dan anggota dewan perwakilan rakyat daerah (DPRD) dalam menelaah realisasi fisik pekerjaan,
                mengonfirmasi Berita Acara Serah Terima (BAST), serta menguji kewajaran penyerapan anggaran secara akuntabel.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Istilah yang sering ditemui</h2>
            </div>
          </div>
          <div className="card__body">
            <dl className="defs">
              <div>
                <dt>Pagu belanja</dt>
                <dd style={{ maxWidth: "65ch", lineHeight: 1.6 }}>
                  Rencana atau batas anggaran belanja satu tahun sesuai data
                  APBD murni atau perubahan pada sumber.
                </dd>
              </div>
              <div>
                <dt>Realisasi belanja</dt>
                <dd style={{ maxWidth: "65ch", lineHeight: 1.6 }}>
                  Belanja yang dilaporkan telah direalisasikan, diakumulasi
                  sampai bulan pelaporan terpilih.
                </dd>
              </div>
              <div>
                <dt>Belanja pegawai</dt>
                <dd style={{ maxWidth: "65ch", lineHeight: 1.6 }}>
                  Belanja untuk pegawai, termasuk tenaga pelayanan publik.
                  Kategori ini tidak berarti seluruhnya biaya administrasi.
                </dd>
              </div>
              <div>
                <dt>Belanja barang dan jasa</dt>
                <dd style={{ maxWidth: "65ch", lineHeight: 1.6 }}>
                  Pengeluaran barang dan jasa untuk kegiatan serta operasional
                  pemerintah dan pelayanan.
                </dd>
              </div>
              <div>
                <dt>Belanja modal</dt>
                <dd style={{ maxWidth: "65ch", lineHeight: 1.6 }}>
                  Kategori pengeluaran untuk perolehan aset sesuai klasifikasi
                  sumber. Nilainya belum membuktikan kondisi atau mutu fisik
                  aset.
                </dd>
              </div>
              <div>
                <dt>Belanja lainnya</dt>
                <dd style={{ maxWidth: "65ch", lineHeight: 1.6 }}>
                  Kelompok lain yang disajikan DJPK, termasuk hibah, bantuan
                  sosial, transfer, atau belanja lain sesuai akun sumber.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">
                Rujukan regulasi dan batas penafsiran hukum
              </h2>
              <p className="card__sub" style={{ maxWidth: "68ch" }}>
                Rujukan hukum nasional disajikan untuk membantu memahami konteks
                kebijakan anggaran daerah, bukan untuk memvonis pelanggaran.
              </p>
            </div>
          </div>
          <div className="card__body">
            <dl className="defs defs--single">
              <div
                style={{
                  paddingBottom: 24,
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <dt style={{ fontSize: "0.9375rem" }}>
                  UU No. 1/2022 (HKPD) Pasal 146 ayat (1) — belanja pegawai
                </dt>
                <dd style={{ maxWidth: "70ch", lineHeight: 1.65 }}>
                  <blockquote style={{ maxWidth: "68ch" }}>
                    “Daerah wajib mengalokasikan belanja pegawai di luar
                    tunjangan guru yang dialokasikan melalui TKD paling tinggi
                    30% (tiga puluh persen) dari total belanja APBD.”
                  </blockquote>
                  <strong>Penerapan dan pengecualian resmi</strong>
                  Ketentuan ini memiliki masa transisi penyesuaian lima tahun
                  sejak diundangkan, berlaku penuh pada 2027. Data DJPK yang
                  ditampilkan di GovSight ID merupakan pagu dan realisasi
                  belanja murni dari portal SIKD yang belum dikurangi komponen
                  pengecualian resmi, seperti tunjangan guru TKD dan bagi hasil
                  desa. Karena itu, persentase belanja pegawai di sini berfungsi
                  sebagai indikator ruang fiskal antardaerah, bukan audit
                  kepatuhan hukum mandatori.
                </dd>
              </div>
              <div style={{ paddingTop: 24 }}>
                <dt style={{ fontSize: "0.9375rem" }}>
                  UU No. 1/2022 (HKPD) Pasal 147 ayat (1) — infrastruktur publik
                </dt>
                <dd style={{ maxWidth: "70ch", lineHeight: 1.65 }}>
                  <blockquote style={{ maxWidth: "68ch" }}>
                    “Daerah wajib mengalokasikan belanja infrastruktur pelayanan
                    publik paling rendah 40% (empat puluh persen) dari total
                    belanja APBD di luar belanja bagi hasil dan/atau transfer
                    kepada daerah dan/atau desa.”
                  </blockquote>
                  <strong>Pembedaan penting</strong>
                  <em>Belanja infrastruktur pelayanan publik</em> merupakan{" "}
                  <strong>klasifikasi fungsi</strong> — pelayanan dasar publik
                  di berbagai pos belanja. Ini <strong>berbeda</strong> dengan{" "}
                  <em>belanja modal</em> yang merupakan{" "}
                  <strong>klasifikasi ekonomi</strong>, yaitu perolehan aset
                  tetap fisik. Belanja modal hanyalah salah satu komponen
                  pembentuk infrastruktur, sehingga angka belanja modal di
                  GovSight ID tidak dapat disamakan langsung dengan kepatuhan
                  Pasal 147 HKPD.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Siklus APBD — Flattened Clean Layout */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">
                Siklus APBD dan titik kritis pengawasan warga
              </h2>
              <p className="card__sub" style={{ maxWidth: "68ch" }}>
                Kapan masyarakat dapat terlibat, dan bagaimana menyalurkan
                aspirasi secara berdaya?
              </p>
            </div>
          </div>
          <div className="card__body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span
                  className="chip chip--square chip--sunk"
                  style={{ alignSelf: "flex-start" }}
                >
                  Fase 1 · Jan–Mei
                </span>
                <h3
                  style={{
                    fontSize: "0.9375rem",
                    margin: "4px 0 2px",
                    fontWeight: 600,
                  }}
                >
                  Perencanaan (Musrenbang)
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                    maxWidth: "60ch",
                    margin: 0,
                  }}
                >
                  Musyawarah perencanaan dari tingkat desa, kecamatan, hingga
                  forum SKPD dan RKPD. Warga berhak mengusulkan pembangunan
                  prioritas di wilayahnya.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span
                  className="chip chip--square chip--sunk"
                  style={{ alignSelf: "flex-start" }}
                >
                  Fase 2 · Jun–Nov
                </span>
                <h3
                  style={{
                    fontSize: "0.9375rem",
                    margin: "4px 0 2px",
                    fontWeight: 600,
                  }}
                >
                  Penganggaran & Pembahasan DPRD
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                    maxWidth: "60ch",
                    margin: 0,
                  }}
                >
                  Pemerintah menyusun KUA-PPAS dan Nota Keuangan RAPBD untuk
                  dibahas bersama DPRD. Pantau komisi terkait agar usulan warga
                  tidak tergeser belanja seremonial.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span
                  className="chip chip--square chip--accent"
                  style={{ alignSelf: "flex-start" }}
                >
                  Fase 3 · Jan–Des · Fokus GovSight ID
                </span>
                <h3
                  style={{
                    fontSize: "0.9375rem",
                    margin: "4px 0 2px",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  Pelaksanaan & Penyerapan
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                    maxWidth: "60ch",
                    margin: 0,
                  }}
                >
                  Realisasi DPA oleh dinas-dinas teknis. Pantau apakah pencairan
                  belanja modal berjalan tertib atau menumpuk tajam di pengujung
                  tahun.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span
                  className="chip chip--square chip--sunk"
                  style={{ alignSelf: "flex-start" }}
                >
                  Fase 4 · Jan–Jun (T+1)
                </span>
                <h3
                  style={{
                    fontSize: "0.9375rem",
                    margin: "4px 0 2px",
                    fontWeight: 600,
                  }}
                >
                  Audit & Pertanggungjawaban
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                    maxWidth: "60ch",
                    margin: 0,
                  }}
                >
                  Pemeriksaan LKPD oleh BPK RI dan evaluasi LKPJ di DPRD. Warga
                  dapat menguji kesesuaian fisik aset di lapangan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tiga Kanal Resmi Partisipasi & Pengaduan Warga — Flattened Clean Layout */}
        <section id="kanal-aduan" className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">
                Tiga kanal resmi partisipasi dan pengaduan warga
              </h2>
              <p className="card__sub" style={{ maxWidth: "68ch" }}>
                Rujukan regulasi resmi dan mekanisme pengaduan publik berbasis bukti data anggaran.
              </p>
            </div>
          </div>
          <div className="card__body">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "18px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  1
                </span>
                <div style={{ maxWidth: "68ch" }}>
                  <strong
                    style={{
                      fontSize: "0.9375rem",
                      display: "block",
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  >
                    Pejabat Pengelola Informasi dan Dokumentasi (PPID)
                  </strong>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--ink-2)",
                      lineHeight: 1.6,
                      margin: 0,
                      maxWidth: "68ch",
                    }}
                  >
                    Berdasarkan <strong>UU No. 14/2008 (KIP)</strong>, setiap
                    warga berhak mengajukan permohonan salinan DPA, RKA, dan
                    Berita Acara Serah Terima (BAST) pekerjaan konstruksi ke pemda.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "18px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                <div style={{ maxWidth: "68ch" }}>
                  <strong
                    style={{
                      fontSize: "0.9375rem",
                      display: "block",
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  >
                    SP4N-LAPOR! (lapor.go.id)
                  </strong>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--ink-2)",
                      lineHeight: 1.6,
                      margin: 0,
                      maxWidth: "68ch",
                    }}
                  >
                    Layanan pengaduan nasional resmi yang terhubung ke
                    Ombudsman RI dan Kementerian PAN-RB. Gunakan data tanggal
                    dan nominal dari GovSight ID sebagai bukti awal pelaporan.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "18px 0",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  3
                </span>
                <div style={{ maxWidth: "68ch" }}>
                  <strong
                    style={{
                      fontSize: "0.9375rem",
                      display: "block",
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  >
                    Forum reses dan Rapat Dengar Pendapat (RDP) DPRD
                  </strong>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--ink-2)",
                      lineHeight: 1.6,
                      margin: 0,
                      maxWidth: "68ch",
                    }}
                  >
                    Manfaatkan <em>lembar telaah kritis</em> di profil daerah
                    untuk mengajukan pertanyaan spesifik langsung kepada
                    anggota dewan daerah pemilihmu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sumber-data" className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Sumber yang bisa kamu periksa</h2>
              <p className="card__sub" style={{ maxWidth: "68ch" }}>
                Unduh data olahan atau buka berkas asli untuk periode terpilih.
              </p>
            </div>
            <div className="section-head__actions">
              <PeriodControls year={year} month={month} onChange={update} />
            </div>
          </div>
          <div className="card__body">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Daerah</th>
                    <th>Keterangan penerimaan SIKD pada portal</th>
                    <th>Diperiksa oleh GovSight ID</th>
                    <th>Berkas sumber</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((row) => (
                    <tr key={row.regionCode}>
                      <th>
                        {
                          regions.find(
                            (region) => region.code === row.regionCode,
                          )?.name
                        }
                      </th>
                      <td>{dateLabel(row.source.publishedAt)}</td>
                      <td>{dateLabel(row.source.checkedAt)}</td>
                      <td>
                        <span className="audit-links">
                          <a
                            href={row.source.rawPath}
                            download
                            className="file-link"
                          >
                            <ArrowDownToLine size={12} /> Unduh asli
                          </a>
                          <a
                            href={row.source.portalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="file-link"
                          >
                            Buka DJPK <ArrowUpRight size={12} />
                          </a>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card__foot">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <p
                className="muted"
                style={{
                  fontSize: "0.8125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  maxWidth: "68ch",
                }}
              >
                <Database size={14} /> Berkas asli disimpan untuk penelusuran.
              </p>
              <DownloadButton
                codes={snapshots.map((row) => row.regionCode)}
                year={year}
                month={month}
              />
            </div>
          </div>
        </section>

        {/* Flattened Limits and Update Cadence Section with Hairline Separation */}
        <section className="card">
          <div
            className="card__body"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 24,
            }}
          >
            <div className="limits" style={{ maxWidth: "65ch" }}>
              <span className="limits__mark">
                <FileText size={19} />
              </span>
              <h2 className="card__title">
                Apa yang belum dijelaskan data ini?
              </h2>
              <ul style={{ margin: "14px 0", paddingLeft: 20 }}>
                <li style={{ marginBottom: 6 }}>
                  Mutu jalan, sekolah, atau fasilitas publik.
                </li>
                <li style={{ marginBottom: 6 }}>
                  Tingkat kepuasan dan manfaat yang dirasakan warga.
                </li>
                <li>
                  Efisiensi, dugaan korupsi, atau kinerja keseluruhan pemda.
                </li>
              </ul>
              <p
                className="muted"
                style={{ fontSize: "0.875rem", lineHeight: 1.6 }}
              >
                Untuk menjawabnya, diperlukan data hasil layanan, konteks
                wilayah, dan pemeriksaan lebih lanjut di lapangan.
              </p>
            </div>

            <div className="limits" style={{ maxWidth: "65ch" }}>
              <span className="limits__mark">
                <RefreshCw size={19} />
              </span>
              <h2 className="card__title">Bagaimana data diperbarui?</h2>
              <p
                className="muted"
                style={{ fontSize: "0.875rem", marginTop: 12, lineHeight: 1.6 }}
              >
                Versi awal ini memakai salinan data yang diperiksa pada{" "}
                <strong>{dateLabel(dataset.generatedAt)}</strong>. Pembaruan
                mengikuti publikasi berkala DJPK Kementerian Keuangan.
              </p>
              <p
                className="muted"
                style={{ fontSize: "0.875rem", marginTop: 10, lineHeight: 1.6 }}
              >
                Tanggal penerimaan SIKD berasal dari keterangan portal saat
                pemeriksaan, bukan tanggal terbit tiap angka. Tanggal
                pemeriksaan menunjukkan kapan kami mengakses sumber.
              </p>
              <span className="checked-line" style={{ marginTop: 14 }}>
                <Check size={14} /> Bukan pembaruan langsung secara real-time.
              </span>
            </div>
          </div>
        </section>

        <InfoNote>
          Perbandingan memakai bulan pelaporan yang sama. Data yang kosong tidak
          diubah menjadi nol, dan kategori berulang tidak dihitung dua kali.
          Revisi sumber dapat mengubah angka historis.
        </InfoNote>
      </div>
    </>
  );
}
