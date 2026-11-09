import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { load } from "cheerio";

// Fetch HTML/assets only: never execute tags or send analytics during release QA.
const base = new URL(process.env.TEST_BASE_URL || "http://localhost:3000");
const origin = "https://optometriccafe.com";
const items = JSON.parse(await readFile("data/site-content.json", "utf8"));
const posts = items.filter((item) => item.type === "post");
const identity = JSON.parse(await readFile("data/site-identity.json", "utf8"));
const localHosts = new Set([base.hostname, "optometriccafe.com", "www.optometriccafe.com"]);
const pages = new Map();
const assets = new Map();
const references = [];
const initialPaths = new Set([
  ...items.map((item) => item.path), "/services/", "/visit/",
  ...Array.from({ length: Math.ceil(posts.length / 10) - 1 }, (_, i) => `/blog/page/${i + 2}/`),
  ...posts.filter((item) => item.author?.slug).map((item) => `/author/${item.author.slug}/`),
]);

async function get(path, method = "GET") {
  return fetch(new URL(path, base), { method, redirect: "manual", signal: AbortSignal.timeout(30000) });
}
function internal(value, from) {
  const url = new URL(value, new URL(from, origin));
  if (!/^https?:$/.test(url.protocol) || !localHosts.has(url.hostname)) return null;
  return url;
}
function reference(value, from, kind) {
  if (!value) return;
  const url = internal(value, from);
  if (!url) return;
  if (url.pathname.startsWith("/_next/image")) {
    // Validate the original asset too; an optimizer URL alone can conceal a lost upload.
    reference(url.searchParams.get("url"), from, "optimized-original");
  }
  references.push({ from, target: url.pathname + url.search + url.hash, kind });
}
function walk(value, visit) {
  if (Array.isArray(value)) value.forEach((node) => walk(node, visit));
  else if (value && typeof value === "object") {
    visit(value);
    Object.values(value).forEach((node) => walk(node, visit));
  }
}

