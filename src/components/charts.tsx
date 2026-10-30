"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
} from "recharts";
import type { Snapshot } from "@/lib/types";
import { monthlyAbsorption } from "@/lib/indicators";
import { months } from "@/lib/regions";
import { compactMoney } from "@/lib/format";
import { regions } from "@/lib/regions";

const axis = { fontSize: 11, fill: "#788497", fontFamily: "inherit" };
const tooltipStyle = {
  border: "1px solid #e3e8f1",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 6px 24px #18213310",
};

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
      className="history-chart"
      role="img"
      aria-label="Grafik serapan kumulatif per bulan. Garis merata hanya ilustrasi, bukan target."
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        initialDimension={{ width: 800, height: 260 }}
      >
        <ComposedChart
          data={data}
          margin={{ top: 15, left: -15, right: 15, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 5"
            stroke="#EAF0F6"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={axis}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
            tick={axis}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) =>
              `${Number(value).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`
            }
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
          />
          <Line
            isAnimationActive={false}
            dataKey="Serapan"
            connectNulls={false}
            type="linear"
            stroke="#2457E7"
            strokeWidth={3}
          />
          <Line
            isAnimationActive={false}
            dataKey="Merata"
            type="linear"
            stroke="#A8B6CC"
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function trillionTick(value: number) {
  return `${value.toLocaleString("id-ID")} T`;
}

export function SpendingChart({
  snapshots,
  layout = snapshots.length > 4 ? "vertical" : "horizontal",
}: {
  snapshots: Snapshot[];
  layout?: "horizontal" | "vertical";
}) {
  const data = snapshots.map((row) => ({
    name: regions.find((region) => region.code === row.regionCode)?.shortName ?? "",
    Pagu: row.total.budget === null ? null : Number(row.total.budget) / 1e12,
    Realisasi:
      row.total.realized === null ? null : Number(row.total.realized) / 1e12,
  }));

  const isVertical = layout === "vertical";

  return (
    <div
      className={`spending-chart ${isVertical ? "spending-chart-horizontal-bars" : ""}`}
      role="img"
      aria-label="Grafik perbandingan pagu dan realisasi. Angka lengkap tersedia pada tabel daerah."
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        initialDimension={{ width: 650, height: isVertical ? 380 : 290 }}
      >
        {isVertical ? (
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, left: -4, right: 16, bottom: 0 }}
            barGap={3}
            barCategoryGap="22%"
          >
            <CartesianGrid
              strokeDasharray="3 5"
              horizontal={false}
              stroke="#EAF0F6"
            />
            <XAxis
              type="number"
              tickFormatter={trillionTick}
              axisLine={false}
              tickLine={false}
              tick={axis}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#334155", fontSize: 11, fontWeight: 500 }}
              interval={0}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "#f6f8fd" }}
              formatter={(value) => compactMoney(String(Number(value) * 1e12))}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            />
            <Bar
              isAnimationActive={false}
              dataKey="Pagu"
              fill="#93B4F5"
              radius={[0, 4, 4, 0]}
              maxBarSize={14}
            />
            <Bar
              isAnimationActive={false}
              dataKey="Realisasi"
              fill="#2457E7"
              radius={[0, 4, 4, 0]}
              maxBarSize={14}
            />
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 14, left: -19, right: 8, bottom: 0 }}
            barGap={6}
            barCategoryGap="28%"
          >
            <CartesianGrid
              strokeDasharray="3 5"
              vertical={false}
              stroke="#EAF0F6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={axis}
              dy={8}
            />
            <YAxis
              tickFormatter={trillionTick}
              axisLine={false}
              tickLine={false}
              tick={axis}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "#f6f8fd" }}
              formatter={(value) => compactMoney(String(Number(value) * 1e12))}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
            />
            <Bar
              isAnimationActive={false}
              dataKey="Pagu"
              fill="#93B4F5"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              isAnimationActive={false}
              dataKey="Realisasi"
              fill="#2457E7"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
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
      className="history-chart"
      role="img"
      aria-label="Grafik riwayat belanja pada bulan pelaporan yang sama. Tabel angka tersedia di bawah grafik."
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        initialDimension={{ width: 800, height: 260 }}
      >
        <ComposedChart
          data={data}
          margin={{ top: 15, left: -15, right: 28, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 5"
            stroke="#EAF0F6"
          />
          <XAxis
            dataKey="tahun"
            axisLine={false}
            tickLine={false}
            tick={axis}
            dy={9}
          />
          <YAxis
            tickFormatter={trillionTick}
            axisLine={false}
            tickLine={false}
            tick={axis}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => compactMoney(String(Number(value) * 1e12))}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
          />
          <Area
            isAnimationActive={false}
            dataKey="Realisasi"
            type="linear"
            fill="#2457E7"
            fillOpacity={0.07}
            stroke="#2457E7"
            strokeWidth={3}
            dot={{ r: 4, fill: "white", strokeWidth: 2 }}
          />
          <Line
            isAnimationActive={false}
            dataKey="Pagu"
            type="linear"
            stroke="#A8B6CC"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
