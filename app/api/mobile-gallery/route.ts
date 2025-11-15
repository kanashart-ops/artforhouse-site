// app/api/mobile-gallery/route.ts
import { NextResponse } from "next/server";
import { galleryItems } from "@/lib/galleryData";

type MobileArtItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

function absoluteUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mat4house.by"; // сюда ставишь свой домен
  return `${base}${path}`;
}

export async function GET() {
  const items: MobileArtItem[] = galleryItems.map((item) => ({
    id: item.name, // уникальный id
    title: item.name, // пока имя файла, позже можно сделать красивые названия
    imageUrl: absoluteUrl(item.src),
    category: String(item.category),
  }));

  return NextResponse.json(items);
}
