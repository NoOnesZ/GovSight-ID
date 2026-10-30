import { readApiPeriod, readApiRegions, toCsv } from "@/lib/dataset";
export function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const { year, month } = readApiPeriod(params);
    const codes = readApiRegions(params);
    return new Response(toCsv(codes, year, month), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="govsight-id-${year}-${month}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
