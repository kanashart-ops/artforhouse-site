/* eslint-disable @next/next/no-img-element */
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import GoogleAnalyticsTracker from "@/app/analytics";
import { Analytics } from "@vercel/analytics/react"; // ✅ добавили Vercel Analytics

export const metadata: Metadata = {
  title: "Art for House",
  description:
    "Интерьерные картины: масло, акрил, премиум жикле. Мировая доставка.",
  icons: {
    icon: "/favicon.png",
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

        {/* ✅ Google Analytics */}
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

        {/* ✅ Yandex.Metrika */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j=0;j<document.scripts.length;j++){
                if (document.scripts[j].src===r){return;}
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],
              k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(104389322, "init", {
              ssr:true,
              webvisor:true,
              clickmap:true,
              ecommerce:"dataLayer",
              accurateTrackBounce:true,
              trackLinks:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/104389322"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </head>

      <body className="flex flex-col min-h-screen bg-white text-gray-900">
        {/* 📊 Трекер маршрутов для Google Analytics */}
        <Suspense fallback={null}>
          <GoogleAnalyticsTracker />
        </Suspense>

        <Header />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* 📈 Vercel Analytics */}
        <Analytics /> 
      </body>
    </html>
  );
}
