import { posts } from "@/lib/content";
import { feedXml } from "@/lib/feed";
import siteIdentity from "@/data/site-identity.json";

export const dynamic = "force-static";

export function GET() {
  return new Response(feedXml(posts, siteIdentity.feed), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
