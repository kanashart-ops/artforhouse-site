import { promises as fs } from "node:fs";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string;
  contentHtml: string;
};

const ARTICLES_URL =
  "https://raw.githubusercontent.com/kanashart-ops/articles/main/articles.json";

const localArticlesPath = path.join(process.cwd(), "data", "articles.json");

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "article"
  );
}

function createUniqueSlug(base: string, usedSlugs: Set<string>) {
  let slug = slugify(base);
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${slugify(base)}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

export async function getLocalArticles(): Promise<Article[]> {
  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();

    if (!prisma) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const items = await prisma.article.findMany({
        orderBy: { createdAt: "desc" },
      });

      return items.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImage: article.coverImage ?? "",
        createdAt: article.createdAt.toISOString(),
        contentHtml: article.contentHtml,
      }));
    } catch (error) {
      console.error("Failed to read articles from database.", error);
    }
  }

  try {
    const raw = await fs.readFile(localArticlesPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Article[]) : [];
  } catch {
    return [];
  }
}

export async function saveLocalArticles(articles: Article[]) {
  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();

    if (!prisma) {
      throw new Error("DATABASE_URL is not configured.");
    }

    const usedSlugs = new Set<string>();
    const operations: Prisma.PrismaPromise<unknown>[] = [prisma.article.deleteMany()];

    for (const article of [...articles].reverse()) {
      const title = article.title.trim();
      const slug = createUniqueSlug(article.slug || title || "article", usedSlugs);

      operations.push(
        prisma.article.create({
          data: {
            slug,
            title: title || "Untitled article",
            excerpt: article.excerpt.trim() || title || "Article excerpt",
            coverImage: article.coverImage?.trim() || null,
            createdAt: article.createdAt
              ? new Date(article.createdAt)
              : new Date(),
            contentHtml: article.contentHtml,
          },
        })
      );
    }

    await prisma.$transaction(operations);
    return;
  }

  await fs.writeFile(
    localArticlesPath,
    `${JSON.stringify(articles, null, 2)}\n`,
    "utf8"
  );
}

export async function fetchAllArticles(): Promise<Article[]> {
  const localArticles = await getLocalArticles();

  try {
    const res = await fetch(ARTICLES_URL, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("Failed to fetch articles:", res.status, res.statusText);
      return localArticles;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Articles JSON is not an array");
      return localArticles;
    }

    const remoteArticles = data as Article[];
    const mergedMap = new Map<string, Article>();

    for (const article of remoteArticles) {
      mergedMap.set(article.slug, article);
    }

    for (const article of localArticles) {
      mergedMap.set(article.slug, article);
    }

    return [...mergedMap.values()];
  } catch (error) {
    console.error("fetchAllArticles: fetch failed", error);
    return localArticles;
  }
}

export async function fetchArticlesLimited(limit: number): Promise<Article[]> {
  const all = await fetchAllArticles();

  return all
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const all = await fetchAllArticles();
  return all.find((article) => article.slug === slug) ?? null;
}
