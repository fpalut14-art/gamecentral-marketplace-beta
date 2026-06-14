"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (username.trim().length < 3) return alert("Kullanıcı adı en az 3 karakter olmalı.");
    if (!email.includes("@")) return alert("Geçerli email gir.");
    if (password.length < 6) return alert("Şifre en az 6 karakter olmalı.");

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username.trim().toLowerCase(),
        role: "user",
        createdAt: serverTimestamp(),
      });

      router.push("/");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Kayıt oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8">
        <h1 className="text-center text-3xl font-black">Hesap Oluştur</h1>
        <div className="mt-7 space-y-4">
          <input value={username} type="text" placeholder="Kullanıcı adı" className="input" onChange={(e) => setUsername(e.target.value)} />
          <input value={email} type="email" placeholder="Email" className="input" onChange={(e) => setEmail(e.target.value)} />
          <input value={password} type="password" placeholder="Şifre" className="input" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleRegister} disabled={loading} className="w-full rounded-2xl bg-emerald-400 py-4 font-black text-black hover:bg-emerald-300 disabled:opacity-50">
            {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </div>
      </div>
    </main>
  );
}
