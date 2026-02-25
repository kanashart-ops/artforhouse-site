import { promises as fs } from "node:fs";
import path from "node:path";

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

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filePath: string, payload: T) {
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function getGalleryItems() {
  return readJsonFile<GalleryItem[]>(galleryFile);
}

export async function saveGalleryItems(items: GalleryItem[]) {
  await writeJsonFile(galleryFile, items);
}

export async function getShopItems() {
  return readJsonFile<ShopItem[]>(shopFile);
}

export async function saveShopItems(items: ShopItem[]) {
  await writeJsonFile(shopFile, items);
}

export async function getGalleryCategories() {
  const items = await getGalleryItems();
  const unique = [...new Set(items.map((item) => item.category.trim()).filter(Boolean))];
  return ["Все", ...unique];
}
