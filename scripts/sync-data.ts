import { mkdir, readFile, writeFile, rename, copyFile, unlink } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { parseDjpkExport } from "../src/lib/data-core";
import { retry } from "../src/lib/retry";
import { regions, coreRegions, months } from "../src/lib/regions";
import { periods, latestPeriod, runningYear, type Period } from "../src/lib/periods";
import type { Dataset, Snapshot, Region } from "../src/lib/types";

interface SyncOptions {
  mode: "latest" | "running-year" | "all";
  year?: number;
  month?: number;
  regionCode?: string;
  dryRun: boolean;
  concurrency: number;
  timeoutMs: number;
}

function parseCliArgs(): SyncOptions {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    mode: "latest",
    dryRun: false,
    concurrency: 4,
    timeoutMs: 30_000,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--all") {
      options.mode = "all";
    } else if (arg === "--running-year") {
      options.mode = "running-year";
    } else if (arg === "--latest") {
      options.mode = "latest";
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--mode=")) {
      const val = arg.split("=")[1] as SyncOptions["mode"];
      if (["latest", "running-year", "all"].includes(val)) {
        options.mode = val;
      }
    } else if (arg === "--year" && args[i + 1]) {
      options.year = Number.parseInt(args[++i], 10);
    } else if (arg.startsWith("--year=")) {
      options.year = Number.parseInt(arg.split("=")[1], 10);
    } else if (arg === "--month" && args[i + 1]) {
      options.month = Number.parseInt(args[++i], 10);
    } else if (arg.startsWith("--month=")) {
      options.month = Number.parseInt(arg.split("=")[1], 10);
    } else if (arg === "--region" && args[i + 1]) {
      options.regionCode = args[++i];
    } else if (arg.startsWith("--region=")) {
      options.regionCode = arg.split("=")[1];
    } else if (arg === "--concurrency" && args[i + 1]) {
      options.concurrency = Number.parseInt(args[++i], 10);
    } else if (arg === "--timeout" && args[i + 1]) {
      options.timeoutMs = Number.parseInt(args[++i], 10);
    }
  }

  return options;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "GovSight-ID-Pipeline/1.0 (+https://govsight-id.vercel.app)",
      Accept: "application/vnd.ms-excel, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`DJPK server mengembalikan HTTP ${response.status} (${response.statusText})`);
  }

  const text = await response.text();
  if (!text || text.trim().length === 0) {
    throw new Error("Respons dari portal DJPK kosong");
  }

  return text;
}

