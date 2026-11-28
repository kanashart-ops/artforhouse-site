"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Phone, Send } from "lucide-react";
import type { ShopItem } from "@/lib/contentStore";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { canOptimizeArtworkImage } from "@/lib/imageOptimization";

export default function ShopClient({ items }: { items: ShopItem[] }) {
  const shopItems = items;
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

      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedItem]);

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!selectedItem) {
      return;
    }

    const delta = event.changedTouches[0].clientX - touchStartX;
    if (delta > 50) {
      prevMedia();
    }
    if (delta < -50) {
      nextMedia();
    }
  };

  const hasItems = shopItems.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <div className="mb-12 grid items-end gap-6 border-b border-[#e5ded4] pb-10 md:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="af-eyebrow">Авторская коллекция / Art For House</p>
          <h1 className="af-display mt-4 text-[clamp(3.2rem,7vw,6.6rem)] leading-[0.98] text-[#292621]">
            Картины <span className="italic text-[#d44d2c]">в наличии.</span>
          </h1>
        </div>
        <div>
          <p className="max-w-md text-base leading-8 text-[#6b655e]">
            Готовые работы Анны Побитко. Если подходящей картины сейчас нет,
            создадим новую под размер, палитру и характер вашего интерьера.
          </p>
          {hasItems && <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#d44d2c]">В каталоге: {shopItems.length}</p>}
        </div>
      </div>

      {!hasItems ? (
        <div className="grid overflow-hidden rounded-[34px] border border-[#e8e2d9] bg-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
            <p className="af-eyebrow">Раздел обновляется</p>
            <h2 className="af-display mt-5 max-w-lg text-4xl leading-[1.1] text-[#292621] sm:text-5xl">
              Готовых работ сейчас нет на витрине
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#6b655e]">
              Можно оставить заявку на индивидуальную картину под интерьер,
              размер стены или готовый подарок.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/order#order-form" className="af-accent-button">Заказать картину <span aria-hidden="true">↗</span></Link>
              <Link href="/gallery" className="af-light-button">Посмотреть галерею</Link>
              <Link href="/contacts" className="af-light-button">Контакты</Link>
            </div>
          </div>
          <div className="relative min-h-[360px] bg-[#eee8df] sm:min-h-[470px]">
            <Image src="/images/order/444.jpg" alt="Пример авторской живописи для индивидуального заказа"
              fill sizes="(max-width: 1023px) 100vw, 45vw" className="object-cover" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
          {shopItems.map((item, index) => (
            <button
              key={item.id || `${item.title}-${index}`}
              type="button"
              className="group overflow-hidden rounded-[24px] border border-[#e8e2d9] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(30,26,22,0.12)] focus-visible:ring-2 focus-visible:ring-[#ee5434]"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setSelectedItem(item);
                setCurrentIndex(0);
              }}
              aria-label={`Открыть карточку работы ${item.title}`}
              aria-haspopup="dialog"
            >
              {item.media[0]?.type === "video" ? (
                <video
                  src={item.media[0].src}
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={item.title}
                  className="h-80 w-full bg-[#f0ede7] object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <Image
                  src={item.media[0]?.src || "/images/hero-bg.jpg"}
                  alt={`${item.title} — готовая картина Art For House`}
                  width={600}
                  height={400}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : undefined}
                  unoptimized={!canOptimizeArtworkImage(item.media[0]?.src || "/images/hero-bg.jpg")}
                  className="h-80 w-full bg-[#f0ede7] object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              )}
              <div className="border-t border-[#eee9e2] p-5">
                <h2 className="mb-1 text-lg font-semibold text-[#302d29]">{item.title}</h2>
                <p className="mb-2 text-sm text-gray-700">{item.size}</p>
                <p className="text-lg font-semibold text-[#d44d2c]">{item.price}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8177]">Смотреть работу ↗</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-[22px] border border-[#e8e2d9] bg-white/70 p-5 text-center text-sm leading-6 text-[#777068]">
        Сайт не является интернет-магазином. Все цены на сайте указаны
        ориентировочно и уточняются индивидуально при обращении.
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            className="relative flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden bg-white shadow-lg sm:h-[85vh] sm:rounded-xl sm:flex-row"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-dialog-title"
          >
            <button
              type="button"
              className="absolute right-3 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-3xl font-bold text-gray-700 shadow transition hover:text-black"
              onClick={closeModal}
              aria-label="Закрыть карточку работы"
            >
              ×
            </button>

            <div
              className="relative h-[38dvh] shrink-0 overflow-hidden bg-black sm:h-auto sm:flex-1"
              onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex h-full items-center justify-center">
                {selectedItem.media[currentIndex]?.type === "image" ? (
                  <Image
                    src={selectedItem.media[currentIndex].src}
                    alt={`${selectedItem.title} — картина Art For House`}
                    width={1200}
                    height={800}
                    className="max-h-[38dvh] max-w-full object-contain sm:max-h-[80vh]"
                    unoptimized
                  />
                ) : (
                  <video
                    src={selectedItem.media[currentIndex]?.src}
                    controls
                    playsInline
                    className="max-h-[38dvh] max-w-full object-contain sm:max-h-[80vh]"
                  />
                )}
              </div>

              {selectedItem.media.length > 1 && <button
                type="button"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-3xl text-white transition hover:bg-black sm:left-3"
                onClick={prevMedia}
                aria-label="Предыдущее изображение"
              >
                ‹
              </button>}

              {selectedItem.media.length > 1 && <button
                type="button"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-3xl text-white transition hover:bg-black sm:right-3"
                onClick={nextMedia}
                aria-label="Следующее изображение"
              >
                ›
              </button>}
              {selectedItem.media.length > 1 && (
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs text-white" aria-live="polite">
                  {currentIndex + 1} из {selectedItem.media.length}
                </p>
              )}
            </div>

            <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto border-t border-gray-200 bg-white p-5 pb-8 sm:w-[380px] sm:flex-none sm:border-l sm:border-t-0 sm:p-6">
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

              <div className="mt-auto flex flex-col gap-3">
                <Link
                  href={`/order?artwork=${encodeURIComponent(selectedItem.title)}`}
                  className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#ee5434] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#cc452b]"
                >
                  Уточнить наличие и заказать
                </Link>
                <button
                  type="button"
                  className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                  onClick={() => setShowContacts((current) => !current)}
                  aria-expanded={showContacts}
                  aria-controls="shop-contact-actions"
                >
                  {showContacts ? "Скрыть контакты" : "Связаться напрямую"}
                </button>
              </div>

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
