import type { Metadata } from "next";
import ServiceLanding from "@/components/ServiceLanding";
import { interiorLandingContent } from "@/lib/serviceLandingContent";

export const metadata: Metadata = {
  title: "Интерьерные картины на заказ | Art for House",
  description:
    "Интерьерные картины на заказ под масштаб помещения, палитру и стиль пространства. Решения для дома и коммерческих интерьеров.",
};

export default function InteriorPaintingsPage() {
  return <ServiceLanding {...interiorLandingContent} />;
}
