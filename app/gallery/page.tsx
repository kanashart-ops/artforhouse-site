import { createPageMetadata } from "@/lib/seo";
import GalleryClient from "@/components/GalleryClient";
import { getGalleryItems } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Галерея картин | Art For House",
  description: "Оригинальные картины художницы Анны Побитко: масло, акрил, интерьерная живопись. Посмотрите галерею работ Art For House.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const items = await getGalleryItems();
  return <GalleryClient items={items} />;
}
