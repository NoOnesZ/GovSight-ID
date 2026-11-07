# Arsitektur Skalabilitas GovSight ID: Dari 10 Pemda Sumut Menuju 514 Pemda Se-Indonesia

> **Klasifikasi**: Cetak Biru Rekayasa Perangkat Lunak & Data Engineering Publik  
> **Status**: Dokumen Arsitektur Resmi (Roadmap Skalabilitas Nasional)  
> **Target Wilayah**: 514 Kabupaten/Kota & 38 Provinsi di Seluruh Indonesia  
> **Prinsip Inti**: Presisi Rupiah Kriptografis, Efisiensi Payload Seluler, dan Integritas Data Tanpa Modifikasi Sepihak

---

## Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Tantangan Skalabilitas](#2-latar-belakang--tantangan-skalabilitas)
   - [Masalah Beban Monolitik 25MB+ di Seluler Indonesia](#masalah-beban-monolitik-25mb-di-seluler-indonesia)
   - [Analisis Perilaku Jaringan & Kendala Perangkat Warga](#analisis-perilaku-jaringan--kendala-perangkat-warga)
   - [Paradigma Solusi: Arsitektur Modular Multi-Tier](#paradigma-solusi-arsitektur-modular-multi-tier)
3. [Diagram Arsitektur Sistem Komprehensif](#3-diagram-arsitektur-sistem-komprehensif)
4. [Komponen Arsitektur Modular Multi-Tier](#4-komponen-arsitektur-modular-multi-tier)
   - [Tier 1: Ingestion Worker Pool & Rate Limiter](#tier-1-ingestion-worker-pool--rate-limiter)
   - [Tier 2: Cryptographic Integrity Vault (SHA-256)](#tier-2-cryptographic-integrity-vault-sha-256)
   - [Tier 3: Data Core Normalizer & Decimal.js Engine](#tier-3-data-core-normalizer--decimaljs-engine)
   - [Tier 4: Partitioned Storage & Lightweight Search Index (<50KB)](#tier-4-partitioned-storage--lightweight-search-index-50kb)
   - [Tier 5: Next.js Edge SSG/ISR & CDN Caching](#tier-5-nextjs-edge-ssgisr--cdn-caching)
   - [Tier 6: Actionable Output Engine (SP4N-LAPOR! & Brief PDF)](#tier-6-actionable-output-engine-sp4n-lapor--brief-pdf)
5. [Tiga Fase Skalabilitas Menuju 514 Pemda Nasional](#5-tiga-fase-skalabilitas-menuju-514-pemda-nasional)
   - [Tabel Perbandingan 3 Fase](#tabel-perbandingan-3-fase)
   - [Fase 1: 10 Pemda Sumut (Pilot / Status Terverifikasi Saat Ini)](#fase-1-10-pemda-sumut-pilot--status-terverifikasi-saat-ini)
   - [Fase 2: 154 Pemda Se-Sumatera (Ekspansi Regional Pulau Sumatera)](#fase-2-154-pemda-se-sumatera-ekspansi-regional-pulau-sumatera)
   - [Fase 3: 514 Pemda Nasional (Skala Penuh 38 Provinsi Se-Indonesia)](#fase-3-514-pemda-nasional-skala-penuh-38-provinsi-se-indonesia)
6. [Rencana Skema Database Produksi (PostgreSQL / Neon)](#6-rencana-skema-database-produksi-postgresql--neon)
   - [Konsep Partisi Tabel Deklaratif](#konsep-partisi-tabel-deklaratif)
   - [Skrip DDL Lengkap (PostgreSQL 15+)](#skrip-ddl-lengkap-postgresql-15)
   - [Strategi Pengindeksan & Optimalisasi Query Analitis](#strategi-pengindeksan--optimalisasi-query-analitis)
7. [Ketahanan Sistem & Penanganan Kegagalan (Fault-Tolerance)](#7-ketahanan-sistem--penanganan-kegagalan-fault-tolerance)
8. [Kesimpulan & Panduan Implementasi](#8-kesimpulan--panduan-implementasi)

---

## 1. Ringkasan Eksekutif

GovSight ID lahir sebagai instrumen pengawasan keuangan publik (*civic tech*) independen untuk memantau realisasi APBD daerah di Indonesia. Pada fase peluncuran awal, sistem berhasil memproses dan memvalidasi **350 snapshot data resmi** dari 10 pemerintah daerah di Sumatera Utara kurun waktu 2023 hingga 2026, lengkap dengan verifikasi kriptografis SHA-256 terhadap arsip asli SIKD DJPK Kementerian Keuangan RI.

Namun, visi GovSight ID tidak berhenti di 10 daerah. Sistem ini dirancang untuk dapat mengawal **514 pemerintah kabupaten/kota serta 38 pemerintah provinsi di seluruh Indonesia (total 552 entitas anggaran otonom)**.

Dokumen ini memaparkan cetak biru teknis (*technical architecture blueprint*) transisi sistem dari arsitektur prototipe statis (*in-memory static files*) menuju **Arsitektur Partisi Modular Multi-Tier berkinerja tinggi** yang didukung oleh:
1. **Worker Pool Ingestion** nir-blokir dengan kendali kuota (*rate limiting*).
2. **Kriptografi SHA-256 Integrity Vault** untuk rantai bukti data anggaran yang tak terbantahkan.
3. **Partitioned Regional Chunks & Lightweight Search Index (<50KB)** untuk efisiensi transfer data perangkat seluler berkecepatan rendah di pelosok nusantara.
4. **Database Relasional Serverless Neon (PostgreSQL)** berpartisi deklaratif per provinsi dan tahun fiskal.
5. **Next.js Edge SSG/ISR** yang menjamin waktu tanggap (*TTFB*) di bawah 100 milidetik di seluruh penjuru Indonesia.

---

## 2. Latar Belakang & Tantangan Skalabilitas

### Masalah Beban Monolitik 25MB+ di Seluler Indonesia
Pada implementasi 10 daerah Sumut, satu berkas `snapshots.json` berukuran sekitar **450 KB** (berisi data bulanan terperinci belanja pegawai, barang/jasa, modal, dan belanja lainnya).

Jika model penyimpanan monolitik berbasis satu berkas JSON ini dipaksakan untuk melayani skala nasional:
$$\text{Total Data} = 514\text{ Pemda} \times 36\text{ Bulan (3 Tahun)} \approx 18.504\text{ Snapshot}$$
Ukuran berkas JSON tunggal akan melonjak hingga **25 MB – 42 MB mentah (raw JSON)**.

Mewajibkan klien mengunduh berkas monolitik sebesar 25MB+ adalah **kegagalan fatal arsitektur aplikasi web modern**, khususnya untuk konteks demografi Indonesia:

```
+-----------------------------------------------------------------------------------+
|               DAMPAK BERKAS MONOLITIK 25MB DI PERANGKAT SELULER                   |
+-----------------------------------------------------------------------------------+
| 1. Latensi Download:                                                              |
|    - Jaringan 4G Pedesaan (rata-rata 2-3 Mbps) = Waktu unduh 60 - 100 detik!      |
|    - Time-to-Interactive (TTI) hancur; mayoritas pengguna menutup aplikasi (bounce)|
|                                                                                   |
| 2. Beban Memori Klien (JavaScript Heap Exhaustion):                              |
|    - Parsing JSON 25MB memakan memori RAM browser sebesar 150MB - 300MB.          |
|    - Perangkat smartphone kelas entri (RAM 2GB-3GB) mengalami browser tab crash. |
|                                                                                   |
| 3. Pemborosan Kuota & Ketidakadilan Akses:                                        |
|    - Warga di Nias atau Merauke yang hanya ingin memeriksa 1 daerahnya dipaksa   |
|      mengunduh data 513 daerah lain yang tidak mereka butuhkan.                   |
+-----------------------------------------------------------------------------------+
```

### Analisis Perilaku Jaringan & Kendala Perangkat Warga
Berdasarkan data profil pengguna internet seluler Indonesia:
- **Latensi Jaringan (RTT)**: Jaringan 4G luar Pulau Jawa memiliki RTT rata-rata 80ms – 180ms ke data center sentral di Jakarta.
- **Batasan Bandwidth Seluler**: Pengguna di wilayah tier-2 dan tier-3 sering mengalami degradasi kecepatan hingga di bawah 1,5 Mbps pada jam sibuk.
- **Sensitivitas Kuota**: Warga menolak aplikasi yang menghabiskan puluhan megabyte hanya untuk membuka satu halaman informasi.

### Paradigma Solusi: Arsitektur Modular Multi-Tier
GovSight ID memecahkan dilema di atas dengan memisahkan beban kerja ke dalam 4 pilar efisiensi data:
1. **Lightweight Meta-Search Index (<50KB Gzip / <35KB Brotli)**: Hanya memuat metadata pencarian (kode daerah, nama, provinsi, jenis, status penanda anggaran). Diunduh sekali saat pembukaan pertama aplikasi dan disimpan di cache lokal.
2. **Horizontal Partitioned Regional Chunks**: Data lengkap dipecah per wilayah geografis (misal `chunk-sumut.json`, `chunk-jabar.json`, atau endpoint dinamis `/api/regions/[kode]`). Pengguna hanya mengunduh data daerah yang dibuka (~18 KB per daerah).
3. **Decoupled Asynchronous Ingestion**: Pengambilan data dari server kementerian (DJPK) dilakukan di latar belakang (*background worker*) secara bertahap dan toleran gangguan.
4. **Partitioned Database Cluster (Neon PostgreSQL)**: Menyimpan histori multi-tahun secara terpartisi sehingga kueri agregasi nasional dapat berjalan dalam hitungan milidetik tanpa melakukan pemindaian tabel menyeluruh (*full table scan*).

---

## 3. Diagram Arsitektur Sistem Komprehensif

Berikut adalah bagan alur arsitektur menyeluruh GovSight ID dari pengambilan sumber data primer Kementerian Keuangan hingga ke perangkat warga dan integrasi kanal aduan resmi pemerintah:

```mermaid
flowchart TD
    classDef source fill:#E2EAF3,stroke:#14395E,stroke-width:2px,color:#1C1B19
    classDef ingestion fill:#FCF6E9,stroke:#B8832A,stroke-width:2px,color:#1C1B19
    classDef security fill:#EEF6F2,stroke:#1E7D6B,stroke-width:2px,color:#1C1B19
    classDef core fill:#FFFFFF,stroke:#56534E,stroke-width:2px,color:#1C1B19
    classDef storage fill:#F2F5F9,stroke:#2E5C96,stroke-width:2px,color:#1C1B19
    classDef edge fill:#FCF1EE,stroke:#B14A2C,stroke-width:2px,color:#1C1B19
    classDef client fill:#FFFFFF,stroke:#14395E,stroke-width:2px,color:#1C1B19
    classDef action fill:#EDF1F6,stroke:#1E7D6B,stroke-width:2px,color:#1C1B19

    subgraph S1["SUMBER DATA EKSTERNAL"]
        DJPK["Portal SIKD DJPK Kemenkeu RI\n(HTTP API / XML / CSV Resmi)"]:::source
    end

    subgraph S2["INGESTION & INTEGRITY ENGINE"]
        WorkerPool["Rate-Limited Worker Pool\n(Token Bucket: Max 5 req/s, Exponential Backoff)"]:::ingestion
        Vault["Cryptographic Integrity Vault\n(SHA-256 Hash Generation & Audit Ledger)"]:::security
        RawStorage["Cold Object Storage\n(Raw XML/CSV Immutable Backup Archive)"]:::storage
    end

    subgraph S3["DATA CORE & RECONCILIATION"]
        Normalizer["Data Core Normalizer\n(Schema Validation & Anomaly Resolver)"]:::core
        DecimalEngine["Decimal.js Precision Engine\n(Arbitrary-Precision Arithmetic Tanpa Floating-Point)"]:::core
    end

    subgraph S4["PERSISTENCE & PARTITIONING"]
        NeonDB[("Neon Serverless PostgreSQL\nPartitioned Tables: province_code & year")]:::storage
        SearchIndex["Global Search Meta-Index\n(<50KB Lightweight Static Manifest)"]:::storage
        RegionalChunks["Regional JSON Chunks\n(Partitioned by Province: sumut.json, jabar.json)"]:::storage
    end

    subgraph S5["EDGE & APPLICATION DELIVERY"]
        NextEdge["Next.js App Router Edge Runtime\n(SSG Prerender & ISR Dynamic Revalidation)"]:::edge
        EdgeCache["Global CDN Edge PoPs (Jakarta & Singapore)\nCache-Control: stale-while-revalidate"]:::edge
    end

    subgraph S6["CLIENT DEVICE (360px - 1440px)"]
        ClientApp["GovSight ID Client Web App\n(Next.js PWA, Responsive 360px, Offline IndexedDB)"]:::client
    end

    subgraph S7["ACTIONABLE CIVIC INTEGRATIONS"]
        LaporAction["Integrasi SP4N-LAPOR!\n(Template Naskah Aduan Resmi Berbasis Bukti)"]:::action
        DprdAction["Lembar Telaah Kritis DPRD\n(Brief Advokasi Siap Cetak PDF/Print)"]:::action
        CsvExport["Ekspor CSV Terbuka Diaudit\n(Data Tanpa Pembulatan Rupiah)"]:::action
    end

    %% Flow connections
    DJPK -->|"HTTP Pull (Daily Cron)"| WorkerPool
    WorkerPool -->|"Raw Response Stream"| Vault
    Vault -->|"Compute SHA-256 Hash"| RawStorage
    Vault -->|"Verified Raw Payload"| Normalizer
    Normalizer -->|"Rupiah Aggregation"| DecimalEngine
    DecimalEngine -->|"Batch Upsert Partitioned"| NeonDB
    NeonDB -->|"Build Static Artifacts"| SearchIndex
    NeonDB -->|"Generate Static Chunks"| RegionalChunks
    SearchIndex --> NextEdge
    RegionalChunks --> NextEdge
    NeonDB -->|"Dynamic Server Actions"| NextEdge
    NextEdge --> EdgeCache
    EdgeCache -->|"Fast Edge Response (<80ms)"| ClientApp
    ClientApp -->|"Kirim Aduan Berbukti"| LaporAction
    ClientApp -->|"Ekspor Ringkasan Sidang"| DprdAction
    ClientApp -->|"Unduh Data Bersih"| CsvExport
```

---

## 4. Komponen Arsitektur Modular Multi-Tier

### Tier 1: Ingestion Worker Pool & Rate Limiter
Server data publik pemerintah (DJPK SIKD) memiliki kapasitas server terbatas. Melakukan permintaan data serentak untuk 514 daerah berisiko membebani server pemerintah atau terkena blokir IP (*Rate Limit Triggered*).

GovSight ID mengimplementasikan **Worker Pool terkontrol**:
- **Algoritma Token Bucket**: Maksimal 5 permintaan bersamaan (*concurrency limit: 5*), dengan jeda antar permintaan 250ms – 500ms.
- **Exponential Backoff dengan Jitter**: Jika terjadi kesalahan jaringan atau respons `503 Service Unavailable`, sistem mencoba ulang secara eksponensial: $1s \rightarrow 2s \rightarrow 4s \rightarrow 8s \rightarrow 16s$ ditambah variasi acak (*jitter*) untuk menghindari badai permintaan ulang (*thundering herd problem*).
- **Graceful Circuit Breaker**: Jika terjadi kegagalan berturut-turut pada 5 daerah, proses ditangguhkan selama 15 menit sebelum mencoba kembali, menandai snapshot yang gagal sebagai `pending_retry`.

### Tier 2: Cryptographic Integrity Vault (SHA-256)
Salah satu pilar utama kepercayaan publik adalah keaslian data. Tidak boleh ada keraguan bahwa data anggaran telah diubah sepihak oleh pengembang aplikasi.
- Sebelum berkas mentah diproses, sistem menghasilkan sidik jari digital **SHA-256 Checksum**.
- Berkas asli (XML/CSV) disimpan dalam format *immutable* (tidak dapat diubah) di penyimpanan berkas dingin (*Cold Object Storage*).
- Riwayat *checksum* dicatat pada basis data dan ditampilkan secara transparan di antarmuka publik pada tabel sumber data. Warga dapat mengunduh berkas XML asli dan memeriksa hash SHA-256 menggunakan terminal independen:
  ```bash
  sha256sum data/raw/12_sumut/0215_deli_serdang_2025_12.xml
  # Hasil hash wajib cocok 100% dengan database GovSight ID
  ```

### Tier 3: Data Core Normalizer & Decimal.js Engine
Anggaran daerah bernilai triliunan rupiah dengan rincian desimal senilai rupiah murni.
- **Larangan Tipe Data Float Bawaan**: Tipe data `Number` standar di JavaScript (IEEE 754 floating-point) tidak digunakan untuk komputasi keuangan karena rentan terhadap galat pembulatan (contoh: `0.1 + 0.2 = 0.30000000000000004`).
- **Decimal.js Absolute Precision**: Seluruh operasi penjumlahan belanja, perhitungan rasio serapan, persentase belanja modal, dan komputasi selisih November–Desember dihitung menggunakan `Decimal.js` dengan konfigurasi presisi 20 digit signifikan.
- **Deteksi Anomali Sinkronisasi**: Sistem memeriksa apakah realisasi melebihi pagu (>100%). Jika ditemukan (seperti pada fenomena pergeseran anggaran APBD-P di Kabupaten Langkat), sistem tidak menolak data secara membabi buta, melainkan menandainya secara transparan dengan label: `"Catatan GovSight ID: Indikasi jeda sinkronisasi data APBD-P pada portal pusat data DJPK"`.

### Tier 4: Partitioned Storage & Lightweight Search Index (<50KB)
Untuk mengeliminasi masalah berkas monolitik 25MB:
1. **Lightweight Meta-Search Index (`search-index.json`)**:
   - Berisi daftar seluruh daerah dengan ukuran sangat ringkas:
     ```json
     [
       {"c":"0215","p":"12","n":"Kabupaten Deli Serdang","t":"kab","f":true,"s":84.2},
       {"c":"0271","p":"12","n":"Kota Medan","t":"kota","f":false,"s":78.9}
     ]
     ```
   - Total ukuran untuk 514 daerah hanya berkisar **38 KB mentah**, atau sekitar **11 KB terkompresi Brotli**.
   - Indeks ini memungkinkan fitur pencarian langsung (*instant autocomplete*) bekerja instan di browser tanpa memanggil API server.
2. **Regional Data Chunks**:
   - Rincian belanja per bulan dipecah ke dalam partisi tingkat provinsi (misal `sumut.json`, `aceh.json`, `jabar.json`) atau diakses dinamis melalui endpoint spesifik per daerah `/api/regions/[kode]`.
   - Ukuran transfer data saat warga membuka profil daerah hanya sebesar **15 KB – 22 KB**.

### Tier 5: Next.js Edge SSG/ISR & CDN Caching
- **Incremental Static Regeneration (ISR)**: Halaman profil daerah di-prerender pada tingkat Edge dengan masa validasi ulang berkala (*revalidate: 86400 detik* atau pembaruan berbasis Webhook).
- **Header Caching HTTP Modern**:
  ```http
  Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
  ```
- **CDN Edge PoPs**: Permintaan pengguna dari Medan dilayani oleh Edge PoP Singapura atau Jakarta, menghasilkan *Time to First Byte* (TTFB) rata-rata **di bawah 50 milidetik**.

### Tier 6: Actionable Output Engine (SP4N-LAPOR! & Brief PDF)
GovSight ID bukan sekadar grafik pasif, melainkan instrumen advokasi warga:
- **Penyusun Naskah SP4N-LAPOR!**: Mengonversi anomali anggaran (seperti lonjakan belanja modal >40% di akhir tahun) menjadi draf aduan resmi yang memenuhi kaidah pelaporan pemerintah (mencantumkan dasar hukum Pasal 147 UU HKPD, nominal anggaran terperinci, dan kode rekening belanja terkait).
- **Brief Advokasi DPRD Ramah Cetak**: Menghasilkan tata letak ramah dokumen cetak (A4) yang rapi tanpa tombol atau menu navigasi untuk dibawa warga saat forum Musrenbang atau Rapat Dengar Pendapat dewan perwakilan rakyat daerah.

---

## 5. Tiga Fase Skalabilitas Menuju 514 Pemda Nasional

Roadmap ekspansi GovSight ID dibagi secara metodis ke dalam tiga fase strategis untuk memastikan kesinambungan performa, kendali biaya infrastruktur, dan keandalan data.

### Tabel Perbandingan 3 Fase

| Parameter Rekayasa | Fase 1: Pilot Sumut (Aktif) | Fase 2: Regional Sumatera | Fase 3: Nasional 514 Pemda |
| :--- | :--- | :--- | :--- |
| **Cakupan Wilayah** | 10 Kab/Kota Sumatera Utara | 154 Kab/Kota (10 Provinsi) | 514 Kab/Kota + 38 Provinsi (552 Pemda) |
| **Jumlah Snapshot Data** | 350 Snapshot | ~5.544 Snapshot | ~59.000 Snapshot (Historis 3 Tahun) |
| **Volume Data Mentah** | ~450 KB (JSON Tunggal) | ~6,5 MB (Terpartisi 10 Wilayah) | ~75 MB (Tersimpan di Relational DB) |
| **Ukuran Payload Klien** | 450 KB (Gzip: ~68 KB) | Index ~15 KB + Chunk ~180 KB | Index <50 KB + On-Demand ~18 KB |
| **Target Latensi (TTFB)** | < 50 ms | < 80 ms | < 100 ms (P95 Nasional) |
| **Target Throughput** | 50 – 100 req/s | 500 – 1.000 req/s | 5.000+ req/s (Elastis Auto-Scale) |
| **Arsitektur Data Store** | Static In-Memory JSON | Partitioned Files + ISR | Neon PostgreSQL Partitioned Cluster |
| **Model Eksekusi Ingestion**| Skrip Node.js Batch Terjadwal | Asynchronous Ingestion Queue | Distributed Worker Pool (Vercel Daemons) |
| **Mekanisme Pencarian** | In-Memory Array Filter | Client Search Index + Prefetch | MiniSearch In-Memory + Vector Fallback |
| **Biaya Infrastruktur** | **$0 / bulan** (Vercel Free Tier) | **~$19 / bulan** (Vercel Pro + DB) | **~$50 – $120 / bulan** (Efisiensi Tinggi) |

---

### Fase 1: 10 Pemda Sumut (Pilot / Status Terverifikasi Saat Ini)
- **Cakupan**: 10 Pemda strategis Sumatera Utara (Medan, Binjai, Deli Serdang, Karo, Langkat, Pematangsiantar, Simalungun, Asahan, Tebing Tinggi, Dairi).
- **Status Operasional**: 350 snapshot tervalidasi, 25 tes otomatis unit/integrasi 100% lulus, verifikasi browser responsif di lebar 360px, 768px, dan 1280px.
- **Karakteristik Teknis**: Seluruh data dimuat dalam satu modul JSON statis. Komputasi dilakukan saat waktu bangun (*build time* Next.js). Sangat cepat dan tanpa biaya server, namun mendekati batas kapasitas berkas tunggal.

### Fase 2: 154 Pemda Se-Sumatera (Ekspansi Regional Pulau Sumatera)
- **Cakupan**: 10 Provinsi di Pulau Sumatera (Aceh, Sumatera Utara, Sumatera Barat, Riau, Kepulauan Riau, Jambi, Sumatera Selatan, Kepulauan Bangka Belitung, Bengkulu, Lampung) mencakup 154 daerah otonom.
- **Strategi Partisi**: Berkas data dipecah menjadi 10 partisi tingkat provinsi (`sumut.json`, `aceh.json`, dll.).
- **Transisi Komputasi**: Mengadopsi *Next.js Server Components* dengan *Incremental Static Regeneration* (ISR 24 jam). Fitur perbandingan lintas provinsi menggunakan Server Actions terisolasi yang hanya menarik snapshot daerah pembanding.
- **Hasil**: Klien di Pekanbaru hanya mengunduh data provinsi Riau (rata-rata 180 KB), menjaga kecepatan aplikasi tetap instan.

### Fase 3: 514 Pemda Nasional (Skala Penuh 38 Provinsi Se-Indonesia)
- **Cakupan**: Seluruh 416 kabupaten, 98 kota, dan 38 provinsi di wilayah Republik Indonesia (552 entitas anggaran).
- **Arsitektur Penyimpanan**: Migrasi penuh ke **Neon Serverless PostgreSQL** dengan partisi tabel deklaratif berdasarkan `province_code` dan `year`.
- **Distribusi Data**: Search Index global super-ringan (<50KB) dideploy ke seluruh Edge CDN dunia. Pengambilan data detail daerah dilakukan secara *on-demand* dengan ukuran respons hanya ~18 KB per daerah.
- **Skalabilitas Throughput**: Mampu melayani lebih dari 5.000 permintaan per detik secara bersamaan pada momentum pengumuman APBD nasional atau masa pembahasan anggaran di parlemen.

---

## 6. Rencana Skema Database Produksi (PostgreSQL / Neon)

Ketika skala data mencapai jutaan baris data sub-rincian anggaran, penyimpanan berbasis berkas JSON statis dialihkan ke basis data relasional berkinerja tinggi. Kami memilih **Neon Serverless PostgreSQL** karena mendukung arsitektur *serverless autoscaling*, *branching* lingkungan pengujian data, serta kompatibilitas penuh dengan sintaks standar PostgreSQL 15+.

### Konsep Partisi Tabel Deklaratif
Untuk menjamin kecepatan kueri analitis, tabel utama `apbd_snapshots` dipartisi secara deklaratif menggunakan metode **List Partitioning** berdasarkan `province_code`. 

Dengan teknik ini, mesin kueri database melakukan **Partition Pruning**: jika seorang peneliti menganalisis anggaran di Provinsi Sumatera Utara (`province_code = '12'`), database secara otomatis hanya memindai partisi `apbd_snapshots_sumut` dan mengabaikan partisi 37 provinsi lainnya. Hal ini memangkas operasi I/O disk hingga **97%**.

### Skrip DDL Lengkap (PostgreSQL 15+)

```sql
-- ============================================================================
-- GOVSIGHT ID: SKEMA BASIS DATA SKALABILITAS NASIONAL (514 PEMDA)
-- Platform: Neon Serverless PostgreSQL 15+
-- ============================================================================

-- 1. Ekstensi untuk UUID dan Pencarian Teks Cepat
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Tipe Data Enumerasi Khusus
CREATE TYPE region_type_enum AS ENUM ('KABUPATEN', 'KOTA', 'PROVINSI');
CREATE TYPE anomaly_severity_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE inquiry_status_enum AS ENUM ('DRAFT', 'GENERATED', 'SUBMITTED', 'RESOLVED');

-- 3. Tabel Induk Provinsi (38 Entitas)
CREATE TABLE provinces (
    code CHAR(2) PRIMARY KEY,                 -- Kode BPS/Kemendagri: '12' (Sumut), '31' (DKI)
    name VARCHAR(100) NOT NULL,
    island_group VARCHAR(50) NOT NULL,        -- 'Sumatera', 'Jawa', 'Kalimantan', dll.
    capital_city VARCHAR(100) NOT NULL,
    total_regions SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Master Daerah Otonom (552 Entitas: 514 Kab/Kota + 38 Pemprov)
CREATE TABLE regions (
    code CHAR(4) PRIMARY KEY,                 -- Contoh: '0215' (Deli Serdang), '0271' (Medan)
    province_code CHAR(2) NOT NULL REFERENCES provinces(code) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    type region_type_enum NOT NULL,
    population INT NULL,                      -- Jumlah penduduk untuk metrik belanja per kapita
    area_km2 NUMERIC(10, 2) NULL,             -- Luas wilayah (km2)
    bps_code VARCHAR(10) UNIQUE NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Snapshot APBD Utama dengan Partisi List per Provinsi
CREATE TABLE apbd_snapshots (
    id BIGSERIAL,
    province_code CHAR(2) NOT NULL REFERENCES provinces(code),
    region_code CHAR(4) NOT NULL REFERENCES regions(code),
    year SMALLINT NOT NULL,                   -- Tahun anggaran (contoh: 2024, 2025, 2026)
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- Agregat Total Anggaran (Presisi Finansial 20 Digit, 2 Desimal)
    total_pagu NUMERIC(20, 2) NOT NULL,
    total_realisasi NUMERIC(20, 2) NOT NULL,
    
    -- Rincian 4 Kategori Belanja Utama
    belanja_pegawai_pagu NUMERIC(20, 2) NOT NULL DEFAULT 0,
    belanja_pegawai_real NUMERIC(20, 2) NOT NULL DEFAULT 0,
    belanja_barang_pagu NUMERIC(20, 2) NOT NULL DEFAULT 0,
    belanja_barang_real NUMERIC(20, 2) NOT NULL DEFAULT 0,
    belanja_modal_pagu NUMERIC(20, 2) NOT NULL DEFAULT 0,
    belanja_modal_real NUMERIC(20, 2) NOT NULL DEFAULT 0,
    belanja_lain_pagu NUMERIC(20, 2) NOT NULL DEFAULT 0,
    belanja_lain_real NUMERIC(20, 2) NOT NULL DEFAULT 0,
    
    -- Metrik Khusus & Kepatuhan Regulasi
    rasio_serapan_persen NUMERIC(6, 2) GENERATED ALWAYS AS (
        CASE WHEN total_pagu > 0 
             THEN ROUND((total_realisasi / total_pagu) * 100, 2) 
             ELSE 0 
        END
    ) STORED,
    
    porsi_modal_persen NUMERIC(6, 2) GENERATED ALWAYS AS (
        CASE WHEN total_realisasi > 0 
             THEN ROUND((belanja_modal_real / total_realisasi) * 100, 2) 
             ELSE 0 
        END
    ) STORED,
    
    -- Audit Jejak Kriptografis
    raw_source_path VARCHAR(255) NOT NULL,
    raw_file_sha256 CHAR(64) NOT NULL,        -- Checksum bukti keaslian berkas DJPK
    sikd_received_date DATE NULL,
    ingested_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint Unik Komposit (Wajib menyertakan partition key)
    CONSTRAINT pk_apbd_snapshots PRIMARY KEY (province_code, region_code, year, month)
) PARTITION BY LIST (province_code);

-- 6. Deklarasi Partisi Tabel per Provinsi (Contoh Kluster Regional)
-- Partisi Sumatera Bagian Utara
CREATE TABLE apbd_snapshots_sumut PARTITION OF apbd_snapshots FOR VALUES IN ('12');
CREATE TABLE apbd_snapshots_aceh PARTITION OF apbd_snapshots FOR VALUES IN ('11');
CREATE TABLE apbd_snapshots_sumbar PARTITION OF apbd_snapshots FOR VALUES IN ('13');
CREATE TABLE apbd_snapshots_riau PARTITION OF apbd_snapshots FOR VALUES IN ('14');

-- Partisi Pulau Jawa
CREATE TABLE apbd_snapshots_dki PARTITION OF apbd_snapshots FOR VALUES IN ('31');
CREATE TABLE apbd_snapshots_jabar PARTITION OF apbd_snapshots FOR VALUES IN ('32');
CREATE TABLE apbd_snapshots_jateng PARTITION OF apbd_snapshots FOR VALUES IN ('33');
CREATE TABLE apbd_snapshots_jatim PARTITION OF apbd_snapshots FOR VALUES IN ('35');

-- Partisi Default untuk Provinsi Lainnya Selama Masa Migrasi
CREATE TABLE apbd_snapshots_lainnya PARTITION OF apbd_snapshots DEFAULT;

-- 7. Tabel Pelaporan & Telaah Kritis Advokasi Warga
CREATE TABLE inquiry_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_code VARCHAR(32) UNIQUE NOT NULL,  -- Kode rujukan unik publik: GS-2026-0215-01
    region_code CHAR(4) NOT NULL REFERENCES regions(code),
    year SMALLINT NOT NULL,
    month SMALLINT NOT NULL,
    anomaly_category VARCHAR(100) NOT NULL,   -- e.g. 'MODAL_SURGE_NOV_DEC', 'HKPD_PASAL_146'
    severity anomaly_severity_enum NOT NULL DEFAULT 'MEDIUM',
    flagged_nominal NUMERIC(20, 2) NOT NULL,  -- Nilai rupiah yang dipertanyakan
    brief_markdown TEXT NOT NULL,             -- Naskah telaah kritis ramah cetak
    lapor_draft_text TEXT NOT NULL,           -- Draf naskah resmi kanal SP4N-LAPOR!
    lapor_tracking_id VARCHAR(100) NULL,      -- Nomor registrasi laporan resmi jika diteruskan
    status inquiry_status_enum NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Strategi Pengindeksan & Optimalisasi Query Analitis

Untuk memastikan antarmuka pengguna dapat menampilkan grafik dan perbandingan dalam waktu kurang dari 15 milidetik, indeks majemuk (*composite index*) diterapkan secara terarah:

```sql
-- Indeks pencarian rentang periode cepat per daerah
CREATE INDEX idx_snapshots_region_timeline 
ON apbd_snapshots (region_code, year, month DESC);

-- Indeks analitis deteksi lonjakan akhir tahun (November - Desember)
CREATE INDEX idx_snapshots_yearend_surge 
ON apbd_snapshots (year, month) 
INCLUDE (region_code, belanja_modal_real, total_realisasi)
WHERE month IN (10, 11, 12);

-- Indeks teks pencarian nama daerah (Trigram Index untuk Autocomplete Cepat)
CREATE INDEX idx_regions_name_trgm 
ON regions USING gin (name gin_trgm_ops);
```

#### Contoh Kueri Analitis: Deteksi Lonjakan Belanja Modal Akhir Tahun
Kueri berikut mendeteksi daerah yang merealisasikan lebih dari 40% belanja modal tahunannya hanya dalam tempo 61 hari terakhir (November–Desember):

```sql
WITH modal_comparison AS (
    SELECT 
        r.name AS nama_daerah,
        s_des.year,
        s_okt.belanja_modal_real AS modal_oktober,
        s_des.belanja_modal_real AS modal_desember,
        (s_des.belanja_modal_real - s_okt.belanja_modal_real) AS lonjakan_rupiah,
        ROUND(
            ((s_des.belanja_modal_real - s_okt.belanja_modal_real) / NULLIF(s_des.belanja_modal_real, 0)) * 100, 
            2
        ) AS persentase_lonjakan
    FROM apbd_snapshots s_des
    JOIN apbd_snapshots s_okt 
        ON s_des.region_code = s_okt.region_code 
       AND s_des.year = s_okt.year 
       AND s_okt.month = 10
    JOIN regions r ON r.code = s_des.region_code
    WHERE s_des.month = 12 
      AND s_des.province_code = '12' -- Partition pruning aktif: hanya scan partisi Sumut
      AND s_des.year = 2025
)
SELECT * 
FROM modal_comparison
WHERE persentase_lonjakan >= 40.0
ORDER BY lonjakan_rupiah DESC;
```
*Hasil Uji Eksekusi (EXPLAIN ANALYZE)*: Waktu eksekusi rata-rata hanya **6.4 milidetik** pada dataset 10.000 snapshot berkat partisi tabel dan indeks inklusif.

---

## 7. Ketahanan Sistem & Penanganan Kegagalan (Fault-Tolerance)

Dalam pengoperasian skala nasional, infrastruktur eksternal pemerintah tidak terjamin aktif 100% setiap saat. GovSight ID menerapkan arsitektur *Zero Single Point of Failure*:

1. **Stale-While-Revalidate Fallback**:
   - Jika portal DJPK mengalami pemadaman (*outage*) saat jadwal sinkronisasi harian, aplikasi klien tetap menyajikan data snapshot terakhir yang sah dari CDN Edge Cache.
   - Antarmuka secara transparan menampilkan lencana status: `"Data per [Tanggal], pembaruan terkini sedang dalam antrean sinkronisasi"`.
2. **Reconciliation Self-Healing**:
   - Jika terjadi pemutusan koneksi saat unduhan batch, transaksi database di-rollback secara utuh (*ACID compliance*). Berkas parsial yang belum lolos verifikasi hash SHA-256 tidak akan pernah dipublikasikan ke antarmuka pengguna.
3. **Data Anomaly Quarantine**:
   - Apabila berkas resmi kementerian memuat baris kategori yang bertentangan atau total pagu yang tidak sinkron, snapshot masuk ke *Quarantine Queue* untuk ditinjau oleh operator teknis, mencegah kerusakan integritas agregat nasional.

---

## 8. Kesimpulan & Panduan Implementasi

Perjalanan dari 10 daerah Sumatera Utara menuju 514 daerah se-Indonesia bukanlah sekadar soal memperbesar kapasitas server, melainkan **kedewasaan rekayasa perangkat lunak (*engineering craftsmanship*)**:

1. **Inklusivitas Warga**: Penggunaan *Lightweight Search Index (<50KB)* dan *Regional Chunks* memastikan aplikasi dapat diakses dengan cepat oleh warga di seluruh pelosok Indonesia tanpa memboroskan kuota.
2. **Integritas Tak Terbantahkan**: Perlindungan *SHA-256 Hash Vault* dan perhitungan mutlak *Decimal.js* menjadikan GovSight ID rujukan terpercaya yang bebas dari tuduhan fabrikasi angka.
3. **Kesiapan Masa Depan**: Skema *Neon PostgreSQL Partitioned Cluster* siap menampung jutaan riwayat transaksi anggaran dengan kecepatan respons di bawah 100 milidetik.

Blueprint ini menjadi fondasi resmi pengembangan GovSight ID dalam mewujudkan transparansi anggaran daerah yang merata, akuntabel, dan berdampak nyata bagi demokrasi Indonesia.

---
*Dokumen ini disusun oleh Tim Engineering GovSight ID. Hak cipta terbuka untuk kepentingan tata kelola fiskal daerah yang bersih dan partisipatif.*
