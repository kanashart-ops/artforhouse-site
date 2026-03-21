import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import {
  addShopItem,
  deleteShopItem,
  getShopItems,
  saveShopItems,
  type ShopItem,
} from "@/lib/contentStore";

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

export async function POST(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { item?: ShopItem };

  if (!body.item) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const item = await addShopItem(body.item);
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Failed to add shop item.", error);
    return NextResponse.json(
      {
        error: "Failed to add shop item",
        details:
          error instanceof Error ? error.message : "Unknown shop add error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: string; title?: string; src?: string }
    | null;

  if (!body?.id && !(body?.title && body?.src)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await deleteShopItem(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete shop item.", error);
    return NextResponse.json(
      {
        error: "Failed to delete shop item",
        details:
          error instanceof Error ? error.message : "Unknown shop delete error",
      },
      { status: 500 }
    );
  }
}
