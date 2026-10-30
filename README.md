# GovSight ID

Prototipe web untuk memahami dan membandingkan belanja daerah Sumatera Utara. GovSight ID menggabungkan **Open Government Data** sebagai dasar data pemerintah yang terbuka dan dapat ditelusuri dengan fitur **Data-Driven Decision Support (DSS)** untuk membantu warga, jurnalis, dan DPRD menentukan pertanyaan yang perlu diajukan. Dibuat untuk MIA 2026, cabang Web In Action.

Data dan analisis disajikan dalam satu aplikasi: pengguna dapat memeriksa angka beserta sumbernya, membandingkan daerah, lalu melihat penanda pola belanja yang patut ditelaah. Penanda adalah bahan pertanyaan, bukan bukti pelanggaran atau penilaian mutu layanan. Pemilihan subtema resmi yang terdaftar tetap perlu dikonfirmasi kepada panitia.

## Menjalankan

Butuh Node.js 20.9 atau lebih baru.

```bash
git clone https://github.com/NoOnesZ/GovSight-ID.git
cd GovSight-ID
npm install
npm run dev -- --port 3100
```

Buka http://127.0.0.1:3100 di browser. Jika port sedang dipakai, ganti angka port. Di Windows PowerShell yang memblokir skrip, pakai `npm.cmd` sebagai pengganti `npm`.

## Yang sudah ada

- Beranda/jelajah dengan pencarian, filter tahun, periode, dan jenis daerah.
- Profil sepuluh pemda Sumatera Utara, dengan komposisi dan riwayat pada bulan yang sama.
- Perbandingan dua atau tiga daerah. Perbandingan kota dan kabupaten diberi penjelasan konteks.
- Fitur DSS: penanda porsi realisasi belanja modal pada November–Desember dengan ambang metodologi 40% (mendeteksi lonjakan percepatan anggaran >2,4× dari laju normal 16,67% pada dua bulan terakhir), pertanyaan kritis lanjutan untuk publik/DPRD, dan tautan ke berkas sumber asli Oktober dan Desember. Ambang tersebut bukan batas hukum; data yang belum tersedia atau tidak konsisten tidak dihitung.
- Perbandingan penanda antar daerah, porsi pagu dan realisasi modal serta pegawai, grafik serapan bulanan, dan pola tiga tahun dengan acuan yang dapat diisi pengguna.
- Metodologi, tautan sumber, berkas asli XML, dan unduhan CSV sesuai filter.
- URL menyimpan filter dan pilihan daerah; tombol bagikan menyalin URL.
- Tampilan desktop, tablet, dan HP; navigasi keyboard, fokus terlihat, reduced motion, serta tabel pendamping grafik.

## Data dan batas prototipe

Sumber: https://djpk.kemenkeu.go.id/portal/data/apbd

Snapshot mencakup Desember 2023, Januari–Desember 2024 dan 2025, serta Januari–Oktober 2026 untuk sepuluh pemda. Tanggal pemeriksaan dicatat otomatis di `data/snapshots.json`; tanggal penerimaan SIKD berasal dari keterangan portal saat pemeriksaan dan bukan tanggal terbit masing-masing angka.

Ekspor DJPK bernama `csv_apbd` tetapi isi yang diperiksa berupa Excel XML. Berkas asli tersimpan di `public/data/raw/` dan SHA-256 dicatat per snapshot. Parser mempertahankan nilai uang sebagai string desimal, mengabaikan duplikasi kategori identik, dan menolak konflik serta total kategori yang tidak cocok dengan sumber. Data yang tidak tersedia memakai `null`, bukan nol.

Refresh seluruh snapshot secara manual:

```bash
npm run data:refresh
```

Daerah ditambahkan di `src/lib/regions.ts`, periode di `src/lib/periods.ts`. Data lama dan berkas asli baru ditulis setelah seluruh batch lolos pemeriksaan. Jangan menjalankan dua proses refresh bersamaan. Pada production nanti, refresh memerlukan deployment ulang karena prototipe membundel data pada build.

**Belum terhubung ke Neon dan belum di-deploy ke Vercel.** Tidak ada pembaruan real-time atau penjadwalan harian. Tidak ada penilaian mutu layanan, skor pemda, atau deteksi korupsi. Integrasi database eksternal dan otomasi sinkronisasi harian menjadi tahap berikutnya (cakupan 10 daerah dengan 350 snapshot telah diimplementasikan).

Porsi modal dan pegawai merupakan deskripsi komposisi, bukan pemeriksaan kepatuhan hukum. Garis serapan merata adalah ilustrasi, dan acuan tiga tahun yang diisi pengguna bukan standar hukum. Pembandingan perlu mempertimbangkan konteks daerah dan perubahan pagu.

Panduan publikasi yang direncanakan tersedia di [docs/VERCEL.md](docs/VERCEL.md); rancangan uji pemahaman lima peserta ada di [docs/UJI-PENGGUNA.md](docs/UJI-PENGGUNA.md).

## Stack dan struktur

Next.js App Router, React, TypeScript, Tailwind CSS, Recharts, Decimal.js, fast-xml-parser. Font Plus Jakarta Sans disimpan lewat paket lokal, sehingga tidak bergantung pada Google Fonts saat membuka aplikasi.

- `src/app/`: empat halaman dan endpoint GET.
- `src/components/`: tampilan dan interaksi.
- `src/lib/`: kontrak data, parser, format rupiah, dan perhitungan.
- `scripts/refresh-data.ts`: mengambil sumber dan menerbitkan snapshot secara atomik.
- `tests/`: pemeriksaan data dan edge case.
- `docs/`: lingkup, keputusan, dan status implementasi.

## Endpoint baca

| Endpoint                                               | Kegunaan                                     |
| ------------------------------------------------------ | -------------------------------------------- |
| `/api/daerah?tahun=2026&bulan=10`                      | Daftar daerah dan ringkasannya               |
| `/api/daerah/0215?tahun=2026&bulan=10`                 | Profil dan riwayat Medan                     |
| `/api/bandingkan?daerah=0215,0214&tahun=2026&bulan=10` | Data perbandingan                            |
| `/api/ekspor?daerah=0215,0214&tahun=2026&bulan=10`     | CSV lengkap, metadata sumber, dan hash batch |

Nilai uang di API berupa string desimal atau `null`. Tahun/periode tidak tersedia dan kode daerah tidak valid menghasilkan HTTP 400; profil daerah yang tidak tersedia menghasilkan HTTP 404.

## Verifikasi

```bash
npm test
npm run typecheck
npm run build
```

Uji browser (preview harus berjalan di port 3100):

```bash
npx playwright install chromium
npm run test:browser
```

Hasil terakhir: 19 tes data/API lulus, TypeScript dan build lulus, serta keempat halaman dan interaksi utama lulus pemeriksaan browser di lebar 360, 768, dan 1280 piksel. Screenshot uji terbaru ada di `test-results/previews/` dan catatan lengkap ada di `docs/IMPLEMENTATION.md`.

Untuk menjalankan build production (juga dipakai di hosting):

```bash
npm run build
PORT=3100 npm start
```

Server mendengarkan semua alamat dan memakai variabel `PORT` dari hosting.

Pengujian manusia dengan lima orang, deploy publik/redeploy, persyaratan hosting sponsor, dan konfirmasi format pengumpulan lomba belum dilakukan. Guidebook memuat tanggal draft yang berbeda; target internal tetap 1 November 2026 sampai ketua memastikan pengumuman terbaru.
