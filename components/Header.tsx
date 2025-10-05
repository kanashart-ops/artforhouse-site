"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // иконки

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* Логотип */}
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 hover:text-amber-600 transition"
        >
          Art for House
        </Link>

        {/* Десктоп-меню */}
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
