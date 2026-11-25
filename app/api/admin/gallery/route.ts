import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { AdminValidationError, updateGalleryEntry } from "@/lib/adminEditing";
import { sameOriginAdminMutation } from "@/lib/adminSecurity";
import {
  addGalleryItem,
  deleteGalleryItem,
  getGalleryItems,
  saveGalleryItems,
  type GalleryItem,
} from "@/lib/contentStore";

export async function GET(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getGalleryItems();
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  if (!sameOriginAdminMutation(req)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }

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
      {
        error: "Failed to save gallery items",
        details:
          error instanceof Error ? error.message : "Unknown gallery save error",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  if (!sameOriginAdminMutation(req)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }

  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { item?: GalleryItem };

  if (!body.item) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const item = await addGalleryItem(body.item);
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Failed to add gallery item.", error);
    return NextResponse.json(
      {
        error: "Failed to add gallery item",
        details:
          error instanceof Error ? error.message : "Unknown gallery add error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!sameOriginAdminMutation(req)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }

  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: string; name?: string; src?: string }
    | null;

  if (!body?.id && !(body?.name && body?.src)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await deleteGalleryItem(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete gallery item.", error);
    return NextResponse.json(
      {
        error: "Failed to delete gallery item",
        details:
          error instanceof Error ? error.message : "Unknown gallery delete error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!sameOriginAdminMutation(req)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: unknown; item?: unknown }
    | null;
  if (!body || typeof body.id !== "string" || !body.id.trim() ||
      !body.item || typeof body.item !== "object" ||
      Array.isArray(body.item)) {
    return NextResponse.json({ error: "Некорректные данные редактирования." }, { status: 400 });
  }

  try {
    const item = await updateGalleryEntry(body.id, body.item as GalleryItem);
    if (!item) {
      return NextResponse.json({ error: "Запись не найдена." }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Admin update failed:", error);
    return NextResponse.json({ error: "Не удалось сохранить изменения." }, { status: 500 });
  }
}
