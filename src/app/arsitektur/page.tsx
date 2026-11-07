import { Suspense } from "react";
import { dataset } from "@/lib/dataset";
import { ArchitectureView } from "@/components/architecture-view";
import Loading from "../loading";

export const metadata = {
  title: "Peta Arsitektur & Cetak Biru Skalabilitas",
  description:
    "Peta arsitektur 4-tier alur data, cetak biru skalabilitas 3-tahap (Sumut, Sumatera, Nasional), spesifikasi DDL database, dan model partisi data GovSight ID.",
};

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ArchitectureView dataset={dataset} />
    </Suspense>
  );
}
