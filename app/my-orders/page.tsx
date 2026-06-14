"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Order = {
  id: string;
  productId?: string;
  productTitle?: string;
  amount?: number;
  buyerEmail?: string;
  sellerEmail?: string;
  status?: "pending_payment" | "paid" | "delivered" | "cancelled";
  createdAt?: string;
};

export default function MyOrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      await loadOrders(currentUser.uid);
    });

    return () => unsub();
  }, [router]);

  async function loadOrders(uid: string) {
    try {
      setLoading(true);

      const q = query(
        collection(db, "orders"),
        where("buyerId", "==", uid)
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Order, "id">),
      }));

      setOrders(data);
    } catch (error) {
      console.error("Siparişler çekilemedi:", error);
      alert("Siparişler çekilemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <div style={top}>
        <div>
          <h1 style={title}>Siparişlerim</h1>
          <p style={muted}>{user?.email}</p>
        </div>

        <Link href="/" style={backBtn}>
          Ana Sayfa
        </Link>
      </div>

      {loading && <p style={muted}>Siparişler yükleniyor...</p>}

      {!loading && orders.length === 0 && (
        <div style={empty}>Henüz siparişin yok.</div>
      )}

      <div style={grid}>
        {orders.map((order) => (
          <article key={order.id} style={card}>
            <span style={getStatusStyle(order.status)}>
              {getStatusLabel(order.status)}
            </span>

            <h3 style={{ margin: 0 }}>
              {order.productTitle || "Ürün yok"}
            </h3>

            <p style={muted}>Satıcı: {order.sellerEmail || "Yok"}</p>
            <p style={muted}>Tarih: {order.createdAt || "Yok"}</p>

            <strong style={price}>₺{order.amount || 0}</strong>

            {order.productId && (
              <Link href={`/listing/${order.productId}`} style={detailBtn}>
                İlanı Gör
              </Link>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

function getStatusLabel(status?: string) {
  if (status === "pending_payment") return "Ödeme Bekliyor";
  if (status === "paid") return "Ödendi";
  if (status === "delivered") return "Teslim Edildi";
  if (status === "cancelled") return "İptal Edildi";
  return "Durum Yok";
}

function getStatusStyle(status?: string): React.CSSProperties {
  const base: React.CSSProperties = {
    width: "fit-content",
    padding: "7px 11px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 13,
  };

  if (status === "paid") {
    return { ...base, background: "rgba(34,197,94,0.12)", color: "#22c55e" };
  }

  if (status === "delivered") {
    return { ...base, background: "rgba(56,189,248,0.12)", color: "#38bdf8" };
  }

  if (status === "cancelled") {
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
  maxWidth: 1200,
  margin: "0 auto 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 38,
  color: "#ffd400",
};

const muted: React.CSSProperties = {
  color: "#94a3b8",
};

const backBtn: React.CSSProperties = {
  color: "#05060f",
  background: "#ffd400",
  padding: "12px 18px",
  borderRadius: 12,
  fontWeight: 900,
  textDecoration: "none",
};

const empty: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: 20,
  borderRadius: 16,
  background: "#101827",
  color: "#94a3b8",
};

const grid: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
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
  gap: 14,
};

const price: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 30,
};

const detailBtn: React.CSSProperties = {
  height: 46,
  borderRadius: 12,
  border: "1px solid rgba(255,212,0,0.35)",
  color: "#ffd400",
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  fontWeight: 900,
};