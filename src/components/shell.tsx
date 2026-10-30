"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  Compass,
  Database,
  FlaskConical,
  Landmark,
  PanelLeftClose,
  ShieldCheck,
} from "lucide-react";
import { regions } from "@/lib/regions";

const navigation = [
  { href: "/", label: "Jelajah anggaran", icon: Compass },
  { href: "/bandingkan", label: "Bandingkan daerah", icon: BarChart3 },
  { href: "/metodologi", label: "Metodologi & sumber", icon: BookOpen },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current =
    navigation.find((item) => item.href === pathname)?.label ??
    (pathname.startsWith("/daerah/")
      ? "Profil daerah"
      : "Halaman tidak ditemukan");
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="GovSight ID, beranda">
          <span className="brand-mark">
            <Landmark size={24} strokeWidth={1.8} />
          </span>
          <span>
            GovSight<span className="brand-second">ID</span>
            <small>Belanja publik, lebih terbuka.</small>
          </span>
        </Link>
        <div className="sidebar-section-label">Ruang eksplorasi</div>
        <nav className="side-nav" aria-label="Navigasi utama">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "nav-link active" : "nav-link"}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {pathname === href && <span className="active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-source">
          <div className="source-icon">
            <Database size={19} />
          </div>
          <strong>Angka yang bisa ditelusuri.</strong>
          <p>
            Setiap angka terhubung ke data terbuka DJPK Kementerian Keuangan.
          </p>
          <Link href="/metodologi">
            Kenali sumber data <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <ShieldCheck size={17} />
          <span>
            Terbuka untuk semua.
            <br />
            <small>Tanpa perlu membuat akun.</small>
          </span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <PanelLeftClose size={18} className="desktop-only" />
            <span className="desktop-only">Ruang data publik</span>
            <ChevronRight size={14} className="desktop-only" />
            <strong>{current}</strong>
          </div>
          <span className="prototype-badge">
            <FlaskConical size={14} />
            <span>Versi awal</span>
            <span className="badge-divider" />
            {regions.length} daerah
          </span>
        </header>
        <main id="main" className="main-content">
          {children}
        </main>
        <footer className="site-footer">
          <span>
            <Landmark size={15} /> GovSight ID{" "}
            <span className="footer-year">2026</span>
          </span>
          <p>Inisiatif independen. Bukan situs resmi pemerintah.</p>
          <a
            href="https://djpk.kemenkeu.go.id/portal/data/apbd"
            target="_blank"
            rel="noreferrer"
          >
            Sumber: DJPK Kemenkeu <ArrowUpRight size={13} />
          </a>
        </footer>
      </div>
    </div>
  );
}
