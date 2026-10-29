"use client";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div className="empty-state">
      <h1>Data belum berhasil dimuat.</h1>
      <p>
        Coba muat kembali. Angka tidak akan digantikan dengan data perkiraan.
      </p>
      <button className="button button-primary" onClick={() => retry()}>
        Coba lagi
      </button>
    </div>
  );
}
