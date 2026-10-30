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
  MessageSquare,
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
      <div className="page-title-row">
        <div>
          <span className="location-label">
            <BookOpen size={15} /> Transparan sampai caranya
          </span>
          <h1>Kenali angka di balik layar.</h1>
          <p>Dari mana datanya, bagaimana dihitung, dan apa batasnya.</p>
        </div>
        <ShareButton />
      </div>
      <div className="method-intro">
        <span className="method-intro-icon">
          <ShieldCheck size={29} />
        </span>
        <div>
          <h2>Keterbukaan dimulai dari sumber yang jelas.</h2>
          <p>
            GovSight ID mengolah data publik APBD dari DJPK Kementerian
            Keuangan. Kami menghitung indikator dengan rumus terbuka dan
            menandai pola yang perlu dipertanyakan. Penanda bukan vonis dan
            dapat ditelusuri ke sumber.
          </p>
        </div>
        <a
          className="button button-secondary"
          href="https://djpk.kemenkeu.go.id/portal/data/apbd"
          target="_blank"
          rel="noreferrer"
        >
          Buka portal DJPK <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="method-grid">
        <section className="panel formula-panel">
          <span className="pill">Pelaksanaan anggaran</span>
          <h2>Serapan belanja</h2>
          <p>
            Berapa bagian rencana belanja tahunan yang sudah direalisasikan
            sampai periode tertentu.
          </p>
          <div className="formula">
            <span>Realisasi sampai periode terpilih</span>
            <span className="formula-line" />
            <span>Pagu belanja tahunan</span>
            <strong>× 100%</strong>
          </div>
          <p className="formula-example">
            Contoh ilustrasi: realisasi Rp60 miliar dari pagu Rp100 miliar
            berarti serapan <strong>60%</strong>.
          </p>
        </section>
        <section className="panel formula-panel">
          <span className="pill green">Pembagian belanja</span>
          <h2>Komposisi realisasi</h2>
          <p>
            Berapa porsi suatu kategori dari seluruh belanja yang sudah
            direalisasikan.
          </p>
          <div className="formula">
            <span>Realisasi suatu kategori</span>
            <span className="formula-line" />
            <span>Total realisasi belanja</span>
            <strong>× 100%</strong>
          </div>
          <p className="formula-example">
            Contoh ilustrasi: belanja modal Rp15 miliar dari total realisasi
            Rp60 miliar berarti porsi modal <strong>25%</strong>.
          </p>
        </section>
      </div>
      <section className="panel formula-panel">
        <span className="pill amber">Penanda Kritis (DSS)</span>
        <h2>Penumpukan belanja modal akhir tahun</h2>
        <div className="formula">
          <span>Realisasi modal s.d. Des − Realisasi modal s.d. Okt</span>
          <span className="formula-line" />
          <span>Total realisasi modal setahun (s.d. Des)</span>
          <strong>× 100%</strong>
        </div>
        <p>
          Hasil perhitungan dibulatkan ke dua desimal sebelum dibandingkan
          dengan ambang batas <strong>{YEAR_END_THRESHOLD}%</strong>.
        </p>
        <div className="method-explanation">
          <h3>Mengapa ambang {YEAR_END_THRESHOLD}% dipilih?</h3>
          <p>
            Jika belanja modal terdistribusi secara proporsional sepanjang 12
            bulan, pengeluaran dua bulan terakhir (November–Desember) sewajarnya
            hanya menyerap sekitar <strong>16,67%</strong> (2/12) dari total
            tahunan. Ambang <strong>{YEAR_END_THRESHOLD}%</strong> menandai
            terjadinya lonjakan percepatan anggaran lebih dari 2,4 kali lipat
            dari laju normal hanya dalam rentang waktu 61 hari terakhir.
          </p>
          <h3>
            Mengapa penanda ini penting jika sebagian besar daerah terindikasi?
          </h3>
          <p>
            Dalam data APBD sepuluh daerah Sumatera Utara yang dianalisis,
            sebanyak <strong>14 dari 20 tahun anggaran (70%)</strong> melampaui
            ambang {YEAR_END_THRESHOLD}%, bahkan Kabupaten Deli Serdang mencapai
            73,41% pada tahun 2025. Fakta ini menegaskan bahwa penumpukan
            belanja modal di akhir tahun bukanlah anomali tunggal, melainkan
            sebuah <em>pola struktural sistemik</em> ("belanja kejar tayang")
            dalam tata kelola anggaran daerah.
          </p>
          <p>
            Status penanda: <em>Perlu ditanyakan (ditandai)</em>,{" "}
            <em>Di bawah ambang (wajar)</em>, <em>Belum tersedia</em>, atau{" "}
            <em>Tidak konsisten</em> bila realisasi kumulatif tercatat menurun.
            Penanda berfungsi sebagai <strong>pemicu pertanyaan publik</strong>{" "}
            (misalnya memastikan serah terima fisik proyek dan kualitas hasil
            konstruksi), bukan vonis hukum atau bukti pelanggaran.
          </p>
        </div>
      </section>
      <section className="panel definitions-panel">
        <h2>Istilah yang sering ditemui</h2>
        <dl>
          <div>
            <dt>Pagu belanja</dt>
            <dd>
              Rencana atau batas anggaran belanja satu tahun sesuai data APBD
              murni/perubahan pada sumber.
            </dd>
          </div>
          <div>
            <dt>Realisasi belanja</dt>
            <dd>
              Belanja yang dilaporkan telah direalisasikan, diakumulasi sampai
              bulan pelaporan terpilih.
            </dd>
          </div>
          <div>
            <dt>Belanja pegawai</dt>
            <dd>
              Belanja untuk pegawai, termasuk tenaga pelayanan publik. Kategori
              ini tidak berarti seluruhnya biaya administrasi.
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
              sumber. Nilainya belum membuktikan kondisi atau mutu fisik aset.
            </dd>
          </div>
          <div>
            <dt>Belanja lainnya</dt>
            <dd>
              Kelompok lain yang disajikan DJPK, termasuk hibah, bantuan sosial,
              transfer, atau belanja lain sesuai akun sumber.
            </dd>
          </div>
        </dl>
      </section>
      <section className="panel education-panel">
        <div className="section-heading">
          <div>
            <span className="pill green">
              <GraduationCap size={13} /> Edukasi Literasi Anggaran
            </span>
            <h2>Siklus APBD & Titik Kritis Pengawasan Warga</h2>
            <p>
              Kapan masyarakat dapat terlibat dan bagaimana menyalurkan aspirasi
              secara berdaya?
            </p>
          </div>
        </div>
        <div className="cycle-grid">
          <div className="cycle-card">
            <span className="cycle-badge">Fase 1 · Jan–Mei</span>
            <h3>Perencanaan (Musrenbang)</h3>
            <p>
              Musyawarah perencanaan dari tingkat desa, kecamatan, hingga forum
              SKPD dan RKPD. Warga berhak mengusulkan pembangunan prioritas di
              wilayahnya.
            </p>
          </div>
          <div className="cycle-card">
            <span className="cycle-badge">Fase 2 · Jun–Nov</span>
            <h3>Penganggaran & Bahas DPRD</h3>
            <p>
              Pemerintah menyusun KUA-PPAS dan Nota Keuangan RAPBD untuk dibahas
              bersama DPRD. Pantau komisi terkait agar usulan warga tidak
              tergeser belanja seremonial.
            </p>
          </div>
          <div className="cycle-card highlight">
            <span className="cycle-badge alert">
              Fase 3 · Jan–Des (Fokus GovSight)
            </span>
            <h3>Pelaksanaan & Penyerapan</h3>
            <p>
              Realisasi DPA oleh dinas-dinas teknis. Pantau apakah pencairan
              belanja modal berjalan tertib atau menumpuk tajam di pengujung
              tahun (penanda November–Desember).
            </p>
          </div>
          <div className="cycle-card">
            <span className="cycle-badge">Fase 4 · Jan–Jun (T+1)</span>
            <h3>Audit & Pertanggungjawaban</h3>
            <p>
              Pemeriksaan Laporan Keuangan Pemerintah Daerah (LKPD) oleh BPK RI
              dan evaluasi LKPJ di DPRD. Warga dapat menguji kesesuaian fisik
              aset di lapangan.
            </p>
          </div>
        </div>

        <div className="advocacy-channels">
          <h3>
            <Landmark size={17} /> Tiga Kanal Resmi Partisipasi & Pengaduan
            Warga
          </h3>
          <div className="channels-list">
            <div className="channel-item">
              <strong>
                1. Pejabat Pengelola Informasi & Dokumentasi (PPID)
              </strong>
              <p>
                Berdasarkan <strong>UU No. 14/2008 (KIP)</strong>, setiap warga
                berhak mengajukan permohonan salinan DPA, RKA, dan Berita Acara
                Serah Terima (BAST) pekerjaan konstruksi ke Pemda.
              </p>
            </div>
            <div className="channel-item">
              <strong>2. SP4N-LAPOR! (lapor.go.id)</strong>
              <p>
                Layanan pengaduan nasional resmi yang terhubung ke Ombudsman RI
                dan Kementerian PAN-RB. Gunakan data tanggal dan nominal dari
                GovSight ID sebagai bukti awal pelaporan.
              </p>
            </div>
            <div className="channel-item">
              <strong>3. Forum Reses & Rapat Dengar Pendapat (RDP) DPRD</strong>
              <p>
                Manfaatkan fitur <em>Lembar Telaah Kritis</em> di profil daerah
                untuk mengajukan pertanyaan spesifik langsung kepada anggota
                dewan daerah pemilihmu.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="panel source-panel">
        <div className="section-heading">
          <div>
            <h2>Sumber yang bisa kamu periksa</h2>
            <p>
              Unduh data olahan atau buka berkas asli untuk periode terpilih.
            </p>
          </div>
          <PeriodControls year={year} month={month} onChange={update} />
        </div>
        <div className="table-scroll">
          <table className="data-table source-table">
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
                      regions.find((region) => region.code === row.regionCode)
                        ?.name
                    }
                  </th>
                  <td>{dateLabel(row.source.publishedAt)}</td>
                  <td>{dateLabel(row.source.checkedAt)}</td>
                  <td>
                    <a href={row.source.rawPath} download className="text-link">
                      <ArrowDownToLine size={14} /> Unduh asli
                    </a>
                    <a
                      href={row.source.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                    >
                      Buka DJPK <ArrowUpRight size={13} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="source-panel-footer">
          <span>
            <Database size={15} /> Berkas asli disimpan untuk penelusuran.
          </span>
          <DownloadButton
            codes={snapshots.map((row) => row.regionCode)}
            year={year}
            month={month}
          />
        </div>
      </section>
      <div className="method-grid">
        <section className="panel limitations-panel">
          <FileText size={22} />
          <h2>Apa yang belum dijelaskan data ini?</h2>
          <ul>
            <li>Mutu jalan, sekolah, atau fasilitas publik.</li>
            <li>Tingkat kepuasan dan manfaat yang dirasakan warga.</li>
            <li>Efisiensi, dugaan korupsi, atau kinerja keseluruhan pemda.</li>
          </ul>
          <p>
            Untuk menjawabnya, diperlukan data hasil layanan, konteks wilayah,
            dan pemeriksaan lebih lanjut.
          </p>
        </section>
        <section className="panel limitations-panel">
          <RefreshCw size={22} />
          <h2>Bagaimana data diperbarui?</h2>
          <p>
            Versi awal ini memakai salinan data yang diperiksa pada{" "}
            <strong>{dateLabel(dataset.generatedAt)}</strong>. Pembaruan
            mengikuti publikasi DJPK.
          </p>
          <p>
            Tanggal penerimaan SIKD berasal dari keterangan portal saat
            pemeriksaan; bukan tanggal terbit tiap angka. Tanggal pemeriksaan
            menunjukkan kapan kami mengakses sumber.
          </p>
          <span className="checked-line">
            <Check size={15} /> Bukan pembaruan langsung secara real-time.
          </span>
        </section>
      </div>
      <InfoNote>
        Perbandingan memakai bulan pelaporan yang sama. Data yang kosong tidak
        diubah menjadi nol, dan kategori berulang tidak dihitung dua kali.
        Revisi sumber dapat mengubah angka historis.
      </InfoNote>
    </>
  );
}
