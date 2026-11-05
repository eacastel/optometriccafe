import type { MetadataRoute } from "next";
import { business } from "@/app/data";
import inventory from "@/data/migration-inventory.json";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...inventory
      .filter((item) => !item.robots.includes("noindex"))
      .map((item) => ({
        url: `${business.url}${item.path}`,
        lastModified: new Date(item.modified),
      })),
    { url: `${business.url}/services/` },
    { url: `${business.url}/visit/` },
  ];
}
