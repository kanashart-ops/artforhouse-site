import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { AdminValidationError, updateArticleEntry } from "@/lib/adminEditing";
import { sameOriginAdminMutation } from "@/lib/adminSecurity";
import { getLocalArticles, saveLocalArticles, type Article } from "@/lib/articles";

export async function GET(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getLocalArticles();
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  if (!sameOriginAdminMutation(req)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }

  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { items?: Article[] };
  const items = body.items;

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await saveLocalArticles(items);
  } catch (error) {
    console.error("Failed to save articles.", error);
    return NextResponse.json(
      {
        error: "Failed to save articles",
        details:
          error instanceof Error ? error.message : "Unknown article save error",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!sameOriginAdminMutation(req)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: unknown; article?: unknown }
    | null;
  if (!body || typeof body.id !== "string" || !body.id.trim() ||
      !body.article || typeof body.article !== "object" ||
      Array.isArray(body.article)) {
    return NextResponse.json({ error: "Некорректные данные редактирования." }, { status: 400 });
  }

  try {
    const item = await updateArticleEntry(body.id, body.article as Article);
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
