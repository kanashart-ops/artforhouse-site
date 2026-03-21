import { config } from "dotenv";
import { promises as fs } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN is missing in .env.local or .env");
  process.exit(1);
}

const cwd = process.cwd();
const targets = [
  {
    kind: "gallery",
    directory: path.join(cwd, "public", "images", "gallery"),
    jsonPath: path.join(cwd, "data", "gallery.json"),
    pathPrefix: "/images/gallery/",
    blobPrefix: "gallery",
  },
  {
    kind: "shop",
    directory: path.join(cwd, "public", "images", "shop"),
    jsonPath: path.join(cwd, "data", "shop.json"),
    pathPrefix: "/images/shop/",
    blobPrefix: "shop",
  },
];

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".mp4") return "video/mp4";

  return "application/octet-stream";
}

async function uploadDirectory(target) {
  const directoryExists = await fs
    .access(target.directory)
    .then(() => true)
    .catch(() => false);

  if (!directoryExists) {
    return new Map();
  }

  const files = (await fs.readdir(target.directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  const replacements = new Map();

  for (const filename of files) {
    const localPath = path.join(target.directory, filename);
    const body = await fs.readFile(localPath);
    const blob = await put(`${target.blobPrefix}/${filename}`, body, {
      access: "public",
      addRandomSuffix: false,
      token,
      contentType: getContentType(filename),
    });

    replacements.set(`${target.pathPrefix}${filename}`, blob.url);
    console.log(`${target.kind}: ${filename} -> ${blob.url}`);
  }

  return replacements;
}

function updateGalleryItems(items, replacements) {
  return items.map((item) => ({
    ...item,
    src: replacements.get(item.src) ?? item.src,
  }));
}

function updateShopItems(items, replacements) {
  return items.map((item) => ({
    ...item,
    media: Array.isArray(item.media)
      ? item.media.map((media) => ({
          ...media,
          src: replacements.get(media.src) ?? media.src,
        }))
      : [],
  }));
}

async function main() {
  const [galleryReplacements, shopReplacements] = await Promise.all(
    targets.map((target) => uploadDirectory(target))
  );

  const galleryItems = await readJson(targets[0].jsonPath, []);
  const shopItems = await readJson(targets[1].jsonPath, []);

  await fs.writeFile(
    targets[0].jsonPath,
    `${JSON.stringify(updateGalleryItems(galleryItems, galleryReplacements), null, 2)}\n`,
    "utf8"
  );

  await fs.writeFile(
    targets[1].jsonPath,
    `${JSON.stringify(updateShopItems(shopItems, shopReplacements), null, 2)}\n`,
    "utf8"
  );

  console.log("Local JSON sources were rewritten to Blob URLs.");
  console.log("If your site already uses Prisma, sync the same data into the database next.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
