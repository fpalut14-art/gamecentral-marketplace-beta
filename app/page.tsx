"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import "./home.css";

type Product = {
  id: string;
  title?: string;
  price?: number;
  category?: string;
  status?: string;
  seller?: string;
  imageBase64?: string;
};

type AdItem = {
  id: string;
  brand?: string;
  title?: string;
  slot?: "premium" | "right-banner" | "partner-slot";
  link?: string;
  status?: string;
};

type UserProfile = {
  name?: string;
  email?: string;
  role?: "admin" | "seller" | "user";
};

const categories = [
  "TÜMÜ",
  "KOLTUKLAR",
  "MONSTER SERİSİ",
  "METİN2 MARKET",
  "VALORANT VP",
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("TÜMÜ");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  async function loadHomeData() {
    try {
      setLoading(true);

      const productQuery = query(
        collection(db, "products"),
        where("status", "==", "active")
      );

      const adsQuery = query(
        collection(db, "ads"),
        where("status", "==", "active")
      );

      const [productSnap, adsSnap] = await Promise.all([
        getDocs(productQuery),
        getDocs(adsQuery),
      ]);

      setProducts(
        productSnap.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Product, "id">),
        }))
      );

      setAds(
        adsSnap.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<AdItem, "id">),
        }))
      );
    } catch (error) {
      console.error("Ana sayfa veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      } else {
        setUserProfile({
          email: user.email || "",
          role: "user",
        });
      }
    });

    return () => unsub();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productCategory = String(product.category || "").toLowerCase();
      const productTitle = String(product.title || "").toLowerCase();

      const categoryMatch =
        selectedCategory === "TÜMÜ" ||
        productCategory === selectedCategory.toLowerCase();

      const searchMatch =
        search.trim() === "" ||
        productTitle.includes(search.toLowerCase()) ||
        productCategory.includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [products, selectedCategory, search]);

  const premiumAd = ads.find((ad) => ad.slot === "premium");
  const rightAds = ads.filter((ad) => ad.slot === "right-banner").slice(0, 3);
  const partnerAds = ads.filter((ad) => ad.slot === "partner-slot");

  return (
    <main className="gc-page">
      <header className="gc-header">
        <Link href="/" className="gc-logo">
          GAME<span>CENTRAL</span>
        </Link>

        <div className="gc-search">
          <input
            type="text"
            placeholder="İlan, kategori veya ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="gc-auth-group">
          {currentUser ? (
            <div className="gc-user-menu">
              <span className="gc-user-name">
                {userProfile?.name ||
                  userProfile?.email ||
                  currentUser.email ||
                  "Kullanıcı"}
              </span>

              <Link href="/profile" className="gc-user-link">
                Profilim
              </Link>

              <Link href="/my-orders" className="gc-user-link">
                Siparişlerim
              </Link>

              {(userProfile?.role === "seller" ||
                userProfile?.role === "admin") && (
                <Link href="/seller" className="gc-user-link seller">
                  Satıcı Panelim
                </Link>
              )}

              <button onClick={handleLogout} className="gc-logout-btn">
                Çıkış
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="gc-login-link">
                Giriş
              </Link>

              <Link href="/register" className="gc-register-link">
                Kayıt
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="gc-layout">
        <aside className="gc-sidebar">
          <Link href="/create" className="gc-create-btn">
            + YENİ İLAN VER
          </Link>

          <div className="gc-sidebar-box">
            <Link href="/" className="gc-menu active">
              🏠 ANA SAYFA
            </Link>

            <small>KATEGORİLER</small>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "gc-category selected"
                    : "gc-category"
                }
              >
                {category === "TÜMÜ" && "🌐 "}
                {category === "KOLTUKLAR" && "🪑 "}
                {category === "MONSTER SERİSİ" && "🟢 "}
                {category === "METİN2 MARKET" && "⚔️ "}
                {category === "VALORANT VP" && "🎯 "}
                {category}
              </button>
            ))}
          </div>
        </aside>

        <section className="gc-content">
          <section className="gc-hero-area">
            <Link href={premiumAd?.link || "/ad-request"} className="gc-hero">
              <div className="gc-hero-overlay">
                <span className="gc-badge">PREMIUM SLOT</span>

                <h1>{premiumAd?.title || "PREMİUM REKLAM ALANI"}</h1>

                <p>
                  {premiumAd?.brand
                    ? `${premiumAd.brand} sponsorlu reklam alanı.`
                    : "Markanı GameCentral vitrininin en güçlü alanında göster."}
                </p>

                <span className="gc-hero-btn">
                  {premiumAd ? "REKLAMI GÖR" : "REKLAM BAŞVURUSU YAP"}
                </span>
              </div>
            </Link>

            <div className="gc-right-banners">
              {[0, 1, 2].map((i) => {
                const ad = rightAds[i];

                return (
                  <Link
                    key={i}
                    href={ad?.link || "/ad-request"}
                    className="gc-right-ad"
                  >
                    <strong>{ad?.title || "+ REKLAM VER"}</strong>
                    <span>{ad?.brand || "Sağ Banner Slot"}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="gc-products">
            <div className="gc-section-head">
              <div className="gc-section-title">💎 AKTİF İLANLAR</div>

              <button onClick={loadHomeData} className="gc-refresh">
                ↻ YENİLE
              </button>
            </div>

            {loading && <div className="gc-empty">İlanlar yükleniyor...</div>}

            {!loading && filteredProducts.length === 0 && (
              <div className="gc-empty">Aktif ilan bulunamadı.</div>
            )}

            <div className="gc-product-grid">
              {filteredProducts.map((product) => (
                <article className="gc-card" key={product.id}>
                  <div className="gc-card-image">
                    {product.imageBase64 ? (
                      <img
                        src={product.imageBase64}
                        alt={product.title || "İlan"}
                      />
                    ) : (
                      <span>GAMECENTRAL</span>
                    )}
                  </div>

                  <div className="gc-card-body">
                    <span className="gc-card-category">
                      {product.category || "Kategori Yok"}
                    </span>

                    <h3>{product.title || "Başlıksız İlan"}</h3>

                    <p className="gc-seller">
                      Satıcı: {product.seller || "Doğrulanmamış Satıcı"}
                    </p>

                    <div className="gc-price">₺{product.price || 0}</div>

                    <Link
                      href={`/listing/${product.id}`}
                      className="gc-card-btn"
                    >
                      İNCELE
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="gc-partners">
            <div className="gc-section-title">💠 PARTNER SLOTLARI</div>

            <div className="gc-slot-grid">
              {Array.from({ length: 18 }).map((_, i) => {
                const ad = partnerAds[i];

                return (
                  <Link
                    href={ad?.link || "/ad-request"}
                    className="gc-slot"
                    key={i}
                  >
                    <strong>{ad?.title || "+"}</strong>
                    <span>{ad?.brand || "REKLAM VER"}</span>
                    <small>SLOT #{String(i + 1).padStart(2, "0")}</small>
                  </Link>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}