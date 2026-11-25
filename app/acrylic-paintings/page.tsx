import { createPageMetadata } from "@/lib/seo";
import ServiceLanding from "@/components/ServiceLanding";
import { acrylicLandingContent } from "@/lib/serviceLandingContent";

export const metadata = createPageMetadata({
  title: "Картины акрилом на заказ | Art For House",
  description: "Картины акрилом на заказ для современных интерьеров. Подбор палитры, формата и серии под пространство.",
  path: "/acrylic-paintings",
});

export default function AcrylicPaintingsPage() {
  return <ServiceLanding {...acrylicLandingContent} />;
}
