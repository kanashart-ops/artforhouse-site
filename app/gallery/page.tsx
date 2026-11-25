import { createPageMetadata } from "@/lib/seo";
import GalleryClient from "@/components/GalleryClient";
import { getGalleryItems } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Галерея картин Анны Побитко | Art For House",
  description: "Галерея Art For House (Арт Фор Хаус): картины художницы Анны Побитко — пейзажи, абстракция, интерьерные картины и роспись стен. Посмотрите работы.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const items = await getGalleryItems();
  return <GalleryClient items={items} />;
}
