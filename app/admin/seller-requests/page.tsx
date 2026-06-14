"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type SellerRequest = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  sellerStatus?: "pending" | "approved" | "rejected" | "none";
  banned?: boolean;
};

export default function SellerRequestsPage() {
  const [users, setUsers] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    try {
      setLoading(true);

      const q = query(
        collection(db, "users"),
        where("sellerStatus", "==", "pending")
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<SellerRequest, "id">),
      }));

      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Başvurular çekilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function approveSeller(userId: string) {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: "seller",
        sellerStatus: "approved",
      });

      alert("Kullanıcı seller oldu.");
      loadRequests();
    } catch (error) {
      console.error(error);
      alert("Onay işlemi başarısız.");
    }
  }

  async function rejectSeller(userId: string) {
    try {
      await updateDoc(doc(db, "users", userId), {
        sellerStatus: "rejected",
      });

      alert("Başvuru reddedildi.");
      loadRequests();
    } catch (error) {
      console.error(error);
      alert("Red işlemi başarısız.");
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <main style={page}>
      <div style={top}>
        <div>
          <h1 style={title}>Satıcı Başvuruları</h1>
          <p style={muted}>
            Satıcı olmak isteyen kullanıcıları yönet.
          </p>
        </div>

        <button onClick={loadRequests} style={refresh}>
          Yenile
        </button>
      </div>

      {loading && <p style={muted}>Başvurular yükleniyor...</p>}

      {!loading && users.length === 0 && (
        <div style={empty}>
          Bekleyen satıcı başvurusu yok.
        </div>
      )}

      <div style={grid}>
        {users.map((user) => (
          <article key={user.id} style={card}>
            <span style={pendingBadge}>PENDING</span>

            <h3 style={{ margin: 0 }}>
              {user.name || "İsimsiz Kullanıcı"}
            </h3>

            <p style={muted}>
              Email: {user.email || "Email yok"}
            </p>

            <p style={muted}>
              Rol: {user.role || "user"}
            </p>

            <p style={muted}>
              UID: {user.id}
            </p>

            <div style={actions}>
              <button
                onClick={() => approveSeller(user.id)}
                style={approveBtn}
              >
                Seller Onayla
              </button>

              <button
                onClick={() => rejectSeller(user.id)}
                style={rejectBtn}
              >
                Reddet
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
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

const title: React.CSSProperties = {
  fontSize: 38,
  margin: 0,
  color: "#ffd400",
};

const muted: React.CSSProperties = {
  color: "#94a3b8",
};

const refresh: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid rgba(255,212,0,0.35)",
  background: "rgba(255,212,0,0.1)",
  color: "#ffd400",
  fontWeight: 900,
  cursor: "pointer",
};

const empty: React.CSSProperties = {
  maxWidth: 1300,
  margin: "0 auto",
  padding: 20,
  borderRadius: 16,
  background: "#101827",
  color: "#94a3b8",
};

const grid: React.CSSProperties = {
  maxWidth: 1300,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
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

const pendingBadge: React.CSSProperties = {
  width: "fit-content",
  padding: "7px 11px",
  borderRadius: 999,
  background: "rgba(255,212,0,0.12)",
  color: "#ffd400",
  fontWeight: 900,
  fontSize: 13,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const approveBtn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(34,197,94,0.35)",
  background: "rgba(34,197,94,0.1)",
  color: "#22c55e",
  fontWeight: 900,
  cursor: "pointer",
};

const rejectBtn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(239,68,68,0.1)",
  color: "#ef4444",
  fontWeight: 900,
  cursor: "pointer",
};