import { createPageMetadata } from "@/lib/seo";
import ServiceLanding from "@/components/ServiceLanding";
import { oilLandingContent } from "@/lib/serviceLandingContent";

export const metadata = createPageMetadata({
  title: "Картины маслом на заказ | Art For House",
  description: "Картины маслом на заказ для интерьера, дома и подарка. Подбор сюжета, размера и палитры под пространство.",
  path: "/oil-paintings",
});

export default function OilPaintingsPage() {
  return <ServiceLanding {...oilLandingContent} />;
}
