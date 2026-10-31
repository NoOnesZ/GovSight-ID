import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { regionListLabel } from "@/lib/regions";

export default function NotFound() {
  return (
    <div className="empty">
      <span className="empty__mark">
        <MapPinOff size={22} />
      </span>
      <h1>Daerah belum tersedia.</h1>
      <p>Versi awal mencakup {regionListLabel}.</p>
      <Link className="btn btn--primary" href="/">
        Jelajahi daerah yang tersedia
      </Link>
    </div>
  );
}
