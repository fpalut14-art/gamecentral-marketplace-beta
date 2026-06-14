"use client";

import React, { useEffect, useState } from "react";
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

  const [loading, setLoading] = useState(true);

  async function loadDashboardStats() {
    try {
      setLoading(true);

      const usersSnap = await getDocs(collection(db, "users"));
      const productsSnap = await getDocs(collection(db, "products"));
      const adsSnap = await getDocs(collection(db, "ads"));
      const ordersSnap = await getDocs(collection(db, "orders"));

      const products = productsSnap.docs.map((doc) => doc.data());
      const orders = ordersSnap.docs.map((doc) => doc.data());

      const activeProducts = products.filter(
        (p: any) => p.status === "active"
      ).length;

      const pendingProducts = products.filter(
        (p: any) => p.status === "pending"
      ).length;

      const rejectedProducts = products.filter(
        (p: any) => p.status === "rejected"
      ).length;

      const volume = orders.reduce((total: number, order: any) => {
        return total + Number(order.amount || 0);
      }, 0);

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

  return (
    <div>
      <div style={top}>
        <div>
          <h1 style={title}>Admin Dashboard</h1>
          <p style={muted}>GameCentral sistem merkezi</p>
        </div>

        <button onClick={loadDashboardStats} style={refresh}>
          Yenile
        </button>
      </div>

      {loading && <p style={muted}>Veriler yükleniyor...</p>}

      <div style={grid}>
        <div style={card}>
          <span style={label}>Toplam Kullanıcı</span>
          <strong style={number}>{stats.users}</strong>
        </div>

        <div style={card}>
          <span style={label}>Aktif İlan</span>
          <strong style={number}>{stats.activeProducts}</strong>
        </div>

        <div style={card}>
          <span style={label}>Onay Bekleyen</span>
          <strong style={number}>{stats.pendingProducts}</strong>
        </div>

        <div style={card}>
          <span style={label}>Reddedilen İlan</span>
          <strong style={number}>{stats.rejectedProducts}</strong>
        </div>

        <div style={card}>
          <span style={label}>Reklam Başvurusu</span>
          <strong style={number}>{stats.ads}</strong>
        </div>

        <div style={card}>
          <span style={label}>Sipariş</span>
          <strong style={number}>{stats.orders}</strong>
        </div>

        <div style={card}>
          <span style={label}>Net Hacim</span>
          <strong style={number}>₺{stats.volume}</strong>
        </div>
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
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};

const card: React.CSSProperties = {
  padding: 22,
  borderRadius: 18,
  background: "#101827",
  border: "1px solid #263244",
  display: "grid",
  gap: 10,
};

const label: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 700,
};

const number: React.CSSProperties = {
  color: "#ffd400",
  fontSize: 34,
};