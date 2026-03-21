export const GALLERY_CATEGORIES = [
  "пейзаж",
  "абстракция",
  "анималистика",
  "в интерьере",
  "премиум",
  "растения",
  "интерьерная роспись",
] as const;

export const GALLERY_ALL_CATEGORY = "Все";

export function orderGalleryCategories(categories: string[]) {
  const unique = [...new Set(categories.map((item) => item.trim()).filter(Boolean))];
  const preferred = GALLERY_CATEGORIES.filter((item) => unique.includes(item));
  const extra = unique.filter(
    (item) => !GALLERY_CATEGORIES.includes(item as (typeof GALLERY_CATEGORIES)[number])
  );

  return [...preferred, ...extra];
}
