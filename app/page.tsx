"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ReactCountryFlag from "react-country-flag";

export default function HomePage() {
  // =========================
  // 1) ДАННЫЕ КАРТИН
  const galleryWorks = [
    { src: "/images/gallery/work1.jpg", alt: "Работа 1" },
    { src: "/images/gallery/work2.jpg", alt: "Работа 2" },
    { src: "/images/gallery/work3.jpg", alt: "Работа 3" },
    { src: "/images/gallery/work4.jpg", alt: "Работа 4" },
    { src: "/images/gallery/work5.jpg", alt: "Работа 5" },
    { src: "/images/gallery/work6.jpg", alt: "Работа 6" },
  ];

  const featuredWorks = galleryWorks.slice(0, 3);

  // =========================
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // =========================
  const faqs = [
    { q: "Какие форматы и размеры картин доступны для заказа?", a: "Вы можете выбрать стандартный размер или заказать картину по индивидуальным параметрам." },
    { q: "Сколько времени занимает создание картины?", a: "В среднем от 1 до 4 недель, в зависимости от размера, техники и сложности сюжета." },
    { q: "Можно ли заказать картину по фото или индивидуальной идее?", a: "Да, я работаю с вашими идеями, фотографиями и создаю уникальные авторские работы." },
    { q: "Делаете ли вы визуализацию в интерьере?", a: "Да, при необходимости покажу, как картина будет смотреться в вашем пространстве и реальном масштабе." },
    { q: "Какие материалы вы используете?", a: "Профессиональные холсты и краски (масло, акрил), а также премиум-жикле на высококачественной основе." },
    { q: "Делаете ли вы небольшие корректировки?", a: "Да, после завершения возможны мелкие правки, чтобы результат был полностью согласован." },
    { q: "Как происходит доставка?", a: "В Минске — личная доставка. По Беларуси — курьерские службы. По всему миру — авиапочтой с надёжной упаковкой." },
    { q: "Если картина не подойдёт по размеру или стилю?", a: "Мы заранее согласовываем все детали и делаем визуализацию, чтобы избежать такой ситуации." },
  ];

  // =========================
  useEffect(() => {
    if (modalIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalIndex(null);
      if (e.key === "ArrowRight")
        setModalIndex((prev) =>
          prev === null ? null : (prev + 1) % galleryWorks.length
        );
      if (e.key === "ArrowLeft")
        setModalIndex((prev) =>
          prev === null ? null : (prev - 1 + galleryWorks.length) % galleryWorks.length
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex, galleryWorks.length]);

  // =========================
  return (
    <main className="flex flex-col">
      {/* Hero-блок */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen text-white text-center"
        style={{
          backgroundImage: "url('/images/1hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 px-6">
          <h1 className="text-6xl font-extrabold mb-6">Art for House</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Интерьерные картины и настенные росписи премиум-качества.
            Масло, акрил, жикле. Доставка по Беларуси и миру.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/gallery" className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full shadow hover:bg-gray-100 transition">
              Галерея
            </a>
            <a href="/shop" className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full shadow hover:bg-gray-100 transition">
              В наличии
            </a>
            <a href="/order" className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full shadow hover:bg-gray-100 transition">
              Заказ
            </a>
          </div>
        </div>
      </section>

      {/* Обо мне и студии */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Anna Pobitko</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Я — художник и основатель студии <span className="font-semibold text-amber-600">Art for House</span>. Это творческое пространство, где каждая картина становится отражением истории своего владельца.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Искусство сопровождает меня с детства: первые рисунки, художественная школа, а затем первые серьёзные проекты.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Сегодня я создаю интерьерные картины на заказ, работаю с маслом и акрилом, а также реализую арт-проекты для тех, кто ценит красоту и индивидуальность.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Мои картины украшают дома и коллекции в Минске, Дубае и других странах Европы.
          </p>
        </div>
      </section>

      {/* Работы превью */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Работы</h2>
          <p className="text-lg text-gray-700 mb-10">
            Ознакомьтесь с примерами картин и росписей.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredWorks.map((work, i) => (
              <div
                key={work.src}
                className="bg-white rounded shadow overflow-hidden flex items-center justify-center h-64 transition duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => setModalIndex(i)}
              >
                <Image
                  src={work.src}
                  alt={work.alt}
                  width={600}
                  height={400}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>

          <div className="mt-10">
            <a
              href="/gallery"
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full shadow hover:bg-gray-800 transition"
            >
              Смотреть все работы
            </a>
          </div>
        </div>
      </section>

      {/* Модалка */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setModalIndex(null)}
        >
          <div
            className="relative max-w-6xl w-full flex items-center justify-center px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-6 text-white text-3xl font-bold"
              onClick={() => setModalIndex(null)}
            >
              ×
            </button>

            <button
              className="absolute left-4 text-white text-4xl bg-black/40 px-3 py-1 rounded-full hover:bg-black"
              onClick={() =>
                setModalIndex((prev) =>
                  prev === null ? null : (prev - 1 + galleryWorks.length) % galleryWorks.length
                )
              }
            >
              ‹
            </button>
            <button
              className="absolute right-4 text-white text-4xl bg-black/40 px-3 py-1 rounded-full hover:bg-black"
              onClick={() =>
                setModalIndex((prev) =>
                  prev === null ? null : (prev + 1) % galleryWorks.length
                )
              }
            >
              ›
            </button>

            <Image
              src={galleryWorks[modalIndex].src}
              alt={galleryWorks[modalIndex].alt}
              width={1200}
              height={800}
              unoptimized
              className="max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* Мировая доставка */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-lg text-gray-700 mb-6">
            🌍 <span className="font-semibold">Art For House</span> уже нашли дом в разных уголках мира:
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-5xl">
            <ReactCountryFlag countryCode="AU" svg title="Австралия — 1" />
            <ReactCountryFlag countryCode="NL" svg title="Нидерланды — 2" />
            <ReactCountryFlag countryCode="IL" svg title="Израиль — 2" />
            <ReactCountryFlag countryCode="PL" svg title="Польша — 5" />
            <ReactCountryFlag countryCode="LT" svg title="Литва — 7" />
            <ReactCountryFlag countryCode="RU" svg title="Россия — 9" />
            <ReactCountryFlag countryCode="ES" svg title="Испания — 4" />
            <ReactCountryFlag countryCode="AE" svg title="ОАЭ — 30+" />
            <ReactCountryFlag countryCode="BY" svg title="Беларусь — 200+" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center text-gray-900">Частые вопросы</h2>
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <div key={index} className="border-b pb-4">
                <button
                  className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-800 hover:text-amber-600"
                  onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}
                >
                  {item.q}
                  <span className="ml-2 text-2xl">{faqOpenIndex === index ? "−" : "+"}</span>
                </button>
                {faqOpenIndex === index && (
                  <p className="mt-3 text-gray-700">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
