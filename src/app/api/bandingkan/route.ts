import { getSnapshot, readApiPeriod, readApiRegions } from "@/lib/dataset";
import { validateComparison } from "@/lib/data-core";
import { regions } from "@/lib/regions";
export function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const { year, month } = readApiPeriod(params);
    const codes = params.has("daerah")
      ? readApiRegions(params)
      : regions.slice(0, 2).map((region) => region.code);
    const snapshots = codes.map((code) => getSnapshot(code, year, month));
    if (snapshots.some((row) => !row)) throw new Error("Data belum tersedia.");
    validateComparison(snapshots as { year: number; month: number }[]);
    return Response.json({ year, month, snapshots });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
