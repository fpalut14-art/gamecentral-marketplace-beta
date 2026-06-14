import Link from "next/link";
import type { Listing } from "@/types";

type Props = {
  item: Listing;
};

export default function ListingCard({ item }: Props) {
  return (
    <Link href={`/listing/${item.id}`} className="group block">
      <article className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40">
        <div className="relative h-48 overflow-hidden bg-zinc-900">
          <img
            src={item.image || "/placeholder.png"}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
          <div className="absolute left-3 top-3 rounded-full border border-emerald-300/30 bg-black/70 px-3 py-1 text-xs text-emerald-200">
            {item.category || "Genel"}
          </div>
        </div>

        <div className="p-5">
          <h2 className="truncate text-lg font-bold text-white">{item.title}</h2>
          <p className="mt-2 text-2xl font-black text-emerald-300">{Number(item.price || 0).toLocaleString("tr-TR")} ₺</p>
          <p className="mt-3 text-sm text-zinc-400">Satıcı: {item.username || "Bilinmiyor"}</p>
        </div>
      </article>
    </Link>
  );
}
