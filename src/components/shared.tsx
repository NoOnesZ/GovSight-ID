"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  Compass,
  ExternalLink,
  Info,
  Link2,
} from "lucide-react";
import { months } from "@/lib/regions";
import { dateLabel, fullMoney, percent, periodLabel } from "@/lib/format";
import { percentage } from "@/lib/data-core";
import {
  availabilityLabel,
  isAvailablePeriod,
  latestPeriod,
  monthsInYear,
  reportMonths,
  years,
} from "@/lib/periods";
import type { Snapshot } from "@/lib/types";

export function kindLabel(type: string): string {
  return type === "kota" ? "Kota" : "Kabupaten";
}

export function useFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const requestedYear = Number(params.get("tahun") ?? latestPeriod.year);
  const requestedMonth = Number(params.get("bulan") ?? latestPeriod.month);
  const invalidPeriod = !isAvailablePeriod(requestedYear, requestedMonth);
  const { year, month } = invalidPeriod
    ? latestPeriod
    : { year: requestedYear, month: requestedMonth };
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
    <>
      <label className="field">
        <span className="sr-only">Tahun anggaran</span>
        <select
          aria-label="Tahun anggaran"
          value={year}
          onChange={(event) => {
            const available = monthsInYear(Number(event.target.value));
            onChange({
              tahun: event.target.value,
              bulan: String(
                available.includes(month)
                  ? month
                  : available[available.length - 1],
              ),
            });
          }}
        >
          {years.map((value) => (
            <option key={value} value={value}>
              TA {value}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="field__caret" />
      </label>
      <label className="field">
        <span className="sr-only">Bulan pelaporan</span>
        <select
          aria-label="Bulan pelaporan"
          value={month}
          onChange={(event) => onChange({ bulan: event.target.value })}
        >
          {reportMonths.map((value) => {
            const unavailable = !monthsInYear(year).includes(value);
            return (
              <option key={value} value={value} disabled={unavailable}>
                s.d. {months[value]}
                {unavailable ? " (belum tersedia)" : ""}
              </option>
            );
          })}
        </select>
        <ChevronDown size={14} className="field__caret" />
      </label>
    </>
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
    <>
      <button className="btn btn--secondary" onClick={share}>
        {copied ? <Check size={15} /> : <Link2 size={15} />}
        {copied ? "Tautan disalin" : "Bagikan"}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Tautan halaman berhasil disalin" : ""}
      </span>
      {error && (
        <span className="chip chip--warn" role="status">
          Salin alamat halaman dari browser
        </span>
      )}
    </>
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
      <button className="btn btn--secondary" disabled>
        <ArrowDownToLine size={15} />
        <span>Unduh CSV</span>
      </button>
    );
  return (
    <a
      className="btn btn--secondary"
      href={`/api/ekspor?daerah=${codes.join(",")}&tahun=${year}&bulan=${month}`}
      download
    >
      <ArrowDownToLine size={15} />
      <span>Unduh CSV</span>
    </a>
  );
}

export function SourceNote({
  snapshot,
}: {
  snapshot: Snapshot;
  compact?: boolean;
}) {
  return (
    <div className="source-line">
      <span className="live-dot" />
      <strong>Data {periodLabel(snapshot.year, snapshot.month)}</strong>
      <span className="source-line__sep">·</span>
      <span>
        Keterangan penerimaan SIKD pada portal:{" "}
        {snapshot.source.publishedAt
          ? dateLabel(snapshot.source.publishedAt)
          : "belum dicantumkan"}
      </span>
      <a href={snapshot.source.portalUrl} target="_blank" rel="noreferrer">
        DJPK Kemenkeu <ArrowUpRight size={12} />
      </a>
    </div>
  );
}

export function InfoNote({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warn" | "alert" | "info";
}) {
  return (
    <div className={tone === "default" ? "note" : `note note--${tone}`}>
      <Info size={15} />
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
    <div>
      <div
        className="stack-bar"
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
            className={`seg seg--${line.code}`}
            style={{
              width: `${percentage(line.realized, snapshot.total.realized) ?? 0}%`,
            }}
          />
        ))}
      </div>
      <div className="legend">
        {snapshot.categories.map((line) => (
          <div key={line.code} className="legend__row">
            <span className={`dot dot--${line.code}`} />
            <span className="legend__name">
              {line.label.replace("Belanja ", "")}
            </span>
            <span className="legend__value">
              <strong>
                {percent(percentage(line.realized, snapshot.total.realized))}
              </strong>
              {showAmounts && (
                <small title={fullMoney(line.realized)}>
                  {fullMoney(line.realized)}
                </small>
              )}
            </span>
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
    <div className="empty">
      <span className="empty__mark">
        <Compass size={22} />
      </span>
      <h3>{title}</h3>
      <p>{children ?? "Pilih daerah atau periode lain untuk melanjutkan."}</p>
      <Link className="btn btn--secondary" href="/">
        Kembali ke jelajah
      </Link>
    </div>
  );
}

export function UnavailablePeriod() {
  return (
    <EmptyState title="Periode belum tersedia">
      Pilih {availabilityLabel} dari halaman jelajah. Data periode lain tidak
      ditampilkan sebagai pengganti.
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
    <div className="section-head">
      <div className="section-head__text">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="section-head__actions">{children}</div>}
    </div>
  );
}

export function ExternalSource({ snapshot }: { snapshot: Snapshot }) {
  return (
    <a
      className="link"
      href={snapshot.source.portalUrl}
      target="_blank"
      rel="noreferrer"
    >
      Buka sumber asli <ExternalLink size={13} />
    </a>
  );
}
