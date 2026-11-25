import { createPageMetadata } from "@/lib/seo";
import ShopClient from "@/components/ShopClient";
import { getShopItems } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Картины в наличии | Art For House",
  description: "Готовые картины Art For House в наличии. Узнайте о доступных работах, размерах и стоимости, свяжитесь с художницей.",
  path: "/shop",
});

export default async function ShopPage() {
  const items = await getShopItems();
  return <ShopClient items={items} />;
}
