import { promises as fs } from "node:fs";
import path from "node:path";
import {
  ArtworkPlacement,
  MediaKind,
  type Prisma,
} from "@prisma/client";
import {
  GALLERY_ALL_CATEGORY,
  GALLERY_CATEGORIES,
  orderGalleryCategories,
} from "@/lib/galleryCategories";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

export type GalleryItem = {
  src: string;
  category: string;
  name: string;
};

export type ShopMediaItem = {
  type: "image" | "video";
  src: string;
};

export type ShopItem = {
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
    name: item.name.trim(),
    category: item.category.trim(),
    src: item.src.trim(),
  };
}

function normalizeShopItem(item: ShopItem): ShopItem {
  return {
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

  return artworks
    .map((artwork) => {
      const primaryMedia = artwork.media[0];

      if (!primaryMedia?.src) {
        return null;
      }

      return {
        src: primaryMedia.src,
        category: artwork.category ?? "",
        name: artwork.title,
      } satisfies GalleryItem;
    })
    .filter((item): item is GalleryItem => Boolean(item));
}

async function saveGalleryItemsToDatabase(items: GalleryItem[]) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const usedSlugs = new Set<string>();
  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.artwork.deleteMany({
      where: { placement: ArtworkPlacement.GALLERY },
    }),
  ];

  for (const item of [...items].reverse()) {
    const normalized = normalizeGalleryItem(item);

    operations.push(
      prisma.artwork.create({
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
      })
    );
  }

  await prisma.$transaction(operations);
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
  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.artwork.deleteMany({
      where: { placement: ArtworkPlacement.SHOP },
    }),
  ];

  for (const item of [...items].reverse()) {
    const normalized = normalizeShopItem(item);

    operations.push(
      prisma.artwork.create({
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
      })
    );
  }

  await prisma.$transaction(operations);
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

export async function getGalleryCategories() {
  const items = await getGalleryItems();
  const unique = items.map((item) => item.category.trim()).filter(Boolean);
  return [GALLERY_ALL_CATEGORY, ...orderGalleryCategories([...GALLERY_CATEGORIES, ...unique])];
}
