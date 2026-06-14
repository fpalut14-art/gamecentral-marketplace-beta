"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function ListingDetail() {
  const params = useParams();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, "listings", params.id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setItem(docSnap.data());
      }
    };

    fetchItem();
  }, []);

  if (!item) return <p>Yükleniyor...</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen">

      <img src={item.image} className="w-full max-w-md rounded mb-6" />

      <h1 className="text-2xl font-bold">{item.title}</h1>

      <p className="text-green-400 text-xl">{item.price} ₺</p>

      <p className="mt-2 text-gray-400">👤 {item.username}</p>

    </div>
  );
}