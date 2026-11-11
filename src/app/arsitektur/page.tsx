import { Suspense } from "react";
import { notFound } from "next/navigation";
import { dataset } from "@/lib/dataset";
import { ArchitectureView } from "@/components/architecture-view";
import Loading from "../loading";

export const metadata = {
  title: "Peta Arsitektur & Cetak Biru Skalabilitas",
  description:
    "Peta arsitektur 4-tier alur data, cetak biru skalabilitas 3-tahap (Sumut, Sumatera, Nasional), spesifikasi DDL database, dan model partisi data GovSight ID.",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ dev?: string }>;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const params = await searchParams;

  // Hanya dapat diakses pada mode development (clone repo) atau dengan akses dev
  if (!isDev && params?.dev !== "true") {
    notFound();
  }

  return (
    <Suspense fallback={<Loading />}>
      <ArchitectureView dataset={dataset} />
    </Suspense>
  );
}
