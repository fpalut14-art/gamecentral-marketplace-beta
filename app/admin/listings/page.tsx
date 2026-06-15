"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, ProductStatus } from "@/types";
import { money } from "@/lib/format";

const tabs: { key: "all" | ProductStatus; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "pending", label: "Onay Bekleyen" },
  { key: "active", label: "Aktif" },
  { key: "rejected", label: "Reddedilen" },
];

export default function AdminListings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | ProductStatus>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, "products"));

      setProducts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[]
      );
    } catch (error) {
      console.error("İlanlar çekilemedi:", error);
      alert("İlanlar çekilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(product: Product, nextStatus: ProductStatus) {
    try {
      await updateDoc(doc(db, "products", product.id), {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });

      if (product.sellerId) {
        await addDoc(collection(db, "notifications"), {
          userId: product.sellerId,
          title:
            nextStatus === "active"
              ? "İlanın onaylandı"
              : nextStatus === "rejected"
              ? "İlanın reddedildi"
              : "İlanın askıya alındı",
          message: `${product.title || "İlan"} durumu: ${nextStatus}`,
          read: false,
          type: "listing",
          createdAt: new Date().toISOString(),
        });
      }

      await load();
    } catch (error) {
      console.error("İlan durumu güncellenemedi:", error);
      alert("İlan durumu güncellenemedi.");
    }
  }

  async function remove(product: Product) {
    const ok = confirm(`"${product.title || "Bu ilan"}" silinsin mi?`);

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "products", product.id));
      await load();
    } catch (error) {
      console.error("İlan silinemedi:", error);
      alert("İlan silinemedi.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    return products.filter((product) => {
      const tabMatch = activeTab === "all" || product.status === activeTab;

      const searchMatch =
        !q ||
        String(product.title || "").toLowerCase().includes(q) ||
        String(product.category || "").toLowerCase().includes(q) ||
        String(product.seller || "").toLowerCase().includes(q);

      return tabMatch && searchMatch;
    });
  }, [products, activeTab, search]);

  const pendingCount = products.filter((p) => p.status === "pending").length;
  const activeCount = products.filter((p) => p.status === "active").length;
  const rejectedCount = products.filter((p) => p.status === "rejected").length;

  return (
    <div>
      <section style={hero}>
        <div>
          <span style={eyebrow}>ADMIN LISTING CONTROL</span>
          <h1 style={title}>İlan Yönetimi</h1>
          <p style={muted}>
            Bekleyen, aktif ve reddedilen ilanları incele. Satıcıya otomatik
            bildirim gönder.
          </p>
        </div>

        <button type="button" onClick={load} style={refreshBtn}>
          {loading ? "Yükleniyor..." : "Yenile"}
        </button>
      </section>

      <section style={statGrid}>
        <MiniStat label="Toplam İlan" value={products.length} />
        <MiniStat label="Onay Bekleyen" value={pendingCount} />
        <MiniStat label="Aktif" value={activeCount} />
        <MiniStat label="Reddedilen" value={rejectedCount} />
      </section>

      <section style={toolbar}>
        <div style={tabsWrap}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={activeTab === tab.key ? tabActive : tabBtn}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İlan, kategori veya satıcı ara..."
          style={searchInput}
        />
      </section>

      {loading && <div style={empty}>İlanlar yükleniyor...</div>}

      {!loading && filteredProducts.length === 0 && (
        <div style={empty}>Bu filtreye uygun ilan bulunamadı.</div>
      )}

      <section style={grid}>
        {!loading &&
          filteredProducts.map((product) => {
            const productImage = product.imageUrl || product.imageBase64 || "";

            return (
              <article key={product.id} style={card}>
                <div style={imageBox}>
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.title || "İlan"}
                      style={image}
                    />
                  ) : (
                    <div style={placeholder}>GAMECENTRAL</div>
                  )}

                  <span style={getStatusStyle(product.status)}>
                    {getStatusLabel(product.status)}
                  </span>
                </div>

                <div style={body}>
                  <span style={category}>
                    {product.category || "Kategori yok"}
                  </span>

                  <h3 style={cardTitle}>
                    {product.title || "Başlıksız İlan"}
                  </h3>

                  <p style={seller}>
                    Satıcı: {product.seller || "Bilinmeyen satıcı"}
                  </p>

                  <strong style={price}>{money(product.price)}</strong>

                  {product.description && (
                    <p style={desc}>{product.description}</p>
                  )}

                  <div style={actions}>
                    <button
                      type="button"
                      onClick={() => changeStatus(product, "active")}
                      style={approveBtn}
                    >
                      Onayla
                    </button>

                    <button
                      type="button"
                      onClick={() => changeStatus(product, "rejected")}
                      style={rejectBtn}
                    >
                      Reddet
                    </button>

                    <button
                      type="button"
                      onClick={() => changeStatus(product, "pending")}
                      style={pendingBtn}
                    >
                      Askıya Al
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(product)}
                      style={deleteBtn}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={miniStat}>
      <span style={muted}>{label}</span>
      <strong style={miniNumber}>{value}</strong>
    </div>
  );
}

