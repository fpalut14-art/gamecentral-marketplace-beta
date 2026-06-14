"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserProfile = {
  email?: string;
  name?: string;
  role?: "admin" | "seller" | "user";
  sellerStatus?: "none" | "pending" | "approved" | "rejected";
  banned?: boolean;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  }

  async function applySeller() {
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      sellerStatus: "pending",
    });

    alert("Satıcı başvurun admin onayına gönderildi.");
    await loadProfile(user.uid);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      await loadProfile(currentUser.uid);
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return <main style={page}>Profil yükleniyor...</main>;
  }

  return (
    <main style={page}>
      <section style={box}>
        <Link href="/" style={backBtn}>← Ana Sayfa</Link>

        <h1 style={title}>Profilim</h1>

        <div style={infoBox}>
          <p><b>Email:</b> {profile?.email || user?.email}</p>
          <p><b>Rol:</b> {profile?.role || "user"}</p>
          <p><b>Satıcı Durumu:</b> {profile?.sellerStatus || "none"}</p>
          <p><b>Ban:</b> {profile?.banned ? "Evet" : "Hayır"}</p>
        </div>

        <div style={actions}>
          <Link href="/my-orders" style={primaryBtn}>
            Siparişlerim
          </Link>

          {(profile?.role === "seller" || profile?.role === "admin") && (
            <Link href="/seller" style={primaryBtn}>
              Satıcı Panelim
            </Link>
          )}

          {(!profile?.sellerStatus || profile?.sellerStatus === "none") && (
            <button onClick={applySeller} style={sellerBtn}>
              Satıcı Ol
            </button>
          )}

          {profile?.sellerStatus === "pending" && (
            <div style={pendingBox}>
              Satıcı başvurun admin onayı bekliyor.
            </div>
          )}

          {profile?.sellerStatus === "rejected" && (
            <button onClick={applySeller} style={sellerBtn}>
              Tekrar Satıcı Başvurusu Yap
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#05060f",
  color: "white",
  padding: 40,
};

const box: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: 34,
  borderRadius: 24,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
};

const backBtn: React.CSSProperties = {
  color: "#ffd400",
  textDecoration: "none",
  fontWeight: 900,
};

const title: React.CSSProperties = {
  color: "#ffd400",
  marginTop: 24,
  fontSize: 38,
};

const infoBox: React.CSSProperties = {
  marginTop: 24,
  padding: 20,
  borderRadius: 16,
  background: "#101827",
  display: "grid",
  gap: 10,
};

const actions: React.CSSProperties = {
  marginTop: 24,
  display: "grid",
  gap: 14,
};

const primaryBtn: React.CSSProperties = {
  height: 50,
  borderRadius: 14,
  background: "#ffd400",
  color: "#05060f",
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  fontWeight: 900,
};

const sellerBtn: React.CSSProperties = {
  height: 50,
  borderRadius: 14,
  border: "1px solid rgba(255,212,0,0.35)",
  background: "rgba(255,212,0,0.1)",
  color: "#ffd400",
  fontWeight: 900,
  cursor: "pointer",
};

const pendingBox: React.CSSProperties = {
  padding: 16,
  borderRadius: 14,
  background: "rgba(255,212,0,0.1)",
  color: "#ffd400",
  fontWeight: 900,
};