import Link from "next/link";
import { regionListLabel } from "@/lib/regions";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>Daerah belum tersedia.</h1>
      <p>Versi awal mencakup {regionListLabel}.</p>
      <Link className="button button-primary" href="/">
        Jelajahi daerah yang tersedia
      </Link>
    </div>
  );
}
