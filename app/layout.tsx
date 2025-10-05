import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Art for House",
  description:
    "Интерьерные картины: масло, акрил, премиум жикле. Мировая доставка.",
  icons: {
    icon: "/favicon.png", // 🔹 путь к иконке (лежит в public/)
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
        {/* 🎨 Основные мета-теги */}
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.png" type="image/png" />

        {/* ✅ Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W0Q5PME6MH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W0Q5PME6MH');
          `}
        </Script>
      </head>

      <body className="flex flex-col min-h-screen bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
