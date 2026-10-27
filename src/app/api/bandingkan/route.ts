import { getSnapshot, readApiPeriod, readApiRegions } from "@/lib/dataset";
import { validateComparison } from "@/lib/data-core";
export function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const { year, month } = readApiPeriod(params);
    const codes = readApiRegions(params);
    const snapshots = codes.map((code) => getSnapshot(code, year, month));
    if (snapshots.some((row) => !row)) throw new Error("Data belum tersedia.");
    validateComparison(snapshots as { year: number; month: number }[]);
    return Response.json({ year, month, snapshots });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
