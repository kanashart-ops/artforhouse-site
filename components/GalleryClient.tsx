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
    <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:p-10">
      <h1 className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
        Галерея картин Анны Побитко
      </h1>
      <p className="mx-auto mb-6 max-w-3xl text-center text-base leading-7 text-gray-700">
        Авторская живопись Art For House (Арт Фор Хаус): пейзажи, абстракция,
        растительные и анималистические сюжеты, работы в интерьере и настенная
        роспись. Выберите категорию и откройте интересующую картину.
      </p>

      <div className="mb-8 text-center text-gray-700">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2">
          <span className="font-medium">Категория:</span>
          <span className="font-semibold text-gray-900">{selectedCategory}</span>
          <span className="opacity-60">•</span>
          <span>Найдено: {filteredItems.length}</span>
        </span>
      </div>

      <div className="-mx-3 mb-8 flex gap-2 overflow-x-auto px-3 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-3 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            aria-pressed={selectedCategory === cat}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm transition sm:text-base ${
              selectedCategory === cat
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
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
            className="group overflow-hidden rounded-lg shadow transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setCurrentIndex(index);
              setTimeout(() => setVisible(true), 10);
            }}
            aria-label={`Открыть: ${galleryArtworkCaption(item)}`}
            aria-haspopup="dialog"
          >
            <div className="relative h-40 w-full bg-gray-100 sm:h-56 lg:h-64">
              <Image
                src={item.src}
                alt={galleryImageAlt(item)}
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                unoptimized={!canOptimizeArtworkImage(item.src)}
              />
            </div>
            <div className="border-t border-gray-100 bg-white px-2 py-2 text-left sm:px-3 sm:py-3">
              <p className="text-xs font-medium text-gray-900 sm:text-sm">
                {galleryArtworkCaption(item)}
              </p>
              {item.category.trim() && (
                <p className="mt-1 text-xs text-gray-600">{item.category}</p>
              )}
            </div>
          </button>
        ))}
      </div>

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
                className="mt-1 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-amber-100"
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
