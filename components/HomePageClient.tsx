"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";
import GooglePlayIcon from "@/components/GooglePlayIcon";
import { useFocusTrap } from "@/lib/useFocusTrap";

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  coverImage?: string | null;
};

type HomePageClientProps = {
  articles: Article[];
};

const galleryWorks = [
  {
    src: "/images/gallery/q2.jpg",
    alt: "Интерьерная картина в светлой гостиной",
    title: "Картина для зоны отдыха",
    note: "Решение для гостиной, где нужен спокойный, но уверенный акцент.",
  },
  {
    src: "/images/gallery/aa7.jpg",
    alt: "Абстрактная работа акрилом",
    title: "Современная абстракция",
    note: "Подходит для интерьеров с чистой архитектурой и акцентной палитрой.",
  },
  {
    src: "/images/gallery/x1.jpg",
    alt: "Фактурная картина маслом",
    title: "Фактурное масло",
    note: "Для проектов, где важны глубина цвета и ручная пластика мазка.",
  },
];

const serviceCards = [
  {
    href: "/interior-paintings",
    title: "Интерьерные картины",
    text: "Подбор под конкретную стену, масштаб комнаты и общую палитру интерьера.",
  },
  {
    href: "/oil-paintings",
    title: "Картины маслом",
    text: "Фактурные, глубокие по цвету работы для дома, кабинета и статусного подарка.",
  },
  {
    href: "/acrylic-paintings",
    title: "Картины акрилом",
    text: "Современные акценты, серии и крупные форматы для актуальных пространств.",
  },
];

const processSteps = [
  {
    title: "Бриф и вводные",
    text: "Вы присылаете фото помещения, размеры стены, референсы или просто идею. Этого уже достаточно, чтобы понять направление.",
  },
  {
    title: "Предложение решения",
    text: "Я собираю идею под задачу: технику, формат, палитру и характер работы, чтобы она вписалась в пространство.",
  },
  {
    title: "Согласование и работа",
    text: "Уточняем сроки, этапы и ключевые детали. В процессе показываю промежуточные состояния, если это важно для проекта.",
  },
  {
    title: "Финал и доставка",
    text: "После финального согласования работа передаётся лично или отправляется, а я подсказываю, как лучше её разместить.",
  },
];

const faqs = [
  {
    question: "Что можно заказать?",
    answer:
      "Интерьерную картину, акцентную работу для конкретной комнаты, серию из нескольких полотен или настенную роспись под проект.",
  },
  {
    question: "Сколько времени занимает создание картины?",
    answer:
      "Обычно от одной до четырёх недель после согласования идеи, размера и техники.",
  },
  {
    question: "Как понять подходящий размер?",
    answer:
      "Достаточно прислать фото стены и примерные размеры мебели. Я предложу формат, который не потеряется и не перегрузит интерьер.",
  },
  {
    question: "Можно ли собрать проект для нескольких комнат?",
    answer:
      "Да. Можно сделать серию работ в одном ритме и палитре, чтобы весь интерьер выглядел собранно.",
  },
];

