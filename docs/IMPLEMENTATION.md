# GovSight ID — prototipe

## Batas tahap ini

Next.js App Router, TypeScript, Tailwind, Recharts. Empat halaman interaktif menggunakan snapshot sumber DJPK untuk sepuluh pemda Sumatera Utara. Tidak ada skor pemda, tuduhan, atau klaim data real-time.

Neon, deployment Vercel, penjadwalan harian, proposal lomba, dan pengujian dengan lima orang menunggu tahap berikutnya (perluasan sepuluh daerah telah selesai).

## Keputusan visual

Seluruh UI ditulis ulang pada 31 Oktober 2026 sebagai satu sistem desain bertoken di `src/app/globals.css`. Rujukannya ruang kerja bertipe Notion (kertas hangat, garis rambut, hierarki tenang) dan pustaka komponen bertipe HeroUI (primitif konsisten, fokus terlihat, radius lembut).

- Prinsip: chrome monokrom; warna hanya dipakai untuk data dan status. Tidak ada gradien, glass, atau glow.
- Warna: kanvas #FBFAF9, permukaan #FFFFFF, tinta #1C1B19 dengan tiga tingkat abu hangat, garis #E7E5E0, aksen institusional #14395E. Warna data: pegawai #2E5C96, barang/jasa #7CA3CF, modal #1E7D6B, lainnya #C6C1B8. Status amber/hijau/merah bata punya pasangan latar, garis, dan tinta sendiri.
- Tipografi: Source Serif 4 untuk judul utama, Inter untuk isi dan antarmuka, basis 15px. Seluruh angka memakai `tabular-nums` dan rata kanan agar kolom bisa dibandingkan sekilas.
- Primitif yang dipakai ulang di semua halaman: `.btn`, `.chip`, `.card`, `.field`, `.segmented`, `.note`, `.table`, `.meter`, `.stack-bar`, `.empty`. Jarak antarblok diatur `.stack`, bukan margin bertumpuk.
- Layout: rail navigasi kiri pada desktop dengan deskripsi tiap menu; pada ≤1024px rail berganti menjadi drawer yang bisa ditutup dengan Escape atau klik di luar.
- Tabel daerah berubah menjadi daftar kartu pada ≤720px, sehingga tidak ada lagi instruksi "geser tabel ke samping" di layar kecil.
- Grafik memakai palet yang sama dengan token, garis bantu tipis, dan legenda HTML (`ChartLegend`) agar tipografinya konsisten dengan sisa halaman.
- Data tetap menjadi fokus. Lencana periode, sumber, keterbatasan, dan tautan unduhan berada dekat angka.

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

## Rekonstruksi UI/UX menyeluruh — 31 Oktober 2026

Seluruh lapisan tampilan ditulis ulang. Logika data, perhitungan indikator, endpoint, dan isi analisis tidak diubah.

- **Sistem desain baru.** `src/app/globals.css` diganti dari nol (±2.200 baris) menjadi satu sistem bertoken: netral hangat, satu garis rambut, bayangan sangat halus. Warna hanya dipakai untuk data dan status, sehingga chrome tidak bersaing dengan angka. Rujukan: Notion untuk ketenangan dan ritme kertas, HeroUI untuk konsistensi primitif dan status fokus.
- **Tipografi.** `@fontsource/plus-jakarta-sans` diganti `@fontsource-variable/inter` (isi, antarmuka, angka) dan `@fontsource-variable/source-serif-4` (judul utama). Keduanya tetap paket lokal, jadi aplikasi masih tidak memanggil Google Fonts. Basis naik dari 13px ke 15px dan semua angka memakai `tabular-nums`.
- **Primitif pengganti.** ±280 kelas sekali-pakai diringkas menjadi primitif yang dipakai ulang: `.btn`, `.chip`, `.card`, `.field`, `.segmented`, `.note`, `.table`, `.meter`, `.stack-bar`, `.metrics`, `.empty`, `.skeleton`.
- **Navigasi.** Rail kiri memuat deskripsi singkat tiap menu. Pada ≤1024px rail berganti menjadi drawer dengan scrim, penutupan lewat Escape, kunci scroll, dan penutupan otomatis saat rute berubah.
- **Perubahan UX, bukan hanya tampilan.**
  - Tabel daerah menjadi daftar kartu pada ≤720px; instruksi "geser tabel ke samping" dihapus karena tidak lagi diperlukan.
  - Filter jenis daerah yang sebelumnya duplikat (dropdown dan pil) disatukan menjadi satu `segmented control` berisi jumlah per kelompok.
  - Urutan daftar dipindah ke baris filter, bukan tersembunyi di dalam kepala panel.
  - Grafik memakai legenda HTML (`ChartLegend`) agar tipografi legenda sama dengan isi halaman, dan palet grafik dikunci sejajar dengan token.
  - Lembar advokasi memakai gaya cetak baru: rail, topbar, tombol, dan grafik disembunyikan; kartu tidak terpotong antarhalaman.
- **Penanda inisial daerah dihapus.** Avatar monogram di tabel jelajah, kartu mobile, kartu sorotan, dan pemilih pembanding dibuang. Aturan inisialnya menghasilkan title case, sehingga nama satu kata terbaca sebagai kata, bukan monogram (Medan → "Me", Binjai → "Bi", Karo → "Ka"). Nama daerah sudah berdiri sendiri di sebelahnya, jadi penanda itu hanya mengulang informasi. Helper `initials()` ikut dihapus dari `shared.tsx`.
- **Tailwind dibatasi pada reset.** `@import "tailwindcss"` diganti impor terpisah `theme.css` dan `preflight.css`; lapisan `utilities` sengaja tidak diimpor. Tailwind v4 membuat utility dari string apa pun yang ditemukannya di sumber, sehingga kelas semantik seperti `.ring` ikut tergenerasi sebagai utility `ring` dan menimpa gaya kita (`box-shadow: 0 0 0 1px`) — terlihat sebagai kotak tipis di sekeliling cincin serapan pada beranda. Kelas itu juga diganti nama menjadi `.gauge`. Nama lain yang berisiko sama bila lapisan utilities dihidupkan kembali: `.table`, `.border`, `.grid`, `.shadow`, `.block`, `.hidden`.
- **Verifikasi.** `npm test` 23/23 lulus, `npm run typecheck` 0 error, `npm run build` lulus (18 halaman), dan `npm run test:browser` lulus seluruhnya pada 360, 768, dan 1280 px tanpa overflow horizontal dan tanpa runtime error.
