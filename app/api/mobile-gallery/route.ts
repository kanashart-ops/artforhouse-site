// app/api/mobile-gallery/route.ts
import { NextResponse } from "next/server";
import { getGalleryItems, type GalleryItem } from "@/lib/contentStore";

type MobileArtItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

function normalizeImageUrl(url?: string | null) {
  const value = (url ?? "").trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `https://artforhouse.by${value}`;
  }

  const base = "https://artforhouse.by";
  return `${base}/${value}`;
}

export async function GET() {
  const galleryItems = await getGalleryItems();

  const items: MobileArtItem[] = galleryItems.map((item: GalleryItem) => ({
    id: item.name,
    title: item.name,
    imageUrl: normalizeImageUrl(item.src),
    category: String(item.category),
  }));

  return NextResponse.json(items);
}
