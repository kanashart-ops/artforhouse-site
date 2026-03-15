"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFocusTrap } from "@/lib/useFocusTrap";

const zlataPhotos = [
  {
    src: "/images/zlata/zlata1.jpg",
    alt: "Злата внимательно смотрит на посетителей сайта",
    note: "Контролирует дедлайны, качество упаковки и общий уровень вдохновения.",
  },
  {
    src: "/images/zlata/zlata2.jpg",
    alt: "Злата в расслабленном режиме",
    note: "Лично проверяет, достаточно ли в проекте уюта, тепла и мягкого света.",
  },
  {
    src: "/images/zlata/zlata3.jpg",
    alt: "Злата рядом с художественными материалами",
    note: "Следит, чтобы каждая работа получала одобрение главного арт-куратора.",
  },
  {
    src: "/images/zlata/zlata4.jpg",
    alt: "Злата позирует для секретной страницы",
    note: "Редкий кадр для тех, кто дошёл до потайной страницы сайта.",
  },
];

const perks = [
  "Секретная скидка за найденную страницу",
  "Приоритетный плюсик к настроению проекта",
  "Личный знак одобрения от Златы",
];

export default function ZlataPage() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [visible, setVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const activePhoto = currentIndex === null ? null : zlataPhotos[currentIndex];

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setCurrentIndex(null), 300);
  };

  useFocusTrap({
    active: currentIndex !== null,
    containerRef: modalRef,
    onEscape: closeModal,
    returnFocusRef: triggerRef,
  });

  useEffect(() => {
    if (currentIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setCurrentIndex((prev) =>
          prev === null ? null : (prev + 1) % zlataPhotos.length
        );
      }
      if (event.key === "ArrowLeft") {
        setCurrentIndex((prev) =>
          prev === null ? null : (prev - 1 + zlataPhotos.length) % zlataPhotos.length
        );
      }
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f5f5f4_55%,_#e7e5e4)] text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(120,53,15,0.08),rgba(255,255,255,0))]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-amber-700">
              Secret Room
            </p>
            <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
              Злата, директор по настроению
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              Если вы добрались сюда, значит нашли скрытую страницу с главным
              пушистым инспектором студии. Это не просто пасхалка, а закрытый клуб
              людей с хорошим вкусом и вниманием к деталям.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {perks.map((perk) => (
                <span
                  key={perk}
                  className="rounded-full border border-amber-200 bg-white/90 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm"
                >
                  {perk}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/order"
                className="rounded-full bg-stone-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Хочу секретный бонус
              </Link>
              <Link
                href="/gallery"
                className="rounded-full border border-stone-300 px-7 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
              >
                Вернуться к картинам
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-2xl backdrop-blur">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-200/50 blur-2xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Image
                src="/images/zlata/zlata-bg.jpg"
                alt="Злата на секретной странице"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-stone-200 bg-white/90 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
              Роль
            </p>
            <h2 className="mt-3 text-2xl font-bold">Кошачий арт-куратор</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Следит, чтобы в студии было достаточно света, спокойствия и
              вдохновения для хороших работ.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white/90 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
              Привилегия
            </p>
            <h2 className="mt-3 text-2xl font-bold">Пасхалка для своих</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Скажите при заказе, что нашли страницу Златы, и получите скрытый
              бонус к заказу. Без этой страницы магия не активируется.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white/90 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
              Кодовая фраза
            </p>
            <h2 className="mt-3 text-2xl font-bold">«Злата одобряет»</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Этого достаточно, чтобы я поняла, что вы не случайный гость, а
              человек, который умеет находить интересное.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Секретная галерея
            </p>
            <h2 className="mt-2 text-3xl font-bold">Лучшие кадры директора студии</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-600">
            Нажмите на фото, чтобы открыть крупно. Да, эта страница существует
            исключительно для хорошего настроения и чуть большей любви к бренду.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {zlataPhotos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              className="group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setCurrentIndex(index);
                setTimeout(() => setVisible(true), 10);
              }}
              aria-label={`Открыть фото Златы ${index + 1}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-stone-100">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-600">{photo.note}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-stone-200 bg-white/90 p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Как использовать страницу
          </p>
          <h2 className="mt-3 text-3xl font-bold">Что сказать при заказе</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-stone-700">
            При обращении просто напишите: «Я нашёл страницу Златы». Этого
            достаточно, чтобы активировать секретный бонус и получить
            дополнительный повод для улыбки.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/order"
              className="rounded-full bg-amber-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Перейти к заявке
            </Link>
            <Link
              href="/contacts"
              className="rounded-full border border-stone-300 px-7 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
            >
              Написать напрямую
            </Link>
          </div>
        </div>
      </section>

      {activePhoto && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фото Златы"
            className={`relative w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white transition-transform duration-300 ${
              visible ? "scale-100" : "scale-95"
            }`}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={(event) => {
              const delta = event.changedTouches[0].clientX - touchStartX;
              if (delta > 50) {
                setCurrentIndex((prev) =>
                  prev === null ? null : (prev - 1 + zlataPhotos.length) % zlataPhotos.length
                );
              }
              if (delta < -50) {
                setCurrentIndex((prev) =>
                  prev === null ? null : (prev + 1) % zlataPhotos.length
                );
              }
            }}
          >
            <button
              type="button"
              className="absolute right-5 top-5 z-10 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-stone-900 shadow"
              onClick={closeModal}
              aria-label="Закрыть фото"
            >
              Закрыть
            </button>

            <div className="grid md:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[28rem] bg-stone-100">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
                  Секретный кадр
                </p>
                <h3 className="mt-3 text-3xl font-bold">Злата на связи</h3>
                <p className="mt-4 text-base leading-7 text-stone-700">
                  {activePhoto.note}
                </p>
                <p className="mt-4 text-sm leading-7 text-stone-500">
                  Сохраните этот момент в памяти и не забудьте использовать кодовую
                  фразу при заказе.
                </p>

                <div className="mt-auto flex flex-wrap gap-3 pt-8">
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === null ? null : (prev - 1 + zlataPhotos.length) % zlataPhotos.length
                      )
                    }
                  >
                    Предыдущее
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === null ? null : (prev + 1) % zlataPhotos.length
                      )
                    }
                  >
                    Следующее
                  </button>
                  <Link
                    href="/order"
                    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                  >
                    Активировать бонус
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
