import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MessageCircle, Phone, Send } from "lucide-react";

const footerNav = [
  { href: "/", label: "Главная" },
  { href: "/gallery", label: "Галерея" },
  { href: "/shop", label: "В наличии" },
  { href: "/order", label: "На заказ" },
  { href: "/articles", label: "Статьи" },
  { href: "/contacts", label: "Контакты" },
  { href: "/oil-paintings", label: "Масло" },
  { href: "/acrylic-paintings", label: "Акрил" },
  { href: "/interior-paintings", label: "Интерьерные картины" },
];

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden rounded-t-[36px] bg-[#262420] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:pt-20">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.25fr_0.85fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#ff997d]">
              Искусство для вашего пространства
            </p>
            <p className="af-display mt-5 max-w-xl text-4xl leading-[1.09] sm:text-5xl">
              Картина, которая станет частью вашего дома.
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              Art For House (Арт Фор Хаус) — авторская живопись и картины на заказ
              художницы Анны Побитко. Минск, Беларусь.
            </p>
            <Link href="/order" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#ee5434] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d94728]">
              Обсудить картину <ArrowUpRight size={18} />
            </Link>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Разделы сайта</h2>
            <nav className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
              {footerNav.map((link) => (
                <Link key={link.href} href={link.href}
                  className="text-sm text-white/80 transition hover:text-[#ff997d]">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Связаться с художницей</h2>
            <div className="mt-6 grid gap-3 text-sm text-white/80">
              <a href="https://t.me/AnnPab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#ff997d]"><Send size={17} /> Telegram</a>
              <a href="https://www.instagram.com/art_for_house.by/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#ff997d]"><Instagram size={17} /> Instagram</a>
              <a href="https://www.tiktok.com/@artforhouse" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff997d]">TikTok · @artforhouse</a>
              <a href="https://wa.me/375293517220" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#ff997d]"><MessageCircle size={17} /> WhatsApp</a>
              <a href="viber://chat?number=%2B375293517220" className="hover:text-[#ff997d]">Viber</a>
              <a href="tel:+375293517220" className="flex items-center gap-2 hover:text-[#ff997d]"><Phone size={17} /> +375 (29) 351-72-20</a>
              <a href="mailto:gribovsksya@gmail.com" className="flex items-center gap-2 hover:text-[#ff997d]"><Mail size={17} /> gribovsksya@gmail.com</a>
              <a href="https://play.google.com/store/apps/details?id=com.art4house.tryon&hl=ru" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff997d]">Приложение Art4House — Google Play</a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Art f
            <Link href="/tacaltaz" title="🐾" className="text-white/75 transition hover:text-[#ff997d]">o</Link>
            r House. Все права защищены.
          </p>
          <p>Created by <a href="https://t.me/Art_aeee" target="_blank" rel="noopener noreferrer" className="font-semibold text-white transition hover:text-[#ff997d]">ArtPab</a></p>
        </div>
      </div>
    </footer>
  );
}
