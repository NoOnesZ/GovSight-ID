"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Snapshot } from "@/lib/types";
import { monthlyAbsorption } from "@/lib/indicators";
import { months, regions } from "@/lib/regions";
import { compactMoney } from "@/lib/format";
import { percentage } from "@/lib/data-core";

/**
 * Token warna & gaya grafik yang diselaraskan dengan CSS variables di globals.css.
 * Recharts SVG presentation attributes memerlukan nilai literal (tidak mendukung var()).
 * Semua warna diuji untuk memenuhi standar aksesibilitas WCAG AA:
 * - Graphical objects & boundaries: rasio kontras minimal 3:1 terhadap background putih (#ffffff) & canvas (#fbfaf9).
 * - Label teks axis: rasio kontras minimal 4.5:1 untuk teks normal.
 */
export const CHART_TOKENS = {
  // Data series (kontras >= 3:1 terhadap putih & canvas)
  realized: "#2e5c96", // --d-realized: rasio 6.8:1 terhadap #ffffff
  budget: "#5a89bf", // --d-budget (disesuaikan dari #c9d6e5 agar rasio kontras 3.64:1 vs #ffffff, lulus WCAG AA)
  modal: "#1e7d6b", // --d-modal: rasio 5.0:1 terhadap #ffffff
  reference: "#716d66", // Garis acuan merata/pagu (rasio 5.15:1 vs #ffffff, lulus WCAG AA)

  // Grid, axes, & labels
  grid: "#ecebe7", // --d-grid: garis pemisah netral
  axis: "#68645e", // --ink-4 (rasio 5.88:1 vs #ffffff, lulus teks 4.5:1)
  label: "#56534e", // --ink-2 (rasio 7.66:1 vs #ffffff)
  hover: "#f6f5f3", // --sunk

  // Surface & Tooltip tokens (menggantikan hardcoded hex)
  paper: "#ffffff", // --paper
  tooltipBorder: "#dad7d1", // --line-2
  tooltipShadow:
    "0 2px 4px -2px rgba(28,27,25,.06), 0 8px 20px -10px rgba(28,27,25,.16)", // --shadow-md
} as const;

export const chartColors = CHART_TOKENS;
const C = CHART_TOKENS;

const axisTick = {
  fontSize: 11,
  fill: C.axis,
  fontFamily: "inherit",
} as const;

const tooltipStyle = {
  backgroundColor: C.paper,
  border: `1px solid ${C.tooltipBorder}`,
  borderRadius: 7,
  fontSize: 13,
  padding: "8px 10px",
  boxShadow: C.tooltipShadow,
  fontVariantNumeric: "tabular-nums lining-nums",
} as const;

const tooltipLabelStyle = {
  color: C.label,
  fontWeight: 600,
  marginBottom: 2,
} as const;

/**
 * Hook untuk mengoptimalkan performa Recharts pada perangkat low-end / mobile:
 * 1. Mendeteksi lebar layar mobile (<= 640px) dan preferensi reduced motion (prefers-reduced-motion: reduce).
 * 2. Mematikan animasi SVG Recharts yang berat (isAnimationActive={false}) untuk menghemat CPU/GPU di device low-end.
 * 3. Memberikan status untuk menyesuaikan rotasi dan kepadatan label axis agar tidak bertabrakan.
 */
function useChartPerformance() {
  const [isMobile, setIsMobile] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateState = () => {
      const mobile = mobileQuery.matches;
      const reducedMotion = motionQuery.matches;
      setIsMobile(mobile);
      // Animasi dimatikan pada mobile (device low-end) atau bila pengguna memilih reduced motion
      setShouldAnimate(!mobile && !reducedMotion);
    };

    updateState();

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", updateState);
      motionQuery.addEventListener("change", updateState);
      return () => {
        mobileQuery.removeEventListener("change", updateState);
        motionQuery.removeEventListener("change", updateState);
      };
    } else {
      mobileQuery.addListener(updateState);
      motionQuery.addListener(updateState);
      return () => {
        mobileQuery.removeListener(updateState);
        motionQuery.removeListener(updateState);
      };
    }
  }, []);

  return { isMobile, shouldAnimate };
}

