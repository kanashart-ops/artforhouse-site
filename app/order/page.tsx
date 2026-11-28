"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

type OrderStatus = "idle" | "loading" | "success" | "error";

export default function OrderPage() {
  const [status, setStatus] = useState<OrderStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [comment, setComment] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState("");

  useEffect(() => {
    const artwork = new URLSearchParams(window.location.search).get("artwork")?.trim();
    if (!artwork) return;
    const value = artwork.slice(0, 140);
    setSelectedArtwork(value);
    setComment((previous) =>
      previous.trim() ? previous : `Меня интересует работа «${value}». Хотелось бы уточнить детали.`
    );
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const comment = String(formData.get("comment") ?? "").trim();

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, comment }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || result?.ok !== true) {
        throw new Error(result?.error || "Не удалось отправить заявку.");
      }

      form.reset();
      setComment("");
      setSelectedArtwork("");
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ошибка при отправке. Попробуйте позже."
      );
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      {/* Заголовок */}
      <h1 className="mb-8 text-center text-3xl font-extrabold text-gray-900 sm:mb-12 sm:text-5xl">
        Заказ картин
      </h1>

      {/* Выбор техники */}
      <section className="mb-12 sm:mb-16">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900 sm:mb-8 sm:text-3xl">
          Выбор техники
        </h2>
        <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          Каждая техника имеет свой характер, настроение и глубину.
          Выберите стиль, который ближе именно вам.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
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
      <section className="mb-12 sm:mb-16">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900 sm:mb-8 sm:text-3xl">
          Процесс заказа
        </h2>
        <ol className="mx-auto max-w-4xl space-y-5 text-base leading-relaxed text-gray-700 sm:space-y-6 sm:text-lg">
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
      <section id="order-form" className="mb-16 scroll-mt-24 sm:mb-20">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
          Оставить заявку
        </h2>
        <p className="text-center text-gray-700 mb-8">
          Пожалуйста, внимательно указывайте номер телефона или @Telegram —
          чтобы я могла с вами связаться.
        </p>

        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          {selectedArtwork && (
            <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Вы выбрали: <strong>{selectedArtwork}</strong>
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="order-name" className="text-sm font-semibold text-gray-800">Ваше имя</label>
          <input
            id="order-name"
            type="text"
            name="name"
            placeholder="Ваше имя"
            autoComplete="name"
            maxLength={100}
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            required
          />
          <label htmlFor="order-contact" className="text-sm font-semibold text-gray-800">Телефон или Telegram</label>
          <input
            id="order-contact"
            type="text"
            name="contact"
            placeholder="Телефон или @Telegram"
            maxLength={150}
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            required
          />
          <label htmlFor="order-comment" className="text-sm font-semibold text-gray-800">
            Пожелания к картине (необязательно)
          </label>
          <textarea
            id="order-comment"
            name="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Сюжет, размер, техника или название понравившейся работы"
            maxLength={2000}
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            rows={4}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-12 w-full rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-50"
          >
            {status === "loading" ? "Отправка..." : "Отправить заявку"}
          </button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-medium">
            <a href="https://t.me/AnnPab" target="_blank" rel="noopener noreferrer"
              className="rounded-full border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50">
              Написать в Telegram
            </a>
            <Link href="/contacts"
              className="rounded-full border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50">
              Другие контакты
            </Link>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-gray-500">
            Если отправка формы недоступна, можно связаться с художницей напрямую.
          </p>
        </div>

        <div role="status" aria-live="polite">
          {status === "success" && (
            <p className="text-green-600 text-center mt-4">
              Заявка успешно отправлена!
            </p>
          )}
          {status === "error" && (
            <p className="mx-auto mt-4 max-w-xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              Заявка не отправлена: {errorMessage} Напишите художнице напрямую по ссылкам выше.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
