import { Suspense } from "react";
import { notFound } from "next/navigation";
import { dataset } from "@/lib/dataset";
import { regions } from "@/lib/regions";
import { Profile } from "@/components/profile";
import Loading from "../../loading";
export function generateStaticParams() {
  return regions.map((region) => ({ kode: region.code }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  return {
    title:
      regions.find((region) => region.code === kode)?.name ??
      "Daerah belum tersedia",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const region = regions.find((region) => region.code === kode);
  if (!region) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <Profile dataset={dataset} region={region} />
    </Suspense>
  );
}
