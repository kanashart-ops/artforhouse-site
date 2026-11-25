import HomePageClient from "@/components/HomePageClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Art For House — авторские картины на заказ",
  description: "Картины маслом и акрилом, интерьерная живопись и художественная роспись стен от Анны Побитко. Галерея работ и индивидуальные заказы.",
  path: "/",
});
import { fetchArticlesLimited } from "@/lib/articles";

export default async function HomePage() {
  const articles = await fetchArticlesLimited(3);

  return <HomePageClient articles={articles} />;
}
