// app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { cache } from "react";
import { ARTIST_NAME, createPageMetadata, jsonLdStringify, publicImageUrl, SITE_URL } from "@/lib/seo";
import { canOptimizeArtworkImage } from "@/lib/imageOptimization";
import { fetchArticleBySlug } from "@/lib/articles";
import type { Article } from "@/lib/articles";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getArticle = cache(fetchArticleBySlug);

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));

  if (!article) {
    return { title: "Статья не найдена | Art For House", robots: { index: false } };
  }

  const date = new Date(article.createdAt);
  return createPageMetadata({
    title: `${article.title} | Art For House`,
    description: article.excerpt?.trim() || article.title,
    path: `/articles/${encodeURIComponent(article.slug)}`,
    image: publicImageUrl(article.coverImage),
    type: "article",
    publishedTime: Number.isFinite(date.getTime()) ? date.toISOString() : undefined,
  });
}

function firstString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function stripAppBreadcrumb(html: string) {
  // Удаляем "Articles / ..." если оно попало в HTML как текст/абзац/хедер/див.
  // 1) <p>Articles / ...</p>
  html = html.replace(
    /<p[^>]*>\s*Articles\s*\/\s*[^<]+<\/p>\s*/i,
    ""
  );

  // 2) <div>Articles / ...</div>
  html = html.replace(
    /<(div|span)[^>]*>\s*Articles\s*\/\s*[^<]+<\/\1>\s*/i,
    ""
  );

  // 3) "Articles / ..." как голый текст в начале
  html = html.replace(/^\s*Articles\s*\/\s*[^\n<]+\s*/i, "");

  return html;
}

export default async function ArticlePage({
  params,
  searchParams,
}: ArticlePageProps) {
  const { slug } = await params;

  const sp = (await searchParams) ?? {};
  const appParam = firstString(sp.app);
  const isApp = appParam === "1";

  const article: Article | null = await getArticle(decodeURIComponent(slug));

  if (!article) notFound();

  const contentHtml = isApp
    ? stripAppBreadcrumb(article.contentHtml)
    : article.contentHtml;

  const imageUrl = publicImageUrl(article.coverImage);
  const date = new Date(article.createdAt);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt?.trim() || article.title,
    mainEntityOfPage: new URL(
      `/articles/${encodeURIComponent(article.slug)}`,
      SITE_URL
    ).toString(),
    author: { "@type": "Person", name: ARTIST_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: "Art For House", url: SITE_URL },
    ...(Number.isFinite(date.getTime()) ? { datePublished: date.toISOString() } : {}),
    ...(imageUrl ? { image: new URL(imageUrl, SITE_URL).toString() } : {}),
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdStringify(structuredData) }}
      />
      <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>

      <p className="text-sm text-gray-500 mb-8">
        {new Date(article.createdAt).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {article.coverImage && (
        <div className="relative w-full mb-10">
          <Image
            src={article.coverImage}
            alt={article.title}
            width={1200}
            height={630}
            sizes="(max-width: 768px) 100vw, 768px"
            fetchPriority="high"
            unoptimized={!canOptimizeArtworkImage(article.coverImage)}
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
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  );
}
