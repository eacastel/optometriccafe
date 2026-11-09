import { load } from "cheerio";
import type { ContentItem } from "@/lib/content";

const origin = "https://optometriccafe.com";
const xml = (value: string) => value.replace(/[<>&"']/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
}[character]!));
const cdata = (value: string) => `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

function absoluteContent(html: string) {
  const $ = load(html, null, false);
  $("[href],[src],[poster]").each((_, node) => {
    for (const name of ["href", "src", "poster"]) {
      const value = $(node).attr(name);
      if (value) $(node).attr(name, new URL(value, origin).href);
    }
  });
  $("[srcset]").each((_, node) => {
    $(node).attr("srcset", $(node).attr("srcset")!.split(",").map((part) => {
      const [url, ...descriptor] = part.trim().split(/\s+/);
      return [new URL(url, origin).href, ...descriptor].join(" ");
    }).join(", "));
  });
  return $.html();
}

export function feedXml(posts: ContentItem[], feed: {
  title: string; description: string; guids: Record<string, string>;
}) {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const updated = sorted.map((post) => post.modified).sort().at(-1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel><title>${xml(feed.title)}</title><link>${origin}</link>
<description>${xml(feed.description)}</description><language>en-US</language>
<atom:link href="${origin}/feed/" rel="self" type="application/rss+xml"/>
${updated ? `<lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>` : ""}
${sorted.map((post) => `<item><title>${xml(post.title)}</title><link>${xml(post.canonical)}</link>
<guid isPermaLink="false">${xml(feed.guids[String(post.id)] || post.canonical)}</guid>
<dc:creator>${xml(post.author?.name || "Optometric Cafe")}</dc:creator>
<pubDate>${new Date(post.date).toUTCString()}</pubDate><category>Blog</category>
<description>${cdata(post.description)}</description>
<content:encoded>${cdata(absoluteContent(post.content))}</content:encoded></item>`).join("\n")}
</channel></rss>`;
}
