import { createPageMetadata } from "@/lib/seo";
import ServiceLanding from "@/components/ServiceLanding";
import { interiorLandingContent } from "@/lib/serviceLandingContent";

export const metadata = createPageMetadata({
  title: "Интерьерные картины на заказ | Art For House",
  description: "Интерьерные картины на заказ под масштаб помещения, палитру и стиль пространства. Решения для дома и коммерческих интерьеров.",
  path: "/interior-paintings",
});

export default function InteriorPaintingsPage() {
  return <ServiceLanding {...interiorLandingContent} />;
}
