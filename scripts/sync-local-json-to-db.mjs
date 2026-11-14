/**
 * Safe one-time import of JSON content into an EMPTY PostgreSQL database.
 * npm run db:seed-local-content             -> dry run only
 * npm run db:seed-local-content -- --apply  -> import, only if DB is empty
 * Never deletes existing records. All inserts use one transaction.
 */
import { config } from "dotenv";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL отсутствует в .env.local или .env.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const cwd = process.cwd();
const apply = process.argv.includes("--apply");
const unknownArguments = process.argv.slice(2).filter((arg) => arg !== "--apply");
if (unknownArguments.length) {
  console.error(`Неизвестные аргументы: ${unknownArguments.join(", ")}`);
  process.exit(1);
}

function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function uniqueSlug(base, used) {
  const root = slugify(base);
  let slug = root;
  let next = 2;
  while (used.has(slug)) slug = `${root}-${next++}`;
  used.add(slug);
  return slug;
}

async function readJsonArray(name) {
  const fullPath = path.join(cwd, "data", name);
  const parsed = JSON.parse(await fs.readFile(fullPath, "utf8"));
  if (!Array.isArray(parsed)) throw new Error(`${name} должен содержать массив.`);
  return parsed;
}

async function main() {
  const [gallery, shop, articles] = await Promise.all([
    readJsonArray("gallery.json"),
    readJsonArray("shop.json"),
    readJsonArray("articles.json"),
  ]);

  for (const [index, item] of gallery.entries()) {
    if (!item || typeof item.name !== "string" || typeof item.src !== "string" || !item.src.trim()) {
      throw new Error(`Некорректная запись галереи #${index + 1}`);
    }
  }
  for (const [index, item] of shop.entries()) {
    if (!item || typeof item.title !== "string" || !Array.isArray(item.media)) {
      throw new Error(`Некорректная запись магазина #${index + 1}`);
    }
    for (const media of item.media) {
      if (typeof media?.src !== "string" || !media.src.trim()) {
        throw new Error(`Некорректное медиа в записи магазина #${index + 1}`);
      }
    }
  }
  for (const [index, item] of articles.entries()) {
    if (!item || typeof item.title !== "string" || typeof item.contentHtml !== "string") {
      throw new Error(`Некорректная статья #${index + 1}`);
    }
    if (item.createdAt && Number.isNaN(new Date(item.createdAt).getTime())) {
      throw new Error(`Некорректная дата статьи #${index + 1}`);
    }
  }

  const existing = {
    gallery: await prisma.artwork.count({ where: { placement: "GALLERY" } }),
    shop: await prisma.artwork.count({ where: { placement: "SHOP" } }),
    articles: await prisma.article.count(),
  };

  console.log("Локальные JSON:", { gallery: gallery.length, shop: shop.length, articles: articles.length });
  console.log("Данные в PostgreSQL:", existing);

  if (Object.values(existing).some((count) => count > 0)) {
    throw new Error(
      "Импорт остановлен: PostgreSQL уже содержит данные. Скрипт ничего не удаляет и не перезаписывает."
    );
  }

  if (!apply) {
    console.log("ПРОВЕРКА ЗАВЕРШЕНА. Запись не выполнялась. Для импорта используйте: npm run db:seed-local-content -- --apply");
    return;
  }

  const artSlugs = new Set();
  const articleSlugs = new Set();

  await prisma.$transaction(async (tx) => {
    // Recheck inside the transaction; never use deleteMany here.
    const [a, b] = await Promise.all([
      tx.artwork.count(),
      tx.article.count(),
    ]);
    if (a || b) throw new Error("База уже содержит записи. Импорт отменён.");

    for (const item of [...gallery].reverse()) {
      const name = item.name.trim();
      await tx.artwork.create({
        data: {
          slug: uniqueSlug(name || item.src, artSlugs),
          title: name || "Untitled artwork",
          category: typeof item.category === "string" ? item.category.trim() || null : null,
          placement: "GALLERY",
          media: {
            create: [{
              type: "IMAGE",
              src: item.src.trim(),
              alt: name || null,
              sortOrder: 0,
            }],
          },
        },
      });
    }

    for (const item of [...shop].reverse()) {
      const title = item.title.trim();
      const media = item.media.map((entry, index) => ({
        type: entry.type === "video" ? "VIDEO" : "IMAGE",
        src: entry.src.trim(),
        alt: title || null,
        sortOrder: index,
      }));
      await tx.artwork.create({
        data: {
          slug: uniqueSlug(title || media[0]?.src || "shop-item", artSlugs),
          title: title || "Untitled artwork",
          size: typeof item.size === "string" ? item.size.trim() || null : null,
          price: typeof item.price === "string" ? item.price.trim() || null : null,
          description: typeof item.description === "string" ? item.description.trim() || null : null,
          placement: "SHOP",
          media: { create: media },
        },
      });
    }

    for (const item of [...articles].reverse()) {
      const title = item.title.trim();
      await tx.article.create({
        data: {
          slug: uniqueSlug(item.slug || title || "article", articleSlugs),
          title: title || "Untitled article",
          excerpt: typeof item.excerpt === "string" ? item.excerpt.trim() || title : title,
          coverImage: typeof item.coverImage === "string" ? item.coverImage.trim() || null : null,
          contentHtml: item.contentHtml,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        },
      });
    }
  }, { maxWait: 10000, timeout: 120000 });

  console.log("Импорт завершён. Записи из JSON добавлены в PostgreSQL без удаления существующих данных.");
}

main()
  .catch((error) => {
    console.error("Импорт отменён:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
