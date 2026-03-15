import HomePageClient from "@/components/HomePageClient";
import { fetchArticlesLimited } from "@/lib/articles";

export default async function HomePage() {
  const articles = await fetchArticlesLimited(3);

  return <HomePageClient articles={articles} />;
}
