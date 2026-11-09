"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  Compass,
  ExternalLink,
  Info,
  Link2,
  MessageSquare,
} from "lucide-react";
import { months } from "@/lib/regions";
import {
  compactMoney,
  dateLabel,
  fullMoney,
  percent,
  periodLabel,
} from "@/lib/format";
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
      <button
        className="btn btn--secondary"
        onClick={share}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: 500,
          borderColor: "var(--line-2)",
          color: "var(--ink)",
        }}
      >
        {copied ? (
          <Check size={15} style={{ color: "var(--ok-solid)", flexShrink: 0 }} />
        ) : (
          <Link2 size={15} style={{ flexShrink: 0 }} />
        )}
        <span>{copied ? "Tautan disalin" : "Bagikan"}</span>
      </button>
      <span className="sr-only" role="status">
        {copied ? "Tautan halaman berhasil disalin" : ""}
      </span>
      {error && (
        <span
          className="chip chip--warn"
          role="status"
          style={{
            fontWeight: 600,
            color: "var(--warn-ink)",
            borderColor: "var(--warn-line)",
            backgroundColor: "var(--warn-bg)",
          }}
        >
          Salin alamat halaman dari browser
        </span>
      )}
    </>
  );
}

export function CivicSummaryShareButton({
  regionName,
  year,
  month,
  budget,
  realized,
  rate,
  anomalyNote,
  url,
  label = "Salin Ringkasan WA/X",
  style,
}: {
  regionName: string;
  year: number;
  month: number;
  budget?: string | number | null;
  realized?: string | number | null;
  rate?: number | null;
  anomalyNote?: string | null;
  url?: string;
  label?: string;
  style?: React.CSSProperties;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const targetUrl =
      url ||
      (typeof window !== "undefined"
        ? window.location.href
        : "https://govsight-id.vercel.app");
    const budgetText =
      budget !== undefined && budget !== null
        ? compactMoney(String(budget))
        : "Belum tersedia";
    const realizedText =
      realized !== undefined && realized !== null
        ? compactMoney(String(realized))
        : "Belum tersedia";
    const rateText =
      rate !== undefined && rate !== null ? percent(rate) : "";

    const lines = [
      `🔎 Catatan APBD ${regionName} (GovSight ID)`,
      `• Pagu Belanja: ${budgetText}`,
      `• Realisasi (${months[month] ?? `Bulan ${month}`} ${year}): ${realizedText}${rateText ? ` (${rateText})` : ""}`,
    ];

    if (anomalyNote) {
      lines.push(`⚠️ Catatan Kritis: ${anomalyNote}`);
    }

    lines.push(
      ``,
      `Telusuri rincian transparansi anggaran daerahmu di:`,
      targetUrl
    );

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      className="btn btn--secondary"
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontWeight: 500,
        borderColor: "var(--line-2)",
        color: "var(--ink)",
        ...style,
      }}
      title="Salin rangkuman data APBD siap kirim ke WhatsApp atau media sosial"
    >
      {copied ? (
        <Check size={14} style={{ color: "var(--ok-solid)", flexShrink: 0 }} />
      ) : (
        <MessageSquare
          size={14}
          style={{ color: "var(--ink-2)", flexShrink: 0 }}
        />
      )}
      <span>{copied ? "Ringkasan tersalin!" : label}</span>
    </button>
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
      <button
        className="btn btn--secondary"
        disabled
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: 500,
          borderColor: "var(--line-2)",
        }}
      >
        <ArrowDownToLine size={15} style={{ flexShrink: 0 }} />
        <span>Unduh CSV</span>
      </button>
    );
  return (
    <a
      className="btn btn--secondary"
      href={`/api/ekspor?daerah=${codes.join(",")}&tahun=${year}&bulan=${month}`}
      download
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontWeight: 500,
        borderColor: "var(--line-2)",
        color: "var(--ink)",
      }}
    >
      <ArrowDownToLine size={15} style={{ flexShrink: 0 }} />
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
    <div className={`source-line ${compact ? "source-line--compact" : ""}`}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--ink)",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        <Calendar size={14} style={{ color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />
        <span>Data Resmi {periodLabel(snapshot.year, snapshot.month)}</span>
      </span>
      <span className="source-line__sep" aria-hidden="true">·</span>
      <span style={{ color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <span>Pembaruan berkala SIKD Kemenkeu</span>
        {snapshot.source.publishedAt && (
          <span style={{ color: "var(--ink-3)" }}>
            ({dateLabel(snapshot.source.publishedAt)})
          </span>
        )}
      </span>
      <a
        href={snapshot.source.portalUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          color: "var(--accent)",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          marginLeft: "auto",
        }}
      >
        <span>Portal DJPK</span>
        <ArrowUpRight size={12} aria-hidden="true" />
      </a>
    </div>
  );
}

