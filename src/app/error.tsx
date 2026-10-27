"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>Data belum berhasil dimuat.</h1>
      <p>
        Coba muat kembali. Angka tidak akan digantikan dengan data perkiraan.
      </p>
      <button className="button button-primary" onClick={reset}>
        Coba lagi
      </button>
    </div>
  );
}
