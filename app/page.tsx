import HomePageClient from "@/components/HomePageClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Art For House (Арт Фор Хаус) — картины Анны Побитко",
  description: "Арт Фор Хаус (Art For House) — авторские картины художницы Анны Побитко. Картины маслом и акрилом на заказ, интерьерная живопись и роспись стен в Минске, Беларуси и с доставкой.",
  path: "/",
});
import { fetchArticlesLimited } from "@/lib/articles";

export default async function HomePage() {
  const articles = await fetchArticlesLimited(3);

  return <HomePageClient articles={articles} />;
}
