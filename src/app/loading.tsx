export default function Loading() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--panel" />
      <span className="sr-only">Memuat data belanja daerah...</span>
    </div>
  );
}
