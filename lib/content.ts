import type { Metadata } from "next";
import content from "@/data/site-content.json";
import brands from "@/data/frame-brands.json";
import { applyBrandText, applyBrandUpdates, applyBrandSchemas } from "@/lib/brand-content";

export type ContentItem = {
  id: number;
  type: string;
  slug: string;
  path: string;
  title: string;
  heading: string;
  seoTitle: string;
  description: string;
  canonical: string;
  robots: string;
  date: string;
  modified: string;
  content: string;
  plainText: string;
  author: { name: string; slug: string; url: string } | null;
  featuredImage: string;
  featuredImageAlt: string;
  openGraph: Record<string, string>;
  schemas: Record<string, unknown>[];
};
export const items = (content as unknown as ContentItem[]).map((item) => ({
  ...item,
  content: applyBrandUpdates(item.content, item.path, brands),
  plainText: applyBrandText(item.plainText, item.path, brands),
  schemas: applyBrandSchemas(item.schemas, item.path, brands),
}));
export const posts = items
  .filter((item) => item.type === "post")
  .sort((a, b) => b.date.localeCompare(a.date));
export const home = items.find((item) => item.path === "/")!;
export const findItem = (slug: string) =>
  items.find((item) => item.slug === slug);
export function contentMetadata(item: ContentItem): Metadata {
  const image = item.openGraph["og:image"] || item.featuredImage;
  return {
    title: { absolute: item.seoTitle },
    description: item.description || undefined,
    alternates: { canonical: item.canonical },
    robots: item.robots || "index, follow",
    openGraph: {
      title: item.openGraph["og:title"] || item.seoTitle,
      description: item.openGraph["og:description"] || item.description,
      url: item.canonical,
      siteName: item.openGraph["og:site_name"] || "Optometric Cafe",
      type: item.type === "post" ? "article" : "website",
      ...(item.type === "post"
        ? {
            publishedTime: item.date,
            modifiedTime: item.modified,
            authors: item.author ? [item.author.url] : [],
          }
        : {}),
      images: image
        ? [
            {
              url: image,
              alt: item.openGraph["og:image:alt"] || item.featuredImageAlt,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: item.openGraph["twitter:title"] || item.seoTitle,
      description: item.openGraph["twitter:description"] || item.description,
      images: image ? [image] : [],
    },
  };
}
export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
