// lib/articles.ts

import { promises as fs } from "node:fs";
import path from "node:path";

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

/**
 * Читает локальные статьи из data/articles.json
 */
export async function getLocalArticles(): Promise<Article[]> {
  try {
    const raw = await fs.readFile(localArticlesPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Article[]) : [];
  } catch {
    return [];
  }
}

/**
 * Сохраняет статьи в data/articles.json
 */
export async function saveLocalArticles(articles: Article[]) {
  await fs.writeFile(
    localArticlesPath,
    `${JSON.stringify(articles, null, 2)}\n`,
    "utf8"
  );
}

/**
 * Загружает все статьи:
 * 1. Пытается получить remote JSON с GitHub
 * 2. Если не получилось — возвращает локальные
 * 3. Если получилось — мержит remote + local (local имеет приоритет)
 */
export async function fetchAllArticles(): Promise<Article[]> {
  const localArticles = await getLocalArticles();

  try {
    const res = await fetch(ARTICLES_URL, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        "Failed to fetch articles:",
        res.status,
        res.statusText
      );
      return localArticles;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Articles JSON is not an array");
      return localArticles;
    }

    const remoteArticles = data as Article[];

    // Мерж по slug (local перезаписывает remote)
    const mergedMap = new Map<string, Article>();

    for (const article of remoteArticles) {
      mergedMap.set(article.slug, article);
    }

    for (const article of localArticles) {
      mergedMap.set(article.slug, article);
    }

    return [...mergedMap.values()];
  } catch (err) {
    console.error("fetchAllArticles: fetch failed", err);
    return localArticles;
  }
}

/**
 * Возвращает ограниченное количество статей,
 * отсортированных по createdAt (новые сверху)
 */
export async function fetchArticlesLimited(
  limit: number
): Promise<Article[]> {
  const all = await fetchAllArticles();

  return all
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

/**
 * Получает статью по slug
 */
export async function fetchArticleBySlug(
  slug: string
): Promise<Article | null> {
  const all = await fetchAllArticles();
  return all.find((a) => a.slug === slug) ?? null;
}
