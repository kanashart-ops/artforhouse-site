import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Art for House",
  description:
    "Интерьерные картины: масло, акрил, премиум жикле. Мировая доставка.",
  icons: {
    icon: "/favicon.png", // 🔹 путь к твоей иконке (лежит в public/)
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* 👇 можно добавить мета-теги для соцсетей и адаптации */}
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="flex flex-col min-h-screen bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
