# Persiapan deploy GovSight ID ke Vercel

Deploy dilakukan nanti setelah tim memilih versi yang akan dipublikasikan dan perubahannya sudah tersedia di GitHub.

1. Pastikan tes dan `npm run build` lulus, lalu commit dan push perubahan ke repository tim.
2. Masuk ke Vercel dengan akun pemilik project. Pilih **Add New → Project**, hubungkan GitHub, lalu import `NoOnesZ/GovSight-ID`.
3. Pilih root repository sebagai Root Directory. Vercel mendeteksi Next.js; gunakan pengaturan build default. Prototipe snapshot tidak memerlukan database atau environment variable.
4. Buat deployment, lalu periksa URL dari perangkat lain: beranda, profil, perbandingan, metodologi, CSV, dan berkas sumber.
5. Catat URL, commit yang dideploy, tanggal pemeriksaan, dan hasil uji pada dokumen submission. Pastikan deployment production memakai commit final di `main`.

Data dibundel saat build. Setelah `npm run data:refresh`, data dan berkas sumber yang berubah harus di-commit dan di-deploy ulang; ini bukan sinkronisasi real-time. Jangan commit `.env`, token, atau folder `.vercel`.

Rujukan: https://vercel.com/docs/frameworks/full-stack/nextjs
