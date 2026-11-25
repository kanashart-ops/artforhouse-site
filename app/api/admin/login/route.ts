import { NextResponse } from "next/server";
import {
  createAdminSession, getAdminAuthConfig, validateAdminLogin,
} from "@/lib/adminAuth";
import {
  clearFailedLogins, getLoginDelay, recordFailedLogin, sameOriginAdminMutation,
} from "@/lib/adminSecurity";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOriginAdminMutation(req)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }

  const retryAfter = getLoginDelay(req);
  if (retryAfter) {
    return NextResponse.json(
      { error: "Слишком много попыток входа. Повторите позже." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Ожидается JSON." }, { status: 415 });
  }
  const size = Number(req.headers.get("content-length"));
  if (Number.isFinite(size) && size > 2048) {
    return NextResponse.json({ error: "Слишком большой запрос." }, { status: 413 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Неверный логин или пароль." }, { status: 401 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (username.length > 150 || password.length > 500 || !validateAdminLogin(username, password)) {
    recordFailedLogin(req);
    return NextResponse.json({ error: "Неверный логин или пароль." }, { status: 401 });
  }

  clearFailedLogins(req);
  await createAdminSession(username || getAdminAuthConfig().username);
  return NextResponse.json({ ok: true });
}
