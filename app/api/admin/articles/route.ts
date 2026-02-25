import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { getLocalArticles, saveLocalArticles, type Article } from "@/lib/articles";

export async function GET() {
  const items = await getLocalArticles();
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { items?: Article[] };
  const items = body.items;

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await saveLocalArticles(items);
  return NextResponse.json({ ok: true });
}
