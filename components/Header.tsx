"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Instagram } from "lucide-react"; // оставляем lucide для Instagram

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* Лого + иконки справа */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-amber-600 transition"
          >
            Art for House
          </Link>

          {/* блок иконок справа от текста */}
          <div className="flex items-center gap-3 ml-2">
            {/* Instagram */}
            <Link
              href="https://www.instagram.com/art_for_house.by"
              target="_blank"
              aria-label="Instagram Art for House"
              className="text-gray-700 hover:text-pink-600 transition transform hover:scale-110"
            >
              <Instagram size={22} />
            </Link>

            {/* TikTok (оригинальный SVG) */}
            <Link
              href="https://www.tiktok.com/@artforhouse"
              target="_blank"
              aria-label="TikTok Art for House"
              className="text-gray-700 hover:text-black transition transform hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="22"
                height="22"
                fill="currentColor"
              >
                <path d="M33.63 14.68c-1.95-.02-3.86-.63-5.44-1.73v13.42c0 5.47-4.43 9.9-9.9 9.9S8.4 31.84 8.4 26.37s4.43-9.9 9.9-9.9c.65 0 1.29.06 1.9.18v4.7c-.61-.18-1.24-.27-1.9-.27a5.2 5.2 0 0 0 0 10.4 5.2 5.2 0 0 0 5.2-5.2V4.5h4.69c.35 4.61 4.03 8.23 8.65 8.53v4.7z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Десктоп-меню (без изменений) */}
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <Link href="/">Главная</Link>
          <Link href="/gallery">Галерея</Link>
          <Link href="/shop">В наличии</Link>
          <Link href="/order">Заказ</Link>
          <Link href="/contacts">Контакты</Link>
          <Link href="/oil-paintings">Масло</Link>
          <Link href="/acrylic-paintings">Акрил</Link>
          <Link href="/interior-paintings">Интерьер</Link>
        </nav>

        {/* Кнопка-бургер (только мобилки) */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Открыть меню"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Мобильное меню */}
      {isOpen && (
        <nav className="md:hidden bg-white shadow-md flex flex-col gap-4 px-6 py-6 text-gray-700 font-medium">
          <Link href="/" onClick={() => setIsOpen(false)}>Главная</Link>
          <Link href="/gallery" onClick={() => setIsOpen(false)}>Галерея</Link>
          <Link href="/shop" onClick={() => setIsOpen(false)}>В наличии</Link>
          <Link href="/order" onClick={() => setIsOpen(false)}>Заказ</Link>
          <Link href="/contacts" onClick={() => setIsOpen(false)}>Контакты</Link>
          <Link href="/oil-paintings" onClick={() => setIsOpen(false)}>Масло</Link>
          <Link href="/acrylic-paintings" onClick={() => setIsOpen(false)}>Акрил</Link>
          <Link href="/interior-paintings" onClick={() => setIsOpen(false)}>Интерьер</Link>
        </nav>
      )}
    </header>
  );
}
