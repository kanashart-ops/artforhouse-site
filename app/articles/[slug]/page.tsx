// app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchArticleBySlug } from "@/lib/articles";

type PageProps = {
  params: { slug: string };
};

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: PageProps) {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    return notFound();
  }

  const date = new Date(article.createdAt);
  const formattedDate = date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      {/* Заголовок страницы */}
      <h1 className="text-4xl font-bold mb-4 text-gray-900">
        {article.title}
      </h1>

      <p className="text-sm text-gray-500 mb-6">{formattedDate}</p>

      {/* Обложка */}
      {article.coverImage && (
        <div className="mb-8">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full max-h-80 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Текст статьи с HTML-разметкой */}
      <article
        className="
          text-lg leading-relaxed text-gray-900
          [&_p]:mt-3
          [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-semibold
          [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-semibold
          [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1
        "
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />
    </main>
  );
}
