import type { GalleryItem } from "@/lib/contentStore";

const TECHNICAL_NAME = /^(?:[a-z]{1,5}[-_]?\\d{1,6}|(?:img|image|photo|dsc|pict|pic)[-_]?\\d{1,8})$/i;

export function hasMeaningfulArtworkName(name: string): boolean {
  const value = name.trim();
  return value.length >= 4 && !TECHNICAL_NAME.test(value);
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "пейзаж": "Пейзажная живопись",
  "абстракция": "Абстрактная живопись",
  "анималистика": "Анималистическая живопись",
  "в интерьере": "Картина в интерьере",
  "премиум": "Работа из премиальной коллекции",
  "растения": "Картина с растительной тематикой",
  "интерьерная роспись": "Художественная роспись стены",
  "я": "Фото художницы Анны Побитко",
};

export function galleryImageAlt(item: GalleryItem): string {
  const custom = item.alt?.trim() ?? "";
  if (custom && custom !== item.name.trim() && !TECHNICAL_NAME.test(custom)) {
    return custom;
  }

  const category = item.category.trim();
  const name = item.name.trim();
  if (hasMeaningfulArtworkName(name)) {
    return `${name} — ${category ? category + ", " : ""}Art For House`;
  }

  return CATEGORY_DESCRIPTIONS[category.toLowerCase()] ??
    (category ? `Работа из раздела «${category}» — Art For House`
              : "Работа из галереи Art For House");
}

export function galleryArtworkCaption(item: GalleryItem): string {
  if (hasMeaningfulArtworkName(item.name)) return item.name.trim();
  return CATEGORY_DESCRIPTIONS[item.category.trim().toLowerCase()] ??
    (item.category.trim() || "Авторская работа");
}
