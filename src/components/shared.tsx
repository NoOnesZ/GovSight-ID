"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ExternalLink,
  Info,
  Link2,
} from "lucide-react";
import { categoryColors, months } from "@/lib/regions";
import { dateLabel, fullMoney, percent, periodLabel } from "@/lib/format";
import { percentage } from "@/lib/data-core";
import type { Snapshot } from "@/lib/types";

export function useFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const requestedYear = Number(params.get("tahun") ?? 2026);
  const year = [2024, 2025, 2026].includes(requestedYear)
    ? requestedYear
    : 2026;
  const requestedMonth = Number(params.get("bulan") ?? 10);
  const invalidPeriod =
    ![2024, 2025, 2026].includes(requestedYear) ||
    ![10, 12].includes(requestedMonth) ||
    (requestedYear === 2026 && requestedMonth === 12);
  const month = requestedMonth === 12 && year !== 2026 ? 12 : 10;
  function update(values: Record<string, string | null>) {
    const updated = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(values)) {
      if (!value) updated.delete(key);
      else updated.set(key, value);
    }
    const query = updated.toString();
    window.history.replaceState(
      null,
      "",
      `${pathname}${query ? `?${query}` : ""}`,
    );
  }
  return {
    year,
    month,
    params,
    update,
    invalidPeriod,
    period: `tahun=${year}&bulan=${month}`,
  };
}

export function PeriodControls({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (values: Record<string, string>) => void;
}) {
  return (
    <div className="period-controls">
      <label className="select-control">
        <CalendarDays size={16} />
        <span className="sr-only">Tahun anggaran</span>
        <select
          aria-label="Tahun anggaran"
          value={year}
          onChange={(event) =>
            onChange({
              tahun: event.target.value,
              bulan:
                month === 12 && event.target.value === "2026"
                  ? "10"
                  : String(month),
            })
          }
        >
          {[2026, 2025, 2024].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <ChevronDown size={14} />
      </label>
      <label className="select-control month-control">
        <span className="sr-only">Bulan pelaporan</span>
        <select
          aria-label="Bulan pelaporan"
          value={month}
          onChange={(event) => onChange({ bulan: event.target.value })}
        >
          <option value="10">s.d. Oktober</option>
          <option value="12" disabled={year === 2026}>
            s.d. Desember{year === 2026 ? " (belum tersedia)" : ""}
          </option>
        </select>
        <ChevronDown size={14} />
      </label>
    </div>
  );
}

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setError(true);
    }
  }
  return (
    <div className="share-wrap">
      <button className="button button-secondary" onClick={share}>
        {copied ? <Check size={16} /> : <Link2 size={16} />}{" "}
        {copied ? "Tautan disalin" : "Bagikan"}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Tautan halaman berhasil disalin" : ""}
      </span>
      {error && (
        <span className="share-error" role="status">
          Salin alamat halaman dari browser untuk membagikan.
        </span>
      )}
    </div>
  );
}

export function DownloadButton({
  codes,
  year,
  month,
}: {
  codes: string[];
  year: number;
  month: number;
}) {
  if (!codes.length)
    return (
      <button className="button button-secondary" disabled>
        <ArrowDownToLine size={16} />
        <span>Unduh CSV</span>
      </button>
    );
  return (
    <a
      className="button button-secondary"
      href={`/api/ekspor?daerah=${codes.join(",")}&tahun=${year}&bulan=${month}`}
      download
    >
      <ArrowDownToLine size={16} />
      <span>Unduh CSV</span>
    </a>
  );
}

export function SourceNote({
  snapshot,
  compact = false,
}: {
  snapshot: Snapshot;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "source-note compact" : "source-note"}>
      <span className="status-dot" />
      <span>
        Data {periodLabel(snapshot.year, snapshot.month)}
        <span className="source-note-divider">/</span>
        <span className="source-meta">
          Diterima SIKD:{" "}
          {snapshot.source.publishedAt
            ? dateLabel(snapshot.source.publishedAt)
            : "belum dicantumkan"}
        </span>
      </span>
      <a href={snapshot.source.portalUrl} target="_blank" rel="noreferrer">
        DJPK Kemenkeu <ArrowUpRight size={13} />
      </a>
    </div>
  );
}

export function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="info-note">
      <Info size={17} />
      <p>{children}</p>
    </div>
  );
}

export function Composition({
  snapshot,
  showAmounts = true,
}: {
  snapshot: Snapshot;
  showAmounts?: boolean;
}) {
  const complete = snapshot.categories.every((line) => line.realized !== null);
  return (
    <div className="composition">
      <div
        className="stacked-bar"
        role="img"
        aria-label={
          complete
            ? "Komposisi realisasi belanja per kategori"
            : "Komposisi belum lengkap"
        }
      >
        {snapshot.categories.map((line) => (
          <span
            key={line.code}
            style={{
              width: `${percentage(line.realized, snapshot.total.realized) ?? 0}%`,
              background: categoryColors[line.code],
            }}
          />
        ))}
      </div>
      <div className="composition-legend">
        {snapshot.categories.map((line) => (
          <div key={line.code} className="composition-row">
            <span
              className="legend-dot"
              style={{ background: categoryColors[line.code] }}
            />
            <span>{line.label.replace("Belanja ", "")}</span>
            <strong>
              {percent(percentage(line.realized, snapshot.total.realized))}
            </strong>
            {showAmounts && (
              <small title={fullMoney(line.realized)}>
                {fullMoney(line.realized)}
              </small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title = "Data belum tersedia",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Info size={28} />
      <h3>{title}</h3>
      <p>{children ?? "Pilih daerah atau periode lain untuk melanjutkan."}</p>
      <Link className="button button-secondary" href="/">
        Kembali ke jelajah
      </Link>
    </div>
  );
}

export function UnavailablePeriod() {
  return (
    <EmptyState title="Periode belum tersedia">
      Pilih Oktober 2024–2026 atau Desember 2024–2025 dari halaman jelajah. Data
      periode lain tidak ditampilkan sebagai pengganti.
    </EmptyState>
  );
}

export function SectionHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function ExternalSource({ snapshot }: { snapshot: Snapshot }) {
  return (
    <a
      className="text-link"
      href={snapshot.source.portalUrl}
      target="_blank"
      rel="noreferrer"
    >
      Buka sumber asli <ExternalLink size={14} />
    </a>
  );
}

export function PeriodLabel({ year, month }: { year: number; month: number }) {
  return (
    <span className="pill">
      {months[month]} {year}
      {year === 2026 && <span className="pill-dot" />}
      {year === 2026 ? "Tahun berjalan" : ""}
    </span>
  );
}
