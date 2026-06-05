import type { MetadataRoute } from "next";
import { business } from "@/app/data";
import content from "@/data/site-content.json";

type ContentItem = { slug: string; modified?: string; type: "page" | "post" };

export default function sitemap(): MetadataRoute.Sitemap {
  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: business.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${business.url}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${business.url}/visit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const contentRoutes = (content as ContentItem[]).map((item) => ({
    url: `${business.url}/${item.slug}`,
    lastModified: item.modified ? new Date(item.modified) : new Date(),
    changeFrequency: item.type === "post" ? "monthly" as const : "weekly" as const,
    priority: item.type === "post" ? 0.65 : 0.82,
  }));

  return [...baseRoutes, ...contentRoutes];
}
