import { NextResponse } from "next/server";
import { ArtworkPlacement } from "@prisma/client";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    const production = process.env.NODE_ENV === "production";
    return NextResponse.json(
      {
        status: "not_configured",
        storage: "local_json",
        writable: !production,
        message: production
          ? "PostgreSQL не подключён. Публикация через админку заблокирована во избежание потери данных."
          : "Разработка использует локальные JSON-файлы. Для Vercel подключите PostgreSQL.",
      },
      { status: production ? 503 : 200 }
    );
  }

  try {
    const prisma = getPrismaClient();
    if (!prisma) throw new Error("Prisma не инициализирована.");

    const [gallery, shop, articles] = await Promise.all([
      prisma.artwork.count({ where: { placement: ArtworkPlacement.GALLERY } }),
      prisma.artwork.count({ where: { placement: ArtworkPlacement.SHOP } }),
      prisma.article.count(),
    ]);

    return NextResponse.json({
      status: "ready",
      storage: "postgresql",
      writable: true,
      counts: { gallery, shop, articles },
    });
  } catch (error) {
    console.error("Content storage check failed:", error);
    return NextResponse.json(
      {
        status: "unavailable",
        storage: "postgresql",
        writable: false,
        message: "Не удалось подключиться к PostgreSQL. Проверьте DATABASE_URL и миграции Prisma.",
      },
      { status: 503 }
    );
  }
}
