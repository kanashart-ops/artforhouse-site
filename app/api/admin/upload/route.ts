import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isAdminAuthorized } from "@/lib/adminAuth";

const uploadFolders: Record<string, string> = {
  gallery: "public/images/gallery",
  shop: "public/images/shop",
  videos: "public/videos",
};

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "gallery");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const targetDir = uploadFolders[folder];
  if (!targetDir) {
    return NextResponse.json({ error: "Unknown folder" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filename = `${Date.now()}-${safeName}`;

  const absoluteDir = path.join(process.cwd(), targetDir);
  await fs.mkdir(absoluteDir, { recursive: true });
  await fs.writeFile(path.join(absoluteDir, filename), buffer);

  const publicPath = `/${targetDir.replace(/^public\//, "")}/${filename}`;
  return NextResponse.json({ src: publicPath });
}
