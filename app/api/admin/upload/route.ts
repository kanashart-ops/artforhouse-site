
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { sameOriginAdminMutation } from "@/lib/adminSecurity";

export const runtime = "nodejs";

const blobFolders = {
  gallery: "gallery",
  shop: "shop",
  videos: "videos",
} as const;

type UploadFolder = keyof typeof blobFolders;

export async function POST(req: Request) {
  try {
    if (!sameOriginAdminMutation(req)) {
      return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
    }
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL?.trim()) {
      return NextResponse.json(
        {
          error: "PostgreSQL не подключён.",
          details: "Сначала настройте DATABASE_URL: нельзя загружать файлы без возможности сохранить карточку работы.",
        },
        { status: 503 }
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

    // The server-upload route is subject to Vercel's request-body limit.
    const maxBytes = 4 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "Файл больше 4 МБ. Для больших файлов нужна прямая загрузка в Blob." },
        { status: 413 }
      );
    }

    const mime = file.type.toLowerCase();
    const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
    const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
    if (!(blobDir === "videos" ? videoTypes : imageTypes).has(mime)) {
      return NextResponse.json(
        { error: blobDir === "videos" ? "Допустимы MP4, WebM и MOV." : "Допустимы JPG, PNG, WebP, GIF и AVIF. SVG запрещён." },
        { status: 415 }
      );
    }

    // Verify magic bytes; extensions and client-provided MIME alone can be forged.
    const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    const ascii = (offset: number, length: number) =>
      String.fromCharCode(...head.slice(offset, offset + length));
    const signatureValid =
      mime === "image/jpeg" ? head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff :
      mime === "image/png" ? head[0] === 0x89 && ascii(1, 3) === "PNG" && head[4] === 13 && head[5] === 10 :
      mime === "image/gif" ? ["GIF87a", "GIF89a"].includes(ascii(0, 6)) :
      mime === "image/webp" ? ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP" :
      mime === "image/avif" ? ascii(4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(8, 4)) :
      mime === "video/mp4" || mime === "video/quicktime" ? ascii(4, 4) === "ftyp" :
      mime === "video/webm" ? head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3 :
      false;
    if (!signatureValid) {
      return NextResponse.json(
        { error: "Содержимое файла не соответствует его формату." },
        { status: 415 }
      );
    }


    const originalName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/^\.+/, "")
      .slice(0, 150) || "upload";

    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov",
    };
    const baseName = originalName.replace(/\.[^.]*$/, "").slice(0, 100) || "upload";
    const filename = `${Date.now()}-${baseName}.${extensions[mime]}`;

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
