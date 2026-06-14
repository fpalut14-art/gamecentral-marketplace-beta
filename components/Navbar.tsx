"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setUsername("");

      if (!currentUser) return;

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUsername(String(docSnap.data().username || ""));
        }
      } catch (error) {
        console.error("Kullanıcı bilgisi alınamadı:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 px-5 py-4 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="text-xl font-black tracking-wide text-emerald-300">
          GAME<span className="text-white">CENTRAL</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          <Link href="/">Market</Link>
          <Link href="/create">İlan Ver</Link>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {!user ? (
            <>
              <Link href="/login" className="rounded-xl border border-white/10 px-4 py-2 hover:border-emerald-300/40">
                Giriş
              </Link>
              <Link href="/register" className="rounded-xl bg-emerald-400 px-4 py-2 font-bold text-black hover:bg-emerald-300">
                Kayıt
              </Link>
            </>
          ) : (
            <>
              <span className="hidden text-emerald-300 sm:inline">{username || user.email}</span>
              <button onClick={handleLogout} className="rounded-xl bg-red-500/90 px-4 py-2 font-semibold text-white hover:bg-red-500">
                Çıkış
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
