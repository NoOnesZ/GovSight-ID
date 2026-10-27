"use client";

import {
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  Check,
  Database,
  FileText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { Dataset } from "@/lib/types";
import { dateLabel } from "@/lib/format";
import { regions } from "@/lib/regions";
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
            Rapor Daerah mengolah data publik APBD dari DJPK Kementerian
            Keuangan. Kami membantu menjelaskan angka, tanpa memberi skor atau
            menilai suatu daerah baik atau buruk.
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
                <th>Tanggal diterima SIKD</th>
                <th>Diperiksa oleh Rapor Daerah</th>
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
            Tanggal diterima SIKD berasal dari keterangan portal. Tanggal
            pemeriksaan menunjukkan kapan kami mengaksesnya. Keduanya tidak
            berarti data baru dipublikasikan pada waktu yang sama.
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
