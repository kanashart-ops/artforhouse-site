// app/articles/page.tsx
import Link from "next/link";
import { fetchAllArticles } from "@/lib/articles";
import type { Article } from "@/lib/articles";

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
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Статьи</h1>

      {sorted.length === 0 && (
        <p className="text-gray-600">Статей пока нет.</p>
      )}

      <ul className="space-y-4">
        {sorted.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="text-2xl font-semibold text-gray-900 hover:text-amber-600"
            >
              {article.title}
            </Link>
            <p className="text-gray-600 mt-1 text-sm">{article.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
