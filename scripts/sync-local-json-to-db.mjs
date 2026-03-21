import { config } from "dotenv";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("DATABASE_URL is missing in .env.local or .env");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const cwd = process.cwd();

function slugify(value) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function createUniqueSlug(base, usedSlugs) {
  let slug = slugify(base);
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${slugify(base)}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function syncGallery() {
  const items = await readJson(path.join(cwd, "data", "gallery.json"), []);
  const usedSlugs = new Set();

  await prisma.artwork.deleteMany({ where: { placement: "GALLERY" } });

  for (const item of [...items].reverse()) {
    await prisma.artwork.create({
      data: {
        slug: createUniqueSlug(item.name || item.src || "gallery-item", usedSlugs),
        title: item.name?.trim() || "Untitled artwork",
        category: item.category?.trim() || null,
        placement: "GALLERY",
        media: {
          create: [
            {
              type: "IMAGE",
              src: item.src?.trim() || "",
              alt: item.name?.trim() || null,
              sortOrder: 0,
            },
          ],
        },
      },
    });
  }

  console.log(`Gallery synced: ${items.length}`);
}

async function syncShop() {
  const items = await readJson(path.join(cwd, "data", "shop.json"), []);
  const usedSlugs = new Set();

  await prisma.artwork.deleteMany({ where: { placement: "SHOP" } });

  for (const item of [...items].reverse()) {
    await prisma.artwork.create({
      data: {
        slug: createUniqueSlug(item.title || item.media?.[0]?.src || "shop-item", usedSlugs),
        title: item.title?.trim() || "Untitled artwork",
        size: item.size?.trim() || null,
        price: item.price?.trim() || null,
        description: item.description?.trim() || null,
        placement: "SHOP",
        media: {
          create: Array.isArray(item.media)
            ? item.media
                .filter((media) => media?.src)
                .map((media, index) => ({
                  type: media.type === "video" ? "VIDEO" : "IMAGE",
                  src: media.src.trim(),
                  alt: item.title?.trim() || null,
                  sortOrder: index,
                }))
            : [],
        },
      },
    });
  }

  console.log(`Shop synced: ${items.length}`);
}

async function syncArticles() {
  const items = await readJson(path.join(cwd, "data", "articles.json"), []);
  const usedSlugs = new Set();

  await prisma.article.deleteMany();

  for (const item of [...items].reverse()) {
    await prisma.article.create({
      data: {
        slug: createUniqueSlug(item.slug || item.title || "article", usedSlugs),
        title: item.title?.trim() || "Untitled article",
        excerpt: item.excerpt?.trim() || item.title?.trim() || "Article excerpt",
        coverImage: item.coverImage?.trim() || null,
        contentHtml: item.contentHtml || "",
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      },
    });
  }

  console.log(`Articles synced: ${items.length}`);
}

async function main() {
  await syncGallery();
  await syncShop();
  await syncArticles();
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
