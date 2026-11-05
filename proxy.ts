import { NextResponse, type NextRequest } from "next/server";
import redirects from "@/data/redirects.json";
import inventory from "@/data/migration-inventory.json";

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const path =
    url.pathname
      .replace(/^\/index\.php(?=\/)/, "")
      .replace(/\/amp\/?$/, "/")
      .replace(/\/+$/, "") || "/";
  url.searchParams.delete("amp");
  url.searchParams.delete("noamp");
  const alias = redirects.find((rule) => rule.source === path);
  let destination = alias?.destination;
  if (path === "/") {
    const id = url.searchParams.get("p") || url.searchParams.get("page_id");
    const item = id && inventory.find((item) => String(item.id) === id);
    if (item) {
      destination = item.path;
      url.searchParams.delete("p");
      url.searchParams.delete("page_id");
    }
    if (url.searchParams.has("s")) {
      destination = "/search/";
      url.searchParams.set("q", url.searchParams.get("s") || "");
      url.searchParams.delete("s");
    }
  }
  if (path === "/blog/page/1") destination = "/blog/";
  const categoryPage = path.match(/^\/category\/blog\/page\/(\d+)$/);
  if (categoryPage) destination = "/blog/";
  if (/^\/author\/morteza\/page\/\d+$/.test(path))
    destination = "/author/morteza/";
  if (
    !destination &&
    path !== "/" &&
    !/\.[^/]+$/.test(path) &&
    !path.startsWith("/_next/")
  )
    destination = `${path}/`;
  if (
    (destination && destination !== request.nextUrl.pathname) ||
    path !== (request.nextUrl.pathname.replace(/\/+$/, "") || "/") ||
    url.search !== request.nextUrl.search
  ) {
    url.pathname = destination || path;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images/|fonts/|wp-content/|favicon.ico).*)",
  ],
};
