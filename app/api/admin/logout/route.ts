import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/adminAuth";
import { sameOriginAdminMutation } from "@/lib/adminSecurity";

export async function POST(req: Request) {
  if (!sameOriginAdminMutation(req)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
