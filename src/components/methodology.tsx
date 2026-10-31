"use client";

import {
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  Check,
  Database,
  FileText,
  GraduationCap,
  Landmark,
  RefreshCw,
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

export function Methodology({ dataset }: { dataset: Dataset }) {
  const { year, month, update, invalidPeriod } = useFilters();
  if (invalidPeriod) return <UnavailablePeriod />;
  const snapshots = dataset.snapshots.filter(
    (row) => row.year === year && row.month === month,
  );
  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <p className="eyebrow">
            <BookOpen size={13} /> Transparan sampai caranya
          </p>
          <h1>Kenali angka di balik layar.</h1>
          <p>Dari mana datanya, bagaimana dihitung, dan apa batasnya.</p>
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
            <p>
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

        <div className="grid-2">
          <section className="card">
            <div className="card__body">
              <span className="chip chip--sunk">Pelaksanaan anggaran</span>
              <h2 className="inquiry-title">Serapan belanja</h2>
              <p className="muted" style={{ fontSize: "0.875rem" }}>
                Berapa bagian rencana belanja tahunan yang sudah direalisasikan
                sampai periode tertentu.
              </p>
              <div className="formula">
                <span>Realisasi sampai periode terpilih</span>
                <span className="formula__line" />
                <span>Pagu belanja tahunan</span>
                <strong>× 100%</strong>
              </div>
              <p className="formula-example">
                Contoh ilustrasi: realisasi Rp60 miliar dari pagu Rp100 miliar
                berarti serapan <strong>60%</strong>.
              </p>
            </div>
          </section>

          <section className="card">
            <div className="card__body">
              <span className="chip chip--ok">Pembagian belanja</span>
              <h2 className="inquiry-title">Komposisi realisasi</h2>
              <p className="muted" style={{ fontSize: "0.875rem" }}>
                Berapa porsi suatu kategori dari seluruh belanja yang sudah
                direalisasikan.
              </p>
              <div className="formula">
                <span>Realisasi suatu kategori</span>
                <span className="formula__line" />
                <span>Total realisasi belanja</span>
                <strong>× 100%</strong>
              </div>
              <p className="formula-example">
                Contoh ilustrasi: belanja modal Rp15 miliar dari total realisasi
                Rp60 miliar berarti porsi modal <strong>25%</strong>.
              </p>
            </div>
          </section>
        </div>

        <section className="card">
          <div className="card__body">
            <span className="chip chip--warn">Penanda kritis (DSS)</span>
            <h2 className="inquiry-title">
              Penumpukan belanja modal akhir tahun
            </h2>
            <div className="formula">
              <span>Realisasi modal s.d. Des − realisasi modal s.d. Okt</span>
              <span className="formula__line" />
              <span>Total realisasi modal setahun (s.d. Des)</span>
              <strong>× 100%</strong>
            </div>
            <p className="muted" style={{ fontSize: "0.875rem" }}>
              Hasil perhitungan dibulatkan ke dua desimal sebelum dibandingkan
              dengan ambang batas <strong>{YEAR_END_THRESHOLD}%</strong>.
            </p>

            <div className="prose" style={{ marginTop: 20 }}>
              <h3>Mengapa ambang {YEAR_END_THRESHOLD}% dipilih?</h3>
              <p>
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
              <p>
                Dalam data APBD sepuluh daerah Sumatera Utara yang dianalisis,
                sebanyak <strong>14 dari 20 tahun anggaran (70%)</strong>{" "}
                melampaui ambang {YEAR_END_THRESHOLD}%, bahkan Kabupaten Deli
                Serdang mencapai 73,41% pada tahun 2025. Fakta ini menegaskan
                bahwa penumpukan belanja modal di akhir tahun bukan anomali
                tunggal, melainkan <em>pola struktural sistemik</em> ("belanja
                kejar tayang") dalam tata kelola anggaran daerah.
              </p>
              <p>
                Status penanda: <em>perlu ditanyakan (ditandai)</em>,{" "}
                <em>di bawah ambang (wajar)</em>, <em>belum tersedia</em>, atau{" "}
                <em>tidak konsisten</em> bila realisasi kumulatif tercatat
                menurun. Penanda berfungsi sebagai{" "}
                <strong>pemicu pertanyaan publik</strong> — misalnya memastikan
                serah terima fisik proyek dan kualitas hasil konstruksi — bukan
                vonis hukum atau bukti pelanggaran.
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
                <dd>
                  Rencana atau batas anggaran belanja satu tahun sesuai data
                  APBD murni atau perubahan pada sumber.
                </dd>
              </div>
              <div>
                <dt>Realisasi belanja</dt>
                <dd>
                  Belanja yang dilaporkan telah direalisasikan, diakumulasi
                  sampai bulan pelaporan terpilih.
                </dd>
              </div>
              <div>
                <dt>Belanja pegawai</dt>
                <dd>
                  Belanja untuk pegawai, termasuk tenaga pelayanan publik.
                  Kategori ini tidak berarti seluruhnya biaya administrasi.
                </dd>
              </div>
              <div>
                <dt>Belanja barang dan jasa</dt>
                <dd>
                  Pengeluaran barang dan jasa untuk kegiatan serta operasional
                  pemerintah dan pelayanan.
                </dd>
              </div>
              <div>
                <dt>Belanja modal</dt>
                <dd>
                  Kategori pengeluaran untuk perolehan aset sesuai klasifikasi
                  sumber. Nilainya belum membuktikan kondisi atau mutu fisik
                  aset.
                </dd>
              </div>
              <div>
                <dt>Belanja lainnya</dt>
                <dd>
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
              <p className="card__sub">
                Rujukan hukum nasional disajikan untuk membantu memahami konteks
                kebijakan anggaran daerah, bukan untuk memvonis pelanggaran.
              </p>
            </div>
          </div>
          <div className="card__body">
            <dl className="defs defs--single">
              <div>
                <dt>
                  UU No. 1/2022 (HKPD) Pasal 146 ayat (1) — belanja pegawai
                </dt>
                <dd>
                  <blockquote>
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
              <div>
                <dt>
                  UU No. 1/2022 (HKPD) Pasal 147 ayat (1) — infrastruktur publik
                </dt>
                <dd>
                  <blockquote>
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

        <section className="card">
          <div className="card__head">
            <div>
              <span className="chip chip--ok">
                <GraduationCap size={12} /> Edukasi literasi anggaran
              </span>
              <h2 className="inquiry-title">
                Siklus APBD dan titik kritis pengawasan warga
              </h2>
              <p className="card__sub">
                Kapan masyarakat dapat terlibat, dan bagaimana menyalurkan
                aspirasi secara berdaya?
              </p>
            </div>
          </div>
          <div className="card__body">
            <div className="cycle">
              <div className="cycle__card">
                <span className="chip chip--square chip--sunk">
                  Fase 1 · Jan–Mei
                </span>
                <h3>Perencanaan (Musrenbang)</h3>
                <p>
                  Musyawarah perencanaan dari tingkat desa, kecamatan, hingga
                  forum SKPD dan RKPD. Warga berhak mengusulkan pembangunan
                  prioritas di wilayahnya.
                </p>
              </div>
              <div className="cycle__card">
                <span className="chip chip--square chip--sunk">
                  Fase 2 · Jun–Nov
                </span>
                <h3>Penganggaran dan pembahasan DPRD</h3>
                <p>
                  Pemerintah menyusun KUA-PPAS dan Nota Keuangan RAPBD untuk
                  dibahas bersama DPRD. Pantau komisi terkait agar usulan warga
                  tidak tergeser belanja seremonial.
                </p>
              </div>
              <div className="cycle__card cycle__card--focus">
                <span className="chip chip--square chip--warn">
                  Fase 3 · Jan–Des · fokus GovSight
                </span>
                <h3>Pelaksanaan dan penyerapan</h3>
                <p>
                  Realisasi DPA oleh dinas-dinas teknis. Pantau apakah pencairan
                  belanja modal berjalan tertib atau menumpuk tajam di pengujung
                  tahun.
                </p>
              </div>
              <div className="cycle__card">
                <span className="chip chip--square chip--sunk">
                  Fase 4 · Jan–Jun (T+1)
                </span>
                <h3>Audit dan pertanggungjawaban</h3>
                <p>
                  Pemeriksaan LKPD oleh BPK RI dan evaluasi LKPJ di DPRD. Warga
                  dapat menguji kesesuaian fisik aset di lapangan.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h3
                style={{
                  fontSize: "0.9375rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Landmark size={16} /> Tiga kanal resmi partisipasi dan
                pengaduan warga
              </h3>
              <div className="channels">
                <div className="channel">
                  <span className="channel__num">1</span>
                  <div>
                    <strong>
                      Pejabat Pengelola Informasi dan Dokumentasi (PPID)
                    </strong>
                    <p>
                      Berdasarkan <strong>UU No. 14/2008 (KIP)</strong>, setiap
                      warga berhak mengajukan permohonan salinan DPA, RKA, dan
                      Berita Acara Serah Terima pekerjaan konstruksi ke pemda.
                    </p>
                  </div>
                </div>
                <div className="channel">
                  <span className="channel__num">2</span>
                  <div>
                    <strong>SP4N-LAPOR! (lapor.go.id)</strong>
                    <p>
                      Layanan pengaduan nasional resmi yang terhubung ke
                      Ombudsman RI dan Kementerian PAN-RB. Gunakan data tanggal
                      dan nominal dari GovSight ID sebagai bukti awal pelaporan.
                    </p>
                  </div>
                </div>
                <div className="channel">
                  <span className="channel__num">3</span>
                  <div>
                    <strong>
                      Forum reses dan Rapat Dengar Pendapat (RDP) DPRD
                    </strong>
                    <p>
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

        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Sumber yang bisa kamu periksa</h2>
              <p className="card__sub">
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

        <div className="grid-2">
          <section className="card">
            <div className="card__body limits">
              <span className="limits__mark">
                <FileText size={19} />
              </span>
              <h2 className="card__title">
                Apa yang belum dijelaskan data ini?
              </h2>
              <ul>
                <li>Mutu jalan, sekolah, atau fasilitas publik.</li>
                <li>Tingkat kepuasan dan manfaat yang dirasakan warga.</li>
                <li>
                  Efisiensi, dugaan korupsi, atau kinerja keseluruhan pemda.
                </li>
              </ul>
              <p className="muted" style={{ fontSize: "0.875rem" }}>
                Untuk menjawabnya, diperlukan data hasil layanan, konteks
                wilayah, dan pemeriksaan lebih lanjut.
              </p>
            </div>
          </section>

          <section className="card">
            <div className="card__body limits">
              <span className="limits__mark">
                <RefreshCw size={19} />
              </span>
              <h2 className="card__title">Bagaimana data diperbarui?</h2>
              <p
                className="muted"
                style={{ fontSize: "0.875rem", marginTop: 12 }}
              >
                Versi awal ini memakai salinan data yang diperiksa pada{" "}
                <strong>{dateLabel(dataset.generatedAt)}</strong>. Pembaruan
                mengikuti publikasi DJPK.
              </p>
              <p
                className="muted"
                style={{ fontSize: "0.875rem", marginTop: 12 }}
              >
                Tanggal penerimaan SIKD berasal dari keterangan portal saat
                pemeriksaan, bukan tanggal terbit tiap angka. Tanggal
                pemeriksaan menunjukkan kapan kami mengakses sumber.
              </p>
              <span className="checked-line">
                <Check size={14} /> Bukan pembaruan langsung secara real-time.
              </span>
            </div>
          </section>
        </div>

        <InfoNote>
          Perbandingan memakai bulan pelaporan yang sama. Data yang kosong tidak
          diubah menjadi nol, dan kategori berulang tidak dihitung dua kali.
          Revisi sumber dapat mengubah angka historis.
        </InfoNote>
      </div>
    </>
  );
}
