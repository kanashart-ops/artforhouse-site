// app/api/articles/route.ts
import { NextResponse } from "next/server";
import { fetchArticlesLimited, fetchAllArticles } from "@/lib/articles";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");

  let articles;

  if (limitParam) {
    const limit = Number(limitParam);
    const safeLimit = Number.isNaN(limit) || limit <= 0 ? 3 : limit;
    articles = await fetchArticlesLimited(safeLimit);
  } else {
    // без limit — отдать все статьи (для архива)
    articles = await fetchAllArticles();
  }

  return NextResponse.json({ articles });
}
