"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserProfile = {
  email?: string;
  role?: "admin" | "seller" | "user";
  banned?: boolean;
};

export default function CreatePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        router.push("/");
        return;
      }

      const data = userSnap.data() as UserProfile;

      if (data.banned) {
        alert("Hesabınız banlı.");
        router.push("/");
        return;
      }

      if (data.role !== "seller" && data.role !== "admin") {
        alert("İlan açmak için seller olmalısın.");
        router.push("/");
        return;
      }

      setCurrentUser(user);
      setProfile(data);
      setChecking(false);
    });

    return () => unsub();
  }, [router]);

  async function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async function handleCreate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!currentUser || !profile) return;

    try {
      await addDoc(collection(db, "products"), {
        title,
        price: Number(price),
        category,
        imageBase64,
        status: "pending",
        sellerId: currentUser.uid,
        seller: profile.email || currentUser.email,
        createdAt: new Date().toISOString(),
      });

      alert("İlan admin onayına gönderildi.");

      router.push("/");
    } catch (error) {
      console.error(error);
      alert("İlan oluşturulamadı.");
    }
  }

  if (checking) {
    return (
      <main style={page}>
        <h1>Kontrol ediliyor...</h1>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={box}>
        <h1 style={titleStyle}>Yeni İlan Oluştur</h1>

        <form onSubmit={handleCreate} style={form}>
          <input
            placeholder="Ürün başlığı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={input}
            required
          />

          <input
            placeholder="Fiyat"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={input}
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={input}
            required
          >
            <option value="">Kategori seç</option>
            <option value="KOLTUKLAR">Koltuklar</option>
            <option value="MONSTER SERİSİ">
              Monster Serisi
            </option>
            <option value="METİN2 MARKET">
              Metin2 Market
            </option>
            <option value="VALORANT VP">
              Valorant VP
            </option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={fileInput}
          />

          {imageBase64 && (
            <img
              src={imageBase64}
              alt="preview"
              style={preview}
            />
          )}

          <button type="submit" style={button}>
            ADMİN ONAYINA GÖNDER
          </button>
        </form>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#05060f",
  display: "grid",
  placeItems: "center",
  padding: 30,
  color: "white",
};

const box: React.CSSProperties = {
  width: "100%",
  maxWidth: 600,
  padding: 34,
  borderRadius: 24,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
};

const titleStyle: React.CSSProperties = {
  color: "#ffd400",
  marginBottom: 24,
};

const form: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const input: React.CSSProperties = {
  height: 54,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#111827",
  color: "white",
  padding: "0 16px",
};

const fileInput: React.CSSProperties = {
  color: "white",
};

const preview: React.CSSProperties = {
  width: "100%",
  height: 280,
  objectFit: "cover",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
};

const button: React.CSSProperties = {
  height: 56,
  border: "none",
  borderRadius: 14,
  background: "#ffd400",
  color: "#05060f",
  fontWeight: 900,
  cursor: "pointer",
};