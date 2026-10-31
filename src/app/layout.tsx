import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/source-serif-4/index.css";
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
