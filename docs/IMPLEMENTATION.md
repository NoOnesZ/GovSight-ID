# Rapor Belanja Daerah — prototipe

Permintaan terbaru: buat prototipe terlebih dahulu di D:\mia2026 dan buka di VS Code.

## Batas tahap ini

Next.js App Router, TypeScript, Tailwind, Recharts. Empat halaman interaktif menggunakan snapshot sumber DJPK untuk Medan, Binjai, dan Deli Serdang. Tidak ada skor pemda, tuduhan, atau klaim data real-time.

Neon, deployment Vercel, penjadwalan harian, perluasan sepuluh daerah, proposal lomba, dan pengujian dengan lima orang menunggu tahap berikutnya. Original MD di Downloads tidak diubah.

## Keputusan visual

- Warna: latar #F5F7FA, permukaan #FFFFFF, teks #182133, sekunder #627085, aksen #2457E7, grafik pendamping #20A58A.
- Tipografi: Plus Jakarta Sans untuk judul dan isi, angka tabular untuk data. Fallback sans-serif sistem.
- Layout: navigasi samping pada desktop, navigasi ringkas pada mobile; hero berupa pertanyaan warga dan ilustrasi komposisi belanja nyata; area eksplorasi menyatukan tabel dan grafik, bukan kumpulan kartu identik.
- Data menjadi fokus. Lencana periode, sumber, keterbatasan, dan tautan unduhan berada dekat angka.

## Ledger

- Persetujuan rencana asli diterima; scope dipersempit oleh user menjadi prototipe lokal sebelum integrasi layanan eksternal.
- Workspace C:\Users\ASUS\Documents\ChatGPT\lomba masih kosong dan tidak diubah. Pekerjaan aktif berada di D:\mia2026 sesuai permintaan terbaru.
- Uji inti: presisi desimal, duplikasi, konflik impor, nilai kosong, pembagi nol, dan kesetaraan periode.

## Status terverifikasi — 28 Oktober 2026 (WIB)

- Empat halaman prototipe selesai: jelajah, profil daerah, perbandingan, serta metodologi/sumber.
- Data aktual: 15 snapshot untuk tiga pemda. Masing-masing memiliki Oktober 2024–2026 dan Desember 2024–2025. Tanggal pengambilan yang tersimpan tetap 27 Oktober 2026; sumber tidak diunduh ulang saat melanjutkan sesi.
- `npm.cmd test`: 11/11 lulus, termasuk pencocokan semua snapshot dengan XML asli dan SHA-256, presisi uang, konflik kategori, total pagu/realisasi, data kosong, parameter API, dan CSV.
- `npm.cmd run typecheck`: lulus.
- `npm.cmd run build`: lulus dengan Next.js 16.4.3.
- `npm.cmd run test:browser`: lulus untuk empat halaman di lebar 360, 768, 1280; pencarian, URL filter, unduhan CSV terfilter, riwayat setara, pilihan pembanding, konteks kota/kabupaten, unduhan XML asli, salin tautan, periode tidak tersedia, halaman tidak ditemukan, dan skip link keyboard.
- Screenshot tersimpan di `docs/previews/`. Tidak ada overflow halaman pada tiga lebar tersebut dan tidak ada browser runtime error selama pengujian.
- Review independen menemukan tiga isu yang sudah diperbaiki: nilai kosong tidak boleh menjadi nol/total parsial; periode URL tidak valid tidak boleh diam-diam diganti; total kategori pagu juga wajib direkonsiliasi.
- Overflow mobile ditelusuri ke label aksesibilitas absolut pada tabel; containing block diperbaiki pada area scroll tabel. Animasi grafik dimatikan agar perubahan data dan reduced motion konsisten.
- Uji CSV menunggu perubahan DOM selesai, bukan hanya perubahan URL; hasil unduhan telah dicocokkan dengan daerah dan tahun terpilih.
- Preview lokal: http://127.0.0.1:3100. Jalankan kembali dengan `npm.cmd run dev -- --port 3100` jika proses preview berhenti.

## Tahap berikutnya

Neon, deployment/redeploy publik, penjadwalan harian, perluasan menjadi sepuluh daerah, materi submission, serta pengujian dengan lima orang belum dilakukan dan tidak diklaim selesai. Prototipe tetap memakai snapshot lokal, bukan data real-time.
