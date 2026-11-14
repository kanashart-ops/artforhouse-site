/**
 * Export PostgreSQL gallery, shop and articles without changing the database.
 * Backups go to ../artforhouse-backups/ OUTSIDE the repository.
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
  console.error("DATABASE_URL не задан. Экспорт PostgreSQL невозможен.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const backupDir = path.resolve(process.cwd(), "..", "artforhouse-backups");

async function main() {
  const [artworks, articles] = await Promise.all([
    prisma.artwork.findMany({
      include: { media: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const gallery = artworks
    .filter((entry) => entry.placement === "GALLERY")
    .map((entry) => ({
      id: entry.id,
      name: entry.title,
      category: entry.category ?? "",
      src: entry.media[0]?.src ?? "",
    }));

  const shop = artworks
    .filter((entry) => entry.placement === "SHOP")
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      size: entry.size ?? "",
      price: entry.price ?? "",
      description: entry.description ?? "",
      media: entry.media.map((media) => ({
        type: media.type === "VIDEO" ? "video" : "image",
        src: media.src,
      })),
    }));

  const articleItems = articles.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    excerpt: entry.excerpt,
    coverImage: entry.coverImage ?? "",
    contentHtml: entry.contentHtml,
    createdAt: entry.createdAt.toISOString(),
  }));

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const destination = path.join(backupDir, timestamp);
  await fs.mkdir(destination, { recursive: true });
  const outputs = {
    "gallery.json": gallery,
    "shop.json": shop,
    "articles.json": articleItems,
  };
  for (const [filename, data] of Object.entries(outputs)) {
    await fs.writeFile(path.join(destination, filename), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  const manifest = {
    savedAt: new Date().toISOString(),
    counts: { gallery: gallery.length, shop: shop.length, articles: articleItems.length },
    note: "Экспорт контента. Это НЕ резервная копия самой PostgreSQL и не включает файлы Vercel Blob.",
  };
  await fs.writeFile(path.join(destination, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log("Экспорт завершён:", destination);
  console.log("Количество записей:", manifest.counts);
}

main().catch((error) => {
  console.error("Ошибка экспорта:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
