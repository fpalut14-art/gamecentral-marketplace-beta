"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserProfile = {
  email?: string;
  role?: "admin" | "seller" | "user";
  sellerStatus?: "none" | "pending" | "approved" | "rejected";
  banned?: boolean;
};

type Product = {
  id: string;
  title?: string;
  price?: number;
  status?: string;
  category?: string;
};

type Order = {
  id: string;
  productTitle?: string;
  amount?: number;
  status?: string;
  buyerEmail?: string;
};

export default function SellerDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSellerData(uid: string) {
    const productsQuery = query(
      collection(db, "products"),
      where("sellerId", "==", uid)
    );

    const ordersQuery = query(
      collection(db, "orders"),
      where("sellerId", "==", uid)
    );

    const [productsSnap, ordersSnap] = await Promise.all([
      getDocs(productsQuery),
      getDocs(ordersQuery),
    ]);

    setProducts(
      productsSnap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Product, "id">),
      }))
    );

    setOrders(
      ordersSnap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Order, "id">),
      }))
    );
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        router.push("/profile");
        return;
      }

      const data = userSnap.data() as UserProfile;

      if (data.banned) {
        alert("Hesabınız banlı.");
        router.push("/");
        return;
      }

      if (data.role !== "seller" && data.role !== "admin") {
        alert("Satıcı paneline erişim yetkiniz yok.");
        router.push("/profile");
        return;
      }

      setUser(currentUser);
      setProfile(data);
      await loadSellerData(currentUser.uid);
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const activeProducts = products.filter((p) => p.status === "active").length;
  const pendingProducts = products.filter((p) => p.status === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((sum, order) => sum + Number(order.amount || 0), 0);

  if (loading) {
    return <main style={page}>Satıcı paneli yükleniyor...</main>;
  }

  return (
    <main style={page}>
      <div style={top}>
        <div>
          <h1 style={title}>Satıcı Paneli</h1>
          <p style={muted}>{profile?.email || user?.email}</p>
        </div>

        <div style={topActions}>
          <Link href="/" style={outlineBtn}>Ana Sayfa</Link>
          <Link href="/create" style={primaryBtn}>Yeni İlan</Link>
        </div>
      </div>

      <section style={statsGrid}>
        <div style={statCard}>
          <span style={muted}>Toplam İlan</span>
          <strong style={statNumber}>{products.length}</strong>
        </div>

        <div style={statCard}>
          <span style={muted}>Aktif İlan</span>
          <strong style={statNumber}>{activeProducts}</strong>
        </div>

        <div style={statCard}>
          <span style={muted}>Onay Bekleyen</span>
          <strong style={statNumber}>{pendingProducts}</strong>
        </div>

        <div style={statCard}>
          <span style={muted}>Gelir</span>
          <strong style={statNumber}>₺{totalRevenue}</strong>
        </div>
      </section>

      <section style={section}>
        <h2 style={sectionTitle}>İlanlarım</h2>

        {products.length === 0 && (
          <div style={empty}>Henüz ilan oluşturmadın.</div>
        )}

        <div style={grid}>
          {products.map((product) => (
            <article key={product.id} style={card}>
              <span style={statusBadge(product.status)}>
                {product.status || "status yok"}
              </span>

              <h3>{product.title || "Başlıksız ilan"}</h3>
              <p style={muted}>Kategori: {product.category || "Yok"}</p>
              <strong style={price}>₺{product.price || 0}</strong>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <h2 style={sectionTitle}>Satışlarım</h2>

        {orders.length === 0 && (
          <div style={empty}>Henüz satış/sipariş yok.</div>
        )}

        <div style={grid}>
          {orders.map((order) => (
            <article key={order.id} style={card}>
              <span style={statusBadge(order.status)}>
                {order.status || "status yok"}
              </span>

              <h3>{order.productTitle || "Ürün yok"}</h3>
              <p style={muted}>Alıcı: {order.buyerEmail || "Yok"}</p>
              <strong style={price}>₺{order.amount || 0}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function statusBadge(status?: string): React.CSSProperties {
  const base: React.CSSProperties = {
    width: "fit-content",
    padding: "7px 11px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 13,
  };

  if (status === "active" || status === "paid" || status === "delivered") {
    return { ...base, background: "rgba(34,197,94,0.12)", color: "#22c55e" };
  }

  if (status === "rejected" || status === "cancelled") {
    return { ...base, background: "rgba(239,68,68,0.12)", color: "#ef4444" };
  }

  return { ...base, background: "rgba(255,212,0,0.12)", color: "#ffd400" };
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#05060f",
  color: "white",
  padding: 40,
};

const top: React.CSSProperties = {
  maxWidth: 1300,
  margin: "0 auto 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const topActions: React.CSSProperties = {
  display: "flex",
  gap: 12,
};

const title: React.CSSProperties = {
  fontSize: 38,
  color: "#ffd400",
  margin: 0,
};

const muted: React.CSSProperties = {
  color: "#94a3b8",
};

const primaryBtn: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  background: "#ffd400",
  color: "#05060f",
  textDecoration: "none",
  fontWeight: 900,
};

const outlineBtn: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid rgba(255,212,0,0.35)",
  color: "#ffd400",
  textDecoration: "none",
  fontWeight: 900,
};

const statsGrid: React.CSSProperties = {
  maxWidth: 1300,
  margin: "0 auto 30px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};

const statCard: React.CSSProperties = {
  padding: 22,
  borderRadius: 18,
  background: "#101827",
  border: "1px solid #263244",
  display: "grid",
  gap: 10,
};

const statNumber: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 34,
};

const section: React.CSSProperties = {
  maxWidth: 1300,
  margin: "0 auto 30px",
};

const sectionTitle: React.CSSProperties = {
  color: "#ffd400",
  marginBottom: 16,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 18,
};

const card: React.CSSProperties = {
  padding: 22,
  borderRadius: 18,
  background: "#101827",
  border: "1px solid #263244",
  display: "grid",
  gap: 12,
};

const empty: React.CSSProperties = {
  padding: 18,
  borderRadius: 16,
  background: "#101827",
  color: "#94a3b8",
};

const price: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 28,
};