"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/contentStore";
import {
  GALLERY_ALL_CATEGORY,
  GALLERY_CATEGORIES,
  orderGalleryCategories,
} from "@/lib/galleryCategories";
import { useFocusTrap } from "@/lib/useFocusTrap";

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(GALLERY_ALL_CATEGORY);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => setGalleryItems(data.items ?? []))
      .catch(() => setGalleryItems([]));
  }, []);

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

  useEffect(() => {
    setLoadedImages(new Array(filteredItems.length).fill(false));
  }, [filteredItems.length]);

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
    <main className="mx-auto max-w-7xl p-10">
      <h1 className="mb-3 text-center text-3xl font-bold text-gray-900">Галерея</h1>

      <div className="mb-8 text-center text-gray-700">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2">
          <span className="font-medium">Категория:</span>
          <span className="font-semibold text-gray-900">{selectedCategory}</span>
          <span className="opacity-60">•</span>
          <span>Найдено: {filteredItems.length}</span>
        </span>
      </div>

      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            aria-pressed={selectedCategory === cat}
            className={`rounded-full border px-4 py-2 transition ${
              selectedCategory === cat
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            type="button"
            className="group overflow-hidden rounded-lg shadow transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setCurrentIndex(index);
              setTimeout(() => setVisible(true), 10);
            }}
            aria-label={`Открыть ${item.name}`}
            aria-haspopup="dialog"
          >
            <div
              className={`relative h-64 w-full bg-gray-100 transition-opacity duration-700 ${
                loadedImages[index] ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={item.src}
                alt={`Картина ${item.name}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onLoad={() => {
                  setLoadedImages((prev) => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                  });
                }}
                unoptimized
              />
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
            className={`relative flex w-full max-w-6xl flex-col items-center p-4 transition-transform duration-300 ${
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
              className="absolute right-6 top-4 text-4xl text-white transition hover:text-gray-300"
              onClick={closeModal}
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="flex items-center justify-center">
              <Image
                src={filteredItems[currentIndex].src}
                alt={`Картина ${filteredItems[currentIndex].name}`}
                width={1400}
                height={900}
                className={`rounded transition-all duration-300 ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
                style={{ objectFit: "contain", maxHeight: "80vh" }}
                unoptimized
              />
            </div>

            <button
              type="button"
              className="absolute left-4 top-1/2 hidden -translate-y-1/2 px-4 text-5xl font-bold text-white transition hover:text-gray-300 sm:block"
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
              className="absolute right-4 top-1/2 hidden -translate-y-1/2 px-4 text-5xl font-bold text-white transition hover:text-gray-300 sm:block"
              onClick={(event) => {
                event.stopPropagation();
                changeImage("next");
              }}
              aria-label="Следующее изображение"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
