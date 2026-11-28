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
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <section className="mb-16 grid items-center gap-8 border-b border-[#e5ded4] pb-14 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <div>
          <p className="af-eyebrow">Авторская живопись / На заказ</p>
          <h1 className="af-display mt-5 text-[clamp(3.2rem,7vw,6.6rem)] leading-[0.98] text-[#292621]">
            Создадим <span className="italic text-[#d44d2c]">вашу картину.</span>
          </h1>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-[#8b7b70]">Заказ картин Art For House</p>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#696158]">
            От первой идеи и выбора техники до готовой работы на вашей стене.
            Подберём размер, сюжет, цвет и материалы под ваш интерьер.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#order-form" className="af-accent-button">Оставить заявку <span aria-hidden="true">↗</span></a>
            <Link href="/contacts" className="af-light-button">Связаться напрямую</Link>
          </div>
        </div>
        <div className="relative min-h-[370px] overflow-hidden rounded-[30px] bg-[#eee8df] sm:min-h-[500px]">
          <Image src="/images/order/444.jpg" alt="Пример авторской картины маслом Art For House"
            fill sizes="(max-width: 1023px) 100vw, 42vw" priority className="object-cover" />
          <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#302d29] backdrop-blur-md">
            Каждая работа индивидуальна
          </span>
        </div>
      </section>

      {/* Выбор техники */}
      <section className="mb-12 sm:mb-16">
        <h2 className="af-display mb-6 text-center text-4xl text-[#292621] sm:mb-8 sm:text-5xl">
          Выбор техники
        </h2>
        <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          Каждая техника имеет свой характер, настроение и глубину.
          Выберите стиль, который ближе именно вам.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
          {/* Масло */}
          <div className="group flex flex-col items-center rounded-[28px] border border-[#e8e2d9] bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,26,22,0.1)] sm:p-5">
            <Image
              src="/images/order/444.jpg"
              alt="Картина маслом"
              width={600}
              height={400}
              className="mb-5 h-60 w-full rounded-[20px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <h3 className="mb-3 text-2xl font-semibold text-[#302d29]">Масло</h3>
            <p className="text-[15px] leading-7 text-[#6b655e]">
              Классическая техника, в которой каждый мазок остаётся живым и фактурным.
              Масляная живопись придаёт глубину, насыщенность и долговечность произведению.
            </p>
          </div>

          {/* Акрил */}
          <div className="group flex flex-col items-center rounded-[28px] border border-[#e8e2d9] bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,26,22,0.1)] sm:p-5">
            <Image
              src="/images/order/333.jpg"
              alt="Картина акрилом"
              width={600}
              height={400}
              className="mb-5 h-60 w-full rounded-[20px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <h3 className="mb-3 text-2xl font-semibold text-[#302d29]">Акрил</h3>
            <p className="text-[15px] leading-7 text-[#6b655e]">
              Современная техника с яркой палитрой и быстрой сушкой.
              Акрил позволяет создавать динамичные картины с выразительной текстурой и чистыми оттенками.
            </p>
          </div>

          {/* Роспись стен */}
          <div className="group flex flex-col items-center rounded-[28px] border border-[#e8e2d9] bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,26,22,0.1)] sm:p-5">
            <Image
              src="/images/order/222.jpg"
              alt="Роспись стен"
              width={600}
              height={400}
              className="mb-5 h-60 w-full rounded-[20px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <h3 className="mb-3 text-2xl font-semibold text-[#302d29]">Роспись стен</h3>
            <p className="text-[15px] leading-7 text-[#6b655e]">
              Авторская настенная роспись, превращающая стены в произведение искусства.
              Индивидуальный сюжет подчеркнёт стиль и атмосферу вашего пространства.
            </p>
          </div>
        </div>
      </section>

      {/* Процесс заказа */}
      <section className="mb-12 sm:mb-16">
        <h2 className="af-display mb-6 text-center text-4xl text-[#292621] sm:mb-8 sm:text-5xl">
          Процесс заказа
        </h2>
        <ol className="mx-auto grid max-w-4xl list-decimal gap-3 pl-5 text-base leading-relaxed text-[#625b54] marker:font-bold marker:text-[#ee5434] sm:text-lg">
          <li className="rounded-2xl border border-[#e8e2d9] bg-white px-5 py-5">
            <span className="font-bold text-[#d44d2c]">Обсуждение идеи —</span> мы вместе определяем стиль, сюжет и настроение будущей картины или росписи.
          </li>
          <li className="rounded-2xl border border-[#e8e2d9] bg-white px-5 py-5">
            <span className="font-bold text-[#d44d2c]">Визуализация —</span> при необходимости покажу, как работа будет выглядеть именно в вашем интерьере.
          </li>
          <li className="rounded-2xl border border-[#e8e2d9] bg-white px-5 py-5">
            <span className="font-bold text-[#d44d2c]">Подбор материалов —</span> подбираю холст или готовлю поверхность стены, уточняю детали, рассчитываю сроки и стоимость.
          </li>
          <li className="rounded-2xl border border-[#e8e2d9] bg-white px-5 py-5">
            <span className="font-bold text-[#d44d2c]">Создание работы —</span> процесс можно наблюдать в моём Instagram и TikTok.
          </li>
          <li className="rounded-2xl border border-[#e8e2d9] bg-white px-5 py-5">
            <span className="font-bold text-[#d44d2c]">Финальное согласование —</span> после завершения отправляю фото и видео готовой работы. Возможны корректировки.
          </li>
          <li className="rounded-2xl border border-[#e8e2d9] bg-white px-5 py-5">
            <span className="font-bold text-[#d44d2c]">Доставка —</span>
            в Минске — личная доставка,
            по Беларуси — курьерские службы,
            по миру — авиапочта в надёжной упаковке.
          </li>
        </ol>
      </section>

      {/* Форма заказа */}
      <section id="order-form" className="mb-16 scroll-mt-24 sm:mb-20">
        <h2 className="af-display mb-6 text-center text-4xl text-[#292621] sm:text-5xl">
          Оставить заявку
        </h2>
        <p className="text-center text-gray-700 mb-8">
          Пожалуйста, внимательно указывайте номер телефона или @Telegram —
          чтобы я могла с вами связаться.
        </p>

        <div className="mx-auto max-w-xl rounded-[32px] border border-[#e8e2d9] bg-white p-5 shadow-sm sm:p-9">
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
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#ee5434] focus:ring-2 focus:ring-[#ffe0d3]"
            required
          />
          <label htmlFor="order-contact" className="text-sm font-semibold text-gray-800">Телефон или Telegram</label>
          <input
            id="order-contact"
            type="text"
            name="contact"
            placeholder="Телефон или @Telegram"
            maxLength={150}
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#ee5434] focus:ring-2 focus:ring-[#ffe0d3]"
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
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#ee5434] focus:ring-2 focus:ring-[#ffe0d3]"
            rows={4}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-12 w-full rounded-full bg-[#ee5434] px-6 py-3 font-semibold text-white transition hover:bg-[#ca4126] disabled:cursor-wait disabled:opacity-50"
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
