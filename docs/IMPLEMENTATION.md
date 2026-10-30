# Rapor Belanja Daerah — prototipe

## Batas tahap ini

Next.js App Router, TypeScript, Tailwind, Recharts. Empat halaman interaktif menggunakan snapshot sumber DJPK untuk Medan, Binjai, dan Deli Serdang. Tidak ada skor pemda, tuduhan, atau klaim data real-time.

Neon, deployment Vercel, penjadwalan harian, perluasan sepuluh daerah, proposal lomba, dan pengujian dengan lima orang menunggu tahap berikutnya.

## Keputusan visual

- Warna: latar #F5F7FA, permukaan #FFFFFF, teks #182133, sekunder #627085, aksen #2457E7, grafik pendamping #20A58A.
- Tipografi: Plus Jakarta Sans untuk judul dan isi, angka tabular untuk data. Fallback sans-serif sistem.
- Layout: navigasi samping pada desktop, navigasi ringkas pada mobile; hero berupa pertanyaan warga dan ilustrasi komposisi belanja nyata; area eksplorasi menyatukan tabel dan grafik, bukan kumpulan kartu identik.
- Data menjadi fokus. Lencana periode, sumber, keterbatasan, dan tautan unduhan berada dekat angka.

## Cakupan uji

- Uji inti: presisi desimal, duplikasi, konflik impor, nilai kosong, pembagi nol, dan kesetaraan periode.

## Status terverifikasi — 28 Oktober 2026 (WIB)

- Empat halaman prototipe selesai: jelajah, profil daerah, perbandingan, serta metodologi/sumber.
- Data aktual: 15 snapshot untuk tiga pemda. Masing-masing memiliki Oktober 2024–2026 dan Desember 2024–2025. Tanggal pengambilan yang tersimpan tetap 27 Oktober 2026; sumber tidak diunduh ulang saat melanjutkan sesi.
- `npm test`: 11/11 lulus, termasuk pencocokan semua snapshot dengan XML asli dan SHA-256, presisi uang, konflik kategori, total pagu/realisasi, data kosong, parameter API, dan CSV.
- `npm run typecheck`: lulus.
- `npm run build`: lulus dengan Next.js 16.4.3.
- `npm run test:browser`: lulus untuk empat halaman di lebar 360, 768, 1280; pencarian, URL filter, unduhan CSV terfilter, riwayat setara, pilihan pembanding, konteks kota/kabupaten, unduhan XML asli, salin tautan, periode tidak tersedia, halaman tidak ditemukan, dan skip link keyboard.
- Screenshot tersimpan di `docs/previews/`. Tidak ada overflow halaman pada tiga lebar tersebut dan tidak ada browser runtime error selama pengujian.
- Review independen menemukan tiga isu yang sudah diperbaiki: nilai kosong tidak boleh menjadi nol/total parsial; periode URL tidak valid tidak boleh diam-diam diganti; total kategori pagu juga wajib direkonsiliasi.
- Overflow mobile ditelusuri ke label aksesibilitas absolut pada tabel; containing block diperbaiki pada area scroll tabel. Animasi grafik dimatikan agar perubahan data dan reduced motion konsisten.
- Uji CSV menunggu perubahan DOM selesai, bukan hanya perubahan URL; hasil unduhan telah dicocokkan dengan daerah dan tahun terpilih.
- Preview lokal: http://127.0.0.1:3100. Jalankan kembali dengan `npm run dev -- --port 3100` jika proses preview berhenti.

## Perapian — 29 Oktober 2026 (WIB)

- Daftar periode kini hanya ada di `src/lib/periods.ts`. Filter, API, teks "periode belum tersedia", dan skrip refresh membacanya dari sana. Tes baru memastikan daftar itu sama persis dengan isi `data/snapshots.json`.
- Teks cakupan ("3 daerah", "Medan, Binjai, dan Deli Serdang") dibentuk dari `src/lib/regions.ts`, jadi ikut berubah saat daerah ditambah.
- `npm start` tidak lagi terkunci di 127.0.0.1 dan `output: "standalone"` dihapus, agar server bisa diakses di hosting.
- Skrip refresh baru menulis berkas asli setelah seluruh batch lolos pemeriksaan.
- Halaman 404 umum dipisah dari 404 daerah; breadcrumb tidak lagi menulis "Profil daerah" di halaman yang tidak ada.
- Pilihan urutan di beranda tersimpan di URL (`urut=realisasi`). Kartu hero memakai nama daerah dari data, bukan teks tetap.
- Sumbu grafik memakai format angka Indonesia, ikon lokasi profil diperbaiki, dan tombol pembanding nonaktif saat tiga daerah sudah dipilih.
- `error.tsx` memakai `retry()` sesuai Next.js 16.2+.
- `npm test` 12/12, `npm run typecheck`, `npm run build`, dan `npm run test:browser` lulus.

## Tahap berikutnya

Neon, deployment/redeploy publik, penjadwalan harian, perluasan menjadi sepuluh daerah, materi submission, serta pengujian dengan lima orang belum dilakukan dan tidak diklaim selesai. Prototipe tetap memakai snapshot lokal, bukan data real-time.

## GovSight ID — 30 Oktober 2026

- Nama tampilan dan metadata diperbarui menjadi GovSight ID. Produk menggabungkan data terbuka dan analisis DSS; subtema yang terdaftar masih perlu dikonfirmasi panitia.
- Data diperluas menjadi 10 pemda dan 350 snapshot: Desember 2023; semua bulan 2024–2025; Januari–Oktober 2026. Batch diperiksa pada 30 Oktober 2026, dan keterangan penerimaan SIKD di portal adalah 29 Oktober 2026. Tanggal ini bukan tanggal terbit setiap angka.
- Penanda November–Desember ditampilkan pada profil, beranda, dan perbandingan, dengan rumus terbuka, sumber asli, konteks, dan pilihan urutan. Pagu dan realisasi modal/pegawai, grafik serapan bulanan, dan pola modal tiga tahun juga ditampilkan. Acuan tiga tahun dimasukkan pengguna dan disimpan pada URL; bukan batas hukum.
- Angka Deli Serdang 2025 diperiksa langsung terhadap ekspor DJPK: realisasi modal Oktober Rp200.361.874.998,65 dan Desember Rp753.608.964.203,45; selisihnya 73,41% dari realisasi Desember.
- Batch pertama berhenti karena satu respons berisi baris kategori yang bertentangan. Pemeriksaan ulang respons konsisten; skrip kini mencoba ulang secara terbatas dan menerbitkan data hanya setelah seluruh batch valid. Snapshot lama dan berkas asli tetap dipertahankan.
- `npm test`: 19/19 lulus, termasuk pemeriksaan hash dan parser seluruh 350 berkas. `npm run typecheck` dan `npm run build` lulus. Uji browser lulus pada 360, 768, dan 1280 px, termasuk filter, CSV, penanda Deli Serdang, perbandingan, acuan yang dibagikan, unduhan, dan keadaan gagal.
- Panduan deploy nanti: `docs/VERCEL.md`. Rencana uji lima orang: `docs/UJI-PENGGUNA.md`. Pengujian dengan peserta nyata dan deployment publik belum dilakukan. Pembaruan data masih manual melalui skrip dan redeploy; ini bukan real-time.
