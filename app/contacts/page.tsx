import {
  Instagram,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Video,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Контакты художницы | Art For House",
  description: "Свяжитесь с художницей Анной Побитко по вопросам заказа картин, интерьерной живописи, росписи стен и сотрудничества.",
  path: "/contacts",
});

export default function ContactsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <section className="mb-12 grid items-center gap-8 border-b border-[#e5ded4] pb-14 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <div>
          <p className="af-eyebrow">Знакомство / Контакты</p>
      {/* Заголовок */}
      <h1 className="af-display mt-5 text-[clamp(3.2rem,6.6vw,6.1rem)] leading-[1.02] text-[#292621]">
        Свяжитесь со мной
      </h1>

      {/* Текстовое описание */}
      <p className="mt-7 text-xl font-semibold leading-8 text-[#312d29]">
        🎨 Мои картины рождаются из вдохновения и ваших идей.
      </p>
      <p className="mt-4 text-base leading-8 text-[#6b655e]">
        Если вы хотите обсудить заказ, сотрудничество или просто поделиться
        замыслом — напишите мне.
      </p>
      <p className="mt-4 text-base leading-8 text-[#6b655e]">
        Я открыта к диалогу в любое время и рада превратить вашу задумку
        в искусство, которое украсит пространство и наполнит его смыслом.
      </p>
      <p className="mt-5 text-base font-semibold leading-8 text-[#d44d2c]">
        📩 Свяжитесь со мной — и вместе мы создадим больше, чем просто картину.
      </p>


        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-[30px] bg-[#eee8df] sm:min-h-[470px]">
          <Image src="/images/1hero-bg.jpg" alt="Авторская живопись Art For House в интерьере"
            fill sizes="(max-width: 1023px) 100vw, 42vw" className="object-cover" />
          <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#302d29] backdrop-blur-md">
            Анна Побитко · Art For House
          </span>
        </div>
      </section>
      <div className="mb-8">
        <p className="af-eyebrow">На связи</p>
        <h2 className="af-display mt-3 text-3xl leading-tight text-[#292621] sm:text-4xl">Выберите удобный способ общения.</h2>
      </div>

      {/* Иконки соцсетей */}
      <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {/* Instagram */}
        <Link
          href="https://www.instagram.com/art_for_house.by?igsh=Y3pzeWl6eXV0aDJo"
          target="_blank"
          className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-[22px] border border-[#e8e2d9] bg-white px-4 py-6 text-[#36322d] transition duration-300 hover:-translate-y-1 hover:border-[#edb3a5] hover:shadow-md"
        >
          <Instagram size={29} />
          <span className="text-base font-medium">Instagram</span>
        </Link>

        {/* TikTok */}
        <Link
          href="https://www.tiktok.com/@artforhouse?_t=ZM-8zoHlBlwoHV&_r=1"
          target="_blank"
          className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-[22px] border border-[#e8e2d9] bg-white px-4 py-6 text-[#36322d] transition duration-300 hover:-translate-y-1 hover:border-[#edb3a5] hover:shadow-md"
        >
          <Video size={29} />
          <span className="text-base font-medium">TikTok</span>
        </Link>

        {/* Telegram */}
        <Link
          href="https://t.me/AnnPab"
          target="_blank"
          className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-[22px] border border-[#e8e2d9] bg-white px-4 py-6 text-[#36322d] transition duration-300 hover:-translate-y-1 hover:border-[#edb3a5] hover:shadow-md"
        >
          <Send size={29} />
          <span className="text-base font-medium">Telegram</span>
        </Link>

        {/* WhatsApp */}
        <Link
          href="https://wa.me/375293517220"
          target="_blank"
          className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-[22px] border border-[#e8e2d9] bg-white px-4 py-6 text-[#36322d] transition duration-300 hover:-translate-y-1 hover:border-[#edb3a5] hover:shadow-md"
        >
          <MessageCircle size={29} />
          <span className="text-base font-medium">WhatsApp</span>
        </Link>

        {/* Viber */}
        <Link
          href="viber://chat?number=%2B375293517220"
          target="_blank"
          className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-[22px] border border-[#e8e2d9] bg-white px-4 py-6 text-[#36322d] transition duration-300 hover:-translate-y-1 hover:border-[#edb3a5] hover:shadow-md"
        >
          <MessageCircle size={29} />
          <span className="text-base font-medium">Viber</span>
        </Link>

        {/* Телефон */}
        <a
          href="tel:+375293517220"
          className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-[22px] border border-[#e8e2d9] bg-white px-4 py-6 text-[#36322d] transition duration-300 hover:-translate-y-1 hover:border-[#edb3a5] hover:shadow-md"
        >
          <Phone size={29} />
          <span className="text-base font-medium">Телефон</span>
        </a>

        {/* Email */}
        <a
          href="mailto:gribovsksya@gmail.com"
          className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-[22px] border border-[#e8e2d9] bg-white px-4 py-6 text-[#36322d] transition duration-300 hover:-translate-y-1 hover:border-[#edb3a5] hover:shadow-md"
        >
          <Mail size={29} />
          <span className="text-base font-medium">Email</span>
        </a>
      </div>

      {/* Контакты текстом */}
      <div className="mt-10 flex flex-col gap-3 rounded-[28px] bg-[#2c2926] px-5 py-7 text-base text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          📞 Телефон:{" "}
          <a
            href="tel:+375293517220"
            className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:text-[#ff997d]"
          >
            +375 (29) 351-72-20
          </a>
        </p>
        <p>
          📧 Email:{" "}
          <a
            href="mailto:gribovsksya@gmail.com"
            className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:text-[#ff997d]"
          >
            gribovsksya@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
