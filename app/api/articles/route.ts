// app/api/articles/route.ts
import { NextResponse } from "next/server";
import { fetchArticlesLimited } from "@/lib/articles";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? "3");

  const articles = await fetchArticlesLimited(limit);

  return NextResponse.json({ articles });
}
