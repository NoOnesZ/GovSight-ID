import test from "node:test";
import assert from "node:assert/strict";
import {
  CHART_TOKENS,
  chartColors,
  ChartLegend,
  MonthlyChart,
  ComparisonRateChart,
  SpendingChart,
  HistoryChart,
} from "../src/components/charts";

function relativeLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const rgb = [0, 2, 4].map(
    (offset) => parseInt(cleanHex.substring(offset, offset + 2), 16) / 255,
  );
  const transformed = rgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return (
    0.2126 * transformed[0] + 0.7152 * transformed[1] + 0.0722 * transformed[2]
  );
}

function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hex1);
  const lum2 = relativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

test("CHART_TOKENS dan chartColors mengekspor token warna yang identik dan lengkap", () => {
  assert.equal(chartColors, CHART_TOKENS);
  const expectedKeys = [
    "realized",
    "budget",
    "modal",
    "reference",
    "grid",
    "axis",
    "label",
    "hover",
    "paper",
    "tooltipBorder",
    "tooltipShadow",
  ];
  for (const key of expectedKeys) {
    assert.ok(
      key in CHART_TOKENS,
      `Kunci token '${key}' harus ada di CHART_TOKENS`,
    );
  }
});

test("Warna graphical objects grafik memenuhi standar WCAG AA (rasio kontras >= 3:1)", () => {
  const white = "#ffffff";
  const canvas = "#fbfaf9";

  const graphicalColors: Array<keyof typeof CHART_TOKENS> = [
    "realized",
    "budget",
    "modal",
    "reference",
  ];

  for (const key of graphicalColors) {
    const color = CHART_TOKENS[key] as string;
    const ratioWhite = contrastRatio(color, white);
    const ratioCanvas = contrastRatio(color, canvas);

    assert.ok(
      ratioWhite >= 3.0,
      `Warna ${key} (${color}) harus memiliki kontras >= 3.0:1 terhadap putih (didapat ${ratioWhite.toFixed(2)}:1)`,
    );
    assert.ok(
      ratioCanvas >= 3.0,
      `Warna ${key} (${color}) harus memiliki kontras >= 3.0:1 terhadap canvas (didapat ${ratioCanvas.toFixed(2)}:1)`,
    );
  }
});

test("Warna teks axis dan label memenuhi standar WCAG AA (rasio kontras >= 4.5:1)", () => {
  const white = "#ffffff";
  const canvas = "#fbfaf9";

  const textColors: Array<keyof typeof CHART_TOKENS> = ["axis", "label"];

  for (const key of textColors) {
    const color = CHART_TOKENS[key] as string;
    const ratioWhite = contrastRatio(color, white);
    const ratioCanvas = contrastRatio(color, canvas);

    assert.ok(
      ratioWhite >= 4.5,
      `Warna teks ${key} (${color}) harus memiliki kontras >= 4.5:1 terhadap putih (didapat ${ratioWhite.toFixed(2)}:1)`,
    );
    assert.ok(
      ratioCanvas >= 4.5,
      `Warna teks ${key} (${color}) harus memiliki kontras >= 4.5:1 terhadap canvas (didapat ${ratioCanvas.toFixed(2)}:1)`,
    );
  }
});

test("Komponen grafik dibungkus dengan React.memo untuk optimasi re-render", () => {
  // Dalam React, objek yang dibungkus memo memiliki properti $$typeof Symbol(react.memo)
  const components = [
    { name: "MonthlyChart", comp: MonthlyChart },
    { name: "ComparisonRateChart", comp: ComparisonRateChart },
    { name: "SpendingChart", comp: SpendingChart },
    { name: "HistoryChart", comp: HistoryChart },
    { name: "ChartLegend", comp: ChartLegend },
  ];

  for (const { name, comp } of components) {
    assert.ok(
      typeof comp === "object" && comp !== null,
      `${name} harus diekspor sebagai React memoized component`,
    );
    // React memo objects have $$typeof and 'type' property
    const symbolStr = String(
      (comp as unknown as { $$typeof: symbol }).$$typeof,
    );
    assert.ok(
      symbolStr.includes("react.memo"),
      `${name} harus dibungkus dengan React.memo, didapat ${symbolStr}`,
    );
  }
});
