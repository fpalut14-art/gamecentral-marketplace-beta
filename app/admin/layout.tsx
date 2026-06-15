"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, isAdmin } from "@/lib/guards";

const navItems = [
  ["/admin", "📊", "Dashboard"],
  ["/admin/users", "👥", "Kullanıcılar"],
  ["/admin/seller-requests", "🛒", "Satıcı Başvuruları"],
  ["/admin/listings", "📦", "İlan Yönetimi"],
  ["/admin/orders", "💳", "Siparişler"],
  ["/admin/ads", "📢", "Reklam Yönetimi"],
  ["/admin/reports", "🚨", "Raporlar"],
  ["/admin/support", "🎧", "Canlı Destek"],
  ["/admin/logs", "🧠", "Sistem Logları"],
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const profile = await getUserProfile(user);

      if (!isAdmin(profile)) {
        router.push("/");
        return;
      }

      setChecking(false);
    });

    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <main style={checkingPage}>
        <div style={checkingCard}>
          <h1 style={{ color: "#ffd400", margin: 0 }}>GAMECENTRAL</h1>
          <p style={{ color: "#94a3b8" }}>Admin yetkisi kontrol ediliyor...</p>
        </div>
      </main>
    );
  }

  return (
    <div style={shell}>
      <aside style={sidebar}>
        <div>
          <Link href="/admin" style={brand}>
            GAME<span style={{ color: "#ffd400" }}>CENTRAL</span>
          </Link>

          <div style={adminBadge}>ADMIN COMMAND CENTER</div>

          <nav style={nav}>
            {navItems.map(([href, icon, label]) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  style={active ? navItemActive : navItem}
                >
                  <span style={navIcon}>{icon}</span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={sideBottom}>
          <div style={systemBox}>
            <small style={{ color: "#94a3b8" }}>Sistem Durumu</small>
            <strong style={{ color: "#22c55e" }}>Aktif</strong>
            <span style={{ color: "#64748b", fontSize: 12 }}>
              Beta panel çalışıyor
            </span>
          </div>

          <Link href="/" style={siteBtn}>
            Ana Siteye Dön
          </Link>
        </div>
      </aside>

      <section style={workspace}>
        <header style={topbar}>
          <div>
            <span style={eyebrow}>GAMECENTRAL ADMIN</span>
            <h1 style={pageTitle}>{getPageTitle(pathname || "/admin")}</h1>
          </div>

          <div style={topActions}>
            <Link href="/" style={ghostBtn}>
              Siteyi Gör
            </Link>

            <button
              type="button"
              style={refreshBtn}
              onClick={() => window.location.reload()}
            >
              Yenile
            </button>
          </div>
        </header>

        <main style={content}>{children}</main>
      </section>
    </div>
  );
}

function getPageTitle(pathname: string) {
  if (pathname.includes("/users")) return "Kullanıcı Yönetimi";
  if (pathname.includes("/seller-requests")) return "Satıcı Başvuruları";
  if (pathname.includes("/listings")) return "İlan Yönetimi";
  if (pathname.includes("/orders")) return "Sipariş Yönetimi";
  if (pathname.includes("/ads")) return "Reklam Yönetimi";
  if (pathname.includes("/reports")) return "Rapor Merkezi";
  if (pathname.includes("/support")) return "Destek Merkezi";
  if (pathname.includes("/logs")) return "Sistem Logları";
  return "Yönetim Paneli";
}

const checkingPage: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(255,212,0,0.12), transparent 30%), #05060f",
  color: "white",
  display: "grid",
  placeItems: "center",
};

const checkingCard: React.CSSProperties = {
  padding: 30,
  borderRadius: 24,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  textAlign: "center",
};

const shell: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(255,212,0,0.08), transparent 26%), #03040a",
  color: "white",
  display: "grid",
  gridTemplateColumns: "310px minmax(0, 1fr)",
};

const sidebar: React.CSSProperties = {
  minHeight: "100vh",
  position: "sticky",
  top: 0,
  alignSelf: "start",
  padding: 24,
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(3,4,10,0.98))",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const brand: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: 1,
};

const adminBadge: React.CSSProperties = {
  marginTop: 12,
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: 999,
  color: "#ffd400",
  background: "rgba(255,212,0,0.08)",
  border: "1px solid rgba(255,212,0,0.2)",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1,
};

const nav: React.CSSProperties = {
  marginTop: 34,
  display: "grid",
  gap: 10,
};

const navItem: React.CSSProperties = {
  height: 50,
  borderRadius: 15,
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "0 16px",
  color: "#cbd5e1",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.04)",
  textDecoration: "none",
  fontWeight: 900,
};

const navItemActive: React.CSSProperties = {
  ...navItem,
  color: "#05060f",
  background: "linear-gradient(135deg, #ffd400, #ffb800)",
  boxShadow: "0 12px 32px rgba(255,212,0,0.16)",
};

const navIcon: React.CSSProperties = {
  width: 24,
  textAlign: "center",
};

const sideBottom: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const systemBox: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  display: "grid",
  gap: 5,
};

const siteBtn: React.CSSProperties = {
  height: 52,
  borderRadius: 15,
  background: "#ffd400",
  color: "#05060f",
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  fontWeight: 900,
};

const workspace: React.CSSProperties = {
  minWidth: 0,
  padding: 26,
};

const topbar: React.CSSProperties = {
  minHeight: 96,
  padding: "22px 26px",
  borderRadius: 24,
  background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(3,4,10,0.96))",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
};

const eyebrow: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1,
};

const pageTitle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 34,
  color: "white",
};

const topActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const ghostBtn: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  color: "#cbd5e1",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontWeight: 900,
};

const refreshBtn: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,212,0,0.28)",
  background: "rgba(255,212,0,0.08)",
  color: "#ffd400",
  fontWeight: 900,
  cursor: "pointer",
};

const content: React.CSSProperties = {
  minWidth: 0,
};
