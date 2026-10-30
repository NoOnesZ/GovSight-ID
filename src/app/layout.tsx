import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GovSight ID — Pahami belanja daerahmu",
    template: "%s | GovSight ID",
  },
  description:
    "Jelajahi dan bandingkan pagu, realisasi, serta komposisi belanja daerah Sumatera Utara dengan data terbuka DJPK.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
