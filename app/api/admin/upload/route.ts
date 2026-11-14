
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const runtime = "nodejs";

const blobFolders = {
  gallery: "gallery",
  shop: "shop",
  videos: "videos",
} as const;

type UploadFolder = keyof typeof blobFolders;

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

    if (!token) {
      return NextResponse.json(
        {
          error: "Vercel Blob не настроен.",
          details:
            "Необходимо указать BLOB_READ_WRITE_TOKEN в переменных окружения.",
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "gallery");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Необходимо выбрать непустой файл." },
        { status: 400 }
      );
    }

    if (!Object.hasOwn(blobFolders, folder)) {
      return NextResponse.json(
        { error: "Неизвестная папка загрузки." },
        { status: 400 }
      );
    }

    const blobDir = blobFolders[folder as UploadFolder];

    const originalName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/^\.+/, "")
      .slice(0, 150) || "upload";

    const filename = `${Date.now()}-${originalName}`;

    const blob = await put(
      `${blobDir}/${filename}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
        token,
      }
    );

    return NextResponse.json({
      src: blob.url,
      storage: "blob",
    });
  } catch (error) {
    console.error("Upload failed:", error);

    return NextResponse.json(
      {
        error: "Ошибка загрузки файла.",
        details:
          error instanceof Error
            ? error.message
            : "Неизвестная ошибка.",
      },
      { status: 500 }
    );
  }
}
