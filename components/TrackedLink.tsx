"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

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
  function track(event: MouseEvent<HTMLAnchorElement>) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      cta_text: ctaText,
      cta_type: ctaType,
      link_url: href,
      page_path: window.location.pathname,
    });
  }

  const isExternal =
    href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a href={href} onClick={track} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={track} {...props}>
      {children}
    </Link>
  );
}
