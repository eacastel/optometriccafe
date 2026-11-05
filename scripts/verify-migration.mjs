import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { load } from "cheerio";

const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const items = JSON.parse(await readFile("data/site-content.json", "utf8"));
const redirects = JSON.parse(await readFile("data/redirects.json", "utf8"));
const results = [];
const links = new Set();
const text = (value) => value.replace(/\s+/g, " ").trim();
async function get(path) {
  return fetch(new URL(path, base), {
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
}
for (const item of items) {
  const response = await get(item.path);
  assert.equal(response.status, 200, item.path);
  const $ = load(await response.text());
  assert.equal($("title").text(), item.seoTitle, `Title: ${item.path}`);
  assert.equal(
    $('link[rel="canonical"]').attr("href"),
    item.canonical,
    `Canonical: ${item.path}`,
  );
  if (item.description)
    assert.equal(
      $('meta[name="description"]').attr("content"),
      item.description,
      `Description: ${item.path}`,
    );
  if (item.robots.includes("noindex"))
    assert.ok($('meta[name="robots"]').attr("content").includes("noindex"));
  assert.equal($("main h1").length, 1, `H1 count: ${item.path}`);
  if (item.slug !== "blog") {
    const expected = load(item.content, null, false);
    assert.equal(
      text($("[data-preserved-content]").text()),
      text(expected.root().text()),
      `Rendered copy: ${item.path}`,
    );
  }
  const graphs = $('script[type="application/ld+json"]')
    .toArray()
    .map((node) => JSON.parse($(node).text()));
  assert.ok(graphs.length >= 2, `Schema: ${item.path}`);
  $("a[href]").each((_, node) => {
    const value = $(node).attr("href");
    const url = new URL(value, base);
    if (url.origin === new URL(base).origin) links.add(url.pathname);
  });
  results.push({
    path: item.path,
    status: 200,
    copy: "exact",
    title: "exact",
    canonical: "exact",
    schema: "parsed",
  });
}
for (const rule of redirects) {
  for (const slash of ["", "/"]) {
    const path = `${rule.source}${slash}?utm_source=migration-test`;
    const response = await get(path);
    assert.equal(response.status, 301, path);
    const location = new URL(response.headers.get("location"), base);
    assert.equal(location.pathname, rule.destination, path);
    assert.equal(location.searchParams.get("utm_source"), "migration-test");
    assert.equal(
      (await get(location.pathname)).status,
      200,
      `Redirect target: ${path}`,
    );
    results.push({ path, status: 301, destination: rule.destination, hops: 1 });
  }
}
for (const [path, destination] of [
  ["/optometry-lab-beverly-hills", "/optometry-lab-beverly-hills/"],
  ["/index.php/optometry-lab/amp/?amp=1", "/optometry-lab-beverly-hills/"],
  [
    "/index.php/prescription-eyeglasses-beverly-hills/",
    "/prescription-eyeglasses-beverly-hills/",
  ],
  [
    "/progressive-glasses-beverly-hills/amp/",
    "/progressive-glasses-beverly-hills/",
  ],
  [
    "/progressive-glasses-beverly-hills/?noamp=mobile",
    "/progressive-glasses-beverly-hills/",
  ],
  ["/?amp=1", "/"],
  ["/?p=22635", "/progressive-glasses-beverly-hills/"],
  ["/blog/page/1/", "/blog/"],
  ["/category/blog/page/2/", "/blog/"],
  ["/author/morteza/page/6/", "/author/morteza/"],
]) {
  const response = await get(path);
  assert.equal(response.status, 301, path);
  const location = new URL(response.headers.get("location"), base);
  assert.equal(location.pathname, destination, path);
  assert.equal(location.search, "", path);
  assert.equal((await get(destination)).status, 200, destination);
  results.push({ path, status: 301, destination, hops: 1 });
}
for (const path of links) {
  const response = await get(path);
  assert.equal(response.status, 200, `Internal link: ${path}`);
}
const sitemapResponse = await get("/sitemap.xml");
const media = JSON.parse(await readFile('data/wordpress-media.json', 'utf8'));
for (const item of media) {
  const response = await fetch(new URL(item.path, base), { method: 'HEAD', redirect: 'manual' });
  assert.equal(response.status, 200, `Legacy media URL: ${item.path}`);
}
const sitemap = load(await sitemapResponse.text(), { xml: true });
const urls = sitemap("url > loc")
  .toArray()
  .map((node) => sitemap(node).text());
for (const item of items)
  assert.equal(
    urls.includes(item.canonical),
    !item.robots.includes("noindex"),
    `Sitemap: ${item.path}`,
  );
assert.equal(new Set(urls).size, urls.length);
assert.equal((await get("/not-a-real-page-should-404/")).status, 404);
assert.equal((await get("/blog/page/99/")).status, 404);
const search = await get("/search/?q=progressive");
assert.equal(search.status, 200);
const $ = load(await search.text());
assert.ok($('main a[href="/progressive-glasses-beverly-hills/"]').length);
assert.ok($('meta[name="robots"]').attr("content").includes("noindex"));
await writeFile(
  "docs/migration-http-verification.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      base,
      pages: items.length,
      internalLinks: links.size,
      sitemapUrls: urls.length,
      legacyMediaUrls: media.length,
      results,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `PASS: ${items.length} pages, ${redirects.length * 2 + 10} redirect variants, ${links.size} internal targets, ${urls.length} sitemap URLs, ${media.length} legacy media URLs, search and real 404s.`,
);
