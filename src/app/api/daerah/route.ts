import { dataset, readApiPeriod } from "@/lib/dataset";
import { regions } from "@/lib/regions";
export function GET(request: Request) {
  try {
    const { year, month } = readApiPeriod(new URL(request.url).searchParams);
    return Response.json({
      mode: "prototype-snapshot",
      checkedAt: dataset.generatedAt,
      regions,
      snapshots: dataset.snapshots.filter(
        (row) => row.year === year && row.month === month,
      ),
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
