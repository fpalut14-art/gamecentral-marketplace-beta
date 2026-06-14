"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, "orders"));

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

  async function updateStatus(id: string, status: Order["status"]) {
    await updateDoc(doc(db, "orders", id), {
      status,
      updatedAt: new Date().toISOString(),
    });

    loadOrders();
  }

  async function removeOrder(id: string) {
    const ok = confirm("Bu siparişi silmek istiyor musun?");
    if (!ok) return;

    await deleteDoc(doc(db, "orders", id));
    loadOrders();
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div>
      <div style={top}>
        <div>
          <h1 style={title}>Sipariş Yönetimi</h1>
          <p style={muted}>Ödeme, teslimat ve iptal süreçlerini yönet.</p>
        </div>

        <button onClick={loadOrders} style={refresh}>
          Yenile
        </button>
      </div>

      {loading && <p style={muted}>Siparişler yükleniyor...</p>}

      <div style={grid}>
        {orders.map((order) => (
          <article key={order.id} style={card}>
            <span style={getStatusStyle(order.status)}>
              {order.status || "status yok"}
            </span>

            <h3 style={{ margin: 0 }}>{order.productTitle || "Ürün yok"}</h3>

            <p style={muted}>Alıcı: {order.buyerEmail || "Yok"}</p>
            <p style={muted}>Satıcı: {order.sellerEmail || "Yok"}</p>

            <strong style={price}>₺{order.amount || 0}</strong>

            <div style={actions}>
              <button onClick={() => updateStatus(order.id, "paid")} style={approveBtn}>
                Ödendi
              </button>

              <button onClick={() => updateStatus(order.id, "delivered")} style={deliverBtn}>
                Teslim Edildi
              </button>

              <button onClick={() => updateStatus(order.id, "cancelled")} style={cancelBtn}>
                İptal Et
              </button>

              <button onClick={() => removeOrder(order.id)} style={deleteBtn}>
                Sil
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function getStatusStyle(status?: string): React.CSSProperties {
  const base: React.CSSProperties = {
    width: "fit-content",
    padding: "7px 10px",
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

const top: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 28,
};

const title: React.CSSProperties = {
  fontSize: 34,
  margin: 0,
};

const muted: React.CSSProperties = {
  color: "#94a3b8",
};

const refresh: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid rgba(255,212,0,0.35)",
  background: "rgba(255,212,0,0.09)",
  color: "#ffd400",
  fontWeight: 900,
  cursor: "pointer",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
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

const actions: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const approveBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(34,197,94,0.35)",
  background: "rgba(34,197,94,0.1)",
  color: "#22c55e",
  fontWeight: 900,
  cursor: "pointer",
};

const deliverBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(56,189,248,0.35)",
  background: "rgba(56,189,248,0.1)",
  color: "#38bdf8",
  fontWeight: 900,
  cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(239,68,68,0.1)",
  color: "#ef4444",
  fontWeight: 900,
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(148,163,184,0.08)",
  color: "#cbd5e1",
  fontWeight: 900,
  cursor: "pointer",
};