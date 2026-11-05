"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  eventName:
    | "oc_phone_click"
    | "oc_email_click"
    | "oc_directions_click"
    | "oc_appointment_click"
    | "oc_review_click"
    | "oc_service_cta_click";
  ctaText: string;
  ctaType: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">;

export function TrackedLink({
  href,
  children,
  eventName,
  ctaText,
  ctaType,
  ...props
}: Props) {
  // AnalyticsLinks owns event classification and dispatch for every link.
  // Legacy eventName/ctaType props are consumed here, never used to override it.
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("tel:") ||
    href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a href={href} data-cta-text={ctaText} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} data-cta-text={ctaText} {...props}>
      {children}
    </Link>
  );
}
