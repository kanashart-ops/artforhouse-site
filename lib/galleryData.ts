// lib/galleryData.ts

export const IMG_EXT = "jpg";

export const CATEGORIES = [
  "Все",
  "пейзаж",
  "премиум",
  "абстракция",
  "анималистика",
  "растения",
  "интерьерная роспись",
  "в интерьере",
  "я",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type GalleryItem = {
  src: string;
  category: Category | string;
  name: string;
};

function makeRange(
  prefix: string,
  start: number,
  end: number,
  category: Category | string
): GalleryItem[] {
  const items: GalleryItem[] = [];
  for (let i = start; i <= end; i++) {
    items.push({
      src: `/images/gallery/${prefix}${i}.${IMG_EXT}`,
      category,
      name: `${prefix}${i}`,
    });
  }
  return items;
}

export const galleryItems: GalleryItem[] = [
  ...makeRange("a", 1, 21, "пейзаж"),
  ...makeRange("aa", 1, 20, "абстракция"),
  ...makeRange("w", 1, 4, "анималистика"),
  ...makeRange("q", 1, 38, "в интерьере"),
  ...makeRange("x", 1, 16, "премиум"),
  ...makeRange("s", 1, 16, "растения"),
  ...makeRange("e", 1, 3, "интерьерная роспись"),
  ...makeRange("d", 1, 11, "я"),
];
