import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    requiresPassword: Boolean(process.env.ADMIN_PASSWORD),
  });
}
