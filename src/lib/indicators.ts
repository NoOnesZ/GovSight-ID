import Decimal from "decimal.js";
import type { Snapshot } from "./types";
import { percentage } from "./data-core";

export function categoryShares(snapshot: Snapshot, code: string) {
  const category = snapshot.categories.find((line) => line.code === code);
  return {
    budget: percentage(category?.budget ?? null, snapshot.total.budget),
    realized: percentage(category?.realized ?? null, snapshot.total.realized),
  };
}
export function monthlyAbsorption(snapshot: Snapshot) {
  return percentage(snapshot.total.realized, snapshot.total.budget);
}

export function threeYearTrend(
  snapshots: Snapshot[],
): "meningkat" | "menurun" | "tetap" | "berfluktuasi" | null {
  const sorted = [...snapshots].sort((a, b) => a.year - b.year);
  if (
    sorted.length !== 3 ||
    sorted.some(
      (s, i) =>
        s.month !== 12 ||
        s.regionCode !== sorted[0].regionCode ||
        (i > 0 && s.year !== sorted[i - 1].year + 1),
    )
  )
    return null;
  const values = sorted.map((s) => categoryShares(s, "modal").realized);
  if (values.some((value) => value === null)) return null;
  const [a, b, c] = values as number[];
  if (a === b && b === c) return "tetap";
  if (a <= b && b <= c) return "meningkat";
  if (a >= b && b >= c) return "menurun";
  return "berfluktuasi";
}

export function belowThreeYearReference(
  snapshots: Snapshot[],
  reference: number,
): boolean | null {
  if (
    !Number.isFinite(reference) ||
    reference < 0 ||
    reference > 100 ||
    threeYearTrend(snapshots) === null
  )
    return null;
  return snapshots.every(
    (snapshot) => categoryShares(snapshot, "modal").realized! < reference,
  );
}

export const YEAR_END_THRESHOLD = 40;
export function formatFlagShare(share: number | null): string {
  return share === null
    ? "Belum tersedia"
    : `${share.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
export function yearEndModalFlag(
  october: Snapshot | undefined,
  december: Snapshot | undefined,
) {
  const regionCode = october?.regionCode ?? december?.regionCode ?? "";
  const year = october?.year ?? december?.year ?? 0;
  const unavailable = {
    regionCode,
    year,
    share: null,
    status: "belum-tersedia" as const,
  };
  if (
    !october ||
    !december ||
    october.regionCode !== december.regionCode ||
    october.year !== december.year ||
    october.month !== 10 ||
    december.month !== 12
  )
    return unavailable;
  const a = october.categories.find((c) => c.code === "modal")?.realized;
  const b = december.categories.find((c) => c.code === "modal")?.realized;
  if (a == null || b == null || new Decimal(b).isZero()) return unavailable;
  if (new Decimal(a).gt(b))
    return { ...unavailable, status: "tidak-konsisten" as const };
  const value = new Decimal(b).minus(a).div(b).times(100);
  const rounded = value.toDecimalPlaces(2);
  return {
    regionCode,
    year,
    share: rounded.toNumber(),
    status: rounded.gte(YEAR_END_THRESHOLD)
      ? ("ditandai" as const)
      : ("wajar" as const),
  };
}