async function page(path) {
  if (pages.has(path)) return pages.get(path);
  assert.ok(pages.size < 100, "Unexpected internal crawl depth");
  const response = await get(path);
  assert.equal(response.status, 200, `Direct page response: ${path}`);
  assert.match(response.headers.get("content-type") || "", /text\/html/, path);
  const $ = load(await response.text());
  pages.set(path, $);
  assert.equal($('link[rel="canonical"]').length, 1, `Single canonical: ${path}`);
  const canonical = new URL(path, origin).href;
  assert.equal($('link[rel="canonical"]').attr("href"), canonical, path);
  assert.equal($('meta[property="og:url"]').attr("content"), canonical, `Social URL: ${path}`);
  assert.equal($("main h1").length, 1, `SSR heading: ${path}`);
  assert.equal($('meta[name="google-site-verification"]').attr("content"), identity.verification.google, `Preserved Search Console verification: ${path}`);
  assert.equal($('link[rel="alternate"][type="application/rss+xml"]').attr("href"), `${origin}/feed/`, `RSS discovery: ${path}`);
  const ids = $("[id]").toArray().map((node) => $(node).attr("id"));
  assert.equal(new Set(ids).size, ids.length, `Unique document IDs: ${path}`);
  const graphs = $('script[type="application/ld+json"]').toArray().map((node) => JSON.parse($(node).text()));
  const definitions = new Set();
  walk(graphs, (node) => {
    if (node["@id"] && Object.keys(node).length > 1) definitions.add(node["@id"]);
  });
  walk(graphs, (node) => {
    if (node["@id"]?.includes("#") && Object.keys(node).length === 1)
      assert.ok(definitions.has(node["@id"]), `Resolved schema identity: ${path} ${node["@id"]}`);
    for (const [key, value] of Object.entries(node)) {
      if (["url", "contentUrl", "image", "logo", "thumbnailUrl"].includes(key) && typeof value === "string") {
        const url = internal(value, path);
        if (url && /^\/(wp-content\/uploads|images)\//.test(url.pathname)) reference(value, path, "schema-image");
      }
    }
  });
  $("a[href]").each((_, node) => reference($(node).attr("href"), path, "link"));
  $("img[src],source[src],video[src],video[poster]").each((_, node) => {
    reference($(node).attr("src"), path, "media");
    reference($(node).attr("poster"), path, "poster");
  });
  $("[srcset]").each((_, node) => {
    for (const part of $(node).attr("srcset").split(","))
      reference(part.trim().split(/\s+/)[0], path, "srcset");
  });
  $('meta[property="og:image"],meta[name="twitter:image"]').each((_, node) => reference($(node).attr("content"), path, "social-image"));
  if (posts.some((post) => post.path === path)) {
    let article;
    walk(graphs, (node) => { if (node["@type"] === "BlogPosting") article = node; });
    assert.ok(article, `SSR BlogPosting: ${path}`);
    assert.ok($("[data-preserved-content]").text().trim().length > 100, `Substantive SSR article: ${path}`);
  }
  return $;
}

for (const path of initialPaths) await page(path);
const checked = new Set();
for (const ref of references) {
  const key = `${ref.kind === "link" ? "link" : "asset"}:${ref.target}`;
  if (checked.has(key)) continue;
  checked.add(key);
  const url = new URL(ref.target, origin);
  if (ref.kind === "link" && !/\.[^/]+$/.test(url.pathname)) {
    const $ = await page(url.pathname + url.search);
    if (url.hash && url.hash !== "#") {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok($("[id],a[name]").toArray().some((node) => $(node).attr("id") === id || $(node).attr("name") === id), `Anchor from ${ref.from}: ${ref.target}`);
    }
  } else if (!assets.has(url.pathname + url.search)) {
    const response = await get(url.pathname + url.search, "HEAD");
    assert.equal(response.status, 200, `Asset from ${ref.from}: ${ref.target}`);
    assert.ok(Number(response.headers.get("content-length")) > 0, `Nonempty asset: ${ref.target}`);
    assert.ok(!response.headers.get("content-type")?.includes("text/html"), `Not an HTML fallback: ${ref.target}`);
    assets.set(url.pathname + url.search, response.headers.get("content-type"));
  }
}

const blogPaths = [...initialPaths].filter((path) => /^\/blog\/(?:page\/\d+\/)?$/.test(path));
const listed = blogPaths.flatMap((path) => pages.get(path)(".content-card h2 a").toArray().map((node) => pages.get(path)(node).attr("href")));
assert.equal(listed.length, posts.length, "Every post listed once across blog pagination");
assert.deepEqual(new Set(listed), new Set(posts.map((post) => post.path)), "No missing or duplicate posts in archive");
for (const path of [...initialPaths].filter((path) => path.startsWith("/author/"))) {
  const $ = pages.get(path);
  assert.match($('meta[name="robots"]').attr("content"), /noindex/);
  const slug = path.split("/")[2];
  assert.equal($(".content-card").length, posts.filter((post) => post.author?.slug === slug).length, `Author archive: ${path}`);
}

const feedResponse = await get("/feed/");
assert.equal(feedResponse.status, 200);
assert.match(feedResponse.headers.get("content-type"), /application\/rss\+xml/);
const feed = load(await feedResponse.text(), { xml: true });
assert.equal(feed("channel > title").text(), identity.feed.title);
assert.equal(feed("item").length, posts.length, "All posts in RSS feed");
for (const post of posts) {
  const entry = feed("item").filter((_, node) => feed(node).find("link").text() === post.canonical);
  assert.equal(entry.length, 1, `RSS canonical: ${post.path}`);
  assert.equal(entry.find("guid").text(), identity.feed.guids[String(post.id)], `Stable RSS GUID: ${post.path}`);
  const body = load(entry.find("content\\:encoded").text(), null, false);
  const expected = load(post.content, null, false);
  assert.equal(body.root().text(), expected.root().text(), `Full RSS article copy: ${post.path}`);
  body("[href],[src]").each((_, node) => {
    for (const name of ["href", "src"])
      if (body(node).attr(name)) assert.ok(!body(node).attr(name).startsWith("/"), `Absolute feed URL: ${post.path}`);
  });
}

for (const path of [
  "/private-exports/optometric-cafe-customers-consolidated.csv",
  "/private-exports/consolidation-report.json",
  "/wp-login.php", "/wp-admin/", "/.env", "/missing-content-release-check/",
]) assert.equal((await get(path)).status, 404, `Private/retired/missing path: ${path}`);

const result = {
  checkedAt: new Date().toISOString(), base: base.href, passed: true,
  pages: pages.size, posts: posts.length, blogPages: blogPaths.length, feedPosts: feed("item").length,
  references: references.length, uniqueChecks: checked.size, uniqueAssets: assets.size,
  anchorTargets: [...checked].filter((key) => key.startsWith("link:") && key.includes("#")).length,
  checks: ["SSR content and headings", "single canonical and page-specific social URL", "internal destinations and fragment IDs", "unique document IDs", "resolved JSON-LD identities", "BlogPosting on all articles", "media/srcset/social/schema image availability", "all posts discoverable once via pagination", "author archive noindex", "Search Console verification", "full-text RSS and original GUIDs", "private export exclusion and real 404s"],
  pagePaths: [...pages.keys()].sort(),
};
await writeFile("docs/content-integrity-verification.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