function getStatusLabel(status?: ProductStatus) {
  if (status === "active") return "Aktif";
  if (status === "rejected") return "Reddedildi";
  return "Bekliyor";
}

function getStatusStyle(status?: ProductStatus): React.CSSProperties {
  if (status === "active") {
    return {
      ...statusBadge,
      color: "#22c55e",
      background: "rgba(34,197,94,0.12)",
      border: "1px solid rgba(34,197,94,0.25)",
    };
  }

  if (status === "rejected") {
    return {
      ...statusBadge,
      color: "#ef4444",
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.25)",
    };
  }

  return {
    ...statusBadge,
    color: "#ffd400",
    background: "rgba(255,212,0,0.12)",
    border: "1px solid rgba(255,212,0,0.25)",
  };
}

const hero: React.CSSProperties = {
  padding: 28,
  borderRadius: 26,
  background:
    "linear-gradient(135deg, rgba(255,212,0,0.14), rgba(15,23,42,0.96))",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 20,
};

const eyebrow: React.CSSProperties = {
  color: "#ffd400",
  fontWeight: 900,
  letterSpacing: 1,
  fontSize: 12,
};

const title: React.CSSProperties = {
  margin: "10px 0 8px",
  fontSize: 40,
};

const muted: React.CSSProperties = {
  color: "#94a3b8",
};

const refreshBtn: React.CSSProperties = {
  height: 46,
  padding: "0 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,212,0,0.35)",
  background: "rgba(255,212,0,0.09)",
  color: "#ffd400",
  fontWeight: 900,
  cursor: "pointer",
};

const statGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 20,
};

const miniStat: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 8,
};

const miniNumber: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 30,
};

const toolbar: React.CSSProperties = {
  padding: 16,
  borderRadius: 20,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  marginBottom: 20,
};

const tabsWrap: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const tabBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.035)",
  color: "#cbd5e1",
  fontWeight: 900,
  cursor: "pointer",
};

const tabActive: React.CSSProperties = {
  ...tabBtn,
  background: "#ffd400",
  color: "#05060f",
};

const searchInput: React.CSSProperties = {
  height: 44,
  minWidth: 290,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#05060f",
  color: "white",
  padding: "0 14px",
  outline: "none",
  fontWeight: 800,
};

const empty: React.CSSProperties = {
  padding: 20,
  borderRadius: 18,
  background: "rgba(255,255,255,0.035)",
  color: "#94a3b8",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 18,
};

const card: React.CSSProperties = {
  borderRadius: 22,
  overflow: "hidden",
  background:
    "linear-gradient(180deg, rgba(16,24,39,0.96), rgba(7,10,18,0.96))",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
};

const imageBox: React.CSSProperties = {
  height: 190,
  background:
    "radial-gradient(circle, rgba(255,212,0,0.16), transparent 60%), #090b11",
  display: "grid",
  placeItems: "center",
  color: "#ffd400",
  fontWeight: 900,
  position: "relative",
  overflow: "hidden",
};

const image: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const placeholder: React.CSSProperties = {
  color: "#ffd400",
  letterSpacing: 1,
};

const statusBadge: React.CSSProperties = {
  position: "absolute",
  top: 14,
  left: 14,
  padding: "8px 11px",
  borderRadius: 999,
  fontWeight: 900,
  fontSize: 12,
  backdropFilter: "blur(10px)",
};

const body: React.CSSProperties = {
  padding: 18,
};

const category: React.CSSProperties = {
  color: "#38bdf8",
  fontWeight: 900,
  fontSize: 13,
};

const cardTitle: React.CSSProperties = {
  margin: "10px 0 8px",
  fontSize: 22,
};

const seller: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 700,
};

const price: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 28,
  display: "block",
  marginTop: 10,
};

const desc: React.CSSProperties = {
  color: "#cbd5e1",
  lineHeight: 1.5,
  minHeight: 44,
};

const actions: React.CSSProperties = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const baseBtn: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "none",
  fontWeight: 900,
  cursor: "pointer",
};

const approveBtn: React.CSSProperties = {
  ...baseBtn,
  background: "#22c55e",
  color: "white",
};

const rejectBtn: React.CSSProperties = {
  ...baseBtn,
  background: "#ef4444",
  color: "white",
};

const pendingBtn: React.CSSProperties = {
  ...baseBtn,
  background: "rgba(255,212,0,0.12)",
  color: "#ffd400",
  border: "1px solid rgba(255,212,0,0.25)",
};

const deleteBtn: React.CSSProperties = {
  ...baseBtn,
  background: "rgba(239,68,68,0.08)",
  color: "#ef4444",
  border: "1px solid rgba(239,68,68,0.25)",
};