export type ChipVariant = "default" | "sunk" | "warn" | "ok" | "alert" | "info";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  square?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

export function Chip({
  variant = "default",
  square = false,
  interactive = false,
  className = "",
  children,
  style,
  ...props
}: ChipProps) {
  const classes = [
    "chip",
    variant !== "default" ? `chip--${variant}` : "",
    square ? "chip--square" : "",
    interactive ? "chip--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={style} {...props}>
      {children}
    </span>
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
      <Info
        size={15}
        style={{
          color:
            tone === "default"
              ? "var(--ink-2)"
              : undefined,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <div style={{ color: tone === "default" ? "var(--ink)" : undefined }}>
        {children}
      </div>
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
        <Compass size={22} style={{ color: "var(--ink-3)" }} />
      </span>
      <h3 style={{ color: "var(--ink)" }}>{title}</h3>
      <p style={{ color: "var(--ink-2)" }}>{children ?? "Pilih daerah atau periode lain untuk melanjutkan."}</p>
      <Link className="btn btn--secondary" href="/" style={{ borderColor: "var(--line-2)", color: "var(--ink)" }}>
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
        <h2 style={{ color: "var(--ink)", letterSpacing: "-0.015em" }}>{title}</h2>
        {subtitle && (
          <p style={{ color: "var(--ink-2)", margin: "4px 0 0 0" }}>{subtitle}</p>
        )}
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
      style={{
        color: "var(--accent)",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <span>Buka sumber asli</span>
      <ExternalLink size={13} style={{ flexShrink: 0 }} />
    </a>
  );
}

export type GlossaryKey =
  | "pagu"
  | "realisasi"
  | "belanja-modal"
  | "modal"
  | "belanja-pegawai"
  | "pegawai"
  | "uu-hkpd"
  | "hkpd"
  | "silpa";

export interface GlossaryDefinition {
  term: string;
  definition: string;
  lawRef?: string;
}

export const GLOSSARY: Record<string, GlossaryDefinition> = {
  pagu: {
    term: "Pagu",
    definition:
      "Total batas anggaran belanja yang direncanakan selama satu tahun anggaran.",
  },
  realisasi: {
    term: "Realisasi",
    definition:
      "Jumlah uang kas daerah yang telah dicairkan dan dibelanjakan hingga bulan pelaporan.",
  },
  "belanja-modal": {
    term: "Belanja Modal",
    definition:
      "Anggaran pembangunan aset fisik berumur panjang (jalan, jembatan, gedung sekolah, puskesmas).",
  },
  modal: {
    term: "Belanja Modal",
    definition:
      "Anggaran pembangunan aset fisik berumur panjang (jalan, jembatan, gedung sekolah, puskesmas).",
  },
  "belanja-pegawai": {
    term: "Belanja Pegawai",
    definition:
      "Biaya kompensasi ASN/PNS daerah (gaji, tunjangan, uang lembur).",
  },
  pegawai: {
    term: "Belanja Pegawai",
    definition:
      "Biaya kompensasi ASN/PNS daerah (gaji, tunjangan, uang lembur).",
  },
  "uu-hkpd": {
    term: "UU HKPD (No. 1/2022)",
    definition:
      "Undang-Undang Hubungan Keuangan antara Pemerintah Pusat dan Pemerintahan Daerah yang mewajibkan belanja modal min. 40% dan belanja pegawai maks. 30%.",
    lawRef: "UU No. 1/2022 (Pasal 146 & 147)",
  },
  hkpd: {
    term: "UU HKPD (No. 1/2022)",
    definition:
      "Undang-Undang Hubungan Keuangan antara Pemerintah Pusat dan Pemerintahan Daerah yang mewajibkan belanja modal min. 40% dan belanja pegawai maks. 30%.",
    lawRef: "UU No. 1/2022 (Pasal 146 & 147)",
  },
  silpa: {
    term: "SiLPA",
    definition:
      "Sisa Lebih Pembiayaan Anggaran, sisa kas APBD pada akhir tahun yang belum terpakai.",
  },
};

export function GlossaryTerm({
  term,
  children,
  definition,
  title,
  position = "top",
}: {
  term?: GlossaryKey | string;
  children?: React.ReactNode;
  definition?: string;
  title?: string;
  position?: "top" | "bottom";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const key = term ? term.toLowerCase().trim() : "";
  const entry = GLOSSARY[key];
  const itemTitle =
    title ??
    entry?.term ??
    (typeof children === "string" ? children : "Istilah APBD");
  const itemDefinition = definition ?? entry?.definition ?? "";
  const lawRef = entry?.lawRef;

  const isOpen = isHovered || isPinned;

  useEffect(() => {
    if (!isPinned) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsPinned(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isPinned]);

  return (
    <span
      ref={containerRef}
      className="glossary-term"
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={`${itemTitle}: ${itemDefinition}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsPinned((prev) => !prev);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsPinned((prev) => !prev);
        } else if (e.key === "Escape") {
          setIsPinned(false);
          setIsHovered(false);
        }
      }}
      style={{
        borderBottom: "1px dotted var(--ink-4)",
        cursor: "help",
        position: "relative",
        display: "inline-block",
        lineHeight: "inherit",
        color: "inherit",
        fontWeight: "inherit",
      }}
    >
      {children ?? entry?.term ?? term}
      {isOpen && itemDefinition && (
        <span
          role="tooltip"
          className={`glossary-popover ${position === "bottom" ? "glossary-popover--bottom" : ""}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: position === "bottom" ? "auto" : "calc(100% + 8px)",
            top: position === "bottom" ? "calc(100% + 8px)" : "auto",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--paper)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-sm, 7px)",
            boxShadow: "0 4px 18px rgba(28, 27, 25, 0.12)",
            padding: "9px 13px",
            minWidth: "210px",
            maxWidth: "min(290px, 85vw)",
            width: "max-content",
            zIndex: 1000,
            fontSize: "0.75rem",
            lineHeight: 1.45,
            fontWeight: 400,
            textAlign: "left",
            whiteSpace: "normal",
            pointerEvents: "auto",
            display: "block",
            letterSpacing: "normal",
            textTransform: "none",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginBottom: "5px",
              borderBottom: "1px solid var(--line)",
              paddingBottom: "4px",
            }}
          >
            <strong
              style={{
                fontWeight: 600,
                color: "var(--ink)",
                fontSize: "0.8125rem",
              }}
            >
              {itemTitle}
            </strong>
            <span
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              {lawRef && (
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--accent)",
                    backgroundColor: "var(--accent-tint)",
                    padding: "1px 5px",
                    borderRadius: "3px",
                  }}
                >
                  {lawRef}
                </span>
              )}
              {isPinned && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPinned(false);
                    setIsHovered(false);
                  }}
                  aria-label="Tutup popover"
                  style={{
                    background: "transparent",
                    border: 0,
                    padding: "0 2px",
                    cursor: "pointer",
                    color: "var(--ink-3)",
                    fontSize: "0.75rem",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              )}
            </span>
          </span>
          <span style={{ color: "var(--ink-2)", display: "block" }}>
            {itemDefinition}
          </span>
        </span>
      )}
    </span>
  );
}
