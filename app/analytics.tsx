"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");

    // 👇 Отправляем событие просмотра страницы
    window.gtag?.("config", "G-W0Q5PME6MH", {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}
