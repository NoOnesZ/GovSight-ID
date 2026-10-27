import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>Daerah belum tersedia.</h1>
      <p>Versi awal mencakup Medan, Binjai, dan Deli Serdang.</p>
      <Link className="button button-primary" href="/">
        Jelajahi daerah yang tersedia
      </Link>
    </div>
  );
}
