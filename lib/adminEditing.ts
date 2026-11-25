import { ArtworkPlacement, MediaKind } from "@prisma/client";
import {
  getGalleryItems, getShopItems, saveGalleryItems, saveShopItems,
  type GalleryItem, type ShopItem,
} from "@/lib/contentStore";
import { getLocalArticles, saveLocalArticles, type Article } from "@/lib/articles";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

export class AdminValidationError extends Error {}

function validMediaUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function readString(value: unknown, field: string, maxLength: number, required = false): string {
  if (typeof value !== "string") {
    throw new AdminValidationError(`Поле «${field}» должно быть текстом.`);
  }
  const normalized = value.trim();
  if ((required && !normalized) || normalized.length > maxLength) {
    throw new AdminValidationError(`Проверьте поле «${field}» (максимум ${maxLength} символов).`);
  }
  return normalized;
}

export async function updateGalleryEntry(id: string, input: GalleryItem): Promise<GalleryItem | null> {
  const name = readString(input.name, "Название", 160, true);
  const category = readString(input.category, "Категория", 100, true);
  const src = readString(input.src, "Фото", 2048, true);
  if (!validMediaUrl(src)) throw new AdminValidationError("Некорректный адрес фотографии.");

  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();
    if (!prisma) throw new Error("PostgreSQL не подключён.");
    return prisma.$transaction(async (tx) => {
      const existing = await tx.artwork.findFirst({
        where: { id, placement: ArtworkPlacement.GALLERY },
        select: { id: true },
      });
      if (!existing) return null;
      const updated = await tx.artwork.update({
        where: { id },
        data: {
          title: name,
          category,
          media: {
            deleteMany: {},
            create: [{ type: MediaKind.IMAGE, src, alt: name, sortOrder: 0 }],
          },
        },
      });
      return { id: updated.id, name, category, src };
    });
  }

  const items = await getGalleryItems();
  const index = items.findIndex((entry) => (entry.id || `${entry.name}::${entry.src}`) === id);
  if (index < 0) return null;
  const item: GalleryItem = { id: items[index].id || id, name, category, src };
  await saveGalleryItems(items.map((entry, pos) => pos === index ? item : entry));
  return item;
}

export async function updateShopEntry(id: string, input: ShopItem): Promise<ShopItem | null> {
  const title = readString(input.title, "Название", 160, true);
  const size = readString(input.size, "Размер", 120);
  const price = readString(input.price, "Цена", 120);
  const description = readString(input.description, "Описание", 8000);
  if (!Array.isArray(input.media) || input.media.length < 1 || input.media.length > 14) {
    throw new AdminValidationError("Для товара нужен хотя бы один файл (максимум 14).");
  }

  const media = input.media.map((entry) => {
    if (!entry || (entry.type !== "image" && entry.type !== "video")) {
      throw new AdminValidationError("Некорректный тип файла.");
    }
    const src = readString(entry.src, "Адрес файла", 2048, true);
    if (!validMediaUrl(src)) throw new AdminValidationError("Некорректный адрес файла.");
    return { type: entry.type, src };
  });

  if (media.filter((entry) => entry.type === "image").length > 10 ||
      media.filter((entry) => entry.type === "video").length > 4) {
    throw new AdminValidationError("Максимум 10 фото и 4 видео для одной картины.");
  }

  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();
    if (!prisma) throw new Error("PostgreSQL не подключён.");
    return prisma.$transaction(async (tx) => {
      const existing = await tx.artwork.findFirst({
        where: { id, placement: ArtworkPlacement.SHOP },
        select: { id: true },
      });
      if (!existing) return null;
      const updated = await tx.artwork.update({
        where: { id },
        data: {
          title, size: size || null, price: price || null,
          description: description || null,
          media: {
            deleteMany: {},
            create: media.map((entry, index) => ({
              type: entry.type === "video" ? MediaKind.VIDEO : MediaKind.IMAGE,
              src: entry.src,
              alt: title,
              sortOrder: index,
            })),
          },
        },
      });
      return { id: updated.id, title, size, price, description, media };
    });
  }

  const items = await getShopItems();
  const index = items.findIndex(
    (entry) => (entry.id || `${entry.title}::${entry.media[0]?.src || ""}`) === id
  );
  if (index < 0) return null;
  const item: ShopItem = { id: items[index].id || id, title, size, price, description, media };
  await saveShopItems(items.map((entry, pos) => pos === index ? item : entry));
  return item;
}

export async function updateArticleEntry(slug: string, input: Article): Promise<Article | null> {
  const title = readString(input.title, "Заголовок", 180, true);
  const excerpt = readString(input.excerpt, "Описание", 700);
  const coverImage = readString(input.coverImage ?? "", "Обложка", 2048);
  if (coverImage && !validMediaUrl(coverImage)) {
    throw new AdminValidationError("Некорректный адрес обложки.");
  }
  if (typeof input.contentHtml !== "string" ||
      !input.contentHtml.trim() || input.contentHtml.length > 250_000) {
    throw new AdminValidationError("Проверьте HTML статьи (максимум 250 000 символов).");
  }

  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();
    if (!prisma) throw new Error("PostgreSQL не подключён.");
    const before = await prisma.article.findUnique({ where: { slug } });
    if (!before) return null;
    const saved = await prisma.article.update({
      where: { slug },
      data: {
        title, excerpt: excerpt || title,
        coverImage: coverImage || null,
        contentHtml: input.contentHtml,
      },
    });
    return {
      slug: saved.slug,
      title: saved.title,
      excerpt: saved.excerpt,
      coverImage: saved.coverImage || "",
      createdAt: saved.createdAt.toISOString(),
      contentHtml: saved.contentHtml,
    };
  }

  const articles = await getLocalArticles();
  const index = articles.findIndex((article) => article.slug === slug);
  if (index < 0) return null;
  const updated: Article = {
    ...articles[index], title, excerpt: excerpt || title,
    coverImage, contentHtml: input.contentHtml,
  };
  await saveLocalArticles(articles.map((article, pos) => pos === index ? updated : article));
  return updated;
}
