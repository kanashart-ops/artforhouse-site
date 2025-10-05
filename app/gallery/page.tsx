"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const galleryItems = [
  { src: "/images/gallery/work1.jpg" },
  { src: "/images/gallery/work2.jpg" },
  { src: "/images/gallery/work3.jpg" },
  { src: "/images/gallery/work4.jpg" },
  { src: "/images/gallery/work5.jpg" },
  { src: "/images/gallery/work6.jpg" },
  { src: "/images/gallery/work7.jpg" },
  { src: "/images/gallery/work9.jpg" },
  // новые фото 100–131
  ...Array.from({ length: 32 }, (_, i) => ({
    src: `/images/gallery/${100 + i}.jpg`,
  })),
];

export default function GalleryPage() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>(
    new Array(galleryItems.length).fill(false)
  );

  // стрелки клавиатуры
  useEffect(() => {
    if (currentIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") changeImage("prev");
      if (e.key === "ArrowRight") changeImage("next");
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const changeImage = (direction: "next" | "prev") => {
    if (currentIndex === null) return;
    setFade(false);
    setTimeout(() => {
      if (direction === "next") {
        setCurrentIndex(
          currentIndex === galleryItems.length - 1 ? 0 : currentIndex + 1
        );
      } else {
        setCurrentIndex(
          currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1
        );
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

  // свайпы
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
    <main className="p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
        Галерея
      </h1>

      {/* сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {galleryItems.map((item, index) => (
          <div
            key={index}
            className="cursor-pointer group overflow-hidden rounded-lg shadow hover:shadow-lg transition"
            onClick={() => openModal(index)}
          >
            <div
              className={`relative w-full h-64 bg-gray-100 transition-opacity duration-700 ${
                loadedImages[index] ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={item.src}
                alt={`Картина ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={() => {
                  setLoadedImages((prev) => {
                    const arr = [...prev];
                    arr[index] = true;
                    return arr;
                  });
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* модалка */}
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
          >
            {/* крестик */}
            <button
              className="absolute top-4 right-6 text-4xl text-white hover:text-gray-300"
              onClick={closeModal}
            >
              ×
            </button>

            {/* картинка */}
            <div className="flex justify-center items-center">
              <Image
                src={galleryItems[currentIndex].src}
                alt={`Картина ${currentIndex + 1}`}
                width={1200}
                height={800}
                className={`rounded transition-all duration-300 ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  objectFit: "contain",
                  maxHeight: "80vh",
                }}
              />
            </div>

            {/* стрелки */}
            <button
              className="hidden sm:block absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold px-4 hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                changeImage("prev");
              }}
            >
              ‹
            </button>
            <button
              className="hidden sm:block absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold px-4 hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                changeImage("next");
              }}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
