"use client";

import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  title?: string;
  price?: number;
  category?: string;
  status?: "pending" | "active" | "rejected";
  seller?: string;
  sellerId?: string;
  createdAt?: string;
  imageBase64?: string;
};

export default function AdminListingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, "products"));

      const data = snap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Product, "id">),
      }));

      setProducts(data);
    } catch (error) {
      console.error("İlanlar çekilemedi:", error);
      alert("İlanlar çekilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function createNotification(
    userId: string,
    title: string,
    message: string
  ) {
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      type: "listing",
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  async function updateStatus(
    id: string,
    status: "pending" | "active" | "rejected"
  ) {
    try {
      const product = products.find((item) => item.id === id);

      await updateDoc(doc(db, "products", id), {
        status,
        updatedAt: new Date().toISOString(),
      });

      if (product?.sellerId) {
        const title =
          status === "active"
            ? "İlanın onaylandı"
            : status === "rejected"
            ? "İlanın reddedildi"
            : "İlanın askıya alındı";

        const message = `${product.title || "İlan"} durumu güncellendi: ${status}`;

        await createNotification(product.sellerId, title, message);
      }

      await loadProducts();
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
      alert("İlan durumu güncellenemedi.");
    }
  }

  async function removeProduct(id: string) {
    const ok = confirm("Bu ilanı kalıcı olarak silmek istiyor musun?");
    if (!ok) return;

    try {
      const product = products.find((item) => item.id === id);

      await deleteDoc(doc(db, "products", id));

      if (product?.sellerId) {
        await createNotification(
          product.sellerId,
          "İlanın silindi",
          `${product.title || "İlan"} admin tarafından silindi.`
        );
      }

      await loadProducts();
    } catch (error) {
      console.error("İlan silme hatası:", error);
      alert("İlan silinemedi.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <div style={top}>
        <div>
          <h1 style={title}>İlan Yönetimi</h1>
          <p style={muted}>
            İlanları onayla, reddet, askıya al veya sil.
          </p>
        </div>

        <button onClick={loadProducts} style={refresh}>
          Yenile
        </button>
      </div>

      {loading && <p style={muted}>İlanlar yükleniyor...</p>}

      {!loading && products.length === 0 && (
        <div style={empty}>Henüz ilan yok.</div>
      )}

      <div style={grid}>
        {products.map((product) => (
          <article key={product.id} style={card}>
            <div style={imageBox}>
              {product.imageBase64 ? (
                <img
                  src={product.imageBase64}
                  alt={product.title || "İlan"}
                  style={image}
                />
              ) : (
                "GAMECENTRAL"
              )}
            </div>

            <span style={getStatusStyle(product.status)}>
              {getStatusLabel(product.status)}
            </span>

            <h3 style={{ margin: 0 }}>
              {product.title || "Başlıksız İlan"}
            </h3>

            <p style={muted}>Kategori: {product.category || "Yok"}</p>
            <p style={muted}>Satıcı: {product.seller || "Bilinmiyor"}</p>
            <p style={muted}>Seller ID: {product.sellerId || "Yok"}</p>

            <strong style={price}>₺{product.price || 0}</strong>

            <div style={actions}>
              <button
                onClick={() => updateStatus(product.id, "active")}
                style={approveBtn}
              >
                Onayla
              </button>

              <button
                onClick={() => updateStatus(product.id, "rejected")}
                style={rejectBtn}
              >
                Reddet
              </button>

              <button
                onClick={() => updateStatus(product.id, "pending")}
                style={pendingBtn}
              >
                Askıya Al
              </button>

              <button
                onClick={() => removeProduct(product.id)}
                style={deleteBtn}
              >
                Sil
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function getStatusLabel(status?: string) {
  if (status === "active") return "Aktif";
  if (status === "rejected") return "Reddedildi";
  if (status === "pending") return "Onay Bekliyor";
  return "Durum Yok";
}

function getStatusStyle(status?: string): React.CSSProperties {
  const base: React.CSSProperties = {
    width: "fit-content",
    padding: "7px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 13,
  };

  if (status === "active") {
    return {
      ...base,
      background: "rgba(34,197,94,0.12)",
      color: "#22c55e",
    };
  }

  if (status === "rejected") {
    return {
      ...base,
      background: "rgba(239,68,68,0.12)",
      color: "#ef4444",
    };
  }

  return {
    ...base,
    background: "rgba(255,212,0,0.12)",
    color: "#ffd400",
  };
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

const empty: React.CSSProperties = {
  padding: 20,
  borderRadius: 16,
  background: "#101827",
  color: "#94a3b8",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
};

const card: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "#101827",
  border: "1px solid #263244",
  display: "grid",
  gap: 14,
};

const imageBox: React.CSSProperties = {
  height: 190,
  borderRadius: 16,
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
  background:
    "radial-gradient(circle, rgba(255,212,0,0.16), transparent 60%), #090b11",
  color: "rgba(255,212,0,0.55)",
  fontWeight: 900,
};

const image: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const price: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 28,
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

const rejectBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(239,68,68,0.1)",
  color: "#ef4444",
  fontWeight: 900,
  cursor: "pointer",
};

const pendingBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,212,0,0.35)",
  background: "rgba(255,212,0,0.1)",
  color: "#ffd400",
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