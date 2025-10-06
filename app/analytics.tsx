"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ✅ строгий тип вместо any
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");

    // ✅ безопасная проверка наличия GA
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-W0Q5PME6MH", {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
