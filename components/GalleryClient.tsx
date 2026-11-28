"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import type { GalleryItem } from "@/lib/contentStore";
import {
  GALLERY_ALL_CATEGORY,
  GALLERY_CATEGORIES,
  orderGalleryCategories,
} from "@/lib/galleryCategories";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { canOptimizeArtworkImage } from "@/lib/imageOptimization";
import { galleryArtworkCaption, galleryImageAlt } from "@/lib/gallerySeo";

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const galleryItems = items;
  const [selectedCategory, setSelectedCategory] = useState<string>(GALLERY_ALL_CATEGORY);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const categories = useMemo(() => {
    const unique = galleryItems.map((item) => item.category).filter(Boolean);
    return [
      GALLERY_ALL_CATEGORY,
      ...orderGalleryCategories([...GALLERY_CATEGORIES, ...unique]),
    ];
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === GALLERY_ALL_CATEGORY) {
      return galleryItems;
    }

    return galleryItems.filter((item) => item.category === selectedCategory);
  }, [galleryItems, selectedCategory]);

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setCurrentIndex(null), 300);
  };

  useFocusTrap({
    active: currentIndex !== null,
    containerRef: modalRef,
    onEscape: closeModal,
    returnFocusRef: triggerRef,
  });

  const changeImage = (direction: "next" | "prev") => {
    if (currentIndex === null || filteredItems.length === 0) {
      return;
    }

    setFade(false);

    setTimeout(() => {
      if (direction === "next") {
        setCurrentIndex(
          currentIndex === filteredItems.length - 1 ? 0 : currentIndex + 1
        );
      } else {
        setCurrentIndex(
          currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1
        );
      }

      setFade(true);
    }, 200);
  };

  useEffect(() => {
    if (currentIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prev) => {
            if (prev === null || filteredItems.length === 0) {
              return prev;
            }

            return prev === 0 ? filteredItems.length - 1 : prev - 1;
          });
          setFade(true);
        }, 200);
      }

      if (event.key === "ArrowRight") {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prev) => {
            if (prev === null || filteredItems.length === 0) {
              return prev;
            }

            return prev === filteredItems.length - 1 ? 0 : prev + 1;
          });
          setFade(true);
        }, 200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredItems]);

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (currentIndex === null) {
      return;
    }

    const delta = event.changedTouches[0].clientX - touchStartX;
    if (delta > 50) {
      changeImage("prev");
    }
    if (delta < -50) {
      changeImage("next");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <section className="mb-12 grid items-end gap-6 border-b border-[#e5ded4] pb-10 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="af-eyebrow">Авторская живопись / Коллекции</p>
          <h1 className="af-display mt-4 max-w-xl text-[clamp(3.2rem,7vw,6.6rem)] leading-[0.98] text-[#292621]">
            Галерея <span className="italic text-[#d44d2c]">работ.</span>
          </h1>
          <p className="mt-4 text-sm font-semibold text-[#49423c]">Картины художницы Анны Побитко</p>
        </div>
        <div>
          <p className="max-w-lg text-base leading-8 text-[#6b655e]">
            Авторская живопись Art For House (Арт Фор Хаус): пейзажи, абстракция,
            растительные и анималистические сюжеты, работы в интерьере и настенная
            роспись. Выберите категорию и откройте интересующую картину.
          </p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.19em] text-[#d44d2c]">
            {galleryItems.length} работ в коллекции
          </p>
        </div>
      </section>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#68615a]">
        <p>Выберите направление</p>
        <p aria-live="polite">
          <span className="font-medium text-[#292621]">{selectedCategory}</span>
          <span className="px-2 text-[#c5bdb4]">/</span>
          Найдено: {filteredItems.length}
        </p>
      </div>

      <div className="-mx-4 mb-10 flex gap-1.5 overflow-x-auto px-4 pb-3 sm:mx-0 sm:flex-wrap sm:gap-2 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            aria-pressed={selectedCategory === cat}
            className={`shrink-0 whitespace-nowrap rounded-full border px-5 py-3 text-[13px] font-semibold transition duration-200 sm:text-sm ${
              selectedCategory === cat
                ? "border-[#ee5434] bg-[#ee5434] text-white shadow-[0_6px_18px_rgba(238,84,52,0.2)]"
                : "border-[#ded8ce] bg-[#eeece7] text-[#3d3934] hover:border-[#d44d2c] hover:bg-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="mb-8 text-center text-gray-600" role="status">
          В этой категории пока нет картин.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item, index) => (
          <button
            key={item.id || `${item.src}-${index}`}
            type="button"
            className="group overflow-hidden rounded-[22px] border border-[#e9e3da] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(30,26,22,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5434]"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setCurrentIndex(index);
              setTimeout(() => setVisible(true), 10);
            }}
            aria-label={`Открыть: ${galleryArtworkCaption(item)}`}
            aria-haspopup="dialog"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#eeeae4]">
              <Image
                src={item.src}
                alt={galleryImageAlt(item)}
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03] sm:p-3"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                unoptimized={!canOptimizeArtworkImage(item.src)}
              />
            </div>
            <div className="border-t border-[#eee9e2] bg-white px-3 py-3 text-left sm:px-4 sm:py-4">
              <p className="line-clamp-2 text-xs font-semibold text-[#312d29] sm:text-sm">
                {galleryArtworkCaption(item)}
              </p>
              {item.category.trim() && (
                <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[#b05b45]">{item.category}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      <section className="mt-16 flex flex-col gap-6 rounded-[30px] bg-[#2c2926] px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffab95]">Ваша идея — наша следующая работа</p>
          <h2 className="af-display mt-3 max-w-xl text-3xl leading-tight sm:text-4xl">Не нашли точную картину? Создадим вашу.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Можно выбрать палитру, размер, сюжет и технику под конкретный интерьер.</p>
        </div>
        <Link href="/order" className="af-accent-button shrink-0">Обсудить картину <span aria-hidden="true">↗</span></Link>
      </section>

      {currentIndex !== null && filteredItems[currentIndex] && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            className={`relative flex h-full w-full max-w-6xl flex-col items-center justify-center px-3 pb-4 pt-14 transition-transform duration-300 sm:p-8 ${
              visible ? "scale-100" : "scale-95"
            }`}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр картины"
          >
            <button
              type="button"
              className="absolute right-3 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20 sm:right-6 sm:top-4"
              onClick={closeModal}
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="flex min-h-0 flex-1 items-center justify-center">
              <Image
                src={filteredItems[currentIndex].src}
                alt={galleryImageAlt(filteredItems[currentIndex])}
                width={1400}
                height={900}
                className={`max-h-[65dvh] max-w-full rounded object-contain transition-all duration-300 ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
                style={{ height: "auto", width: "auto" }}
                unoptimized
              />
            </div>

            <button
              type="button"
              className="absolute bottom-28 left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-4xl font-bold text-white transition hover:bg-black/80 sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-y-1/2"
              onClick={(event) => {
                event.stopPropagation();
                changeImage("prev");
              }}
              aria-label="Предыдущее изображение"
            >
              ‹
            </button>

            <button
              type="button"
              className="absolute bottom-28 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-4xl font-bold text-white transition hover:bg-black/80 sm:bottom-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2"
              onClick={(event) => {
                event.stopPropagation();
                changeImage("next");
              }}
              aria-label="Следующее изображение"
            >
              ›
            </button>

            <div className="mt-3 flex w-full flex-col items-center gap-2 px-10 text-center text-white">
              <p className="text-sm font-medium sm:text-base">
                {galleryArtworkCaption(filteredItems[currentIndex])}
              </p>
              <p className="text-xs text-white/70" aria-live="polite">
                {currentIndex + 1} из {filteredItems.length}
              </p>
              <Link
                href={`/order?artwork=${encodeURIComponent(
                  `${filteredItems[currentIndex].name} — ${filteredItems[currentIndex].category}`
                )}`}
                className="af-accent-button mt-1"
              >
                Заказать похожую работу
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
