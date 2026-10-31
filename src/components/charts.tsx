"use client";

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

/* Warna grafik dikunci di sini agar sama dengan token di globals.css.
   Presentation attribute SVG tidak bisa membaca var(), jadi nilainya literal. */
const C = {
  realized: "#2e5c96",
  budget: "#c9d6e5",
  modal: "#1e7d6b",
  reference: "#b9b4ab",
  grid: "#ecebe7",
  axis: "#8c8881",
  label: "#56534e",
  hover: "#f6f5f3",
};

const axisTick = {
  fontSize: 11,
  fill: C.axis,
  fontFamily: "inherit",
} as const;

const tooltipStyle = {
  border: "1px solid #dad7d1",
  borderRadius: 7,
  fontSize: 13,
  padding: "8px 10px",
  boxShadow:
    "0 2px 4px -2px rgba(28,27,25,.06), 0 8px 20px -10px rgba(28,27,25,.16)",
  fontVariantNumeric: "tabular-nums",
} as const;

const tooltipLabelStyle = {
  color: C.label,
  fontWeight: 600,
  marginBottom: 2,
} as const;

/** Legenda ditulis sebagai HTML, bukan lewat recharts, supaya tipografinya konsisten. */
export function ChartLegend({
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
}

export const chartColors = C;

function trillionTick(value: number) {
  return `${value.toLocaleString("id-ID")} T`;
}

export function MonthlyChart({ snapshots }: { snapshots: Snapshot[] }) {
  const data = Array.from({ length: 12 }, (_, i) => {
    const row = snapshots.find((s) => s.month === i + 1);
    return {
      month: months[i + 1].slice(0, 3),
      Serapan: row ? monthlyAbsorption(row) : null,
      Merata: Math.round(((i + 1) / 12) * 10000) / 100,
    };
  });
  return (
    <div
      className="chart"
      role="img"
      aria-label="Grafik serapan kumulatif per bulan. Garis merata hanya ilustrasi, bukan target."
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        initialDimension={{ width: 800, height: 272 }}
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
            tick={axisTick}
            dy={6}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
            tick={axisTick}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) =>
              `${Number(value).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`
            }
          />
          <Line
            isAnimationActive={false}
            dataKey="Merata"
            type="linear"
            stroke={C.reference}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            isAnimationActive={false}
            dataKey="Serapan"
            connectNulls={false}
            type="linear"
            stroke={C.realized}
            strokeWidth={2.25}
            dot={{
              r: 2.5,
              fill: "#fff",
              stroke: C.realized,
              strokeWidth: 1.75,
            }}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonRateChart({ snapshots }: { snapshots: Snapshot[] }) {
  const data = snapshots.map((row) => {
    const rate = percentage(row.total.realized, row.total.budget);
    return {
      name:
        regions.find((region) => region.code === row.regionCode)?.shortName ??
        "",
      Serapan: rate !== null ? Math.round(rate * 10) / 10 : 0,
    };
  });

  return (
    <div
      className="chart chart--bars"
      role="img"
      aria-label="Grafik perbandingan persentase serapan belanja anggaran."
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        initialDimension={{ width: 650, height: 292 }}
      >
        <BarChart
          data={data}
          margin={{ top: 10, left: -18, right: 8, bottom: 0 }}
          barCategoryGap="34%"
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
            tick={axisTick}
            dy={8}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
            axisLine={false}
            tickLine={false}
            tick={axisTick}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ fill: C.hover }}
            formatter={(value) => `${value}%`}
          />
          <Bar
            isAnimationActive={false}
            dataKey="Serapan"
            fill={C.realized}
            radius={[3, 3, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpendingChart({
  snapshots,
  layout = snapshots.length > 4 ? "vertical" : "horizontal",
}: {
  snapshots: Snapshot[];
  layout?: "horizontal" | "vertical";
}) {
  const data = snapshots.map((row) => ({
    name:
      regions.find((region) => region.code === row.regionCode)?.shortName ?? "",
    Pagu: row.total.budget === null ? null : Number(row.total.budget) / 1e12,
    Realisasi:
      row.total.realized === null ? null : Number(row.total.realized) / 1e12,
  }));

  const isVertical = layout === "vertical";

  return (
    <div
      className={isVertical ? "chart chart--tall" : "chart chart--bars"}
      role="img"
      aria-label="Grafik perbandingan pagu dan realisasi. Angka lengkap tersedia pada tabel daerah."
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        initialDimension={{ width: 650, height: isVertical ? 380 : 292 }}
      >
        {isVertical ? (
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, left: 0, right: 14, bottom: 0 }}
            barGap={2}
            barCategoryGap="26%"
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
              tick={axisTick}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={104}
              axisLine={false}
              tickLine={false}
              tick={{ fill: C.label, fontSize: 11.5, fontFamily: "inherit" }}
              interval={0}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: C.hover }}
              formatter={(value) => compactMoney(String(Number(value) * 1e12))}
            />
            <Bar
              isAnimationActive={false}
              dataKey="Pagu"
              fill={C.budget}
              radius={[0, 3, 3, 0]}
              maxBarSize={11}
            />
            <Bar
              isAnimationActive={false}
              dataKey="Realisasi"
              fill={C.realized}
              radius={[0, 3, 3, 0]}
              maxBarSize={11}
            />
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 10, left: -18, right: 8, bottom: 0 }}
            barGap={4}
            barCategoryGap="30%"
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
              tick={axisTick}
              dy={8}
            />
            <YAxis
              tickFormatter={trillionTick}
              axisLine={false}
              tickLine={false}
              tick={axisTick}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: C.hover }}
              formatter={(value) => compactMoney(String(Number(value) * 1e12))}
            />
            <Bar
              isAnimationActive={false}
              dataKey="Pagu"
              fill={C.budget}
              radius={[3, 3, 0, 0]}
              maxBarSize={46}
            />
            <Bar
              isAnimationActive={false}
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
}

export function HistoryChart({ snapshots }: { snapshots: Snapshot[] }) {
  const data = [...snapshots]
    .sort((a, b) => a.year - b.year)
    .map((row) => ({
      tahun: String(row.year),
      Pagu: row.total.budget === null ? null : Number(row.total.budget) / 1e12,
      Realisasi:
        row.total.realized === null ? null : Number(row.total.realized) / 1e12,
    }));
  return (
    <div
      className="chart"
      role="img"
      aria-label="Grafik riwayat belanja pada bulan pelaporan yang sama. Tabel angka tersedia di bawah grafik."
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        initialDimension={{ width: 800, height: 272 }}
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
            tick={axisTick}
            dy={8}
          />
          <YAxis
            tickFormatter={trillionTick}
            axisLine={false}
            tickLine={false}
            tick={axisTick}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) => compactMoney(String(Number(value) * 1e12))}
          />
          <Area
            isAnimationActive={false}
            dataKey="Realisasi"
            type="linear"
            fill={C.realized}
            fillOpacity={0.06}
            stroke={C.realized}
            strokeWidth={2.25}
            dot={{
              r: 2.5,
              fill: "#fff",
              stroke: C.realized,
              strokeWidth: 1.75,
            }}
            activeDot={{ r: 4 }}
          />
          <Line
            isAnimationActive={false}
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
}