/** Legenda ditulis sebagai HTML, bukan lewat recharts, supaya tipografinya konsisten. */
export const ChartLegend = memo(function ChartLegend({
  items,
}: {
  items: { label: string; color: string; dashed?: boolean }[];
}) {
  return (
    <ul className="chart-legend">
      {items.map((item) => (
        <li key={item.label}>
          <span
            className={
              item.dashed ? "chart-legend__key is-dashed" : "chart-legend__key"
            }
            style={
              item.dashed
                ? { borderColor: item.color }
                : { background: item.color }
            }
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
});

function trillionTick(value: number) {
  return `${value.toLocaleString("id-ID")} T`;
}

export const MonthlyChart = memo(function MonthlyChart({
  snapshots,
}: {
  snapshots: Snapshot[];
}) {
  const { isMobile, shouldAnimate } = useChartPerformance();

  const data = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const row = snapshots.find((s) => s.month === i + 1);
      return {
        month: months[i + 1].slice(0, 3),
        Serapan: row ? monthlyAbsorption(row) : null,
        Merata: Math.round(((i + 1) / 12) * 10000) / 100,
      };
    });
  }, [snapshots]);

  const latestSnapshot = useMemo(() => {
    if (snapshots.length === 0) return null;
    return [...snapshots].sort((a, b) => b.month - a.month)[0];
  }, [snapshots]);

  const latestRate = latestSnapshot ? monthlyAbsorption(latestSnapshot) : null;
  const ariaLabel =
    latestRate !== null && latestSnapshot
      ? `Grafik garis tren serapan anggaran bulanan. Realisasi kumulatif terkini mencapai ${latestRate}% pada bulan ${months[latestSnapshot.month] ?? `ke-${latestSnapshot.month}`}. Garis putus-putus menunjukkan acuan serapan merata linier.`
      : "Grafik serapan kumulatif per bulan. Garis merata hanya ilustrasi, bukan target.";

  const minHeight = isMobile ? 240 : 272;

  return (
    <div
      className="chart"
      role="img"
      aria-label={ariaLabel}
      style={{ minHeight }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        minHeight={minHeight}
        initialDimension={{ width: 800, height: minHeight }}
      >
        <ComposedChart
          data={data}
          margin={{ top: 10, left: -18, right: 12, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="2 4"
            stroke={C.grid}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ ...axisTick, fontSize: isMobile ? 10 : 11 }}
            minTickGap={4}
            dy={6}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
            tick={{ ...axisTick, fontSize: isMobile ? 10 : 11 }}
          />
          <Tooltip
            isAnimationActive={false}
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) =>
              `${Number(value).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`
            }
          />
          <Line
            isAnimationActive={shouldAnimate}
            animationDuration={400}
            animationEasing="ease-out"
            dataKey="Merata"
            type="linear"
            stroke={C.reference}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            isAnimationActive={shouldAnimate}
            animationDuration={400}
            animationEasing="ease-out"
            dataKey="Serapan"
            connectNulls={false}
            type="linear"
            stroke={C.realized}
            strokeWidth={2.25}
            dot={{
              r: 2.5,
              fill: C.paper,
              stroke: C.realized,
              strokeWidth: 1.75,
            }}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

export const ComparisonRateChart = memo(function ComparisonRateChart({
  snapshots,
}: {
  snapshots: Snapshot[];
}) {
  const { isMobile, shouldAnimate } = useChartPerformance();

  const data = useMemo(() => {
    return snapshots.map((row) => {
      const rate = percentage(row.total.realized, row.total.budget);
      return {
        name:
          regions.find((region) => region.code === row.regionCode)?.shortName ??
          "",
        Serapan: rate !== null ? Math.round(rate * 10) / 10 : 0,
      };
    });
  }, [snapshots]);

  const ariaLabel = useMemo(() => {
    if (data.length === 0) {
      return "Grafik perbandingan persentase serapan belanja anggaran antar daerah.";
    }
    const sorted = [...data].sort((a, b) => b.Serapan - a.Serapan);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    if (highest && lowest && highest.name !== lowest.name) {
      return `Grafik batang perbandingan persentase serapan belanja untuk ${data.length} daerah. Serapan tertinggi dicapai oleh ${highest.name} (${highest.Serapan}%) dan terendah oleh ${lowest.name} (${lowest.Serapan}%).`;
    }
    return `Grafik batang perbandingan persentase serapan belanja untuk ${data.length} daerah. Serapan ${highest?.name ?? ""} sebesar ${highest?.Serapan ?? 0}%.`;
  }, [data]);

  const minHeight = 292;

  return (
    <div
      className="chart chart--bars"
      role="img"
      aria-label={ariaLabel}
      style={{ minHeight }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        minHeight={minHeight}
        initialDimension={{ width: 650, height: minHeight }}
      >
        <BarChart
          data={data}
          margin={{
            top: 10,
            left: -18,
            right: 8,
            bottom: isMobile ? 26 : 0,
          }}
          barCategoryGap={isMobile ? "24%" : "34%"}
        >
          <CartesianGrid
            strokeDasharray="2 4"
            vertical={false}
            stroke={C.grid}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              ...axisTick,
              fontSize: isMobile ? 10 : 11,
            }}
            dy={isMobile ? 6 : 8}
            dx={isMobile ? -2 : 0}
            angle={isMobile ? -35 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 54 : 30}
            interval={0}
            minTickGap={4}
            tickFormatter={(name: string) => {
              const maxLen = isMobile ? 8 : 13;
              return name.length > maxLen
                ? `${name.slice(0, maxLen - 1)}…`
                : name;
            }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
            axisLine={false}
            tickLine={false}
            tick={{ ...axisTick, fontSize: isMobile ? 10 : 11 }}
          />
          <Tooltip
            isAnimationActive={false}
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ fill: C.hover }}
            formatter={(value) => `${value}%`}
          />
          <Bar
            isAnimationActive={shouldAnimate}
            animationDuration={400}
            animationEasing="ease-out"
            dataKey="Serapan"
            fill={C.realized}
            radius={[3, 3, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export const SpendingChart = memo(function SpendingChart({
  snapshots,
  layout = snapshots.length > 4 ? "vertical" : "horizontal",
}: {
  snapshots: Snapshot[];
  layout?: "horizontal" | "vertical";
}) {
  const { isMobile, shouldAnimate } = useChartPerformance();

  const data = useMemo(() => {
    return snapshots.map((row) => ({
      name:
        regions.find((region) => region.code === row.regionCode)?.shortName ??
        "",
      Pagu: row.total.budget === null ? null : Number(row.total.budget) / 1e12,
      Realisasi:
        row.total.realized === null ? null : Number(row.total.realized) / 1e12,
    }));
  }, [snapshots]);

  const isVertical = layout === "vertical";
  // Setiap baris horizontal membutuhkan minimal 36px agar 2 bar dan label daerah
  // memiliki ruang vertikal yang lapang dan tidak ada label teks yang bertumpuk.
  const rowHeight = 36;
  const dynamicHeight = isVertical
    ? Math.max(320, data.length * rowHeight + 48)
    : 292;

  const ariaLabel = useMemo(() => {
    return `Grafik perbandingan pagu dan realisasi belanja untuk ${data.length} daerah. Detail nominal dan rincian lengkap tersedia pada tabel data.`;
  }, [data.length]);

  return (
    <div
      className={
        isVertical ? "chart chart--spending-vertical" : "chart chart--bars"
      }
      style={{
        height: isVertical ? dynamicHeight : undefined,
        minHeight: dynamicHeight,
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer
        width="100%"
        height={isVertical ? dynamicHeight : "100%"}
        minWidth={1}
        minHeight={dynamicHeight}
        initialDimension={{ width: 650, height: dynamicHeight }}
      >
        {isVertical ? (
          <BarChart
            layout="vertical"
            data={data}
            margin={{
              top: 8,
              left: isMobile ? -6 : 4,
              right: isMobile ? 12 : 24,
              bottom: 8,
            }}
            barGap={3}
            barCategoryGap={isMobile ? "18%" : "22%"}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              horizontal={false}
              stroke={C.grid}
            />
            <XAxis
              type="number"
              tickFormatter={trillionTick}
              axisLine={false}
              tickLine={false}
              tick={{ ...axisTick, fontSize: isMobile ? 10 : 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 104 : 144}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: C.label,
                fontSize: isMobile ? 10 : 11.5,
                fontFamily: "inherit",
              }}
              interval={0}
              tickFormatter={(name: string) => {
                const maxLen = isMobile ? 12 : 18;
                return name.length > maxLen
                  ? `${name.slice(0, maxLen - 1)}…`
                  : name;
              }}
            />
            <Tooltip
              isAnimationActive={false}
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: C.hover }}
              formatter={(value) => compactMoney(String(Number(value) * 1e12))}
            />
            <Bar
              isAnimationActive={shouldAnimate}
              animationDuration={400}
              animationEasing="ease-out"
              dataKey="Pagu"
              fill={C.budget}
              radius={[0, 3, 3, 0]}
              maxBarSize={9}
            />
            <Bar
              isAnimationActive={shouldAnimate}
              animationDuration={400}
              animationEasing="ease-out"
              dataKey="Realisasi"
              fill={C.realized}
              radius={[0, 3, 3, 0]}
              maxBarSize={9}
            />
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{
              top: 10,
              left: -18,
              right: 8,
              bottom: isMobile ? 26 : 0,
            }}
            barGap={4}
            barCategoryGap={isMobile ? "22%" : "30%"}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              vertical={false}
              stroke={C.grid}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                ...axisTick,
                fontSize: isMobile ? 10 : 11,
              }}
              dy={isMobile ? 6 : 8}
              dx={isMobile ? -2 : 0}
              angle={isMobile ? -35 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 54 : 30}
              interval={0}
              minTickGap={4}
              tickFormatter={(name: string) => {
                const maxLen = isMobile ? 8 : 13;
                return name.length > maxLen
                  ? `${name.slice(0, maxLen - 1)}…`
                  : name;
              }}
            />
            <YAxis
              tickFormatter={trillionTick}
              axisLine={false}
              tickLine={false}
              tick={{ ...axisTick, fontSize: isMobile ? 10 : 11 }}
            />
            <Tooltip
              isAnimationActive={false}
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: C.hover }}
              formatter={(value) => compactMoney(String(Number(value) * 1e12))}
            />
            <Bar
              isAnimationActive={shouldAnimate}
              animationDuration={400}
              animationEasing="ease-out"
              dataKey="Pagu"
              fill={C.budget}
              radius={[3, 3, 0, 0]}
              maxBarSize={46}
            />
            <Bar
              isAnimationActive={shouldAnimate}
              animationDuration={400}
              animationEasing="ease-out"
              dataKey="Realisasi"
              fill={C.realized}
              radius={[3, 3, 0, 0]}
              maxBarSize={46}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});

export const HistoryChart = memo(function HistoryChart({
  snapshots,
}: {
  snapshots: Snapshot[];
}) {
  const { isMobile, shouldAnimate } = useChartPerformance();

  const sortedSnapshots = useMemo(() => {
    return [...snapshots].sort((a, b) => a.year - b.year);
  }, [snapshots]);

  const data = useMemo(() => {
    return sortedSnapshots.map((row) => ({
      tahun: String(row.year),
      Pagu: row.total.budget === null ? null : Number(row.total.budget) / 1e12,
      Realisasi:
        row.total.realized === null ? null : Number(row.total.realized) / 1e12,
    }));
  }, [sortedSnapshots]);

  const ariaLabel = useMemo(() => {
    if (sortedSnapshots.length === 0) {
      return "Grafik riwayat belanja pada bulan pelaporan yang sama.";
    }
    const minYear = sortedSnapshots[0]?.year;
    const maxYear = sortedSnapshots[sortedSnapshots.length - 1]?.year;
    const latestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
    const latestRealized =
      latestSnapshot?.total.realized != null
        ? compactMoney(String(latestSnapshot.total.realized))
        : null;

    const spanText =
      minYear && maxYear && minYear !== maxYear
        ? `dari tahun ${minYear} hingga ${maxYear}`
        : `tahun ${maxYear ?? ""}`;

    return `Grafik riwayat belanja daerah ${spanText}.${
      latestRealized
        ? ` Realisasi tahun ${maxYear} tercatat sebesar ${latestRealized}.`
        : ""
    } Tabel angka lengkap tersedia di bawah grafik.`;
  }, [sortedSnapshots]);

  const minHeight = isMobile ? 240 : 272;

  return (
    <div
      className="chart"
      role="img"
      aria-label={ariaLabel}
      style={{ minHeight }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        minHeight={minHeight}
        initialDimension={{ width: 800, height: minHeight }}
      >
        <ComposedChart
          data={data}
          margin={{ top: 10, left: -18, right: 20, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="2 4"
            stroke={C.grid}
          />
          <XAxis
            dataKey="tahun"
            axisLine={false}
            tickLine={false}
            tick={{ ...axisTick, fontSize: isMobile ? 10 : 11 }}
            minTickGap={8}
            dy={8}
          />
          <YAxis
            tickFormatter={trillionTick}
            axisLine={false}
            tickLine={false}
            tick={{ ...axisTick, fontSize: isMobile ? 10 : 11 }}
          />
          <Tooltip
            isAnimationActive={false}
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) => compactMoney(String(Number(value) * 1e12))}
          />
          <Area
            isAnimationActive={shouldAnimate}
            animationDuration={400}
            animationEasing="ease-out"
            dataKey="Realisasi"
            type="linear"
            fill={C.realized}
            fillOpacity={0.08}
            stroke={C.realized}
            strokeWidth={2.25}
            dot={{
              r: 2.5,
              fill: C.paper,
              stroke: C.realized,
              strokeWidth: 1.75,
            }}
            activeDot={{ r: 4 }}
          />
          <Line
            isAnimationActive={shouldAnimate}
            animationDuration={400}
            animationEasing="ease-out"
            dataKey="Pagu"
            type="linear"
            stroke={C.reference}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});
