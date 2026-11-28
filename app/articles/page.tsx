// app/articles/page.tsx
import Link from "next/link";
import Image from "next/image";
import { fetchAllArticles } from "@/lib/articles";
import type { Article } from "@/lib/articles";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Статьи о живописи и интерьере | Art For House",
  description: "Статьи о картинах, живописи, оформлении интерьера и выборе искусства для дома от Art For House.",
  path: "/articles",
});

export const revalidate = 60; // или можешь убрать

export default async function ArticlesPage() {
  const articles: Article[] = await fetchAllArticles();

  const sorted = articles
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <section className="mb-12 grid gap-6 border-b border-[#e5ded4] pb-10 md:grid-cols-[1fr_0.85fr] md:items-end">
        <div>
          <p className="af-eyebrow">Art For House / Журнал</p>
          <h1 className="af-display mt-4 text-[clamp(3.2rem,7vw,6.6rem)] leading-[0.98] text-[#292621]">
            Истории <span className="italic text-[#d44d2c]">об искусстве.</span>
          </h1>
          <p className="mt-4 text-sm font-semibold text-[#49423c]">Статьи о живописи и интерьере</p>
        </div>
        <p className="max-w-lg text-base leading-8 text-[#6b655e]">
          Идеи, практические советы, подборка работ и вдохновение для дома.
          Всё, что помогает найти своё искусство.
        </p>
      </section>
      {sorted.length === 0 ? (
        <div className="rounded-[30px] border border-[#e8e2d9] bg-white px-6 py-16 text-center sm:px-10">
          <p className="af-eyebrow">Скоро здесь появятся материалы</p>
          <h2 className="af-display mt-4 text-4xl text-[#292621]">Статей пока нет.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#6b655e]">
            Пока можно посмотреть авторские картины или обсудить заказ напрямую с художницей.
          </p>
          <Link href="/gallery" className="af-accent-button mt-6">Посмотреть галерею</Link>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((article) => (
            <li key={article.slug}>
              <Link href={`/articles/${article.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#e8e2d9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,26,22,0.1)]">
                <div className="relative flex aspect-[5/3] items-center justify-center overflow-hidden bg-[#efe9e1]">
                  {article.coverImage ? (
                    <Image src={article.coverImage} alt={article.title} fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="af-display text-4xl text-[#a99d90]">Art For House</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <time className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d44d2c]" dateTime={article.createdAt}>
                    {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                  </time>
                  <h2 className="mt-3 text-xl font-semibold text-[#292621]">{article.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#6b655e]">{article.excerpt}</p>
                  <span className="mt-auto pt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#d44d2c]">
                    Читать статью ↗
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
