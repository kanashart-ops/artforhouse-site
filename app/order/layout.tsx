import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Заказать картину | Art For House",
  description:
    "Заказ оригинальных картин маслом, акрилом и художественной росписи стен. Обсудите идею, размеры, материалы и доставку с художницей.",
  path: "/order",
});

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
