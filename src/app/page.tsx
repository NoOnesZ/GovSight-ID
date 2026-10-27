import { Suspense } from "react";
import { dataset } from "@/lib/dataset";
import { Explorer } from "@/components/explorer";
import Loading from "./loading";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Explorer dataset={dataset} />
    </Suspense>
  );
}
