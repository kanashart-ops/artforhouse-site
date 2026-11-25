import { createPageMetadata } from "@/lib/seo";
import ShopClient from "@/components/ShopClient";
import { getShopItems } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Готовые картины в наличии | Art For House",
  description: "Готовые картины художницы Анны Побитко в Art For House (Арт Фор Хаус). Посмотрите работы в наличии, размеры, цены и свяжитесь с художницей.",
  path: "/shop",
});

export default async function ShopPage() {
  const items = await getShopItems();
  return <ShopClient items={items} />;
}
