import type { Metadata } from "next";
import ServiceLanding from "@/components/ServiceLanding";
import { oilLandingContent } from "@/lib/serviceLandingContent";

export const metadata: Metadata = {
  title: "Картины маслом на заказ | Art for House",
  description:
    "Картины маслом на заказ для интерьера, дома и подарка. Подбор сюжета, размера и палитры под пространство.",
};

export default function OilPaintingsPage() {
  return <ServiceLanding {...oilLandingContent} />;
}
