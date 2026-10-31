"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Compass,
  Database,
  Landmark,
  Lock,
  Menu,
  Scale,
  X,
} from "lucide-react";
import { regions } from "@/lib/regions";

const navigation = [
  {
    href: "/",
    label: "Jelajah anggaran",
    desc: "Daftar dan ringkasan 10 pemda",
    icon: Compass,
  },
  {
    href: "/bandingkan",
    label: "Bandingkan daerah",
    desc: "Dua sampai tiga daerah berdampingan",
    icon: Scale,
  },
  {
    href: "/metodologi",
    label: "Metodologi & sumber",
    desc: "Rumus, batas tafsir, berkas asli",
    icon: BookOpen,
  },
];

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="GovSight ID, beranda"
      onClick={onNavigate}
    >
      <span className="brand__mark">
        <Landmark strokeWidth={1.9} />
      </span>
      <span>
        <span className="brand__name">
          GovSight <span>ID</span>
        </span>
        <span className="brand__tag">Belanja publik, lebih terbuka</span>
      </span>
    </Link>
  );
}

function Navigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="nav-group" aria-label="Navigasi utama">
      <p className="nav-group__label">Ruang data</p>
      {navigation.map(({ href, label, desc, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={active ? "nav-item is-active" : "nav-item"}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={17} strokeWidth={1.9} />
            <span>
              <span className="nav-item__label">{label}</span>
              <span className="nav-item__desc">{desc}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const current =
    navigation.find((item) => item.href === pathname)?.label ??
    (pathname.startsWith("/daerah/")
      ? "Profil daerah"
      : "Halaman tidak ditemukan");

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>

      <aside className="rail">
        <Brand />
        <Navigation pathname={pathname} />
        <span className="rail__spacer" />
        <div className="rail-card">
          <p className="rail-card__title">
            <Database size={15} /> Angka yang bisa ditelusuri
          </p>
          <p>
            Setiap angka di sini berasal dari data terbuka DJPK Kementerian
            Keuangan, lengkap dengan berkas aslinya.
          </p>
          <Link href="/metodologi">
            Kenali sumber data <ArrowUpRight size={13} />
          </Link>
        </div>
        <p className="rail__foot">
          <Lock size={13} />
          <span>
            Terbuka untuk semua, tanpa akun.
            <br />
            Inisiatif independen.
          </span>
        </p>
      </aside>

      <div
        className={menuOpen ? "drawer is-open" : "drawer"}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="drawer__scrim"
          tabIndex={-1}
          aria-label="Tutup navigasi"
          onClick={() => setMenuOpen(false)}
        />
        <div className="drawer__panel" role="dialog" aria-label="Navigasi">
          <div className="drawer__top">
            <Brand onNavigate={() => setMenuOpen(false)} />
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup navigasi"
            >
              <X size={18} />
            </button>
          </div>
          <Navigation
            pathname={pathname}
            onNavigate={() => setMenuOpen(false)}
          />
          <span className="rail__spacer" />
          <div className="rail-card">
            <p className="rail-card__title">
              <Database size={15} /> Angka yang bisa ditelusuri
            </p>
            <p>Sumber: data terbuka DJPK Kementerian Keuangan.</p>
          </div>
        </div>
      </div>

      <div className="shell">
        <header className="topbar">
          <div className="crumb">
            <button
              type="button"
              className="menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Buka navigasi"
              aria-expanded={menuOpen}
            >
              <Menu size={18} />
            </button>
            <span className="muted">Data publik</span>
            <ChevronRight size={14} />
            <strong>{current}</strong>
          </div>
          <div className="topbar__right">
            <span className="chip chip--sunk">
              Pratinjau · {regions.length} daerah
            </span>
          </div>
        </header>

        <main id="main" className="content">
          {children}
        </main>

        <footer className="site-foot">
          <span className="site-foot__brand">
            <Landmark size={14} /> GovSight ID 2026
          </span>
          <p>Inisiatif independen. Bukan situs resmi pemerintah.</p>
          <a
            href="https://djpk.kemenkeu.go.id/portal/data/apbd"
            target="_blank"
            rel="noreferrer"
          >
            Sumber: DJPK Kemenkeu <ArrowUpRight size={12} />
          </a>
        </footer>
      </div>
    </div>
  );
}
