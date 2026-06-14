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

type AdRequest = {
  id: string;
  brand?: string;
  title?: string;
  slot?: string;
  link?: string;
  status?: "pending" | "active" | "rejected";
  createdAt?: string;
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAds() {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, "ads"));

      const data = snap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<AdRequest, "id">),
      }));

      setAds(data);
    } catch (error) {
      console.error("Reklamlar çekilemedi:", error);
      alert("Reklam başvuruları çekilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "active" | "rejected" | "pending") {
    await updateDoc(doc(db, "ads", id), {
      status,
      updatedAt: new Date().toISOString(),
    });

    loadAds();
  }

  async function removeAd(id: string) {
    const ok = confirm("Bu reklam başvurusunu silmek istiyor musun?");
    if (!ok) return;

    await deleteDoc(doc(db, "ads", id));
    loadAds();
  }

  useEffect(() => {
    loadAds();
  }, []);

  return (
    <div>
      <div style={top}>
        <div>
          <h1 style={title}>Reklam Yönetimi</h1>
          <p style={muted}>Reklam başvurularını onayla, reddet veya sil.</p>
        </div>

        <button onClick={loadAds} style={refresh}>
          Yenile
        </button>
      </div>

      {loading && <p style={muted}>Reklamlar yükleniyor...</p>}

      <div style={grid}>
        {ads.map((ad) => (
          <article key={ad.id} style={card}>
            <span style={getStatusStyle(ad.status)}>
              {ad.status || "pending"}
            </span>

            <h3 style={{ margin: 0 }}>{ad.title || "Başlıksız reklam"}</h3>

            <p style={muted}>Marka: {ad.brand || "Yok"}</p>
            <p style={muted}>Slot: {ad.slot || "Yok"}</p>
            <p style={muted}>Link: {ad.link || "Yok"}</p>

            <div style={actions}>
              <button onClick={() => updateStatus(ad.id, "active")} style={approveBtn}>
                Onayla
              </button>

              <button onClick={() => updateStatus(ad.id, "rejected")} style={rejectBtn}>
                Reddet
              </button>

              <button onClick={() => updateStatus(ad.id, "pending")} style={pendingBtn}>
                Askıya Al
              </button>

              <button onClick={() => removeAd(ad.id)} style={deleteBtn}>
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
  gap: 14,
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