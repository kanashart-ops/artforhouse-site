"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Instagram, Menu, X } from "lucide-react";
import GooglePlayIcon from "@/components/GooglePlayIcon";
import { useFocusTrap } from "@/lib/useFocusTrap";

const mainLinks = [
  { href: "/", label: "Главная" },
  { href: "/gallery", label: "Галерея" },
  { href: "/shop", label: "В наличии" },
  { href: "/articles", label: "Статьи" },
  { href: "/contacts", label: "Контакты" },
];

const serviceLinks = [
  { href: "/interior-paintings", label: "Интерьерные картины" },
  { href: "/oil-paintings", label: "Картины маслом" },
  { href: "/acrylic-paintings", label: "Картины акрилом" },
];

const tiktokIcon = (
  <svg aria-hidden="true" viewBox="0 0 48 48" width="21" height="21" fill="currentColor">
    <path d="M33.63 14.68c-1.95-.02-3.86-.63-5.44-1.73v13.42c0 5.47-4.43 9.9-9.9 9.9S8.4 31.84 8.4 26.37s4.43-9.9 9.9-9.9c.65 0 1.29.06 1.9.18v4.7c-.61-.18-1.24-.27-1.9-.27a5.2 5.2 0 0 0 5.2-5.2V4.5h4.69c.35 4.61 4.03 8.23 8.65 8.53v4.7z" />
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isOpen = openPath === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    active: isOpen,
    containerRef: menuDialogRef,
    onEscape: () => setOpenPath(null),
    returnFocusRef: menuButtonRef,
  });

  const desktopLinkClass = (href: string) =>
    pathname === href
      ? "rounded-full bg-[#f7eee9] px-3.5 py-2 text-sm font-semibold text-[#d44d2c]"
      : "rounded-full px-3.5 py-2 text-sm font-medium text-[#383631] transition hover:bg-[#f5f2ee] hover:text-[#d44d2c]";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-7">
      <div className="mx-auto max-w-[1480px] rounded-[26px] border border-[#e9e6df] bg-white/95 shadow-[0_8px_36px_rgba(27,25,22,0.07)] backdrop-blur-xl">
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:gap-5 xl:px-7">
          <Link href="/" className="group flex shrink-0 flex-col leading-none" aria-label="Art For House — главная">
            <span className="text-[20px] font-black uppercase tracking-[-0.09em] text-[#242321] sm:text-[25px]">
              ART<span className="text-[#ee5434]">.</span>FOR<span className="font-light">HOUSE</span>
            </span>
            <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.23em] text-[#77716a] sm:text-[9px]">
              Художница Анна Побитко
            </span>
          </Link>

          <nav aria-label="Основная навигация" className="hidden items-center gap-0.5 xl:flex">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={desktopLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-[#383631] transition hover:bg-[#f5f2ee] [&::-webkit-details-marker]:hidden">
                Услуги <ChevronDown size={15} className="transition group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 top-full z-[80] mt-3 min-w-56 rounded-2xl border border-[#e9e6df] bg-white p-2 shadow-xl">
                {serviceLinks.map((link) => (
                  <Link key={link.href} href={link.href}
                    className="block rounded-xl px-4 py-3 text-sm text-[#383631] transition hover:bg-[#f7eee9] hover:text-[#c94425]">
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-1.5 lg:flex">
              <a href="https://www.instagram.com/art_for_house.by" target="_blank" rel="noopener noreferrer"
                aria-label="Art For House в Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#44413c] transition hover:bg-[#f7eee9] hover:text-[#d44d2c]">
                <Instagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@artforhouse" target="_blank" rel="noopener noreferrer"
                aria-label="Art For House в TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#44413c] transition hover:bg-[#f7eee9] hover:text-[#d44d2c]">
                {tiktokIcon}
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.art4house.tryon&hl=ru"
                target="_blank" rel="noopener noreferrer" aria-label="Приложение Art4House в Google Play"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#44413c] transition hover:bg-[#f7eee9] hover:text-[#d44d2c]">
                <GooglePlayIcon className="h-[21px] w-[21px]" />
              </a>
            </div>
            <Link href="/order"
              className="hidden min-h-11 items-center gap-2 rounded-full bg-[#ee5434] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ca4126] sm:inline-flex">
              Заказать <ArrowUpRight size={17} />
            </Link>
            <button type="button" ref={menuButtonRef}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f2ee] text-[#2c2926] xl:hidden"
              onClick={() => setOpenPath(isOpen ? null : pathname)}
              aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={isOpen} aria-controls="mobile-navigation-dialog" aria-haspopup="dialog">
              {isOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="fixed inset-0 z-[75] overflow-y-auto bg-[#1d1b19]/45 px-3 pb-6 pt-24 xl:hidden"
            onClick={() => setOpenPath(null)}>
            <div id="mobile-navigation-dialog" ref={menuDialogRef} role="dialog" aria-modal="true"
              aria-label="Мобильное меню"
              className="mx-auto max-w-2xl rounded-[28px] bg-white p-5 shadow-2xl sm:p-7"
              onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.23em] text-[#d44d2c]">Навигация</p>
                <button type="button" onClick={() => setOpenPath(null)}
                  aria-label="Закрыть мобильное меню"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f5f0] text-[#292621]">
                  <X size={21} />
                </button>
              </div>
              <nav className="grid gap-1" aria-label="Навигация на мобильных устройствах">
                {[...mainLinks, ...serviceLinks, { href: "/order", label: "Заказать картину" }].map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpenPath(null)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={pathname === link.href
                      ? "rounded-2xl bg-[#f7eee9] px-4 py-3 text-base font-semibold text-[#c94425]"
                      : "rounded-2xl px-4 py-3 text-base font-medium text-[#2c2926] transition hover:bg-[#f7f5f0]"}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#eee9e2] pt-5 text-sm">
                <a href="https://www.instagram.com/art_for_house.by" target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#f7f5f0] px-4 py-2">Instagram</a>
                <a href="https://www.tiktok.com/@artforhouse" target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#f7f5f0] px-4 py-2">TikTok</a>
                <a href="https://play.google.com/store/apps/details?id=com.art4house.tryon&hl=ru" target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#f7f5f0] px-4 py-2">Google Play</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
