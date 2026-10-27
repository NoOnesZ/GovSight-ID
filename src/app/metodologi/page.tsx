import { Suspense } from "react";
import { dataset } from "@/lib/dataset";
import { Methodology } from "@/components/methodology";
import Loading from "../loading";
export const metadata = { title: "Metodologi dan sumber" };
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Methodology dataset={dataset} />
    </Suspense>
  );
}
