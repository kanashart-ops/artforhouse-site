"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Phone, Send } from "lucide-react";
import type { ShopItem } from "@/lib/contentStore";
import { useFocusTrap } from "@/lib/useFocusTrap";

export default function ShopPage() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContacts, setShowContacts] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const closeModal = () => {
    setSelectedItem(null);
    setShowContacts(false);
  };

  useEffect(() => {
    fetch("/api/shop")
      .then((res) => res.json())
      .then((data: { items: ShopItem[] }) => setShopItems(data.items ?? []));
  }, []);

  useFocusTrap({
    active: selectedItem !== null,
    containerRef: modalRef,
    onEscape: closeModal,
    returnFocusRef: triggerRef,
  });

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % (selectedItem?.media.length ?? 1));
  };

  const prevMedia = () => {
    setCurrentIndex((prev) =>
      (prev - 1 + (selectedItem?.media.length ?? 1)) %
      (selectedItem?.media.length ?? 1)
    );
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!selectedItem) {
        return;
      }
      if (event.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % (selectedItem.media.length || 1));
      }
      if (event.key === "ArrowLeft") {
        setCurrentIndex((prev) =>
          (prev - 1 + (selectedItem.media.length || 1)) %
          (selectedItem.media.length || 1)
        );
      }
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedItem]);

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!selectedItem) {
      return;
    }

    const delta = event.changedTouches[0].clientX - touchStartX;
    if (delta > 50) prevMedia();
    if (delta < -50) nextMedia();
  };

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-10">
      <h1 className="mb-10 text-center text-4xl font-bold text-gray-900">
        Картины в наличии
      </h1>

      {shopItems.length === 0 ? (
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Раздел обновляется
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            Готовых работ сейчас нет в витрине
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Можно оставить заявку на индивидуальную картину под интерьер, размер стены или готовый подарок.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/order"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Заказать картину
            </Link>
            <Link
              href="/gallery"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-900"
            >
              Посмотреть галерею
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shopItems.map((item, index) => (
            <button
              key={`${item.title}-${index}`}
              type="button"
              className="overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setSelectedItem(item);
                setCurrentIndex(0);
              }}
              aria-label={`Открыть карточку товара ${item.title}`}
              aria-haspopup="dialog"
            >
              <Image
                src={item.media[0]?.src || "/images/hero-bg.jpg"}
                alt={item.title}
                width={600}
                height={400}
                className="h-80 w-full rounded-t-lg bg-gray-50 object-contain"
              />
              <div className="p-5">
                <h2 className="mb-1 text-xl font-bold text-gray-900">{item.title}</h2>
                <p className="mb-2 text-sm text-gray-700">{item.size}</p>
                <p className="text-lg font-bold text-amber-700">{item.price}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            className="relative flex h-auto w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-lg sm:h-[85vh] sm:flex-row"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-dialog-title"
          >
            <button
              type="button"
              className="absolute right-4 top-2 z-10 text-3xl font-bold text-gray-700 transition hover:text-black"
              onClick={closeModal}
              aria-label="Закрыть карточку товара"
            >
              ×
            </button>

            <div
              className="relative flex-1 overflow-hidden bg-black"
              onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex h-full items-center justify-center">
                {selectedItem.media[currentIndex]?.type === "image" ? (
                  <Image
                    src={selectedItem.media[currentIndex].src}
                    alt={selectedItem.title}
                    width={1200}
                    height={800}
                    className="h-auto max-h-[80vh] w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  <video
                    src={selectedItem.media[currentIndex]?.src}
                    controls
                    playsInline
                    className="h-auto max-h-[80vh] w-auto object-contain"
                  />
                )}
              </div>

              <button
                type="button"
                className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-3xl text-white transition hover:bg-black sm:block"
                onClick={prevMedia}
                aria-label="Предыдущее изображение"
              >
                ‹
              </button>

              <button
                type="button"
                className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-3xl text-white transition hover:bg-black sm:block"
                onClick={nextMedia}
                aria-label="Следующее изображение"
              >
                ›
              </button>
            </div>

            <div className="flex max-h-[80vh] w-full flex-col overflow-y-auto border-t border-gray-200 bg-white p-5 sm:w-[380px] sm:border-l sm:border-t-0 sm:p-6">
              <h2
                id="shop-dialog-title"
                className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-left"
              >
                {selectedItem.title}
              </h2>
              <p className="mb-2 text-center font-medium text-gray-700 sm:text-left">
                {selectedItem.size}
              </p>
              <p className="mb-6 text-center text-xl font-bold text-amber-700 sm:text-left">
                {selectedItem.price}
              </p>

              <p className="mb-6 whitespace-pre-line text-[16px] leading-relaxed text-gray-800">
                {selectedItem.description}
              </p>

              <button
                type="button"
                className="mt-auto w-full rounded-lg bg-amber-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-amber-700"
                onClick={() => setShowContacts(true)}
                aria-expanded={showContacts}
                aria-controls="shop-contact-actions"
              >
                Купить
              </button>

              {showContacts && (
                <div
                  id="shop-contact-actions"
                  className="mt-6 rounded-lg border bg-gray-100 p-4 text-center"
                >
                  <p className="mb-4 text-base font-medium text-gray-800">
                    Свяжитесь со мной любым удобным способом:
                  </p>

                  <div className="flex justify-center gap-6 text-[30px] text-gray-700">
                    <a
                      href="https://t.me/AnnPab"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Telegram"
                    >
                      <Send size={34} className="transition hover:text-sky-500" />
                    </a>

                    <a
                      href="https://www.instagram.com/art_for_house.by/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                    >
                      <Instagram size={34} className="transition hover:text-pink-500" />
                    </a>

                    <a href="tel:+375293517220" title="Позвонить">
                      <Phone size={34} className="transition hover:text-green-600" />
                    </a>
                  </div>

                  <p className="mt-4 select-all text-sm text-gray-600">
                    +375 (29) 351-72-20
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
