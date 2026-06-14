"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Product = {
  title?: string;
  price?: number;
  category?: string;
  status?: string;
  seller?: string;
  sellerId?: string;
  createdAt?: string;
  imageBase64?: string;
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;

      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct(snap.data() as Product);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("İlan detayı çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  async function createOrder() {
    if (!currentUser) {
      alert("Satın almak için giriş yapmalısın.");
      router.push("/login");
      return;
    }

    if (!product) return;

    if (product.sellerId === currentUser.uid) {
      alert("Kendi ilanını satın alamazsın.");
      return;
    }

    try {
      setBuying(true);

      await addDoc(collection(db, "orders"), {
        productId: id,
        productTitle: product.title || "Başlıksız ilan",
        amount: Number(product.price || 0),
        buyerId: currentUser.uid,
        buyerEmail: currentUser.email,
        sellerId: product.sellerId || "",
        sellerEmail: product.seller || "",
        status: "pending_payment",
        createdAt: new Date().toISOString(),
      });

      alert("Sipariş oluşturuldu. Admin paneline gönderildi.");
      router.push("/");
    } catch (error) {
      console.error("Sipariş oluşturma hatası:", error);
      alert("Sipariş oluşturulamadı.");
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return <main style={page}>İlan yükleniyor...</main>;
  }

  if (!product) {
    return (
      <main style={page}>
        <h1>İlan bulunamadı</h1>
        <Link href="/" style={backBtn}>Ana sayfaya dön</Link>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={card}>
        <Link href="/" style={backBtn}>← Ana sayfaya dön</Link>

        <div style={imageBox}>
          {product.imageBase64 ? (
            <img src={product.imageBase64} alt={product.title || "İlan"} style={detailImage} />
          ) : (
            "GAMECENTRAL"
          )}
        </div>

        <span style={category}>{product.category || "Kategori yok"}</span>

        <h1 style={title}>{product.title || "Başlıksız ilan"}</h1>

        <p style={seller}>Satıcı: {product.seller || "Bilinmiyor"}</p>

        <div style={price}>₺{product.price || 0}</div>

        <p style={status}>Durum: {product.status || "Yok"}</p>

        <button onClick={createOrder} style={buyBtn} disabled={buying}>
          {buying ? "Sipariş oluşturuluyor..." : "Satın Al"}
        </button>
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

const card: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: 30,
  borderRadius: 24,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
};

const imageBox: React.CSSProperties = {
  height: 360,
  marginTop: 24,
  borderRadius: 22,
  overflow: "hidden",
  background: "radial-gradient(circle, rgba(255,212,0,0.16), transparent 60%), #090b11",
  display: "grid",
  placeItems: "center",
  color: "rgba(255,212,0,0.5)",
  fontWeight: 900,
  fontSize: 28,
};

const detailImage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const backBtn: React.CSSProperties = {
  color: "#ffd400",
  textDecoration: "none",
  fontWeight: 900,
};

const category: React.CSSProperties = {
  display: "inline-block",
  marginTop: 24,
  color: "#22c55e",
  fontWeight: 900,
};

const title: React.CSSProperties = {
  marginTop: 12,
  fontSize: 42,
};

const seller: React.CSSProperties = {
  color: "#94a3b8",
};

const price: React.CSSProperties = {
  marginTop: 20,
  color: "#ffd400",
  fontSize: 44,
  fontWeight: 900,
};

const status: React.CSSProperties = {
  color: "#38bdf8",
  marginTop: 12,
};

const buyBtn: React.CSSProperties = {
  marginTop: 26,
  height: 56,
  padding: "0 24px",
  borderRadius: 14,
  border: "none",
  background: "#ffd400",
  color: "#05060f",
  fontWeight: 900,
  cursor: "pointer",
};