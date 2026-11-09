import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { dirname } from "node:path";

// Public GET requests only. Never authenticate to or modify WordPress.
const origin = "https://optometriccafe.com";
const option = (name, fallback) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) || fallback;
const cache = option("cache", "public/tmp/wordpress");
const output = option("output", "data/wordpress-source.json");
const refresh = process.argv.includes("--refresh");
const archivePaths = new Set();
function pageMedia($) {
  $("a[href]").each((_, node) => {
    const url = new URL($(node).attr("href"), origin);
    if (
      url.hostname === "optometriccafe.com" &&
      /^\/(blog\/page\/\d+|author\/[^/]+(?:\/page\/\d+)?)\/$/.test(url.pathname)
    )
      archivePaths.add(url.pathname);
  });
  return $("img[src],source[src],video[poster]")
    .toArray()
    .map((node) => ({
      src: $(node).attr("src") || "",
      srcset: $(node).attr("srcset") || "",
      poster: $(node).attr("poster") || "",
    }));
}
await mkdir(cache, { recursive: true });
await mkdir(dirname(output), { recursive: true });
async function capture(path, name) {
  const filename = `${cache}/${name}`;
  if (!refresh) {
    try {
      return JSON.parse(await readFile(filename, "utf8"));
    } catch {}
  }
  const response = await fetch(new URL(path, origin), {
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  const result = {
    url: response.url,
    status: response.status,
    capturedAt: new Date().toISOString(),
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
  };
  await writeFile(filename, JSON.stringify(result));
  return result;
}
const records = [];
for (const type of ["pages", "posts"]) {
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page++) {
    const result = await capture(
      `/wp-json/wp/v2/${type}?per_page=100&page=${page}&_embed`,
      `${type}-${page}.json`,
    );
    totalPages = Number(result.headers["x-wp-totalpages"]);
    if (!totalPages) throw new Error(`Missing REST pagination for ${type}`);
    records.push(...JSON.parse(result.body));
  }
}
const entries = [];
let siteVerification = {};
for (const record of records) {
  const result = await capture(record.link, `${record.id}.json`);
  const $ = load(result.body);
  const entry =
    record.slug === "homepage-redesign-no-divi"
      ? $("main").first()
      : $(".entry-content").first();
  const schemas = $('script[type="application/ld+json"]')
    .toArray()
    .map((node) => JSON.parse($(node).text()));
  const meta = (name) =>
    $(`meta[name="${name}"], meta[property="${name}"]`)
      .first()
      .attr("content") || "";
  if (new URL(record.link).pathname === "/") {
    const google = meta("google-site-verification");
    siteVerification = google ? { google } : {};
  }
  entries.push({
    id: record.id,
    guid: record.guid?.rendered || "",
    type: record.type,
    slug: new URL(record.link).pathname === "/" ? "" : record.slug,
    path: new URL(record.link).pathname,
    url: record.link,
    title: load(record.title.rendered).text(),
    seoTitle: $("title").text(),
    description: meta("description"),
    canonical: $('link[rel="canonical"]').attr("href") || "",
    robots: meta("robots"),
    openGraph: Object.fromEntries(
      $(
        'meta[property^="og:"], meta[property^="article:"], meta[name^="twitter:"]',
      )
        .toArray()
        .map((node) => [
          $(node).attr("property") || $(node).attr("name"),
          $(node).attr("content"),
        ]),
    ),
    date: `${record.date_gmt}Z`,
    modified: `${record.modified_gmt}Z`,
    author: record._embedded?.author?.[0] || null,
    featuredImage:
      record._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
    featuredImageAlt:
      record._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || "",
    content: entry.html() || "",
    schemas,
    microdata: $("[itemscope]")
      .toArray()
      .map((node) => ({ type: $(node).attr("itemtype"), html: $.html(node) })),
    footer: $("#main-footer").html() || "",
    media: pageMedia($),
    sourceHash: createHash("sha256").update(result.body).digest("hex"),
    capturedAt: result.capturedAt,
    contentFound: entry.length === 1,
  });
  console.log(
    `${record.id} ${record.link} schemas=${schemas.length} content=${entry.text().length}`,
  );
}
const sitemaps = [];
const archives = [];
for (const path of archivePaths) {
  const result = await capture(
    path,
    `archive-${encodeURIComponent(path)}.json`,
  );
  const $ = load(result.body);
  archives.push({
    url: result.url,
    canonical: $('link[rel="canonical"]').attr("href"),
    robots: $('meta[name="robots"]').attr("content"),
    media: pageMedia($),
  });
  if (archives.length > 100)
    throw new Error("Unexpected archive pagination depth");
}
const pending = ["/sitemap_index.xml"];
while (pending.length) {
  const path = pending.shift();
  const result = await capture(
    path,
    `${new URL(path, origin).pathname.slice(1)}.json`,
  );
  const $ = load(result.body, { xml: true });
  if ($("sitemapindex").length)
    pending.push(
      ...$("sitemap > loc")
        .toArray()
        .map((node) => $(node).text()),
    );
  sitemaps.push({ url: result.url, xml: result.body });
}
await writeFile(
  output,
  JSON.stringify(
    { capturedAt: new Date().toISOString(), entries, sitemaps, archives, siteVerification },
    null,
    2,
  ) + "\n",
);
console.log(`Captured ${entries.length} entries, ${sitemaps.length} sitemaps to ${output}.`);
