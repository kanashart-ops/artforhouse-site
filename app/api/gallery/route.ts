import { NextResponse } from "next/server";
import { getGalleryCategories, getGalleryItems } from "@/lib/contentStore";

export async function GET() {
  const [items, categories] = await Promise.all([
    getGalleryItems(),
    getGalleryCategories(),
  ]);

  return NextResponse.json({ items, categories });
}
