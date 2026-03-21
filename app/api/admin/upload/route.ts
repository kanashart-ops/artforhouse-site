import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { isAdminAuthorized } from "@/lib/adminAuth";

const uploadFolders: Record<string, string> = {
  gallery: "public/images/gallery",
  shop: "public/images/shop",
  videos: "public/videos",
};

const blobFolders: Record<string, string> = {
  gallery: "gallery",
  shop: "shop",
  videos: "videos",
};

export async function POST(req: Request) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "gallery");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const targetDir = uploadFolders[folder];
  const blobDir = blobFolders[folder];

  if (!targetDir || !blobDir) {
    return NextResponse.json({ error: "Unknown folder" }, { status: 400 });
  }

  const ext = path.extname(file.name);
  const basename = path
    .basename(file.name, ext)
    .replace(/[^a-zA-Z0-9._-]/g, "-");
  const filename = `${Date.now()}-${basename}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    const blob = await put(`${blobDir}/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      src: blob.url,
      storage: "blob",
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const absoluteDir = path.join(process.cwd(), targetDir);

  await fs.mkdir(absoluteDir, { recursive: true });
  await fs.writeFile(path.join(absoluteDir, filename), buffer);

  return NextResponse.json({
    src: `/${targetDir.replace(/^public\//, "")}/${filename}`,
    storage: "local",
  });
}
