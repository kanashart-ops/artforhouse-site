"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const zlataPhotos = [
  { src: "/images/zlata/zlata1.jpg", alt: "Злата 1" },
  { src: "/images/zlata/zlata2.jpg", alt: "Злата 2" },
  { src: "/images/zlata/zlata3.jpg", alt: "Злата 3" },
  { src: "/images/zlata/zlata4.jpg", alt: "Злата 4" },
];

export default function ZlataPage() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(true);

  // клавиатура
  useEffect(() => {
    if (currentIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changePhoto("next");
      if (e.key === "ArrowLeft") changePhoto("prev");
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex]);

  const changePhoto = (dir: "next" | "prev") => {
    if (currentIndex === null) return;
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        dir === "next"
          ? (prev! + 1) % zlataPhotos.length
          : (prev! - 1 + zlataPhotos.length) % zlataPhotos.length
      );
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
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (currentIndex === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta > 50) changePhoto("prev");
    if (delta < -50) changePhoto("next");
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[70vh] text-white text-center"
        style={{
          backgroundImage: "url('/images/zlata/zlata-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 px-6">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
            🐾 Злата — арт-директор
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Главная вдохновительница студии{" "}
            <span className="text-amber-400 font-semibold">Art for House</span>
          </p>
        </div>
      </section>

      {/* Галерея */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {zlataPhotos.map((photo, index) => (
            <div
              key={index}
              className="cursor-pointer bg-gray-100 rounded-lg shadow hover:shadow-lg overflow-hidden flex items-center justify-center"
              onClick={() => openModal(index)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={400}
                className="w-full h-64 object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>

        <p className="mt-14 text-center text-gray-600 italic">
          💡 Нашли эту страницу? Поздравляем! <br />
          Покажите фото Златы при заказе — и получите секретную скидку 🐱
        </p>
      </section>

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
          >
            <button
              className="absolute top-4 right-6 text-4xl text-white hover:text-gray-300"
              onClick={closeModal}
            >
              ×
            </button>

            <Image
              src={zlataPhotos[currentIndex].src}
              alt={zlataPhotos[currentIndex].alt}
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

            {/* стрелки */}
            <button
              className="hidden sm:block absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold px-4 hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                changePhoto("prev");
              }}
            >
              ‹
            </button>
            <button
              className="hidden sm:block absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold px-4 hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                changePhoto("next");
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
