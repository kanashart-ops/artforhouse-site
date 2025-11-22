// app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchArticleBySlug } from "@/lib/articles";
import type { Article } from "@/lib/articles";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const article: Article | null = await fetchArticleBySlug(
    decodeURIComponent(slug)
  );

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">
        {article.title}
      </h1>

      <p className="text-sm text-gray-500 mb-8">
        {new Date(article.createdAt).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {article.coverImage && (
        <div className="relative w-full mb-10">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full max-h-[420px] object-cover rounded-xl"
          />
        </div>
      )}

      <article
        className="
          text-lg leading-relaxed text-gray-900
          [&_p]:mt-3
          [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:text-gray-900
          [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-900
          [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-gray-900
          [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1
          [&_strong]:font-semibold
          [&_a]:text-amber-600 hover:[&_a]:text-amber-700
          [&_figure]:my-8
          [&_img]:w-full [&_img]:rounded-xl [&_img]:object-cover
          [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_figcaption]:text-gray-500 [&_figcaption]:text-center
          [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:mt-6
        "
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />
    </main>
  );
}
