// app/api/mobile-gallery/route.ts
import { NextResponse } from "next/server";
import { getGalleryItems } from "@/lib/contentStore";

type MobileArtItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

// Всегда отдаём правильный домен artforhouse.by
function absoluteUrl(path: string) { 
  const base = "https://artforhouse.by";
  return `${base}${path}`;
}

export async function GET() {
  const galleryItems = await getGalleryItems();

  const items: MobileArtItem[] = galleryItems.map((item) => ({
    id: item.name,
    title: item.name,
    imageUrl: absoluteUrl(item.src),
    category: String(item.category),
  }));

  return NextResponse.json(items);
}