export default function HomePageClient({ articles }: HomePageClientProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const activeWork = modalIndex === null ? null : galleryWorks[modalIndex];

  useFocusTrap({
    active: modalIndex !== null,
    containerRef: modalRef,
    onEscape: () => setModalIndex(null),
    returnFocusRef: openButtonRef,
  });

  useEffect(() => {
    if (modalIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setModalIndex((prev) =>
          prev === null ? null : (prev + 1) % galleryWorks.length
        );
      }

      if (event.key === "ArrowLeft") {
        setModalIndex((prev) =>
          prev === null ? null : (prev - 1 + galleryWorks.length) % galleryWorks.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalIndex]);

  return (
    <main className="bg-stone-50 text-stone-900">
      <section
        className="relative isolate overflow-hidden"
        style={{
          backgroundImage: "url('/images/1hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-6 py-20 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-300">
            Art for House
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-tight md:text-7xl">
            Картины и роспись под интерьер, а не просто под пустую стену
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-100 md:text-xl">
            Помогаю подобрать формат, палитру и технику под ваш интерьер: масло,
            акрил, интерьерные серии и настенная роспись. Работаю для домов,
            квартир, офисов и коммерческих пространств.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/order"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              Обсудить заказ
            </Link>
            <Link
              href="/gallery"
              className="rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Смотреть работы
            </Link>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 backdrop-blur">
              <p className="text-sm font-semibold text-amber-200">Что можно заказать</p>
              <p className="mt-2 text-sm leading-6 text-stone-100">
                Картину под интерьер, серию работ, подарок или настенную роспись.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 backdrop-blur">
              <p className="text-sm font-semibold text-amber-200">Сроки</p>
              <p className="mt-2 text-sm leading-6 text-stone-100">
                В среднем от 1 до 4 недель после согласования идеи и формата.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 backdrop-blur">
              <p className="text-sm font-semibold text-amber-200">Стоимость</p>
              <p className="mt-2 text-sm leading-6 text-stone-100">
                Считаю индивидуально по размеру, технике и задаче, чтобы не закладывать в цену лишнее.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 backdrop-blur">
              <p className="text-sm font-semibold text-amber-200">Как проходит работа</p>
              <p className="mt-2 text-sm leading-6 text-stone-100">
                Бриф, подбор решения, этапы согласования, финал и доставка.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Оффер
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Понятный путь от идеи до готовой работы
              </h2>
            </div>
            <Link
              href="/contacts"
              className="text-sm font-semibold text-stone-700 underline-offset-4 transition hover:text-stone-950 hover:underline"
            >
              Связаться напрямую
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-8">
              <h3 className="text-2xl font-semibold">Что вы получаете</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-semibold text-stone-950">Подбор под интерьер</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Работаю от фото помещения, размера стены, мебели и общей палитры.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-semibold text-stone-950">Технику под задачу</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Масло для глубины, акрил для современного ритма, роспись для цельного сценария.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-semibold text-stone-950">Промежуточные согласования</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Показываю этапы, чтобы финал совпал с ожиданиями, а не удивил.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-semibold text-stone-950">Доставку и рекомендации</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Подскажу, как лучше разместить работу и оформить её в пространстве.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-stone-100 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Процесс
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-stone-950">
                    Как проходит работа
                  </h3>
                </div>
                <div className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                  По этапам
                </div>
              </div>

              <ol className="mt-6 grid gap-4">
                {processSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[3rem_1fr] items-start gap-4 rounded-2xl border border-stone-200 bg-white/90 px-4 py-4 shadow-sm"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white shadow-sm">
                      {index + 1}
                    </span>
                    <div className="pt-1">
                      <p className="font-semibold text-stone-950">{step.title}</p>
                      <p className="mt-2 text-sm leading-7 text-stone-700">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Услуги
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Выберите направление, которое ближе вашей задаче
            </h2>
          </div>
          <Link
            href="/order"
            className="text-sm font-semibold text-stone-700 underline-offset-4 transition hover:text-stone-950 hover:underline"
          >
            Оставить заявку
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {serviceCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-stone-900 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{card.text}</p>
              <p className="mt-6 text-sm font-semibold text-amber-700">
                Перейти к странице услуги
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 overflow-hidden rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_45%,#fafaf9_45%,#fff7ed_100%)] p-8 shadow-sm md:grid-cols-[1fr_0.9fr] md:items-center">
            <div className="text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
                Приложение
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
                Примерьте картину в интерьере через Android-приложение
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-200 md:text-base">
                В приложении можно открыть примерочную и посмотреть, как работа
                будет смотреться прямо на вашей стене. Это удобно, если нужно
                быстрее понять масштаб, композицию и характер картины в реальном пространстве.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-stone-100">
                  Android
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-stone-100">
                  Виртуальная примерка
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-stone-100">
                  Быстрый выбор масштаба
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.art4house.tryon&hl=ru"
                  target="_blank"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
                >
                  <GooglePlayIcon className="h-5 w-5" />
                  Открыть в Google Play
                </Link>
                <Link
                  href="/gallery"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
                >
                  Сначала посмотреть работы
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur">
              <div className="rounded-[1.5rem] bg-stone-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Art4House TryOn
                    </p>
                    <p className="mt-2 text-2xl font-bold">Картина на вашей стене за пару минут</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <GooglePlayIcon className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm leading-7 text-stone-200">
                  <p>1. Открываете приложение и загружаете фото комнаты.</p>
                  <p>2. Выбираете картину и примеряете её в пространстве.</p>
                  <p>3. Сравниваете варианты до обращения за заказом или покупкой.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Подборка работ
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Примеры, которые уже работают в интерьере
              </h2>
            </div>
            <Link
              href="/gallery"
              className="text-sm font-semibold text-stone-700 underline-offset-4 transition hover:text-stone-950 hover:underline"
            >
              Смотреть всю галерею
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {galleryWorks.map((work, index) => (
              <button
                key={work.src}
                type="button"
                className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-50 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                onClick={(event) => {
                  openButtonRef.current = event.currentTarget;
                  setModalIndex(index);
                }}
                aria-haspopup="dialog"
                aria-label={`Открыть работу: ${work.title}`}
              >
                <div className="relative aspect-[4/5] bg-stone-200">
                  <Image
                    src={work.src}
                    alt={work.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{work.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{work.note}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Работы уже нашли дом в разных странах</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                Это хороший индикатор доверия: проект можно собрать локально в Минске и отправить дальше по Беларуси или за её пределы.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-5xl">
              <ReactCountryFlag countryCode="AU" svg title="Австралия" />
              <ReactCountryFlag countryCode="NL" svg title="Нидерланды" />
              <ReactCountryFlag countryCode="IL" svg title="Израиль" />
              <ReactCountryFlag countryCode="PL" svg title="Польша" />
              <ReactCountryFlag countryCode="LT" svg title="Литва" />
              <ReactCountryFlag countryCode="ES" svg title="Испания" />
              <ReactCountryFlag countryCode="AE" svg title="ОАЭ" />
              <ReactCountryFlag countryCode="BY" svg title="Беларусь" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Статьи
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Материалы о живописи и подборе работ в интерьер
              </h2>
            </div>
            <Link
              href="/articles"
              className="text-sm font-semibold text-stone-700 underline-offset-4 transition hover:text-stone-950 hover:underline"
            >
              Все статьи
            </Link>
          </div>

          {articles.length === 0 ? (
            <p className="mt-8 text-sm text-stone-500">
              Статьи появятся здесь, когда будут добавлены материалы в архив.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {article.coverImage && (
                    <div className="relative mb-4 h-48 overflow-hidden rounded-2xl">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {new Date(article.createdAt).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-stone-950">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
          FAQ
        </p>
        <h2 className="mt-2 text-center text-3xl font-bold md:text-4xl">
          Частые вопросы перед заказом
        </h2>
        <div className="mt-8 space-y-4">
          {faqs.map((item, index) => (
            <div
              key={item.question}
              className="rounded-2xl border border-stone-200 bg-white p-2 shadow-sm"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-4 text-left text-base font-semibold text-stone-900"
                aria-expanded={faqOpenIndex === index}
                aria-controls={`home-faq-${index}`}
                onClick={() =>
                  setFaqOpenIndex((current) => (current === index ? null : index))
                }
              >
                <span>{item.question}</span>
                <span className="text-2xl text-amber-700">
                  {faqOpenIndex === index ? "−" : "+"}
                </span>
              </button>
              {faqOpenIndex === index && (
                <p
                  id={`home-faq-${index}`}
                  className="px-4 pb-4 text-sm leading-7 text-stone-600"
                >
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {activeWork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8"
          onClick={() => setModalIndex(null)}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-gallery-dialog-title"
            className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalIndex(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-stone-900 shadow"
              aria-label="Закрыть просмотр работы"
            >
              Закрыть
            </button>

            <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[26rem] bg-stone-100">
                <Image
                  src={activeWork.src}
                  alt={activeWork.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Пример работы
                </p>
                <h3 id="home-gallery-dialog-title" className="mt-3 text-3xl font-bold">
                  {activeWork.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-stone-600">
                  {activeWork.note}
                </p>
                <p className="mt-4 text-sm leading-7 text-stone-500">
                  Если нужен похожий характер работы, можно оттолкнуться от этой палитры и адаптировать размер, технику и композицию под ваш интерьер.
                </p>

                <div className="mt-auto flex flex-wrap gap-3 pt-8">
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
                    onClick={() =>
                      setModalIndex((prev) =>
                        prev === null ? null : (prev - 1 + galleryWorks.length) % galleryWorks.length
                      )
                    }
                  >
                    Предыдущая
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
                    onClick={() =>
                      setModalIndex((prev) =>
                        prev === null ? null : (prev + 1) % galleryWorks.length
                      )
                    }
                  >
                    Следующая
                  </button>
                  <Link
                    href="/order"
                    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                  >
                    Хочу похожее решение
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
