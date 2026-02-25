"use client";

import { useState, useEffect } from "react";
import type React from "react";
import Image from "next/image";
import { Send, Instagram, Phone } from "lucide-react";
import type { ShopItem } from "@/lib/contentStore";

export default function ShopPage() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContacts, setShowContacts] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  useEffect(() => {
    fetch("/api/shop")
      .then((res) => res.json())
      .then((data: { items: ShopItem[] }) => setShopItems(data.items));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectedItem) return;
      if (e.key === "ArrowRight") nextMedia();
      if (e.key === "ArrowLeft") prevMedia();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const nextMedia = () =>
    setCurrentIndex((p) => (p + 1) % (selectedItem?.media.length ?? 1));

  const prevMedia = () =>
    setCurrentIndex((p) =>
      (p - 1 + (selectedItem?.media.length ?? 1)) %
      (selectedItem?.media.length ?? 1)
    );

  const closeModal = () => {
    setSelectedItem(null);
    setShowContacts(false);
  };

  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStartX(e.touches[0].clientX);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!selectedItem) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta > 50) prevMedia();
    if (delta < -50) nextMedia();
  };

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-900">
        Картины в наличии
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {shopItems.map((item, index) => (
          <div
            key={index}
            className="cursor-pointer border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all bg-white"
            onClick={() => {
              setSelectedItem(item);
              setCurrentIndex(0);
            }}
          >
            <Image
              src={item.media[0]?.src || "/images/hero-bg.jpg"}
              alt={item.title}
              width={600}
              height={400}
              className="w-full h-80 object-contain bg-gray-50 rounded-t-lg"
            />
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {item.title}
              </h2>
              <p className="text-gray-700 text-sm mb-2">{item.size}</p>
              <p className="text-lg font-bold text-amber-700">
                {item.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl bg-white rounded-lg shadow-lg flex flex-col sm:flex-row overflow-hidden sm:h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-3xl font-bold text-gray-700 hover:text-black z-10"
              onClick={closeModal}
            >
              ×
            </button>

            <div
              className="relative flex-1 bg-black flex items-center justify-center overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {selectedItem.media[currentIndex]?.type === "image" ? (
                <Image
                  src={selectedItem.media[currentIndex].src}
                  alt={selectedItem.title}
                  width={1200}
                  height={800}
                  className="object-contain max-h-[80vh] w-auto h-auto"
                  unoptimized
                />
              ) : (
                <video
                  src={selectedItem.media[currentIndex]?.src}
                  controls
                  playsInline
                  className="object-contain max-h-[80vh] w-auto h-auto"
                />
              )}

              <button
                className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white text-3xl p-2 rounded-full hover:bg-black"
                onClick={prevMedia}
              >
                ‹
              </button>

              <button
                className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white text-3xl p-2 rounded-full hover:bg-black"
                onClick={nextMedia}
              >
                ›
              </button>
            </div>

            <div className="w-full sm:w-[380px] p-5 sm:p-6 flex flex-col border-t sm:border-l border-gray-200 bg-white max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-3 text-gray-900 text-center sm:text-left">
                {selectedItem.title}
              </h2>
              <p className="text-gray-700 font-medium mb-2 text-center sm:text-left">
                {selectedItem.size}
              </p>
              <p className="text-xl font-bold text-amber-700 mb-6 text-center sm:text-left">
                {selectedItem.price}
              </p>

              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-[16px] mb-6">
                {selectedItem.description}
              </p>

              <button
                className="mt-auto w-full px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold text-lg hover:bg-amber-700 transition"
                onClick={() => setShowContacts(true)}
              >
                Купить
              </button>

              {showContacts && (
                <div className="mt-6 bg-gray-100 border rounded-lg p-4 text-center">
                  <p className="mb-4 font-medium text-gray-800 text-base">
                    Свяжитесь со мной любым удобным способом:
                  </p>

                  <div className="flex justify-center gap-6 text-gray-700 text-[30px]">
                    <a
                      href="https://t.me/AnnPab"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Telegram"
                    >
                      <Send size={34} className="hover:text-sky-500 transition" />
                    </a>

                    <a
                      href="https://www.instagram.com/art_for_house.by/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                    >
                      <Instagram size={34} className="hover:text-pink-500 transition" />
                    </a>

                    <a href="tel:+375293517220" title="Позвонить">
                      <Phone size={34} className="hover:text-green-600 transition" />
                    </a>
                  </div>

                  <p className="mt-4 text-sm text-gray-600 select-all">
                    ☎ +375 (29) 351-72-20
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
