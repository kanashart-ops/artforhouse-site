"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Menu, X } from "lucide-react";
import GooglePlayIcon from "@/components/GooglePlayIcon";
import { useFocusTrap } from "@/lib/useFocusTrap";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/gallery", label: "Галерея" },
  { href: "/shop", label: "В наличии" },
  { href: "/order", label: "Заказ" },
  { href: "/contacts", label: "Контакты" },
  { href: "/oil-paintings", label: "Масло" },
  { href: "/acrylic-paintings", label: "Акрил" },
  { href: "/interior-paintings", label: "Интерьер" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    active: isOpen,
    containerRef: menuDialogRef,
    onEscape: () => setIsOpen(false),
    returnFocusRef: menuButtonRef,
  });

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 transition hover:text-amber-600"
          >
            Art for House
          </Link>

          <div className="ml-2 flex items-center gap-3">
            <Link
              href="https://www.instagram.com/art_for_house.by"
              target="_blank"
              aria-label="Instagram Art for House"
              className="text-gray-700 transition hover:text-pink-600"
            >
              <Instagram size={22} />
            </Link>

            <Link
              href="https://www.tiktok.com/@artforhouse"
              target="_blank"
              aria-label="TikTok Art for House"
              className="text-gray-700 transition hover:text-black"
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

            <Link
              href="https://play.google.com/store/apps/details?id=com.art4house.tryon&hl=ru"
              target="_blank"
              aria-label="Приложение Art4House в Google Play"
              className="text-gray-700 transition hover:text-emerald-600"
            >
              <GooglePlayIcon className="h-[22px] w-[22px]" />
            </Link>
          </div>
        </div>

        <nav className="hidden gap-6 text-gray-700 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`font-medium transition hover:text-amber-600 ${
                pathname === link.href ? "text-amber-700" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className="text-gray-700 md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-dialog"
          aria-haspopup="dialog"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 px-4 pt-20 md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            id="mobile-navigation-dialog"
            ref={menuDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Мобильное меню"
            className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <nav className="flex flex-col gap-3 text-gray-700">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`rounded-2xl px-4 py-3 font-medium transition hover:bg-amber-50 hover:text-amber-700 ${
                    pathname === link.href ? "bg-amber-50 text-amber-700" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
