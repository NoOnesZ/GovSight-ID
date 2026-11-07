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
  FileCheck2,
  FileText,
  GraduationCap,
  Landmark,
  RefreshCw,
  Scale,
  ShieldCheck,
} from "lucide-react";
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
            <div className="pipeline-header__badge-row">
              <span className="chip chip--accent chip--square">
                Arsitektur & Sitemap
              </span>
              <span className="chip chip--sunk chip--square">
                Alur Data 4 Tahap
              </span>
            </div>
            <h2 id="arsitektur-sitemap-heading" className="pipeline-header__title">
              Peta Arsitektur, Alur Data & Sitemap GovSight ID
            </h2>
            <p className="pipeline-header__desc">
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

        <div id="rumus-indikator" className="grid-2">
          <section className="card">
            <div className="card__body">
              <span className="chip chip--sunk">Pelaksanaan anggaran</span>
              <h2 className="inquiry-title" style={{ marginTop: 10 }}>
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
              <span className="chip chip--ok">Pembagian belanja</span>
              <h2 className="inquiry-title" style={{ marginTop: 10 }}>
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
            <span className="chip chip--warn">
              Penanda Kritis
            </span>
            <h2 className="inquiry-title" style={{ marginTop: 10 }}>
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
              <p style={{ lineHeight: 1.65 }}>
                Sebagai <strong>Sistem Pendukung Keputusan & Advokasi Warga</strong>, penanda ini
                bukan vonis hukum sepihak atau bukti pelanggaran pidana. Status penanda —{" "}
                <em>perlu ditanyakan (ditandai)</em>, <em>di bawah ambang (wajar)</em>,{" "}
                <em>belum tersedia</em>, atau <em>tidak konsisten</em> — berfungsi sebagai{" "}
                <strong>pemicu advokasi dan pertanyaan publik berbasis data</strong>. Instrumen ini
                memperkuat warga, akademisi, jurnalis, dan anggota dewan untuk menuntut pembuktian
                serah terima fisik pekerjaan, menguji mutu konstruksi di lapangan, serta memastikan
                hak publik atas anggaran terpenuhi.
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

        {/* Siklus APBD & Kanal Pengawasan Warga — Flattened Sections with Hairline Dividers */}
        <section className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--ok">
                <GraduationCap size={12} /> Edukasi literasi anggaran
              </span>
              <h2 className="inquiry-title" style={{ marginTop: 8 }}>
                Siklus APBD dan titik kritis pengawasan warga
              </h2>
              <p className="card__sub" style={{ maxWidth: "68ch" }}>
                Kapan masyarakat dapat terlibat, dan bagaimana menyalurkan
                aspirasi secara berdaya?
              </p>
            </div>
          </div>
          <div className="card__body">
            {/* Flattened Phase Flow */}
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
                  padding: "14px 0",
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
                  padding: "14px 0",
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
                  padding: "16px 18px",
                  background: "var(--accent-tint)",
                  borderLeft: "3px solid var(--accent)",
                  borderRadius: "var(--r-sm)",
                }}
              >
                <span
                  className="chip chip--square chip--warn"
                  style={{ alignSelf: "flex-start" }}
                >
                  Fase 3 · Jan–Des · Fokus GovSight
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
                  padding: "14px 0",
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

            {/* Hairline Divider with Generous Whitespace */}
            <div className="divider" style={{ margin: "32px 0 28px" }} />

            {/* Tiga Kanal Resmi Partisipasi & Pengaduan Warga */}
            <div id="kanal-aduan">
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Landmark size={17} style={{ color: "var(--accent)" }} /> Tiga
                kanal resmi partisipasi dan pengaduan warga
              </h3>
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
                      }}
                    >
                      Berdasarkan <strong>UU No. 14/2008 (KIP)</strong>, setiap
                      warga berhak mengajukan permohonan salinan DPA, RKA, dan
                      Berita Acara Serah Terima pekerjaan konstruksi ke pemda.
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
