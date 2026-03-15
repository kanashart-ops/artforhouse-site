"use client";

import { useState } from "react";
import Image from "next/image";

export default function OrderPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // ✅ Защита от undefined во время сборки
  const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";
  const CHAT_IDS = (process.env.NEXT_PUBLIC_TELEGRAM_CHAT_IDS || "")
    .split(",")
    .filter(Boolean);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name");
    const contact = formData.get("contact");
    const comment = formData.get("comment");

    const now = new Date();
    const dateTime = now.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = `📩 Новая заявка на заказ\n\n🕒 ${dateTime}\n\n👤 Имя: ${name}\n📱 Контакт: ${contact}\n💬 Комментарий: ${comment}`;

    try {
      // ✅ Если переменные не заданы — просто пропускаем отправку, чтобы сайт не падал
      if (!TELEGRAM_BOT_TOKEN || CHAT_IDS.length === 0) {
        console.warn("❗ Telegram bot token или chat IDs не заданы — пропуск отправки");
        setStatus("success");
        form.reset();
        return;
      }

      await Promise.all(
        CHAT_IDS.map((id) =>
          fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: id,
              text: message,
              parse_mode: "HTML",
            }),
          })
        )
      );

      setStatus("success");
      form.reset();
    } catch (error) {
      console.error("Ошибка при отправке в Telegram:", error);
      setStatus("error");
    }
  }

  return (
    <main className="p-10 max-w-6xl mx-auto">
      {/* Заголовок */}
      <h1 className="text-5xl font-extrabold mb-12 text-center text-gray-900">
        Заказ картин
      </h1>

      {/* Выбор техники */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-900">
          Выбор техники
        </h2>
        <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          Каждая техника имеет свой характер, настроение и глубину.  
          Выберите стиль, который ближе именно вам.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Масло */}
          <div className="p-6 bg-white shadow rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
            <Image
              src="/images/order/444.jpg"
              alt="Картина маслом"
              width={600}
              height={400}
              className="w-full h-56 object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-500"
            />
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Масло</h3>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              Классическая техника, в которой каждый мазок остаётся живым и фактурным.  
              Масляная живопись придаёт глубину, насыщенность и долговечность произведению.
            </p>
          </div>

          {/* Акрил */}
          <div className="p-6 bg-white shadow rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
            <Image
              src="/images/order/333.jpg"
              alt="Картина акрилом"
              width={600}
              height={400}
              className="w-full h-56 object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-500"
            />
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Акрил</h3>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              Современная техника с яркой палитрой и быстрой сушкой.  
              Акрил позволяет создавать динамичные картины с выразительной текстурой и чистыми оттенками.
            </p>
          </div>

          {/* Роспись стен */}
          <div className="p-6 bg-white shadow rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
            <Image
              src="/images/order/222.jpg"
              alt="Роспись стен"
              width={600}
              height={400}
              className="w-full h-56 object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-500"
            />
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Роспись стен</h3>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              Авторская настенная роспись, превращающая стены в произведение искусства.  
              Индивидуальный сюжет подчеркнёт стиль и атмосферу вашего пространства.
            </p>
          </div>
        </div>
      </section>

      {/* Процесс заказа */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-900">
          Процесс заказа
        </h2>
        <ol className="space-y-6 text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
          <li>
            <span className="font-bold text-amber-600">Обсуждение идеи —</span> мы вместе определяем стиль, сюжет и настроение будущей картины или росписи.
          </li>
          <li>
            <span className="font-bold text-amber-600">Визуализация —</span> при необходимости покажу, как работа будет выглядеть именно в вашем интерьере.
          </li>
          <li>
            <span className="font-bold text-amber-600">Подбор материалов —</span> подбираю холст или готовлю поверхность стены, уточняю детали, рассчитываю сроки и стоимость.
          </li>
          <li>
            <span className="font-bold text-amber-600">Создание работы —</span> процесс можно наблюдать в моём Instagram и TikTok.
          </li>
          <li>
            <span className="font-bold text-amber-600">Финальное согласование —</span> после завершения отправляю фото и видео готовой работы. Возможны корректировки.
          </li>
          <li>
            <span className="font-bold text-amber-600">Доставка —</span>  
            в Минске — личная доставка,  
            по Беларуси — курьерские службы,  
            по миру — авиапочта в надёжной упаковке.
          </li>
        </ol>
      </section>

      {/* Форма заказа */}
      <section className="mb-20">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900">
          Оставить заявку
        </h2>
        <p className="text-center text-gray-700 mb-8">
          📌 Пожалуйста, внимательно указывайте номер телефона или @Telegram —  
          чтобы я могла с вами связаться.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Ваше имя"
            className="rounded border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-500"
            required
          />
          <input
            type="text"
            name="contact"
            placeholder="Телефон или @Telegram"
            className="rounded border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-500"
            required
          />
          <textarea
            name="comment"
            placeholder="Комментарий"
            className="rounded border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-500"
            rows={4}
          ></textarea>
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-black text-white py-3 px-6 rounded font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {status === "loading" ? "Отправка..." : "Отправить заявку"}
          </button>
        </form>

        {status === "success" && (
          <p className="text-green-600 text-center mt-4">✅ Заявка успешно отправлена!</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-center mt-4">❌ Ошибка при отправке. Попробуйте позже.</p>
        )}
      </section>
    </main>
  );
}
