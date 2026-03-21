import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { getShopItems, saveShopItems, type ShopItem } from "@/lib/contentStore";

export async function GET() {
  const items = await getShopItems();
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { items?: ShopItem[] };
  const items = body.items;

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await saveShopItems(items);
  } catch (error) {
    console.error("Failed to save shop items.", error);
    return NextResponse.json(
      {
        error: "Failed to save shop items",
        details:
          error instanceof Error ? error.message : "Unknown shop save error",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
