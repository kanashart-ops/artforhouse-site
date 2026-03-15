import type { Metadata } from "next";
import ServiceLanding from "@/components/ServiceLanding";
import { acrylicLandingContent } from "@/lib/serviceLandingContent";

export const metadata: Metadata = {
  title: "Картины акрилом на заказ | Art for House",
  description:
    "Картины акрилом на заказ для современных интерьеров. Подбор палитры, формата и серии под пространство.",
};

export default function AcrylicPaintingsPage() {
  return <ServiceLanding {...acrylicLandingContent} />;
}
