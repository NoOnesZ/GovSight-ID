import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>Halaman tidak ditemukan.</h1>
      <p>Alamat ini tidak ada. Periksa kembali tautan yang kamu buka.</p>
      <Link className="button button-primary" href="/">
        Kembali ke jelajah
      </Link>
    </div>
  );
}
