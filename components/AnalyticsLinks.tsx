"use client";
import { useEffect } from "react";
import { classifyClick } from "@/lib/tracking";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function AnalyticsLinks() {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const payload = classifyClick(anchor.href, window.location.href);
      if (!payload) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        ...payload,
        cta_text: (
          anchor.dataset.ctaText ||
          anchor.textContent ||
          anchor.getAttribute("aria-label") ||
          ""
        )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 100),
        link_placement: anchor.closest("footer")
          ? "footer"
          : anchor.closest("header,.location-bar")
            ? "header"
            : "content",
      });
    };
    // Capture before Next.js handles navigation. One listener covers React and imported HTML.
    document.addEventListener("click", listener, true);
    return () => document.removeEventListener("click", listener, true);
  }, []);
  return null;
}
