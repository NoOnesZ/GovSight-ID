import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="empty">
      <span className="empty__mark">
        <Compass size={22} />
      </span>
      <h1>Halaman tidak ditemukan.</h1>
      <p>Alamat ini tidak ada. Periksa kembali tautan yang kamu buka.</p>
      <Link className="btn btn--primary" href="/">
        Kembali ke jelajah
      </Link>
    </div>
  );
}
