import type { MetadataRoute } from "next";
import { fetchAllArticles } from "@/lib/articles";
import { getGalleryItems } from "@/lib/contentStore";
import { publicImageUrl, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

const publicPages: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/gallery", priority: 0.9 },
  { path: "/shop", priority: 0.8 },
  { path: "/order", priority: 0.8 },
  { path: "/contacts", priority: 0.7 },
  { path: "/oil-paintings", priority: 0.8 },
  { path: "/acrylic-paintings", priority: 0.8 },
  { path: "/interior-paintings", priority: 0.8 },
  { path: "/articles", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = publicPages.map(({ path, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    priority,
  }));

  try {
    const artworks = await getGalleryItems();
    const images = Array.from(
      new Set(
        artworks
          .map((item) => publicImageUrl(item.src))
          .filter((url): url is string => Boolean(url))
          .map((url) => new URL(url, SITE_URL).toString())
      )
    ).slice(0, 1000);

    if (images.length > 0) {
      const gallery = entries.find((entry) => entry.url === `${SITE_URL}/gallery`);
      if (gallery) gallery.images = images;
    }
  } catch (error) {
    // Keep the sitemap available even if the catalogue database is temporarily down.
    console.error("Sitemap: gallery images unavailable.", error);
  }

  try {
    const articles = await fetchAllArticles();
    const seen = new Set<string>();
    for (const article of articles) {
      const slug = typeof article.slug === "string" ? article.slug.trim() : "";
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);

      const createdAt = new Date(article.createdAt);
      entries.push({
        url: new URL(`/articles/${encodeURIComponent(slug)}`, SITE_URL).toString(),
        priority: 0.6,
        ...(Number.isFinite(createdAt.getTime()) ? { lastModified: createdAt } : {}),
      });
    }
  } catch (error) {
    console.error("Sitemap: articles unavailable.", error);
  }

  return entries;
}
