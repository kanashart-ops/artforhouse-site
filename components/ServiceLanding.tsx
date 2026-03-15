import Image from "next/image";
import Link from "next/link";

type WorkItem = {
  src: string;
  alt: string;
  title: string;
  note: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type LinkItem = {
  href: string;
  label: string;
  description: string;
};

type StatItem = {
  value: string;
  label: string;
};

type ServiceLandingProps = {
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  offer: string[];
  stats: StatItem[];
  benefits: string[];
  process: string[];
  works: WorkItem[];
  faqs: FaqItem[];
  ctaTitle: string;
  ctaText: string;
  internalLinks: LinkItem[];
};

export default function ServiceLanding({
  eyebrow,
  title,
  description,
  heroImage,
  heroAlt,
  offer,
  stats,
  benefits,
  process,
  works,
  faqs,
  ctaTitle,
  ctaText,
  internalLinks,
}: ServiceLandingProps) {
  return (
    <main className="bg-stone-50 text-stone-900">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
              {eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              {description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {offer.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-6 text-stone-700"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/order"
                className="rounded-full bg-stone-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Обсудить заказ
              </Link>
              <Link
                href="/gallery"
                className="rounded-full border border-stone-300 px-7 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                Смотреть галерею
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-stone-200 shadow-xl">
            <Image
              src={heroImage}
              alt={heroAlt}
              width={1200}
              height={1400}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-stone-200 bg-white px-5 py-6 shadow-sm"
            >
              <p className="text-3xl font-bold text-stone-950">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold">Что получает клиент</h2>
          <ul className="mt-6 space-y-4 text-base leading-7 text-stone-700">
            {benefits.map((item) => (
              <li key={item} className="rounded-2xl bg-stone-50 px-4 py-4">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-white shadow-sm">
          <h2 className="text-3xl font-bold">Как проходит работа</h2>
          <ol className="mt-6 space-y-4">
            {process.map((item, index) => (
              <li
                key={item}
                className="grid grid-cols-[2.5rem_1fr] items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-base leading-7 text-stone-100">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Подборка работ
            </p>
            <h2 className="mt-2 text-3xl font-bold">Примеры для этой услуги</h2>
          </div>
          <Link
            href="/gallery"
            className="text-sm font-semibold text-stone-700 underline-offset-4 transition hover:text-stone-950 hover:underline"
          >
            Перейти в полную галерею
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {works.map((work) => (
            <article
              key={work.src}
              className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/5] bg-stone-100">
                <Image
                  src={work.src}
                  alt={work.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{work.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{work.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-bold">Частые вопросы</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-stone-900">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Внутренние ссылки
            </p>
            <h2 className="mt-2 text-3xl font-bold">С чего продолжить</h2>
            <div className="mt-6 space-y-4">
              {internalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5 transition hover:border-stone-900 hover:bg-white"
                >
                  <p className="font-semibold text-stone-950">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-stone-950 px-8 py-10 text-white shadow-xl">
          <h2 className="max-w-3xl text-3xl font-bold">{ctaTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-200">
            {ctaText}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/order"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              Оставить заявку
            </Link>
            <Link
              href="/contacts"
              className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Перейти в контакты
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
