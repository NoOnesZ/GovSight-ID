import Decimal from "decimal.js";
import type { Amount } from "./types";
import { months } from "./regions";

export function compactMoney(value: Amount, withCurrency = true): string {
  if (value === null) return "Belum tersedia";
  const amount = new Decimal(value);
  const unit = amount.abs().gte("1e12")
    ? { scale: "1e12", label: "T" }
    : amount.abs().gte("1e9")
      ? { scale: "1e9", label: "M" }
      : amount.abs().gte("1e6")
        ? { scale: "1e6", label: "jt" }
        : { scale: "1", label: "" };
  return `${withCurrency ? "Rp" : ""}${amount
    .div(unit.scale)
    .toNumber()
    .toLocaleString("id-ID", {
      maximumFractionDigits: 2,
      minimumFractionDigits: unit.label ? 2 : 0,
    })}${unit.label ? ` ${unit.label}` : ""}`;
}
export function fullMoney(value: Amount): string {
  if (value === null) return "Belum tersedia";
  const [whole, fraction] = new Decimal(value).toFixed(2).split(".");
  return `Rp${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${fraction}`;
}
export function percent(value: number | null): string {
  return value === null
    ? "Belum tersedia"
    : `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
}
export function dateLabel(value: string | null): string {
  if (!value) return "Tanggal publikasi belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value.length === 10 ? `${value}T00:00:00+07:00` : value));
}
export function periodLabel(year: number, month: number): string {
  return `s.d. ${months[month]} ${year}`;
}
