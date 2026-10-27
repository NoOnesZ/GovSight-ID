import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { parseDjpkExport } from "../src/lib/data-core";
import { regions, months } from "../src/lib/regions";
import type { Dataset, Snapshot } from "../src/lib/types";

async function get(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok)
    throw new Error(`DJPK mengembalikan HTTP ${response.status}`);
  return response.text();
}

function publishedDate(html: string): string | null {
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
}

async function main() {
  const checkedAt = new Date().toISOString();
  const runId = checkedAt.replace(/[:.]/g, "-");
  const rawDirectory = path.join(process.cwd(), "public", "data", "raw", runId);
  await mkdir(rawDirectory, { recursive: true });
  await mkdir(path.join(process.cwd(), "data"), { recursive: true });
  const snapshots: Snapshot[] = [];
  for (const region of regions) {
    for (const year of [2024, 2025, 2026]) {
      for (const month of year === 2026 ? [10] : [10, 12]) {
        const query = new URLSearchParams({
          periode: String(month),
          tahun: String(year),
          provinsi: "02",
          pemda: region.sourceCode,
        });
        const url = `https://djpk.kemenkeu.go.id/portal/csv_apbd?type=apbd&${query}`;
        const portalUrl = `https://djpk.kemenkeu.go.id/portal/data/apbd?${query}`;
        const [raw, html] = await Promise.all([get(url), get(portalUrl)]);
        const parsed = parseDjpkExport(raw);
        const file = `${region.code}-${year}-${month}.xml`;
        const rawPath = `/data/raw/${runId}/${file}`;
        await writeFile(path.join(rawDirectory, file), raw, "utf8");
        snapshots.push({
          regionCode: region.code,
          year,
          month,
          ...parsed,
          source: {
            url,
            portalUrl,
            publishedAt: publishedDate(html),
            checkedAt,
            batchId: createHash("sha256").update(raw).digest("hex"),
            rawPath,
          },
        });
        console.log(
          `${region.name} ${year}/${month}: ${parsed.total.realized}`,
        );
      }
    }
  }
  const dataset: Dataset = { version: 1, generatedAt: checkedAt, snapshots };
  const destination = path.join(process.cwd(), "data", "snapshots.json");
  const text = JSON.stringify(dataset, null, 2) + "\n";
  try {
    const existing: Dataset = JSON.parse(await readFile(destination, "utf8"));
    if (new Date(existing.generatedAt) > new Date(checkedAt))
      throw new Error("Snapshot yang tersimpan lebih baru dari proses ini");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await writeFile(destination + ".pending", text, "utf8");
  await rename(destination + ".pending", destination);
  console.log(
    `Published ${snapshots.length} snapshots. Batch failed = old snapshots remain unchanged.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
