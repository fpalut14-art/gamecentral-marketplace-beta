"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Stats = {
  users: number;
  activeProducts: number;
  pendingProducts: number;
  rejectedProducts: number;
  ads: number;
  orders: number;
  volume: number;
};

type ActivityItem = {
  id: string;
  type: "product" | "order" | "ad" | "user";
  title: string;
  status?: string;
  createdAt?: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    activeProducts: 0,
    pendingProducts: 0,
    rejectedProducts: 0,
    ads: 0,
    orders: 0,
    volume: 0,
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboardStats() {
    try {
      setLoading(true);

      const [usersSnap, productsSnap, adsSnap, ordersSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "ads")),
        getDocs(collection(db, "orders")),
      ]);

      const products = productsSnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as any[];

      const orders = ordersSnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as any[];

      const ads = adsSnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as any[];

      const users = usersSnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as any[];

      const activeProducts = products.filter((p) => p.status === "active").length;
      const pendingProducts = products.filter((p) => p.status === "pending").length;
      const rejectedProducts = products.filter((p) => p.status === "rejected").length;

      const volume = orders.reduce((total, order) => {
        return total + Number(order.amount || 0);
      }, 0);

      const recentProducts: ActivityItem[] = products.slice(0, 5).map((p) => ({
        id: p.id,
        type: "product",
        title: p.title || "Başlıksız ilan",
        status: p.status,
        createdAt: p.createdAt,
      }));

      const recentOrders: ActivityItem[] = orders.slice(0, 5).map((o) => ({
        id: o.id,
        type: "order",
        title: o.productTitle || "Sipariş",
        status: o.status,
        createdAt: o.createdAt,
      }));

      const recentAds: ActivityItem[] = ads.slice(0, 3).map((a) => ({
        id: a.id,
        type: "ad",
        title: a.title || a.brand || "Reklam",
        status: a.status,
        createdAt: a.createdAt,
      }));

      const recentUsers: ActivityItem[] = users.slice(0, 3).map((u) => ({
        id: u.id,
        type: "user",
        title: u.email || u.name || "Kullanıcı",
        status: u.role,
        createdAt: u.createdAt,
      }));

      setActivities(
        [...recentProducts, ...recentOrders, ...recentAds, ...recentUsers]
          .sort((a, b) =>
            String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
          )
          .slice(0, 10)
      );

      setStats({
        users: usersSnap.size,
        activeProducts,
        pendingProducts,
        rejectedProducts,
        ads: adsSnap.size,
        orders: ordersSnap.size,
        volume,
      });
    } catch (error) {
      console.error("Dashboard veri hatası:", error);
      alert("Dashboard verileri çekilemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const approvalRate = useMemo(() => {
    const total =
      stats.activeProducts + stats.pendingProducts + stats.rejectedProducts;

    if (total === 0) return 0;

    return Math.round((stats.activeProducts / total) * 100);
  }, [stats]);

  return (
    <div>
      <section style={hero}>
        <div>
          <span style={eyebrow}>ADMIN OVERVIEW</span>
          <h1 style={title}>GameCentral Yönetim Merkezi</h1>
          <p style={muted}>
            Kullanıcıları, ilanları, siparişleri, reklamları ve sistem akışını
            tek panelden takip et.
          </p>
        </div>

        <div style={heroActions}>
          <Link href="/admin/listings" style={primaryAction}>
            Bekleyen İlanlar
          </Link>

          <button onClick={loadDashboardStats} style={refresh}>
            {loading ? "Yükleniyor..." : "Verileri Yenile"}
          </button>
        </div>
      </section>

      <section style={grid}>
        <StatCard label="Toplam Kullanıcı" value={stats.users} icon="👥" />
        <StatCard label="Aktif İlan" value={stats.activeProducts} icon="📦" />
        <StatCard label="Onay Bekleyen" value={stats.pendingProducts} icon="⏳" />
        <StatCard label="Reddedilen İlan" value={stats.rejectedProducts} icon="🚫" />
        <StatCard label="Reklam Başvurusu" value={stats.ads} icon="📢" />
        <StatCard label="Sipariş Talebi" value={stats.orders} icon="💳" />
        <StatCard label="Beta Hacim" value={`₺${stats.volume}`} icon="💰" />
        <StatCard label="Onay Oranı" value={`%${approvalRate}`} icon="📈" />
      </section>

      <section style={lowerGrid}>
        <div style={panel}>
          <div style={panelHead}>
            <div>
              <h2 style={panelTitle}>Hızlı Yönetim</h2>
              <p style={muted}>En sık kullanılan admin işlemleri.</p>
            </div>
          </div>

          <div style={quickGrid}>
            <QuickLink href="/admin/users" title="Kullanıcıları Yönet" desc="Rol, ban ve kullanıcı takibi." />
            <QuickLink href="/admin/listings" title="İlanları İncele" desc="Bekleyen, aktif ve reddedilen ilanlar." />
            <QuickLink href="/admin/orders" title="Siparişleri Gör" desc="Beta işlem ve talep kayıtları." />
            <QuickLink href="/admin/ads" title="Reklamları Yönet" desc="Slider, banner ve partner slotları." />
            <QuickLink href="/admin/reports" title="Raporları İncele" desc="Şikayet ve güvenlik bildirimleri." />
            <QuickLink href="/admin/logs" title="Sistem Logları" desc="Admin aksiyon ve olay kayıtları." />
          </div>
        </div>

        <div style={panel}>
          <div style={panelHead}>
            <div>
              <h2 style={panelTitle}>Son Hareketler</h2>
              <p style={muted}>Son ürün, sipariş, reklam ve kullanıcı kayıtları.</p>
            </div>
          </div>

          <div style={activityList}>
            {loading && <div style={empty}>Veriler yükleniyor...</div>}

            {!loading && activities.length === 0 && (
              <div style={empty}>Henüz hareket yok.</div>
            )}

            {!loading &&
              activities.map((item) => (
                <div key={`${item.type}-${item.id}`} style={activityItem}>
                  <div style={activityIcon}>{getActivityIcon(item.type)}</div>

                  <div style={{ minWidth: 0 }}>
                    <strong style={activityTitle}>{item.title}</strong>
                    <p style={activityMeta}>
                      {getActivityLabel(item.type)} • {item.status || "durum yok"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div style={card}>
      <div style={cardTop}>
        <span style={statIcon}>{icon}</span>
        <span style={labelStyle}>{label}</span>
      </div>

      <strong style={number}>{value}</strong>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} style={quickLink}>
      <strong>{title}</strong>
      <span>{desc}</span>
    </Link>
  );
}

function getActivityIcon(type: ActivityItem["type"]) {
  if (type === "product") return "📦";
  if (type === "order") return "💳";
  if (type === "ad") return "📢";
  return "👤";
}

function getActivityLabel(type: ActivityItem["type"]) {
  if (type === "product") return "İlan";
  if (type === "order") return "Sipariş";
  if (type === "ad") return "Reklam";
  return "Kullanıcı";
}

const hero: React.CSSProperties = {
  padding: 28,
  borderRadius: 26,
  background:
    "linear-gradient(135deg, rgba(255,212,0,0.14), rgba(15,23,42,0.96))",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  gap: 24,
  alignItems: "center",
  marginBottom: 24,
};

const eyebrow: React.CSSProperties = {
  color: "#ffd400",
  fontWeight: 900,
  letterSpacing: 1,
  fontSize: 12,
};

const title: React.CSSProperties = {
  fontSize: 40,
  margin: "10px 0 8px",
};

const muted: React.CSSProperties = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const heroActions: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const primaryAction: React.CSSProperties = {
  height: 46,
  padding: "0 16px",
  borderRadius: 14,
  background: "#ffd400",
  color: "#05060f",
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  fontWeight: 900,
};

const refresh: React.CSSProperties = {
  height: 46,
  padding: "0 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,212,0,0.35)",
  background: "rgba(255,212,0,0.09)",
  color: "#ffd400",
  fontWeight: 900,
  cursor: "pointer",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};

const card: React.CSSProperties = {
  padding: 22,
  borderRadius: 20,
  background:
    "linear-gradient(180deg, rgba(16,24,39,0.96), rgba(7,10,18,0.96))",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 14,
  boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
};

const cardTop: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const statIcon: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 14,
  background: "rgba(255,212,0,0.1)",
  display: "grid",
  placeItems: "center",
};

const labelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 800,
};

const number: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 36,
};

const lowerGrid: React.CSSProperties = {
  marginTop: 24,
  display: "grid",
  gridTemplateColumns: "1.25fr 0.75fr",
  gap: 20,
};

const panel: React.CSSProperties = {
  padding: 24,
  borderRadius: 24,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
};

const panelHead: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
};

const panelTitle: React.CSSProperties = {
  color: "#ffd400",
  margin: 0,
};

const quickGrid: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const quickLink: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "white",
  textDecoration: "none",
  display: "grid",
  gap: 8,
};

const activityList: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gap: 12,
};

const activityItem: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const activityIcon: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  background: "rgba(255,212,0,0.1)",
  display: "grid",
  placeItems: "center",
  flex: "0 0 auto",
};

const activityTitle: React.CSSProperties = {
  color: "white",
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const activityMeta: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#94a3b8",
  fontSize: 13,
};

const empty: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.035)",
  color: "#94a3b8",
};
