import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import {
  getGalleryItems,
  saveGalleryItems,
  type GalleryItem,
} from "@/lib/contentStore";

export async function GET() {
  const items = await getGalleryItems();
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { items?: GalleryItem[] };
  const items = body.items;

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await saveGalleryItems(items);
  } catch (error) {
    console.error("Failed to save gallery items.", error);
    return NextResponse.json(
      { error: "Failed to save gallery items" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