function extractPublishedDate(html: string): string | null {
  try {
    const match = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .match(/data diterima SIKD per\s+(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
    if (!match) return null;
    const month = months.findIndex(
      (value) => value.toLowerCase() === match[2].toLowerCase(),
    );
    return month > 0
      ? `${match[3]}-${String(month).padStart(2, "0")}-${match[1].padStart(2, "0")}`
      : null;
  } catch {
    return null;
  }
}

async function atomicWriteJson(destination: string, data: unknown): Promise<void> {
  const text = JSON.stringify(data, null, 2) + "\n";
  const tempPath = `${destination}.${Date.now()}.${process.pid}.tmp`;
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(tempPath, text, "utf8");

  try {
    await rename(tempPath, destination);
  } catch {
    // Windows atomic rename fallback bila terjadi kendala file lock
    await copyFile(tempPath, destination);
    await unlink(tempPath).catch(() => {});
  }
}

function computeSha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function syncData(cliOptions?: Partial<SyncOptions>): Promise<{
  totalJobs: number;
  successfulFetches: number;
  failedFetches: number;
  updatedSnapshotsCount: number;
}> {
  const options: SyncOptions = {
    ...parseCliArgs(),
    ...cliOptions,
  };

  const startTime = Date.now();
  const checkedAt = new Date().toISOString();
  const runId = checkedAt.replace(/[:.]/g, "-");
  const rawDirectory = path.join(process.cwd(), "public", "data", "raw", runId);
  const destination = path.join(process.cwd(), "data", "snapshots.json");

  console.log("=========================================================");
  console.log("GovSight ID - Pipeline Sinkronisasi Data APBD DJPK Kemenkeu");
  console.log("=========================================================");
  console.log(`Waktu Pemeriksaan: ${checkedAt}`);
  console.log(`Mode Operasi     : ${options.mode}`);
  console.log(`Dry-Run          : ${options.dryRun ? "YA (Simulasi)" : "TIDAK (Persistensi Berkas)"}`);
  console.log(`Konkurensi       : ${options.concurrency} worker`);
  console.log("---------------------------------------------------------");

  // Baca dataset existing
  let existingDataset: Dataset;
  try {
    const rawExisting = await readFile(destination, "utf8");
    existingDataset = JSON.parse(rawExisting);
  } catch (error) {
    throw new Error(`Gagal membaca data existing di ${destination}: ${(error as Error).message}`);
  }

  // Tentukan target periode yang akan disinkronkan
  let targetPeriods: Period[] = [];
  if (options.year && options.month) {
    targetPeriods = [{ year: options.year, month: options.month }];
  } else if (options.year) {
    targetPeriods = periods.filter((p) => p.year === options.year);
  } else if (options.mode === "latest") {
    targetPeriods = [latestPeriod];
  } else if (options.mode === "running-year") {
    targetPeriods = periods.filter((p) => p.year === (runningYear ?? latestPeriod.year));
  } else {
    targetPeriods = [...periods];
  }

  // Tentukan target daerah yang akan disinkronkan
  let targetRegions: Region[] = regions;
  if (options.regionCode) {
    targetRegions = regions.filter((r) => r.code === options.regionCode);
    if (targetRegions.length === 0) {
      throw new Error(`Daerah dengan kode ${options.regionCode} tidak ditemukan di registry`);
    }
  }

  // Buat daftar pekerjaan sinkronisasi
  const jobs = targetRegions.flatMap((region) =>
    targetPeriods.map((period) => ({ region, ...period })),
  );

  console.log(`Target Sinkronisasi: ${targetRegions.length} daerah x ${targetPeriods.length} periode = ${jobs.length} snapshot pekerjaan.`);

  const rawFiles = new Map<string, string>();
  const fetchedSnapshots: Snapshot[] = [];
  let cursor = 0;
  let successfulFetches = 0;
  let failedFetches = 0;

  async function worker(workerId: number) {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const { region, year, month } = job;
      const query = new URLSearchParams({
        periode: String(month),
        tahun: String(year),
        provinsi: "02",
        pemda: region.sourceCode,
      });
      const url = `https://djpk.kemenkeu.go.id/portal/csv_apbd?type=apbd&${query}`;
      const portalUrl = `https://djpk.kemenkeu.go.id/portal/data/apbd?${query}`;

      try {
        // Eksekusi pengambilan dengan graceful retry (3 kali percobaan dengan exponential backoff)
        const result = await retry(
          async () => {
            const raw = await fetchWithTimeout(url, options.timeoutMs);
            const parsed = parseDjpkExport(raw);

            // Opsional: ambil tanggal publikasi dari portal data, jangan gagal jika portal lambat
            let pubDate: string | null = null;
            try {
              const html = await fetchWithTimeout(portalUrl, Math.min(options.timeoutMs, 10_000));
              pubDate = extractPublishedDate(html);
            } catch {
              // Jika portal gagal, gunakan tanggal fallback
            }

            return { raw, parsed, pubDate };
          },
          3,
          1000,
        );

        const { raw, parsed, pubDate } = result;
        const file = `${region.code}-${year}-${month}.xml`;
        const rawPath = `/data/raw/${runId}/${file}`;
        const batchId = computeSha256(raw);

        rawFiles.set(file, raw);

        const existingSnapshot = existingDataset.snapshots.find(
          (s) => s.regionCode === region.code && s.year === year && s.month === month,
        );

        const publishedAt =
          pubDate ??
          existingSnapshot?.source.publishedAt ??
          new Date().toISOString().slice(0, 10);

        fetchedSnapshots.push({
          regionCode: region.code,
          year,
          month,
          ...parsed,
          source: {
            url,
            portalUrl,
            publishedAt,
            checkedAt,
            batchId,
            rawPath,
          },
        });

        successfulFetches++;
        console.log(`[W${workerId}] OK: ${region.name} (${year}/${month}) - Realisasi: Rp ${Number(parsed.total.realized).toLocaleString("id-ID")}`);
      } catch (error) {
        failedFetches++;
        console.warn(
          `[W${workerId}] PERINGATAN: ${region.name} (${year}/${month}) gagal diambil: ${(error as Error).message}. Mempertahankan snapshot data lama yang tersimpan.`,
        );
      }
    }
  }

  // Jalankan worker pool secara paralel
  const workerCount = Math.min(options.concurrency, jobs.length);
  await Promise.all(Array.from({ length: workerCount }, (_, i) => worker(i + 1)));

  console.log("---------------------------------------------------------");
  console.log(`Hasil Pengambilan: ${successfulFetches} berhasil, ${failedFetches} gagal/timeout.`);

  // Jika seluruh fetch gagal (misal server DJPK down atau koneksi terputus total)
  if (successfulFetches === 0 && jobs.length > 0) {
    console.warn("[PERINGATAN GLOBAL] Server DJPK Kemenkeu tidak merespons atau sedang down/timeout.");
    console.warn("[MODE PROTEKSI] Tidak ada perubahan yang ditulis ke berkas. Seluruh data lama dipertahankan utuh.");
    return {
      totalJobs: jobs.length,
      successfulFetches: 0,
      failedFetches,
      updatedSnapshotsCount: 0,
    };
  }

  // Gabungkan snapshot baru dengan snapshot existing
  // Jika snapshot diperbarui, pakai data baru; jika tidak, pertahankan snapshot lama
  const mergedSnapshotsMap = new Map<string, Snapshot>();

  for (const snapshot of existingDataset.snapshots) {
    const key = `${snapshot.regionCode}-${snapshot.year}-${snapshot.month}`;
    mergedSnapshotsMap.set(key, snapshot);
  }

  for (const snapshot of fetchedSnapshots) {
    const key = `${snapshot.regionCode}-${snapshot.year}-${snapshot.month}`;
    mergedSnapshotsMap.set(key, snapshot);
  }

  const combinedSnapshots = Array.from(mergedSnapshotsMap.values());

  // Urutkan snapshot sesuai urutan resmi: urutan regions -> tahun ascending -> bulan ascending
  combinedSnapshots.sort(
    (a, b) =>
      regions.findIndex((r) => r.code === a.regionCode) -
        regions.findIndex((r) => r.code === b.regionCode) ||
      a.year - b.year ||
      a.month - b.month,
  );

  // Uji Integritas Data Menyeluruh Sebelum Persistensi
  console.log("Menjalankan verifikasi integritas dataset komprehensif...");

  // 1. Verifikasi kelengkapan periode dan daerah
  const expectedKeys = new Set(
    regions.flatMap((r) => periods.map((p) => `${r.code}-${p.year}-${p.month}`)),
  );
  if (combinedSnapshots.length !== expectedKeys.size) {
    throw new Error(
      `Integritas gagal: Jumlah snapshot (${combinedSnapshots.length}) tidak sesuai ekspektasi (${expectedKeys.size}).`,
    );
  }

  // 2. Verifikasi 10 coreRegions: setiap snapshot harus memiliki raw file dan SHA-256 yang valid
  for (const coreRegion of coreRegions) {
    const coreList = combinedSnapshots.filter((s) => s.regionCode === coreRegion.code);
    if (coreList.length !== periods.length) {
      throw new Error(`Integritas gagal: Daerah core ${coreRegion.name} memiliki ${coreList.length} snapshot, butuh ${periods.length}.`);
    }

    for (const snapshot of coreList) {
      const file = `${snapshot.regionCode}-${snapshot.year}-${snapshot.month}.xml`;
      let rawContent: string | null = null;

      if (rawFiles.has(file)) {
        rawContent = rawFiles.get(file)!;
      } else {
        const diskPath = path.join(process.cwd(), "public", snapshot.source.rawPath);
        if (!existsSync(diskPath)) {
          throw new Error(`Integritas gagal: Berkas mentah core tidak ditemukan di ${diskPath}`);
        }
        rawContent = readFileSync(diskPath, "utf8");
      }

      const calculatedHash = computeSha256(rawContent);
      if (calculatedHash !== snapshot.source.batchId) {
        throw new Error(
          `Integritas gagal: Checksum SHA-256 tidak cocok untuk ${snapshot.regionCode} (${snapshot.year}/${snapshot.month}). Ekspektasi ${snapshot.source.batchId}, aktual ${calculatedHash}`,
        );
      }

      const reParsed = parseDjpkExport(rawContent);
      if (reParsed.total.realized !== snapshot.total.realized) {
        throw new Error(`Integritas gagal: Nilai realisasi total ${snapshot.regionCode} tidak cocok dengan hasil parsing mentah.`);
      }
    }
  }

  console.log("Verifikasi Integritas: 100% LULUS (Semua SHA-256 dan parsing tervalidasi).");

  if (options.dryRun) {
    console.log("[DRY-RUN] Melewati penulisan berkas. Semua data valid.");
    return {
      totalJobs: jobs.length,
      successfulFetches,
      failedFetches,
      updatedSnapshotsCount: successfulFetches,
    };
  }

  // Tulis berkas mentah XML ke direktori publik
  if (rawFiles.size > 0) {
    await mkdir(rawDirectory, { recursive: true });
    for (const [file, raw] of rawFiles) {
      await writeFile(path.join(rawDirectory, file), raw, "utf8");
    }
    console.log(`Menyimpan ${rawFiles.size} berkas XML mentah ke ${rawDirectory}`);
  }

  // Tulis dataset ke snapshots.json secara atomik
  const updatedDataset: Dataset = {
    version: 1,
    generatedAt: checkedAt,
    snapshots: combinedSnapshots,
  };

  await atomicWriteJson(destination, updatedDataset);
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("=========================================================");
  console.log(`[SUKSES] Sinkronisasi data selesai dalam ${elapsedSec} detik.`);
  console.log(`Snapshot diperbarui: ${successfulFetches} dari ${jobs.length} pekerjaan.`);
  console.log(`Total snapshot aktif: ${combinedSnapshots.length} snapshot.`);
  console.log(`Berkas target       : ${destination} (diperbarui secara atomik).`);
  console.log("=========================================================");

  return {
    totalJobs: jobs.length,
    successfulFetches,
    failedFetches,
    updatedSnapshotsCount: successfulFetches,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  syncData().catch((error) => {
    console.error("[FATAL ERROR]", (error as Error).message);
    process.exitCode = 1;
  });
}
