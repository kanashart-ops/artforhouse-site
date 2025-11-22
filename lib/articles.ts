// lib/articles.ts
export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string;
  contentHtml: string;
};

// ⚠️ ТВОЙ реальный RAW-URL:
const ARTICLES_URL =
  "https://raw.githubusercontent.com/kanashart-ops/articles/main/articles.json";

export async function fetchAllArticles(): Promise<Article[]> {
  try {
    const res = await fetch(ARTICLES_URL, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch articles:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Articles JSON is not an array");
      return [];
    }

    return data as Article[];
  } catch (err) {
    console.error("fetchAllArticles: fetch failed", err);
    return [];
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

export async function fetchArticleBySlug(
  slug: string
): Promise<Article | null> {
  const all = await fetchAllArticles();
  return all.find((a) => a.slug === slug) ?? null;
}
