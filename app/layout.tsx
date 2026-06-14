import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameCentral | Gamer Pazarı",
  description: "Oyuncular için ilan, ekipman ve dijital ürün pazarı.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}