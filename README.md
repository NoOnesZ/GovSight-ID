# Rapor Daerah

Prototipe web Open Government Data untuk memahami dan membandingkan belanja daerah Sumatera Utara. Dibuat di `D:\mia2026` untuk MIA 2026, cabang Web In Action.

## Menjalankan di VS Code

Buka folder `D:\mia2026`, lalu jalankan dari terminal PowerShell:

```powershell
npm.cmd install
npm.cmd run dev -- --port 3100
```

Buka http://127.0.0.1:3100 di browser. Jika port sedang digunakan oleh preview yang sudah berjalan, gunakan preview tersebut atau ganti port.

## Yang sudah ada

- Beranda/jelajah dengan pencarian, filter tahun, periode, dan jenis daerah.
- Profil Medan, Binjai, dan Deli Serdang, dengan komposisi dan riwayat pada bulan yang sama.
- Perbandingan dua atau tiga daerah. Perbandingan kota dan kabupaten diberi penjelasan konteks.
- Metodologi, tautan sumber, berkas asli XML, dan unduhan CSV sesuai filter.
- URL menyimpan filter dan pilihan daerah; tombol bagikan menyalin URL.
- Tampilan desktop, tablet, dan HP; navigasi keyboard, fokus terlihat, reduced motion, serta tabel pendamping grafik.

## Data dan batas prototipe

Sumber: https://djpk.kemenkeu.go.id/portal/data/apbd

Snapshot asli mencakup Oktober 2024, Oktober 2025, Oktober 2026, serta Desember 2024–2025 untuk masing-masing tiga pemda. Tanggal pemeriksaan dicatat otomatis di `data/snapshots.json`; tanggal diterima SIKD diambil dari keterangan portal untuk setiap ekspor.

Ekspor DJPK bernama `csv_apbd` tetapi isi yang diperiksa berupa Excel XML. Berkas asli tersimpan di `public/data/raw/` dan SHA-256 dicatat per snapshot. Parser mempertahankan nilai uang sebagai string desimal, mengabaikan duplikasi kategori identik, dan menolak konflik serta total kategori yang tidak cocok dengan sumber. Data yang tidak tersedia memakai `null`, bukan nol.

Refresh seluruh snapshot secara manual:

```powershell
npm.cmd run data:refresh
```

Data lama hanya diganti setelah seluruh batch lolos pemeriksaan. Jangan menjalankan dua proses refresh bersamaan. Pada production nanti, refresh memerlukan deployment ulang karena prototipe membundel data pada build.

**Belum terhubung ke Neon dan belum di-deploy ke Vercel.** Tidak ada pembaruan real-time atau penjadwalan harian. Tidak ada penilaian mutu layanan, skor pemda, atau deteksi korupsi. Integrasi database dan penambahan sepuluh daerah menjadi tahap berikutnya.

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

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Uji browser (preview harus berjalan di port 3100):

```powershell
npx.cmd playwright install chromium
npm.cmd run test:browser
```

Hasil terakhir: 11 tes data/API lulus, TypeScript dan build lulus, serta keempat halaman dan interaksi utama lulus pemeriksaan browser di lebar 360, 768, dan 1280 piksel. Screenshot ada di `docs/previews/` dan catatan lengkap ada di `docs/IMPLEMENTATION.md`.

Untuk menjalankan build production:

```powershell
npm.cmd run start -- --port 3100
```

Pengujian manusia dengan lima orang, deploy publik/redeploy, persyaratan hosting sponsor, dan konfirmasi format pengumpulan lomba belum dilakukan. Guidebook memuat tanggal draft yang berbeda; target internal tetap 1 November 2026 sampai ketua memastikan pengumuman terbaru.
