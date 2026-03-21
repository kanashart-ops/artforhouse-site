import { promises as fs } from "node:fs";
import path from "node:path";
import {
  ArtworkPlacement,
  MediaKind,
} from "@prisma/client";
import {
  GALLERY_ALL_CATEGORY,
  GALLERY_CATEGORIES,
  orderGalleryCategories,
} from "@/lib/galleryCategories";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

export type GalleryItem = {
  id?: string;
  src: string;
  category: string;
  name: string;
};

export type ShopMediaItem = {
  type: "image" | "video";
  src: string;
};

export type ShopItem = {
  id?: string;
  title: string;
  size: string;
  price: string;
  description: string;
  media: ShopMediaItem[];
};

const dataDir = path.join(process.cwd(), "data");
const galleryFile = path.join(dataDir, "gallery.json");
const shopFile = path.join(dataDir, "shop.json");

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, payload: T) {
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "artwork"
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

function normalizeGalleryItem(item: GalleryItem): GalleryItem {
  return {
    id: item.id?.trim() || undefined,
    name: item.name.trim(),
    category: item.category.trim(),
    src: item.src.trim(),
  };
}

function normalizeShopItem(item: ShopItem): ShopItem {
  return {
    id: item.id?.trim() || undefined,
    title: item.title.trim(),
    size: item.size.trim(),
    price: item.price.trim(),
    description: item.description.trim(),
    media: item.media
      .map((media) => ({
        type: media.type === "video" ? "video" : "image",
        src: media.src.trim(),
      }) satisfies ShopMediaItem)
      .filter((media) => media.src),
  };
}

function getLocalGalleryItemId(item: GalleryItem) {
  return item.id?.trim() || `${item.name.trim()}::${item.src.trim()}`;
}

function getLocalShopItemId(item: ShopItem) {
  const primaryMedia = item.media[0]?.src?.trim() || "";
  return item.id?.trim() || `${item.title.trim()}::${primaryMedia}`;
}

async function getGalleryItemsFromDatabase(): Promise<GalleryItem[] | null> {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  const artworks = await prisma.artwork.findMany({
    where: { placement: ArtworkPlacement.GALLERY },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const items: GalleryItem[] = [];

  for (const artwork of artworks) {
    const primaryMedia = artwork.media[0];

    if (!primaryMedia?.src) {
      continue;
    }

    items.push({
      id: artwork.id,
      src: primaryMedia.src,
      category: artwork.category ?? "",
      name: artwork.title,
    });
  }

  return items;
}

async function saveGalleryItemsToDatabase(items: GalleryItem[]) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const usedSlugs = new Set<string>();

  await prisma.$transaction(
    async (tx) => {
      await tx.artwork.deleteMany({
        where: { placement: ArtworkPlacement.GALLERY },
      });

      for (const item of [...items].reverse()) {
        const normalized = normalizeGalleryItem(item);

        await tx.artwork.create({
          data: {
            slug: createUniqueSlug(
              normalized.name || normalized.src || "gallery-item",
              usedSlugs
            ),
            title: normalized.name || "Untitled artwork",
            category: normalized.category || null,
            placement: ArtworkPlacement.GALLERY,
            media: {
              create: [
                {
                  type: MediaKind.IMAGE,
                  src: normalized.src,
                  alt: normalized.name || null,
                  sortOrder: 0,
                },
              ],
            },
          },
        });
      }
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
}

async function getShopItemsFromDatabase(): Promise<ShopItem[] | null> {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  const artworks = await prisma.artwork.findMany({
    where: { placement: ArtworkPlacement.SHOP },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return artworks.map((artwork) => ({
    id: artwork.id,
    title: artwork.title,
    size: artwork.size ?? "",
    price: artwork.price ?? "",
    description: artwork.description ?? "",
    media: artwork.media.map((media) => ({
      type: media.type === MediaKind.VIDEO ? "video" : "image",
      src: media.src,
    })),
  }));
}

async function saveShopItemsToDatabase(items: ShopItem[]) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const usedSlugs = new Set<string>();

  await prisma.$transaction(
    async (tx) => {
      await tx.artwork.deleteMany({
        where: { placement: ArtworkPlacement.SHOP },
      });

      for (const item of [...items].reverse()) {
        const normalized = normalizeShopItem(item);

        await tx.artwork.create({
          data: {
            slug: createUniqueSlug(
              normalized.title || normalized.media[0]?.src || "shop-item",
              usedSlugs
            ),
            title: normalized.title || "Untitled artwork",
            size: normalized.size || null,
            price: normalized.price || null,
            description: normalized.description || null,
            placement: ArtworkPlacement.SHOP,
            media: {
              create: normalized.media.map((media, index) => ({
                type: media.type === "video" ? MediaKind.VIDEO : MediaKind.IMAGE,
                src: media.src,
                alt: normalized.title || null,
                sortOrder: index,
              })),
            },
          },
        });
      }
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (isDatabaseConfigured()) {
    try {
      const items = await getGalleryItemsFromDatabase();

      if (items) {
        return items;
      }
    } catch (error) {
      console.error("Failed to read gallery from database.", error);
    }
  }

  return readJsonFile<GalleryItem[]>(galleryFile, []);
}

export async function saveGalleryItems(items: GalleryItem[]): Promise<void> {
  if (isDatabaseConfigured()) {
    await saveGalleryItemsToDatabase(items);
    return;
  }

  await writeJsonFile(galleryFile, items);
}

export async function addGalleryItem(item: GalleryItem): Promise<GalleryItem> {
  const normalized = normalizeGalleryItem(item);

  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();

    if (!prisma) {
      throw new Error("DATABASE_URL is not configured.");
    }

    const created = await prisma.artwork.create({
      data: {
        slug: `${slugify(normalized.name || normalized.src || "gallery-item")}-${Date.now()}`,
        title: normalized.name || "Untitled artwork",
        category: normalized.category || null,
        placement: ArtworkPlacement.GALLERY,
        media: {
          create: [
            {
              type: MediaKind.IMAGE,
              src: normalized.src,
              alt: normalized.name || null,
              sortOrder: 0,
            },
          ],
        },
      },
      include: {
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return {
      id: created.id,
      name: created.title,
      category: created.category ?? "",
      src: created.media[0]?.src ?? normalized.src,
    };
  }

  const current = await readJsonFile<GalleryItem[]>(galleryFile, []);
  const nextItem = {
    ...normalized,
    id: normalized.id || getLocalGalleryItemId(normalized),
  };

  await writeJsonFile(galleryFile, [nextItem, ...current]);
  return nextItem;
}

export async function deleteGalleryItem(identifier: {
  id?: string;
  name?: string;
  src?: string;
}): Promise<void> {
  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();

    if (!prisma) {
      throw new Error("DATABASE_URL is not configured.");
    }

    if (identifier.id) {
      await prisma.artwork.delete({
        where: { id: identifier.id },
      });
      return;
    }

    const existing = await prisma.artwork.findFirst({
      where: {
        placement: ArtworkPlacement.GALLERY,
        title: identifier.name,
        media: {
          some: {
            src: identifier.src,
          },
        },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Gallery item not found.");
    }

    await prisma.artwork.delete({
      where: { id: existing.id },
    });
    return;
  }

  const current = await readJsonFile<GalleryItem[]>(galleryFile, []);
  const nextItems = current.filter((item) => {
    const sameId = identifier.id && getLocalGalleryItemId(item) === identifier.id;
    const samePair =
      identifier.name &&
      identifier.src &&
      item.name === identifier.name &&
      item.src === identifier.src;

    return !(sameId || samePair);
  });

  await writeJsonFile(galleryFile, nextItems);
}

export async function getShopItems(): Promise<ShopItem[]> {
  if (isDatabaseConfigured()) {
    try {
      const items = await getShopItemsFromDatabase();

      if (items) {
        return items;
      }
    } catch (error) {
      console.error("Failed to read shop from database.", error);
    }
  }

  return readJsonFile<ShopItem[]>(shopFile, []);
}

export async function saveShopItems(items: ShopItem[]): Promise<void> {
  if (isDatabaseConfigured()) {
    await saveShopItemsToDatabase(items);
    return;
  }

  await writeJsonFile(shopFile, items);
}

export async function addShopItem(item: ShopItem): Promise<ShopItem> {
  const normalized = normalizeShopItem(item);

  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();

    if (!prisma) {
      throw new Error("DATABASE_URL is not configured.");
    }

    const created = await prisma.artwork.create({
      data: {
        slug: `${slugify(normalized.title || normalized.media[0]?.src || "shop-item")}-${Date.now()}`,
        title: normalized.title || "Untitled artwork",
        size: normalized.size || null,
        price: normalized.price || null,
        description: normalized.description || null,
        placement: ArtworkPlacement.SHOP,
        media: {
          create: normalized.media.map((media, index) => ({
            type: media.type === "video" ? MediaKind.VIDEO : MediaKind.IMAGE,
            src: media.src,
            alt: normalized.title || null,
            sortOrder: index,
          })),
        },
      },
      include: {
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return {
      id: created.id,
      title: created.title,
      size: created.size ?? "",
      price: created.price ?? "",
      description: created.description ?? "",
      media: created.media.map((media) => ({
        type: media.type === MediaKind.VIDEO ? "video" : "image",
        src: media.src,
      })),
    };
  }

  const current = await readJsonFile<ShopItem[]>(shopFile, []);
  const nextItem = {
    ...normalized,
    id: normalized.id || getLocalShopItemId(normalized),
  };

  await writeJsonFile(shopFile, [nextItem, ...current]);
  return nextItem;
}

export async function deleteShopItem(identifier: {
  id?: string;
  title?: string;
  src?: string;
}): Promise<void> {
  if (isDatabaseConfigured()) {
    const prisma = getPrismaClient();

    if (!prisma) {
      throw new Error("DATABASE_URL is not configured.");
    }

    if (identifier.id) {
      await prisma.artwork.delete({
        where: { id: identifier.id },
      });
      return;
    }

    const existing = await prisma.artwork.findFirst({
      where: {
        placement: ArtworkPlacement.SHOP,
        title: identifier.title,
        media: {
          some: {
            src: identifier.src,
          },
        },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Shop item not found.");
    }

    await prisma.artwork.delete({
      where: { id: existing.id },
    });
    return;
  }

  const current = await readJsonFile<ShopItem[]>(shopFile, []);
  const nextItems = current.filter((item) => {
    const sameId = identifier.id && getLocalShopItemId(item) === identifier.id;
    const samePair =
      identifier.title &&
      identifier.src &&
      item.title === identifier.title &&
      item.media[0]?.src === identifier.src;

    return !(sameId || samePair);
  });

  await writeJsonFile(shopFile, nextItems);
}

export async function getGalleryCategories() {
  const items = await getGalleryItems();
  const unique = items.map((item) => item.category.trim()).filter(Boolean);
  return [GALLERY_ALL_CATEGORY, ...orderGalleryCategories([...GALLERY_CATEGORIES, ...unique])];
}
