"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  Landmark,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import type { Dataset } from "@/lib/types";
import { months, regions } from "@/lib/regions";
import { compactMoney, fullMoney, percent } from "@/lib/format";
import { percentage } from "@/lib/data-core";
import {
  yearEndModalFlag,
  formatFlagShare,
  YEAR_END_THRESHOLD,
} from "@/lib/indicators";
import {
  DownloadButton,
  EmptyState,
  InfoNote,
  PeriodControls,
  ShareButton,
  SourceNote,
  UnavailablePeriod,
  kindLabel,
  useFilters,
} from "./shared";
import {
  ChartLegend,
  ComparisonRateChart,
  SpendingChart,
  chartColors,
} from "./charts";

export function Comparison({ dataset }: { dataset: Dataset }) {
  const [chartMode, setChartMode] = useState<"nominal" | "serapan">("nominal");
  const { year, month, params, update, period, invalidPeriod } = useFilters();
  if (invalidPeriod) return <UnavailablePeriod />;

  const completeYear = Math.max(
    ...dataset.snapshots.filter((s) => s.month === 12).map((s) => s.year),
  );

  const requested = params.get("daerah");
  const codes =
    requested === null
      ? ["0215", "0214"]
      : requested === "kosong" || requested === ""
        ? []
        : [
            ...new Set(
              requested
                .split(",")
                .filter((code) => regions.some((region) => region.code === code)),
            ),
          ].slice(0, 3);

  const snapshots = codes
    .map((code) =>
      dataset.snapshots.find(
        (row) =>
          row.regionCode === code && row.year === year && row.month === month,
      ),
    )
    .filter((row) => row !== undefined);

  const mixed =
    new Set(
      codes.map((code) => regions.find((region) => region.code === code)?.type),
    ).size > 1;

  function toggle(code: string) {
    if (codes.includes(code)) {
      const remaining = codes.filter((value) => value !== code);
      update({ daerah: remaining.length > 0 ? remaining.join(",") : "kosong" });
    } else {
      update({ daerah: [...codes, code].slice(0, 3).join(",") });
    }
  }

  function applyPreset(presetCodes: string[]) {
    update({ daerah: presetCodes.join(",") });
  }

  function clearAll() {
    update({ daerah: "kosong" });
  }

  const mebidangroCodes = ["0215", "0214", "0203"];
  const dataranTinggiCodes = ["0204", "0202", "0211"];
  const tapanuliRayaCodes = ["0208", "0207", "0209"];
  const kotaUtamaCodes = ["0215", "0214", "0216"];

  const isMebidangro =
    codes.length === 3 && mebidangroCodes.every((c) => codes.includes(c));
  const isDataranTinggi =
    codes.length === 3 && dataranTinggiCodes.every((c) => codes.includes(c));
  const isTapanuliRaya =
    codes.length === 3 && tapanuliRayaCodes.every((c) => codes.includes(c));
  const isKotaUtama =
    codes.length === 3 && kotaUtamaCodes.every((c) => codes.includes(c));

  const kotaRegions = regions.filter((r) => r.type === "kota");
  const kabRegions = regions.filter((r) => r.type === "kabupaten");

  const sampleCategories =
    dataset.snapshots[0]?.categories ?? [
      { code: "pegawai", label: "Belanja pegawai", budget: 0, realized: 0 },
      { code: "barang-jasa", label: "Belanja barang dan jasa", budget: 0, realized: 0 },
      { code: "modal", label: "Belanja modal", budget: 0, realized: 0 },
      { code: "lainnya", label: "Belanja lainnya", budget: 0, realized: 0 },
    ];

  // At least 2 columns are maintained so unselecting preserves a placeholder slot
  const displaySlotsCount = Math.max(2, codes.length);

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <h1>Bandingkan daerah.</h1>
          <p>Angka berdampingan, periode yang sama, gambaran lebih jelas.</p>
        </div>
        <div className="page-actions">
          <ShareButton />
          {codes.length >= 2 && (
            <DownloadButton codes={codes} year={year} month={month} />
          )}
        </div>
      </div>

      <div className="stack">
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Pilih daerah pembanding</h2>
              <p className="card__sub">
                Pilih dua hingga tiga daerah, lalu periksa angkanya berdampingan.
              </p>
            </div>
            <div className="section-head__actions">
              <PeriodControls year={year} month={month} onChange={update} />
            </div>
          </div>

          <div className="card__body">
            {/* Quick 1-click Preset Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                paddingBottom: 16,
                marginBottom: 16,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Preset Kawasan 1-Klik:
              </span>
              {/* Preset 1: Segitiga Mebidangro */}
              <button
                type="button"
                aria-label="Preset Segitiga Mebidangro (Medan, Binjai, Deli Serdang)"
                onClick={() => applyPreset(mebidangroCodes)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  maxWidth: "100%",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: "var(--r-pill)",
                  border: isMebidangro
                    ? "1px solid var(--accent)"
                    : "1px solid var(--line-2)",
                  background: isMebidangro
                    ? "var(--accent-tint)"
                    : "var(--paper)",
                  color: isMebidangro ? "var(--accent)" : "var(--ink)",
                  fontSize: "0.8125rem",
                  fontWeight: isMebidangro ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Sparkles size={13} />
                <span>Segitiga Mebidangro</span>
                <span style={{ fontSize: "0.6875rem", opacity: 0.8 }}>
                  (Medan, Binjai, Deli Serdang)
                </span>
                {isMebidangro && <Check size={12} />}
              </button>

              {/* Preset 2: Dataran Tinggi */}
              <button
                type="button"
                aria-label="Preset Dataran Tinggi (Karo, Dairi, Simalungun)"
                onClick={() => applyPreset(dataranTinggiCodes)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  maxWidth: "100%",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: "var(--r-pill)",
                  border: isDataranTinggi
                    ? "1px solid var(--accent)"
                    : "1px solid var(--line-2)",
                  background: isDataranTinggi
                    ? "var(--accent-tint)"
                    : "var(--paper)",
                  color: isDataranTinggi ? "var(--accent)" : "var(--ink)",
                  fontSize: "0.8125rem",
                  fontWeight: isDataranTinggi ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Sparkles size={13} />
                <span>Dataran Tinggi</span>
                <span style={{ fontSize: "0.6875rem", opacity: 0.8 }}>
                  (Karo, Dairi, Simalungun)
                </span>
                {isDataranTinggi && <Check size={12} />}
              </button>

              {/* Preset 3: Tapanuli Raya */}
              <button
                type="button"
                aria-label="Preset Tapanuli Raya (Taput, Tapteng, Tapsel)"
                onClick={() => applyPreset(tapanuliRayaCodes)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  maxWidth: "100%",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: "var(--r-pill)",
                  border: isTapanuliRaya
                    ? "1px solid var(--accent)"
                    : "1px solid var(--line-2)",
                  background: isTapanuliRaya
                    ? "var(--accent-tint)"
                    : "var(--paper)",
                  color: isTapanuliRaya ? "var(--accent)" : "var(--ink)",
                  fontSize: "0.8125rem",
                  fontWeight: isTapanuliRaya ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Sparkles size={13} />
                <span>Tapanuli Raya</span>
                <span style={{ fontSize: "0.6875rem", opacity: 0.8 }}>
                  (Taput, Tapteng, Tapsel)
                </span>
                {isTapanuliRaya && <Check size={12} />}
              </button>

              {/* Preset 4: Kota Otonom Utama */}
              <button
                type="button"
                aria-label="Preset Kota Otonom Utama (Medan, Binjai, Pematang Siantar)"
                onClick={() => applyPreset(kotaUtamaCodes)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  maxWidth: "100%",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: "var(--r-pill)",
                  border: isKotaUtama
                    ? "1px solid var(--accent)"
                    : "1px solid var(--line-2)",
                  background: isKotaUtama
                    ? "var(--accent-tint)"
                    : "var(--paper)",
                  color: isKotaUtama ? "var(--accent)" : "var(--ink)",
                  fontSize: "0.8125rem",
                  fontWeight: isKotaUtama ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Building2 size={13} />
                <span>Kota Otonom Utama</span>
                <span style={{ fontSize: "0.6875rem", opacity: 0.8 }}>
                  (Medan, Binjai, P. Siantar)
                </span>
                {isKotaUtama && <Check size={12} />}
              </button>

              {codes.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    borderRadius: "var(--r-pill)",
                    border: "1px solid var(--line)",
                    background: "var(--canvas)",
                    color: "var(--ink-3)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                  title="Kosongkan semua pilihan"
                >
                  <RotateCcw size={12} />
                  Reset pilihan
                </button>
              )}
            </div>

            {/* Administrative Groups: Kota vs Kabupaten */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Group 1: Kota Otonom */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Building2 size={15} style={{ color: "var(--accent)" }} />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      Wilayah Kota Otonom
                    </span>
                    <span
                      className="chip chip--sunk chip--square"
                      style={{ fontSize: "0.6875rem" }}
                    >
                      {kotaRegions.length} Kota
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--ink-4)" }}>
                    Pemerintahan kota otonom tingkat II
                  </span>
                </div>
                <div className="picker">
                  {kotaRegions.map((region) => {
                    const selected = codes.includes(region.code);
                    return (
                      <button
                        key={region.code}
                        onClick={() => toggle(region.code)}
                        disabled={!selected && codes.length >= 3}
                        aria-pressed={selected}
                        className={
                          selected
                            ? "region-option is-selected"
                            : "region-option"
                        }
                      >
                        <span className="region-option__text">
                          <strong>{region.shortName}</strong>
                          <small>{kindLabel(region.type)}</small>
                        </span>
                        <span className="region-option__box">
                          {selected ? <Check size={13} /> : <Plus size={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hairline Divider */}
              <div className="divider" />

              {/* Group 2: Kabupaten */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Landmark size={15} style={{ color: "var(--accent)" }} />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      Wilayah Kabupaten Administratif
                    </span>
                    <span
                      className="chip chip--sunk chip--square"
                      style={{ fontSize: "0.6875rem" }}
                    >
                      {kabRegions.length} Kabupaten
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--ink-4)" }}>
                    Pemerintahan kabupaten tingkat II
                  </span>
                </div>
                <div className="picker">
                  {kabRegions.map((region) => {
                    const selected = codes.includes(region.code);
                    return (
                      <button
                        key={region.code}
                        onClick={() => toggle(region.code)}
                        disabled={!selected && codes.length >= 3}
                        aria-pressed={selected}
                        className={
                          selected
                            ? "region-option is-selected"
                            : "region-option"
                        }
                      >
                        <span className="region-option__text">
                          <strong>{region.shortName}</strong>
                          <small>{kindLabel(region.type)}</small>
                        </span>
                        <span className="region-option__box">
                          {selected ? <Check size={13} /> : <Plus size={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Slots Status Tray */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "var(--sunk)",
            borderRadius: "var(--r)",
            border: "1px solid var(--line)",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Slot Pembanding ({codes.length}/3):
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              flex: 1,
            }}
          >
            {[0, 1, 2].map((idx) => {
              const code = codes[idx];
              const region = code
                ? regions.find((r) => r.code === code)
                : null;
              if (region) {
                return (
                  <span
                    key={region.code}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 8px 4px 12px",
                      background: "var(--paper)",
                      border: "1px solid var(--accent-line)",
                      borderRadius: "var(--r-sm)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--ink)",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <span>{region.shortName}</span>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--ink-4)",
                        fontWeight: 400,
                      }}
                    >
                      ({kindLabel(region.type)})
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(region.code)}
                      title={`Hapus ${region.shortName} dari perbandingan`}
                      style={{
                        display: "inline-grid",
                        placeItems: "center",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--ink-3)",
                        padding: 0,
                        marginLeft: 2,
                      }}
                      aria-label={`Hapus slot ${idx + 1}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              }
              return (
                <span
                  key={`empty-slot-${idx}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    border: "1px dashed var(--line-3)",
                    borderRadius: "var(--r-sm)",
                    fontSize: "0.75rem",
                    color: "var(--ink-4)",
                    background: "transparent",
                  }}
                >
                  <Plus size={11} />
                  {idx === 0
                    ? "Pilih daerah ke-1"
                    : idx === 1
                      ? "Pilih daerah pembanding ke-2"
                      : "Slot ke-3 (opsional)"}
                </span>
              );
            })}
          </div>
        </div>

        {mixed && (
          <InfoNote>
            Kamu membandingkan kota dan kabupaten. Kewenangan, kebutuhan
            layanan, dan kondisi wilayahnya dapat berbeda. Angka ini bukan
            peringkat kinerja.
          </InfoNote>
        )}

        {codes.length === 0 ? (
          <EmptyState title="Pilih daerah untuk dibandingkan">
            Pilih dua hingga tiga daerah dari daftar pilihan di atas atau gunakan
            salah satu preset kawasan untuk memulai perbandingan anggaran.
          </EmptyState>
        ) : (
          <>
            {codes.length === 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "var(--accent-tint)",
                  border: "1px dashed var(--accent-line)",
                  borderRadius: "var(--r)",
                  fontSize: "0.8125rem",
                  color: "var(--ink)",
                }}
              >
                <Plus size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span>
                  Menampilkan data <strong>{regions.find((r) => r.code === codes[0])?.name}</strong>. Silakan pilih <strong>1 daerah lagi</strong> pada daftar di atas untuk mengisi slot pembanding kedua.
                </span>
              </div>
            )}
            {/* Comparison Table Section */}
        <section className="card">
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--ink-4)",
                      }}
                    >
                      Periode pelaporan
                    </span>
                    <strong style={{ display: "block", marginTop: 4 }}>
                      {months[month]} {year}
                    </strong>
                  </th>
                  {Array.from({ length: displaySlotsCount }).map((_, idx) => {
                    const code = codes[idx];
                    const row = snapshots.find((s) => s.regionCode === code);
                    const region = code
                      ? regions.find((r) => r.code === code)
                      : null;

                    if (row && region) {
                      return (
                        <th key={row.regionCode}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 6,
                            }}
                          >
                            <div>
                              <Link
                                href={`/daerah/${row.regionCode}?${period}`}
                              >
                                {region.name}
                              </Link>
                              <span>
                                Sumatera Utara · {kindLabel(region.type)}
                              </span>
                              <div style={{ marginTop: 4 }}>
                                {region.statusAudit === "audit-penuh" ? (
                                  <span
                                    className="chip chip--ok chip--square"
                                    style={{ fontSize: "0.6875rem", padding: "1px 6px" }}
                                  >
                                    Audit SHA-256
                                  </span>
                                ) : (
                                  <span
                                    className="chip chip--sunk chip--square"
                                    style={{ fontSize: "0.6875rem", padding: "1px 6px" }}
                                  >
                                    Ekspansi Tahap 2
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggle(row.regionCode)}
                              title={`Keluarkan ${region.shortName} dari perbandingan`}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--ink-4)",
                                cursor: "pointer",
                                padding: 2,
                                borderRadius: 4,
                                display: "inline-grid",
                                placeItems: "center",
                              }}
                              aria-label={`Keluarkan kolom ${idx + 1}`}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </th>
                      );
                    }

                    return (
                      <th
                        key={`placeholder-head-${idx}`}
                        style={{
                          background: "var(--sunk)",
                          border: "1px dashed var(--line-3)",
                          textAlign: "center",
                          verticalAlign: "middle",
                          padding: "18px 14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-grid",
                              placeItems: "center",
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: "var(--paper)",
                              border: "1px dashed var(--accent-line)",
                              color: "var(--accent)",
                            }}
                          >
                            <Plus size={13} />
                          </span>
                          <strong
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--ink)",
                              fontWeight: 600,
                            }}
                          >
                            Slot Pembanding Kosong
                          </strong>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--ink-3)",
                              maxWidth: "20ch",
                              lineHeight: 1.4,
                            }}
                          >
                            Pilih 1 daerah lagi pada daftar di atas
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="is-key">
                  <th>
                    Pagu belanja<small>Rencana satu tahun</small>
                  </th>
                  {Array.from({ length: displaySlotsCount }).map((_, idx) => {
                    const code = codes[idx];
                    const row = snapshots.find((s) => s.regionCode === code);
                    if (row) {
                      return (
                        <td
                          key={row.regionCode}
                          title={fullMoney(row.total.budget)}
                        >
                          {compactMoney(row.total.budget)}
                        </td>
                      );
                    }
                    return (
                      <td
                        key={`placeholder-budget-${idx}`}
                        style={{
                          background: "var(--canvas)",
                          textAlign: "center",
                          color: "var(--ink-4)",
                          borderLeft: "1px dashed var(--line)",
                          borderRight: "1px dashed var(--line)",
                        }}
                      >
                        <span style={{ opacity: 0.4 }}>—</span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="is-key">
                  <th>
                    Realisasi belanja
                    <small>Akumulasi sampai periode terpilih</small>
                  </th>
                  {Array.from({ length: displaySlotsCount }).map((_, idx) => {
                    const code = codes[idx];
                    const row = snapshots.find((s) => s.regionCode === code);
                    if (row) {
                      return (
                        <td
                          key={row.regionCode}
                          className="is-accent"
                          title={fullMoney(row.total.realized)}
                        >
                          {compactMoney(row.total.realized)}
                        </td>
                      );
                    }
                    return (
                      <td
                        key={`placeholder-realized-${idx}`}
                        style={{
                          background: "var(--canvas)",
                          textAlign: "center",
                          color: "var(--ink-4)",
                          borderLeft: "1px dashed var(--line)",
                          borderRight: "1px dashed var(--line)",
                        }}
                      >
                        <span style={{ opacity: 0.4 }}>—</span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <th>
                    Serapan anggaran<small>Realisasi dibagi pagu</small>
                  </th>
                  {Array.from({ length: displaySlotsCount }).map((_, idx) => {
                    const code = codes[idx];
                    const row = snapshots.find((s) => s.regionCode === code);
                    if (row) {
                      return (
                        <td key={row.regionCode}>
                          <strong>
                            {percent(
                              percentage(row.total.realized, row.total.budget),
                            )}
                          </strong>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={`placeholder-rate-${idx}`}
                        style={{
                          background: "var(--canvas)",
                          textAlign: "center",
                          color: "var(--ink-4)",
                          borderLeft: "1px dashed var(--line)",
                          borderRight: "1px dashed var(--line)",
                        }}
                      >
                        <span style={{ opacity: 0.4 }}>—</span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="table__section">
                  <th colSpan={displaySlotsCount + 1}>
                    Komposisi realisasi belanja
                    <span>Porsi dari total realisasi, bukan dari pagu.</span>
                  </th>
                </tr>
                {sampleCategories.map((line, index) => (
                  <tr key={line.code}>
                    <th>
                      <span
                        className={`dot dot--${line.code}`}
                        style={{
                          display: "inline-block",
                          marginRight: 8,
                          verticalAlign: "1px",
                        }}
                      />
                      {line.label}
                    </th>
                    {Array.from({ length: displaySlotsCount }).map((_, idx) => {
                      const code = codes[idx];
                      const row = snapshots.find((s) => s.regionCode === code);
                      if (row && row.categories[index]) {
                        return (
                          <td key={row.regionCode}>
                            <strong>
                              {percent(
                                percentage(
                                  row.categories[index].realized,
                                  row.total.realized,
                                ),
                              )}
                            </strong>
                            <small
                              title={fullMoney(row.categories[index].realized)}
                            >
                              {compactMoney(row.categories[index].realized)}
                            </small>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={`placeholder-cat-${line.code}-${idx}`}
                          style={{
                            background: "var(--canvas)",
                            textAlign: "center",
                            color: "var(--ink-4)",
                            borderLeft: "1px dashed var(--line)",
                            borderRight: "1px dashed var(--line)",
                          }}
                        >
                          <span style={{ opacity: 0.4 }}>—</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Visual Charts Section */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">
                {chartMode === "nominal"
                  ? "Pagu dan realisasi, berdampingan"
                  : "Tingkat serapan anggaran, berdampingan"}
              </h2>
              <p className="card__sub">
                {chartMode === "nominal"
                  ? "Nilai nominal dalam rupiah (triliun). Menampilkan perbandingan skala anggaran dan realisasi belanja tiap daerah."
                  : "Persentase realisasi terhadap pagu (0–100%). Menampilkan laju penyerapan anggaran dengan skala yang setara."}
              </p>
            </div>
            {/* Smart Toggle with High Contrast & Clear Labels */}
            <div
              className="segmented"
              role="group"
              aria-label="Pilihan skala grafik perbandingan"
              style={{
                background: "var(--sunk)",
                border: "1px solid var(--line-2)",
                padding: "3px",
                borderRadius: "var(--r-sm)",
              }}
            >
              <button
                type="button"
                className={`segmented__item ${chartMode === "nominal" ? "is-active" : ""}`}
                onClick={() => setChartMode("nominal")}
                aria-pressed={chartMode === "nominal"}
                style={
                  chartMode === "nominal"
                    ? {
                        background: "var(--ink)",
                        color: "#ffffff",
                        fontWeight: 600,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                      }
                    : {
                        color: "var(--ink-2)",
                        fontWeight: 500,
                      }
                }
              >
                Nominal Rp (Pagu & Realisasi)
              </button>
              <button
                type="button"
                className={`segmented__item ${chartMode === "serapan" ? "is-active" : ""}`}
                onClick={() => setChartMode("serapan")}
                aria-pressed={chartMode === "serapan"}
                style={
                  chartMode === "serapan"
                    ? {
                        background: "var(--ink)",
                        color: "#ffffff",
                        fontWeight: 600,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                      }
                    : {
                        color: "var(--ink-2)",
                        fontWeight: 500,
                      }
                }
              >
                % Serapan Anggaran
              </button>
            </div>
          </div>
          <div className="card__body">
            {snapshots.length >= 2 ? (
              chartMode === "nominal" ? (
                <>
                  <SpendingChart snapshots={snapshots} layout="horizontal" />
                  <ChartLegend
                    items={[
                      { label: "Pagu belanja", color: chartColors.budget },
                      { label: "Realisasi", color: chartColors.realized },
                    ]}
                  />
                </>
              ) : (
                <>
                  <ComparisonRateChart snapshots={snapshots} />
                  <ChartLegend
                    items={[
                      {
                        label: "Serapan terhadap pagu",
                        color: chartColors.realized,
                      },
                    ]}
                  />
                </>
              )
            ) : snapshots.length === 1 ? (
              <div>
                {chartMode === "nominal" ? (
                  <>
                    <SpendingChart snapshots={snapshots} layout="horizontal" />
                    <ChartLegend
                      items={[
                        { label: "Pagu belanja", color: chartColors.budget },
                        { label: "Realisasi", color: chartColors.realized },
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <ComparisonRateChart snapshots={snapshots} />
                    <ChartLegend
                      items={[
                        {
                          label: "Serapan terhadap pagu",
                          color: chartColors.realized,
                        },
                      ]}
                    />
                  </>
                )}
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    background: "var(--sunk)",
                    border: "1px dashed var(--line-2)",
                    borderRadius: "var(--r-sm)",
                    fontSize: "0.8125rem",
                    color: "var(--ink-3)",
                    textAlign: "center",
                  }}
                >
                  Menampilkan data 1 daerah. Tambahkan 1 daerah lagi pada
                  pilihan di atas untuk membandingkan kurva visual berdampingan.
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--canvas)",
                  border: "1px dashed var(--line-2)",
                  borderRadius: "var(--r)",
                }}
              >
                <p
                  style={{
                    fontWeight: 600,
                    color: "var(--ink-2)",
                    margin: "0 0 6px",
                  }}
                >
                  Grafik perbandingan belum aktif
                </p>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--ink-3)",
                    margin: 0,
                  }}
                >
                  Silakan pilih minimal dua daerah di atas untuk memvisualisasikan
                  grafik komparasi anggaran.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Year-End Modal Flag Section */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">
                Penanda akhir tahun berdampingan
              </h2>
              <p className="card__sub">
                Perbandingan lonjakan pencairan belanja modal fisik pada dua
                bulan penutup tahun anggaran.
              </p>
            </div>
            <span className="chip chip--sunk">
              Ambang {YEAR_END_THRESHOLD}%
            </span>
          </div>
          <div className="card__body">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Daerah</th>
                    <th>Tahun</th>
                    <th className="is-num">November–Desember</th>
                    <th>Penanda</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          color: "var(--ink-4)",
                          padding: "24px 16px",
                          fontStyle: "italic",
                        }}
                      >
                        Belum ada daerah dipilih. Pilih hingga 3 daerah pada
                        daftar di atas.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {codes.map((code) => {
                        const availableYears = dataset.snapshots
                          .filter(
                            (s) => s.month === 12 && s.regionCode === code,
                          )
                          .map((s) => s.year);
                        const october = dataset.snapshots.find(
                          (s) =>
                            s.regionCode === code &&
                            s.year === completeYear &&
                            s.month === 10,
                        );
                        const december = dataset.snapshots.find(
                          (s) =>
                            s.regionCode === code &&
                            s.year === completeYear &&
                            s.month === 12,
                        );
                        const flag = yearEndModalFlag(october, december);
                        return (
                          <tr key={code}>
                            <th>
                              <Link
                                className="link link--quiet"
                                href={`/daerah/${code}?${period}`}
                              >
                                {regions.find((r) => r.code === code)?.name}
                              </Link>
                            </th>
                            <td>
                              {availableYears.includes(completeYear)
                                ? completeYear
                                : "Belum tersedia"}
                            </td>
                            <td className="is-num">
                              {formatFlagShare(flag.share)}
                            </td>
                            <td>
                              {flag.status === "ditandai" ? (
                                <span className="chip chip--warn chip--square">
                                  Perlu ditanyakan
                                </span>
                              ) : flag.status === "wajar" ? (
                                <span className="chip chip--ok chip--square">
                                  Di bawah ambang
                                </span>
                              ) : flag.status === "tidak-konsisten" ? (
                                <span className="chip chip--square">
                                  Data tidak konsisten
                                </span>
                              ) : (
                                <span className="chip chip--square">
                                  Belum tersedia
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {codes.length === 1 && (
                        <tr style={{ background: "var(--canvas)" }}>
                          <td
                            colSpan={4}
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              color: "var(--ink-3)",
                              fontSize: "0.8125rem",
                              borderTop: "1px dashed var(--line-2)",
                            }}
                          >
                            + Tambahkan 1 daerah lagi pada pemilih di atas untuk
                            membandingkan penanda akhir tahun secara berdampingan.
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card__foot">
            <InfoNote>
              Ambang {YEAR_END_THRESHOLD}% merupakan pilihan metodologi,
              bukan batas hukum atau bukti pelanggaran. Perbedaan jadwal
              proyek dapat memengaruhi hasil. Buka profil untuk pertanyaan
              dan sumber Oktober serta Desember.
            </InfoNote>
          </div>
        </section>

        {snapshots[0] && <SourceNote snapshot={snapshots[0]} />}

        <InfoNote>
          Persentase serapan atau komposisi yang lebih tinggi tidak otomatis
          berarti layanan lebih baik. Pertimbangkan kebutuhan warga,
          kewenangan daerah, dan data hasil layanan.
        </InfoNote>
      </>
    )}
  </div>
</>
  );
}
