import { NextResponse } from "next/server";
import { getAdminAuthConfig, isAdminAuthorized } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const config = getAdminAuthConfig();

  return NextResponse.json({
    ...config,
    isAuthorized: await isAdminAuthorized(req),
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
  });
}