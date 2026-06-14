"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";

const categories = ["Valorant", "CS2 Skin", "Metin2", "Ekipman", "Laptop", "Koltuk"];

export default function CreateListing() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 750_000) {
      alert("Şimdilik 750 KB altı görsel yükle. Production'da Firebase Storage'a geçilecek.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!auth.currentUser) return alert("İlan vermek için giriş yapmalısın.");
    if (!title.trim() || !price || !image) return alert("Başlık, fiyat ve görsel zorunlu.");

    setLoading(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const username = userSnap.exists() ? userSnap.data().username : auth.currentUser.email;

      await addDoc(collection(db, "listings"), {
        title: title.trim(),
        price: Number(price),
        category,
        description: description.trim(),
        image,
        userId: auth.currentUser.uid,
        username,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("İlan admin onayına gönderildi.");
      router.push("/");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "İlan oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-2xl shadow-emerald-500/10">
        <p className="text-sm uppercase tracking-[.25em] text-emerald-300">Satıcı Paneli</p>
        <h1 className="mt-2 text-3xl font-black">Yeni İlan Oluştur</h1>
        <p className="mt-2 text-sm text-zinc-400">İlan önce admin onayına düşer, onaydan sonra ana sayfada görünür.</p>

        <div className="mt-7 space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" className="input" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" placeholder="Fiyat ₺" className="input" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" rows={4} className="input resize-none" />
          <input type="file" accept="image/*" onChange={handleImage} className="block w-full text-sm text-zinc-300" />

          {image && <img src={image} alt="Önizleme" className="h-52 w-full rounded-2xl object-cover" />}

          <button onClick={handleCreate} disabled={loading} className="w-full rounded-2xl bg-emerald-400 py-4 font-black text-black transition hover:bg-emerald-300 disabled:opacity-50">
            {loading ? "Gönderiliyor..." : "Admin Onayına Gönder"}
          </button>
        </div>
      </div>
    </main>
  );
}
