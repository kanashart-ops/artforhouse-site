// app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { cache } from "react";
import { ARTIST_NAME, createPageMetadata, jsonLdStringify, publicImageUrl, SITE_URL } from "@/lib/seo";
import { canOptimizeArtworkImage } from "@/lib/imageOptimization";
import { sanitizeArticleHtml } from "@/lib/sanitizeArticleHtml";
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

  const contentHtml = sanitizeArticleHtml(
    isApp ? stripAppBreadcrumb(article.contentHtml) : article.contentHtml
  );

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
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdStringify(structuredData) }}
      />
      <p className="af-eyebrow">Art For House / Журнал</p>
      <h1 className="af-display mt-5 text-4xl leading-[1.07] text-[#292621] sm:text-5xl lg:text-6xl">{article.title}</h1>

      <p className="mb-8 mt-5 border-b border-[#e8e2d9] pb-6 text-sm text-[#9b7868]">
        {new Date(article.createdAt).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {imageUrl && (
        <div className="relative w-full mb-10">
          <Image
            src={imageUrl}
            alt={article.title}
            width={1200}
            height={630}
            sizes="(max-width: 768px) 100vw, 768px"
            fetchPriority="high"
            unoptimized={!canOptimizeArtworkImage(imageUrl)}
            className="max-h-[520px] w-full rounded-[26px] object-cover"
          />
        </div>
      )}

      <article
        className="
          text-[17px] leading-8 text-[#39342f]
          [&_p]:mt-3
          [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:text-gray-900
          [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-900
          [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-gray-900
          [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1
          [&_strong]:font-semibold
          [&_a]:text-[#d44d2c] hover:[&_a]:text-[#b93e22]
          [&_figure]:my-8
          [&_img]:w-full [&_img]:rounded-[20px] [&_img]:object-cover
          [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_figcaption]:text-gray-500 [&_figcaption]:text-center
          [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:mt-6
        "
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  );
}
