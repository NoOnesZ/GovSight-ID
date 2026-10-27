import { Suspense } from "react";
import { dataset } from "@/lib/dataset";
import { Comparison } from "@/components/comparison";
import Loading from "../loading";
export const metadata = { title: "Bandingkan daerah" };
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Comparison dataset={dataset} />
    </Suspense>
  );
}
