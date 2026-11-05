const servicePaths: Record<string, string> = {
  "/optometry-lab-beverly-hills/": "optical_workshop",
  "/high-prescription-glasses-beverly-hills/": "high_prescription",
  "/replacement-lenses-existing-frames-beverly-hills/": "replacement_lenses",
  "/progressive-glasses-beverly-hills/": "progressive_fitting",
  "/glasses-repair-adjustment-beverly-hills/": "repairs_adjustments",
  "/prescription-eyeglasses-beverly-hills/": "prescription_glasses",
  "/womens-prescription-glasses-beverly-hills/": "prescription_glasses",
  "/mens-prescription-eye-glasses-beverly-hills/": "prescription_glasses",
  "/childrens-prescription-glasses-beverly-hills/": "childrens_glasses",
  "/sunglasses-beverly-hills/": "sunglasses",
  "/womens-sunglasses-beverly-hills/": "sunglasses",
  "/mens-sunglasses-beverly-hills/": "sunglasses",
  "/childrens-sunglasses-beverly-hills/": "childrens_glasses",
  "/sports-eye-glasses-and-sunglasses/": "sports_glasses",
  "/computer-gaming-eye-glasses-beverly-hills/": "computer_glasses",
  "/contact-lenses-beverly-hills/": "contact_lenses",
  "/optometry-services-in-beverly-hills/": "eye_exam",
};
const normalizePath = (path: string) =>
  path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;

// Compatible with the October measurement contract; clicks are intent, never bookings.
export function classifyClick(href: string, pageUrl: string) {
  const url = new URL(href, pageUrl);
  const current = new URL(pageUrl);
  const source = normalizePath(current.pathname);
  const destination = normalizePath(url.pathname);
  const common = {
    page_path: source,
    service_interest: servicePaths[source] || "general_inquiry",
    measurement_version: "2026-10-05",
  };
  if (
    url.protocol === "tel:" &&
    ["13108882848", "3108882848"].includes(url.pathname.replace(/\D/g, ""))
  )
    return {
      ...common,
      event: "oc_phone_click",
      cta_type: "phone_intent",
      destination_path: "phone",
      link_url: "tel:+13108882848",
    };
  if (
    url.protocol === "mailto:" &&
    url.pathname.toLowerCase() === "info@optometriccafe.com"
  )
    return {
      ...common,
      event: "oc_email_click",
      cta_type: "email_intent",
      destination_path: "email",
      link_url: "mailto:info@optometriccafe.com",
    };
  if (
    (/^(maps\.|www\.)?google\.[a-z.]+$/.test(url.hostname) &&
      (url.hostname.startsWith("maps.") || url.pathname.startsWith("/maps"))) ||
    url.hostname === "maps.app.goo.gl" ||
    (url.hostname === "goo.gl" && url.pathname.startsWith("/maps"))
  )
    return {
      ...common,
      event: "oc_directions_click",
      cta_type: "directions",
      destination_path: "directions",
      link_url: `${url.origin}${url.pathname}`,
    };
  if (url.origin !== current.origin || destination === source) return null;
  const base = {
    ...common,
    destination_path: destination,
    link_url: `${url.origin}${url.pathname}`,
  };
  if (["/contact-us/", "/visit/"].includes(destination))
    return {
      ...base,
      event: "oc_contact_click",
      cta_type: "contact_navigation",
    };
  if (servicePaths[destination])
    return {
      ...base,
      event: "oc_service_cta_click",
      cta_type: "service_navigation",
      service_interest: servicePaths[destination],
    };
  if (destination === "/services/")
    return {
      ...base,
      event: "oc_service_cta_click",
      cta_type: "service_navigation",
      service_interest:
        url.hash === "#glasses-repair"
          ? "repairs_adjustments"
          : "general_inquiry",
    };
  if (["/featured-reviews/", "/reviews/"].includes(destination))
    return { ...base, event: "oc_review_click", cta_type: "reviews" };
  return null;
}
