/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

const IMG_EXT = "jpg";

function makeRange(prefix: string, start: number, end: number, category: string) {
  const items = [];
  for (let i = start; i <= end; i++) {
    items.push({
      src: `/images/gallery/${prefix}${i}.${IMG_EXT}`,
      category,
      name: `${prefix}${i}`,
    });
  }
  return items;
}

const CATEGORIES = [
  "Все",
  "пейзаж",
  "премиум",
  "абстракция",
  "анималистика",
  "растения",
  "интерьерная роспись",
  "в интерьере",
  "я",
] as const;
type Category = (typeof CATEGORIES)[number];

export default function GalleryPage() {
  const galleryItems = useMemo(
    () => [
      ...makeRange("a", 1, 21, "пейзаж"),
      ...makeRange("aa", 1, 20, "абстракция"),
      ...makeRange("w", 1, 4, "анималистика"),
      ...makeRange("q", 1, 35, "в интерьере"),
      ...makeRange("x", 1, 13, "премиум"),
      ...makeRange("s", 1, 13, "растения"),
      ...makeRange("e", 1, 3, "интерьерная роспись"),
      ...makeRange("d", 1, 11, "я"),
    ],
    []
  );

  const [selectedCategory, setSelectedCategory] = useState<Category>("Все");
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);

  const filteredItems = useMemo(
    () =>
      selectedCategory === "Все"
        ? galleryItems
        : galleryItems.filter((item) => item.category === selectedCategory),
    [galleryItems, selectedCategory]
  );

  const [loadedImages, setLoadedImages] = useState<boolean[]>(
    new Array(filteredItems.length).fill(false)
  );
  useEffect(() => {
    setLoadedImages(new Array(filteredItems.length).fill(false));
  }, [filteredItems.length]);

  useEffect(() => {
    if (currentIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") changeImage("prev");
      if (e.key === "ArrowRight") changeImage("next");
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredItems]);

  const changeImage = (direction: "next" | "prev") => {
    if (currentIndex === null) return;
    setFade(false);
    setTimeout(() => {
      if (direction === "next") {
        setCurrentIndex(currentIndex === filteredItems.length - 1 ? 0 : currentIndex + 1);
      } else {
        setCurrentIndex(currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1);
      }
      setFade(true);
    }, 200);
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setTimeout(() => setVisible(true), 10);
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setCurrentIndex(null), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (currentIndex === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta > 50) changeImage("prev");
    if (delta < -50) changeImage("next");
  };

  return (
    <main className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-3 text-center text-gray-900">Галерея</h1>

      <div className="mb-8 text-center text-gray-700">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
          <span className="font-medium">Категория:</span>
          <span className="font-semibold text-gray-900">{selectedCategory}</span>
          <span className="opacity-60">•</span>
          <span>Найдено: {filteredItems.length}</span>
        </span>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border transition
              ${
                selectedCategory === cat
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Сетка без подписей */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            className="cursor-pointer group overflow-hidden rounded-lg shadow hover:shadow-lg transition"
            onClick={() => openModal(index)}
            aria-label={`Открыть ${item.name}`}
          >
            <div
              className={`relative w-full h-64 bg-gray-100 transition-opacity duration-700 ${
                loadedImages[index] ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={item.src}
                alt={`Картина ${item.name}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={() => {
                  setLoadedImages((prev) => {
                    const arr = [...prev];
                    arr[index] = true;
                    return arr;
                  });
                }}
                unoptimized
              />
            </div>
          </button>
        ))}
      </div>

      {/* Модалка */}
      {currentIndex !== null && (
        <div
          className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <div
            className={`relative flex flex-col items-center max-w-6xl w-full p-4 transition-transform duration-300 ${
              visible ? "scale-100" : "scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
          >
            {/* крестик */}
            <button
              className="absolute top-4 right-6 text-4xl text-white hover:text-gray-300"
              onClick={closeModal}
              aria-label="Закрыть"
            >
              ×
            </button>

            {/* картинка */}
            <div className="flex justify-center items-center">
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

            {/* стрелки */}
            <button
              className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl font-bold px-4 hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                changeImage("prev");
              }}
              aria-label="Предыдущее изображение"
            >
              ‹
            </button>
            <button
              className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl font-bold px-4 hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
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
