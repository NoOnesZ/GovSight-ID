"use client";

import { TriangleAlert } from "lucide-react";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div className="empty">
      <span className="empty__mark">
        <TriangleAlert size={22} />
      </span>
      <h1>Data belum berhasil dimuat.</h1>
      <p>
        Coba muat kembali. Angka tidak akan digantikan dengan data perkiraan.
      </p>
      <button className="btn btn--primary" onClick={() => retry()}>
        Coba lagi
      </button>
    </div>
  );
}
