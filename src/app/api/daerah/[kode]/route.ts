import { dataset, getSnapshot, readApiPeriod } from "@/lib/dataset";
import { regions } from "@/lib/regions";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  try {
    const { kode } = await params;
    const { year, month } = readApiPeriod(new URL(request.url).searchParams);
    const region = regions.find((row) => row.code === kode);
    const snapshot = getSnapshot(kode, year, month);
    if (!region || !snapshot)
      return Response.json(
        { error: "Daerah atau periode belum tersedia." },
        { status: 404 },
      );
    return Response.json({
      region,
      snapshot,
      history: dataset.snapshots.filter(
        (row) => row.regionCode === kode && row.month === month,
      ),
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
