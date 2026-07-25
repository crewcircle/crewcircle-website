"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest("a, button");
      if (!target) return;
      const text = (
        target.textContent ??
        target.getAttribute("aria-label") ??
        ""
      )
        .trim()
        .slice(0, 120);
      const href = target.getAttribute("href") ?? "";
      trackEvent("cta_click", { cta_text: text, cta_href: href, page: pathname });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}', { page_path: window.location.pathname });`}
      </Script>
    </>
  );
}
