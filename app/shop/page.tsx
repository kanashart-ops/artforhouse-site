import type { Metadata } from "next";
import ShopClient from "@/components/ShopClient";
import { getShopItems } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Картины в наличии | Art For House",
  description:
    "Готовые картины Art For House в наличии. Узнайте о доступных работах, размерах и стоимости, свяжитесь с художницей.",
};

export default async function ShopPage() {
  const items = await getShopItems();
  return <ShopClient items={items} />;
}
