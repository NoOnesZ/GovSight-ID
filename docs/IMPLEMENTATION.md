# GovSight ID — prototipe

## Batas tahap ini

Next.js App Router, TypeScript, Tailwind, Recharts. Empat halaman interaktif menggunakan snapshot sumber DJPK untuk sepuluh pemda Sumatera Utara. Tidak ada skor pemda, tuduhan, atau klaim data real-time.

Neon, deployment Vercel, penjadwalan harian, proposal lomba, dan pengujian dengan lima orang menunggu tahap berikutnya (perluasan sepuluh daerah telah selesai).

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

Neon, deployment/redeploy publik, penjadwalan harian, materi submission, serta pengujian dengan lima orang belum dilakukan dan tidak diklaim selesai. Perluasan sepuluh daerah telah selesai. Prototipe tetap memakai snapshot lokal, bukan data real-time.

## GovSight ID — 30 Oktober 2026

- Nama tampilan dan metadata diperbarui menjadi GovSight ID. Produk menggabungkan data terbuka dan analisis DSS; subtema yang terdaftar masih perlu dikonfirmasi panitia.
- Data diperluas menjadi 10 pemda dan 350 snapshot: Desember 2023; semua bulan 2024–2025; Januari–Oktober 2026. Batch diperiksa pada 30 Oktober 2026, dan keterangan penerimaan SIKD di portal adalah 29 Oktober 2026. Tanggal ini bukan tanggal terbit setiap angka.
- Penanda November–Desember ditampilkan pada profil, beranda, dan perbandingan, dengan rumus terbuka, sumber asli, konteks, dan pilihan urutan. Pagu dan realisasi modal/pegawai, grafik serapan bulanan, dan pola modal tiga tahun juga ditampilkan. Acuan tiga tahun dimasukkan pengguna dan disimpan pada URL; bukan batas hukum.
- Angka Deli Serdang 2025 diperiksa langsung terhadap ekspor DJPK: realisasi modal Oktober Rp200.361.874.998,65 dan Desember Rp753.608.964.203,45; selisihnya 73,41% dari realisasi Desember.
- Batch pertama berhenti karena satu respons berisi baris kategori yang bertentangan. Pemeriksaan ulang respons konsisten; skrip kini mencoba ulang secara terbatas dan menerbitkan data hanya setelah seluruh batch valid. Berkas asli lama dipertahankan sebagai arsip riwayat, sedangkan seluruh snapshot aktif kini merujuk pada batch folder 30 Oktober 2026.
- `npm test`: 19/19 lulus, termasuk pemeriksaan hash dan parser seluruh 350 berkas. `npm run typecheck` dan `npm run build` lulus. Uji browser lulus pada 360, 768, dan 1280 px, termasuk filter, CSV, penanda Deli Serdang, perbandingan, acuan yang dibagikan, unduhan, dan keadaan gagal.
- Panduan deploy nanti: `docs/VERCEL.md`. Rencana uji lima orang: `docs/UJI-PENGGUNA.md`. Pengujian dengan peserta nyata dan deployment publik belum dilakukan. Pembaruan data masih manual melalui skrip dan redeploy; ini bukan real-time.

## Pembaruan Iterasi 2 (Mock Review Round 2 Fixes) — 30 Oktober 2026

- **Diferensiasi & Peringkat Realistis:** Pemeringkatan lonjakan akhir tahun diformulasikan sebagai komparasi di antara 10 daerah pantauan Sumatera Utara (bukan klaim menyeluruh 33 kab/kota).
- **Analisis Persistensi Dinamis:** Status persistensi (`2 Th Beruntun`, `Baru [Tahun]`, `Di Bawah Ambang`) diturunkan secara dinamis dari tahun terlengkap terbaru (`latestCompleteYear`). Data tahun sebelumnya yang belum tersedia kini secara tepat diklasifikasikan sebagai `belum-lengkap`, bukan memicu status baru keliru.
- **Penyempurnaan Konteks Regulasi UU HKPD:** Menghapus alarm umum yang memicu 10/10 daerah pada lembar telaah. Sebagai gantinya, porsi belanja pegawai dan modal ditempatkan pada kartu konteks bertingkat (_ranked context_) di profil daerah. Penjelasan metodologi memperjelas pengecualian tunjangan guru dan bagi hasil desa pada Pasal 146 HKPD serta membedakan klasifikasi ekonomi _belanja modal_ dari klasifikasi fungsi _belanja infrastruktur pelayanan publik_ pada Pasal 147 HKPD.
- **Transparansi Integritas Data Resmi:** Realisasi melebihi pagu tercatat (>100% pada Kab. Langkat) disajikan apa adanya dengan label `Catatan GovSight ID` yang menerangkan kemungkinan keterlambatan sinkronisasi data APBD-P di sistem pusat data DJPK.
- **Klarifikasi Model Simulasi Daya Beli:** Konversi kapasitas belanja modal ditandai secara tegas sebagai _Simulasi Rujukan Pilihan Alternatif (Salah Satu / Atau)_ dengan asumsi model estimasi tim, menghindari kesalahpahaman akumulasi ganda.
- **Keamanan & CI/CD Produksi:** HTTP Security Headers produksi aktif di `next.config.ts`. Workflow GitHub Actions CI memverifikasi typecheck, test, dan build pada setiap push/PR. Draf workflow pembaruan berkala via Pull Request disiapkan untuk menjaga integritas data tanpa mengubah cabang utama secara sepihak.
- **Hasil Pengujian:** `npm test` 23/23 lulus, `npm run typecheck` 0 error, `npm run build` sukses, dan seluruh halaman responsif tanpa overflow di 360, 768, dan 1280 px.
