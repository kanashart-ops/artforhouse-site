import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { getShopItems, saveShopItems, type ShopItem } from "@/lib/contentStore";

export async function GET() {
  const items = await getShopItems();
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { items?: ShopItem[] };
  const items = body.items;
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await saveShopItems(items);
  return NextResponse.json({ ok: true });
}
