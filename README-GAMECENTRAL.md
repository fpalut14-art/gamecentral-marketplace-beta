# GameCentral Next.js + Firebase

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Önemli düzeltmeler

- Dinamik ilan detay yolu düzeltildi: `app/listing/[id]/page.tsx`
- Firebase config `.env.local` mantığına taşındı.
- İlan oluşturma akışı `pending` olarak admin onayına gönderir.
- Ana sayfa sadece `status: active` ilanları gösterir.
- TypeScript tipleri `types.ts` dosyasına eklendi.
- Navbar, login, register, create ve ilan detay sayfaları temizlendi.

## Firebase koleksiyon yapısı

### users/{uid}
```js
{
  uid: string,
  email: string,
  username: string,
  role: "user" | "admin",
  createdAt: Timestamp
}
```

### listings/{id}
```js
{
  title: string,
  price: number,
  category: string,
  description: string,
  image: string,
  userId: string,
  username: string,
  status: "pending" | "active" | "rejected",
  createdAt: Timestamp
}
```

## Not

Şu an görseller Base64 olarak Firestore'a yazılıyor. MVP için çalışır ama production'da Firebase Storage'a taşınmalı.
