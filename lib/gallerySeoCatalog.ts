import type { GalleryItem } from "@/lib/contentStore";
import landscapes from "@/data/gallery-seo/landscapes.json";
import abstract from "@/data/gallery-seo/abstract.json";
import animals from "@/data/gallery-seo/animals.json";
import interiors from "@/data/gallery-seo/interiors.json";
import premium from "@/data/gallery-seo/premium.json";
import flowers from "@/data/gallery-seo/flowers.json";
import murals from "@/data/gallery-seo/murals.json";
import artist from "@/data/gallery-seo/artist.json";

type ArtworkSeoCopy = { name: string; alt: string };

// Suggestions were written after inspecting original gallery photos.
// Keyed by original filename, not by database ID, so migrations and
// image URLs are unaffected.
export const gallerySeoCatalog: Readonly<Record<string, ArtworkSeoCopy>> = {
  ...landscapes,
  ...abstract,
  ...animals,
  ...interiors,
  ...premium,
  ...flowers,
  ...murals,
  ...artist,
};

export function applyGallerySeoTitle(item: GalleryItem): GalleryItem {
  const cleanSrc = item.src.split(/[?#]/, 1)[0];
  const filename = cleanSrc.split("/").pop()?.toLowerCase() ?? "";
  const code = filename.replace(/\.(?:jpe?g|png|webp|avif)$/i, "");
  const suggested = gallerySeoCatalog[code];

  // Never override a title chosen by the artist. Only improve untouched
  // legacy codes like a1 / aa2 / q18, where the filename also matches.
  if (!suggested || item.name.trim().toLowerCase() !== code) return item;

  const currentAlt = item.alt?.trim() || "";
  const hasCustomAlt = currentAlt &&
    currentAlt.toLowerCase() !== code &&
    currentAlt.toLowerCase() !== filename.toLowerCase();

  return {
    ...item,
    name: suggested.name,
    alt: hasCustomAlt ? currentAlt : suggested.alt,
  };
}
