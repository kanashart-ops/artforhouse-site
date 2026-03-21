import { NextResponse } from "next/server";
import { createAdminSession, getAdminAuthConfig, validateAdminLogin } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  const username = body?.username?.trim() ?? "";
  const password = body?.password?.trim() ?? "";

  if (!validateAdminLogin(username, password)) {
    return NextResponse.json({ error: "Неверный логин или пароль." }, { status: 401 });
  }

  await createAdminSession(username || getAdminAuthConfig().username);
  return NextResponse.json({ ok: true });
}
