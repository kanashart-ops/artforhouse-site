import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { getGalleryItems, getShopItems } from "@/lib/contentStore";
import { getLocalArticles } from "@/lib/articles";
import { isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (process.env.NODE_ENV === "production" && !isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "PostgreSQL не подключён, экспорт заблокирован." },
      { status: 503 }
    );
  }

  try {
    const [gallery, shop, articles] = await Promise.all([
      getGalleryItems(), getShopItems(), getLocalArticles(),
    ]);
    const content = {
      format: "artforhouse-content-backup-v1",
      exportedAt: new Date().toISOString(),
      counts: { gallery: gallery.length, shop: shop.length, articles: articles.length },
      warning: "Экспорт записей. Файлы Vercel Blob и сама база PostgreSQL не включены.",
      gallery, shop, articles,
    };
    const timestamp = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(content, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="artforhouse-backup-${timestamp}.json"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Admin export failed:", error);
    return NextResponse.json({ error: "Не удалось создать экспорт." }, { status: 503 });
  }
}
