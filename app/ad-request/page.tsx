"use client";

import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdRequestPage() {
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState("premium");
  const [link, setLink] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await addDoc(collection(db, "ads"), {
      brand,
      title,
      slot,
      link,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    alert("Reklam başvurusu admin onayına gönderildi.");

    setBrand("");
    setTitle("");
    setSlot("premium");
    setLink("");
  }

  return (
    <main style={page}>
      <form onSubmit={handleSubmit} style={box}>
        <h1 style={heading}>Reklam Başvurusu</h1>

        <input
          style={input}
          placeholder="Marka / Firma adı"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />

        <input
          style={input}
          placeholder="Reklam başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select
          style={input}
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        >
          <option value="premium">Premium Slider</option>
          <option value="right-banner">Sağ Dikey Banner</option>
          <option value="partner-slot">Partner Slot</option>
        </select>

        <input
          style={input}
          placeholder="Yönlendirme linki"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <button style={button}>ADMİN ONAYINA GÖNDER</button>
      </form>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#05060f",
  color: "white",
  display: "grid",
  placeItems: "center",
  padding: 30,
};

const box: React.CSSProperties = {
  width: "100%",
  maxWidth: 560,
  padding: 34,
  borderRadius: 24,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 16,
};

const heading: React.CSSProperties = {
  color: "#ffd400",
  marginBottom: 10,
};

const input: React.CSSProperties = {
  height: 54,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#111827",
  color: "white",
  padding: "0 16px",
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