"use client";

import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type AppUser = {
  id: string;
  email?: string;
  name?: string;
  role?: "admin" | "seller" | "user";
  banned?: boolean;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, "users"));

      const data = snap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<AppUser, "id">),
      }));

      setUsers(data);
    } catch (error) {
      console.error("Kullanıcı çekme hatası:", error);
      alert("Kullanıcılar çekilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(userId: string, role: "admin" | "seller" | "user") {
    await updateDoc(doc(db, "users", userId), {
      role,
    });

    loadUsers();
  }

  async function toggleBan(userId: string, banned: boolean) {
    await updateDoc(doc(db, "users", userId), {
      banned: !banned,
    });

    loadUsers();
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <div style={top}>
        <div>
          <h1 style={title}>Kullanıcı Yönetimi</h1>
          <p style={muted}>Rol değiştir, satıcı yap, kullanıcı banla.</p>
        </div>

        <button onClick={loadUsers} style={refresh}>
          Yenile
        </button>
      </div>

      {loading && <p style={muted}>Kullanıcılar yükleniyor...</p>}

      <div style={grid}>
        {users.map((user) => (
          <div key={user.id} style={card}>
            <div>
              <h3 style={{ margin: 0 }}>
                {user.name || user.email || "İsimsiz Kullanıcı"}
              </h3>

              <p style={muted}>UID: {user.id}</p>
              <p style={muted}>Email: {user.email || "Yok"}</p>
            </div>

            <div style={badgeRow}>
              <span style={roleBadge}>
                Rol: {user.role || "user"}
              </span>

              <span style={user.banned ? bannedBadge : activeBadge}>
                {user.banned ? "Banlı" : "Aktif"}
              </span>
            </div>

            <div style={actions}>
              <button onClick={() => changeRole(user.id, "user")} style={smallBtn}>
                User
              </button>

              <button onClick={() => changeRole(user.id, "seller")} style={smallBtn}>
                Seller
              </button>

              <button onClick={() => changeRole(user.id, "admin")} style={adminBtn}>
                Admin
              </button>
            </div>

            <button
              onClick={() => toggleBan(user.id, Boolean(user.banned))}
              style={user.banned ? unbanBtn : banBtn}
            >
              {user.banned ? "Banı Kaldır" : "Banla"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
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
  gap: 16,
};

const badgeRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const roleBadge: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,212,0,0.1)",
  color: "#ffd400",
  fontWeight: 800,
};

const activeBadge: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.1)",
  color: "#22c55e",
  fontWeight: 800,
};

const bannedBadge: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(239,68,68,0.1)",
  color: "#ef4444",
  fontWeight: 800,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const smallBtn: React.CSSProperties = {
  padding: "10px 13px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  cursor: "pointer",
};

const adminBtn: React.CSSProperties = {
  ...smallBtn,
  border: "1px solid rgba(255,212,0,0.35)",
  color: "#ffd400",
};

const banBtn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(239,68,68,0.1)",
  color: "#ef4444",
  fontWeight: 900,
  cursor: "pointer",
};

const unbanBtn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(34,197,94,0.35)",
  background: "rgba(34,197,94,0.1)",
  color: "#22c55e",
  fontWeight: 900,
  cursor: "pointer",
};