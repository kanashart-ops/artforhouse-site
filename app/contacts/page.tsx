import {
  Instagram,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Video,
} from "lucide-react";
import Link from "next/link";

export default function ContactsPage() {
  return (
    <main className="p-10 max-w-4xl mx-auto text-center bg-gray-50">
      {/* Заголовок */}
      <h1 className="text-5xl font-extrabold mb-8 text-gray-900">
        Свяжитесь со мной
      </h1>

      {/* Текстовое описание */}
      <p className="text-xl text-gray-800 mb-6 leading-relaxed">
        🎨 Мои картины рождаются из вдохновения и ваших идей.
      </p>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        Если вы хотите обсудить заказ, сотрудничество или просто поделиться
        замыслом — напишите мне.
      </p>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        Я открыта к диалогу в любое время и рада превратить вашу задумку
        в искусство, которое украсит пространство и наполнит его смыслом.
      </p>
      <p className="text-lg text-gray-700 mb-10 leading-relaxed font-medium">
        📩 Свяжитесь со мной — и вместе мы создадим больше, чем просто картину.
      </p>

      {/* Иконки соцсетей */}
      <div className="flex flex-wrap justify-center gap-10 mb-12">
        {/* Instagram */}
        <Link
          href="https://www.instagram.com/art_for_house.by?igsh=Y3pzeWl6eXV0aDJo"
          target="_blank"
          className="flex flex-col items-center gap-2 text-gray-700 hover:text-pink-600 transition transform hover:scale-110"
        >
          <Instagram size={40} />
          <span className="text-base font-medium">Instagram</span>
        </Link>

        {/* TikTok */}
        <Link
          href="https://www.tiktok.com/@artforhouse?_t=ZM-8zoHlBlwoHV&_r=1"
          target="_blank"
          className="flex flex-col items-center gap-2 text-gray-700 hover:text-black transition transform hover:scale-110"
        >
          <Video size={40} />
          <span className="text-base font-medium">TikTok</span>
        </Link>

        {/* Telegram */}
        <Link
          href="https://t.me/AnnPab"
          target="_blank"
          className="flex flex-col items-center gap-2 text-gray-700 hover:text-sky-500 transition transform hover:scale-110"
        >
          <Send size={40} />
          <span className="text-base font-medium">Telegram</span>
        </Link>

        {/* WhatsApp */}
        <Link
          href="https://wa.me/375293517220"
          target="_blank"
          className="flex flex-col items-center gap-2 text-gray-700 hover:text-green-500 transition transform hover:scale-110"
        >
          <MessageCircle size={40} />
          <span className="text-base font-medium">WhatsApp</span>
        </Link>

        {/* Viber */}
        <Link
          href="viber://chat?number=%2B375293517220"
          target="_blank"
          className="flex flex-col items-center gap-2 text-gray-700 hover:text-purple-500 transition transform hover:scale-110"
        >
          <MessageCircle size={40} />
          <span className="text-base font-medium">Viber</span>
        </Link>

        {/* Телефон */}
        <a
          href="tel:+375293517220"
          className="flex flex-col items-center gap-2 text-gray-700 hover:text-blue-600 transition transform hover:scale-110"
        >
          <Phone size={40} />
          <span className="text-base font-medium">Телефон</span>
        </a>

        {/* Email */}
        <a
          href="mailto:gribovsksya@gmail.com"
          className="flex flex-col items-center gap-2 text-gray-700 hover:text-red-600 transition transform hover:scale-110"
        >
          <Mail size={40} />
          <span className="text-base font-medium">Email</span>
        </a>
      </div>

      {/* Контакты текстом */}
      <div className="mt-10 text-center text-lg text-gray-900">
        <p>
          📞 Телефон:{" "}
          <a
            href="tel:+375293517220"
            className="font-semibold hover:text-amber-600 transition"
          >
            +375 (29) 351-72-20
          </a>
        </p>
        <p>
          📧 Email:{" "}
          <a
            href="mailto:gribovsksya@gmail.com"
            className="font-semibold hover:text-amber-600 transition"
          >
            gribovsksya@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
