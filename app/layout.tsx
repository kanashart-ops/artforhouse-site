/* eslint-disable @next/next/no-img-element */
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import GoogleAnalyticsTracker from "@/app/analytics";
import { Analytics } from "@vercel/analytics/react"; // ✅ добавили Vercel Analytics
import { ARTIST_NAME, DEFAULT_SOCIAL_IMAGE, jsonLdStringify, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Art For House (Арт Фор Хаус) — картины Анны Побитко",
  description:
    "Art For House — Арт Фор Хаус: картины художницы Анны Побитко, интерьерная живопись, масло и акрил, работы на заказ. Минск, Беларусь, доставка.",
  applicationName: SITE_NAME,
  verification: {
    other: { "yandex-verification": "af0e3cc1277745b7" },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    title: "Art For House (Арт Фор Хаус) — картины Анны Побитко",
    description:
      "Арт Фор Хаус — авторские картины Анны Побитко, интерьерная живопись маслом и акрилом и картины на заказ.",
    url: SITE_URL,
    images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "Art For House — интерьерная живопись" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: ["Арт Фор Хаус", "Артфорхаус", "ArtForHouse"],
      inLanguage: "ru",
      publisher: { "@id": `${SITE_URL}/#artist` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#artist`,
      name: ARTIST_NAME,
      alternateName: "Anna Pobitko",
      jobTitle: "Художница",
      url: SITE_URL,
      sameAs: [
        "https://www.instagram.com/art_for_house.by/",
        "https://www.tiktok.com/@artforhouse",
      ],
    },
  ],
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
        <meta name="theme-color" content="#f7f5f0" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdStringify(siteStructuredData) }}
        />

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

        {/* ✅ Yandex.Metrika — counter 114684042 */}
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
            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=114684042", "ym");

            ym(114684042, "init", {
              ssr:true,
              webvisor:true,
              clickmap:true,
              ecommerce:"dataLayer",
              referrer:document.referrer,
              url:location.href,
              accurateTrackBounce:true,
              trackLinks:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/114684042"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </head>

      <body className="flex min-h-screen flex-col bg-[#f7f5f0] text-[#292621]">
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
