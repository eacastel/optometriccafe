import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import {
  decodeEmailProtection,
  correctPublishedHours,
} from "./wordpress-html.mjs";

const source = JSON.parse(await readFile("data/wordpress-source.json", "utf8"));
const redirects = JSON.parse(await readFile("data/redirects.json", "utf8"));
const origin = "https://optometriccafe.com";
const assets = new Map();
const changes = [];
const normalizeText = (text) => text.replace(/\s+/g, " ").trim();
const sha = (text) => createHash("sha256").update(text).digest("hex");
const flatten = (value) =>
  Array.isArray(value)
    ? value.flatMap(flatten)
    : value?.["@graph"]
      ? flatten(value["@graph"])
      : [value];
function asset(value) {
  if (!value) return value;
  const url = new URL(value, origin);
  if (
    !["optometriccafe.com", "www.optometriccafe.com"].includes(url.hostname) ||
    !url.pathname.startsWith("/wp-content/uploads/")
  )
    return value;
  assets.set(url.pathname, `${origin}${url.pathname}`);
  return url.pathname;
}
function link(value) {
  const url = new URL(value, origin);
  if (!["optometriccafe.com", "www.optometriccafe.com"].includes(url.hostname))
    return value;
  if (url.pathname.startsWith("/wp-content/uploads/")) return asset(value);
  const redirect = redirects.find(
    (rule) => rule.source === url.pathname.replace(/\/$/, ""),
  );
  const path =
    redirect?.destination ||
    (url.pathname !== "/" &&
    !url.pathname.endsWith("/") &&
    !/\.[^/]+$/.test(url.pathname)
      ? `${url.pathname}/`
      : url.pathname);
  return `${path}${url.search}${url.hash}`;
}
const items = source.entries.map((entry) => {
  if (!entry.contentFound && entry.slug !== "blog")
    throw new Error(`No content for ${entry.path}`);
  const $ = load(entry.content, null, false);
  decodeEmailProtection($);
  correctPublishedHours($, entry.path);
  $("script, style, noscript, link").remove();
  const originalText = normalizeText($.root().text());
  const originalHeadings = $("h1,h2,h3,h4,h5,h6")
    .toArray()
    .map((node) => normalizeText($(node).text()));
  const originalLinks = $("a[href]")
    .toArray()
    .map((node) => ({
      text: normalizeText($(node).text()),
      href: $(node).attr("href"),
    }));
  // Keep semantic content and anchor IDs, but do not ship Divi styles or executable attributes.
  $("*").each((_, node) => {
    const el = $(node);
    const classes = (el.attr("class") || "")
      .split(/\s+/)
      .filter((c) =>
        ["reviews", "review-card", "review-stars", "oc-btn"].includes(c),
      );
    for (const name of Object.keys(node.attribs || {})) {
      if (
        ![
          "href",
          "src",
          "srcset",
          "alt",
          "width",
          "height",
          "title",
          "id",
          "target",
          "rel",
          "type",
          "poster",
          "colspan",
          "rowspan",
          "datetime",
          "open",
          "controls",
          "itemprop",
          "itemscope",
          "itemtype",
          "allowfullscreen",
          "referrerpolicy",
        ].includes(name) &&
        !name.startsWith("aria-")
      )
        el.removeAttr(name);
    }
    if (classes.length) el.attr("class", classes.join(" "));
    for (const attr of ["href", "src", "poster"]) {
      const value = el.attr(attr);
      if (!value) continue;
      if (/^(javascript|data):/i.test(value)) {
        el.removeAttr(attr);
        continue;
      }
      el.attr(attr, attr === "href" ? link(value) : asset(value));
    }
    const srcset = el.attr("srcset");
    if (srcset)
      el.attr(
        "srcset",
        srcset
          .split(",")
          .map((part) => {
            const [url, ...descriptor] = part.trim().split(/\s+/);
            return [asset(url), ...descriptor].join(" ");
          })
          .join(", "),
      );
    if (node.name === "img")
      el.attr("loading", "lazy").attr("decoding", "async");
    if (node.name === "iframe") el.attr("loading", "lazy");
    if (node.name === "video") el.attr("controls", "").attr("preload", "none");
    if (el.attr("target") === "_blank") el.attr("rel", "noopener noreferrer");
  });
  let heading = normalizeText($("h1").first().text()) || entry.title;
  if (entry.path !== "/" && $("h1").length) $("h1").first().remove();
  $("h1").each((_, node) => {
    node.name = "h2";
  });
  // The approved homepage keeps its logo in the header only.
  if (entry.path === "/") $('img[src*="optometric-logo"]').remove();
  $("div,span")
    .toArray()
    .reverse()
    .forEach((node) => {
      if (!Object.keys(node.attribs || {}).length)
        $(node).replaceWith($(node).contents());
    });
  $("p").each((_, node) => {
    if (!$(node).text().trim() && !$(node).find("img,iframe,video").length)
      $(node).remove();
  });
  const schemas = entry.schemas.flatMap(flatten);
  const schemaAssets = (value) => {
    if (typeof value === "string" && /^https?:/.test(value)) asset(value);
    else if (Array.isArray(value)) value.forEach(schemaAssets);
    else if (value && typeof value === "object")
      Object.values(value).forEach(schemaAssets);
  };
  schemas.forEach(schemaAssets);
  Object.values(entry.openGraph)
    .filter((value) => /^https?:/.test(value))
    .forEach(asset);
  const footer = load(entry.footer, null, false);
  footer("img[src]").each((_, node) => asset(footer(node).attr("src")));
  const content = $.html().trim();
  const plainText = normalizeText($.root().text());
  const originalBody = load(entry.content, null, false);
  decodeEmailProtection(originalBody);
  correctPublishedHours(originalBody, entry.path);
  originalBody("script,style,noscript,link").remove();
  if (entry.path !== "/") originalBody("h1").first().remove();
  if (
    plainText !== normalizeText(originalBody.root().text()) &&
    entry.slug !== "blog"
  )
    throw new Error(`Text changed for ${entry.path}`);
  return {
    id: entry.id,
    type: entry.type,
    slug: entry.slug,
    path: entry.path,
    title: entry.title,
    heading,
    seoTitle: entry.seoTitle,
    description: entry.description,
    canonical: entry.canonical || entry.url,
    robots: entry.robots,
    date: entry.date,
    modified: entry.modified,
    author: entry.author
      ? {
          name: entry.author.name,
          slug: entry.author.slug,
          url: entry.author.link,
        }
      : null,
    featuredImage: asset(entry.featuredImage),
    featuredImageAlt: entry.featuredImageAlt,
    openGraph: entry.openGraph,
    content,
    plainText,
    sourceTextHash: sha(originalText),
    sourceHeadings: originalHeadings,
    sourceLinks: originalLinks,
    schemas,
  };
});
const home = items.find((item) => item.path === "/");
for (const page of [...source.entries, ...(source.archives || [])]) {
  for (const media of page.media || []) {
    asset(media.src);
    asset(media.poster);
    if (media.srcset)
      media.srcset
        .split(",")
        .forEach((part) => asset(part.trim().split(/\s+/)[0]));
  }
}
for (const sitemap of source.sitemaps) {
  const $ = load(sitemap.xml, { xml: true });
  $("image\\:loc").each((_, node) => asset($(node).text()));
}
const baseNodes = home.schemas;
const business = baseNodes.find((node) =>
  [node["@type"]].flat().includes("LocalBusiness"),
);
const businessId = business["@id"];
const businessTypes = ["LocalBusiness", "Optician", "Optometrist"];
const businessIds = new Set(
  items.flatMap((item) =>
    item.schemas
      .filter((node) =>
        [node["@type"]].flat().some((type) => businessTypes.includes(type)),
      )
      .map((node) => node["@id"])
      .filter(Boolean),
  ),
);
const socialLinks = [
  { name: "Instagram", url: "https://www.instagram.com/optometric_cafe/" },
  { name: "Facebook", url: "https://www.facebook.com/OptometricCafe/" },
  {
    name: "Yelp",
    url: "https://www.yelp.com/biz/optometric-cafe-beverly-hills",
  },
  { name: "X / Twitter", url: "https://twitter.com/optometriccafe" },
];
// This CID is the listing linked by the live footer and map embed, not an address search.
const googleBusinessUrl = `https://www.google.com/maps?cid=${BigInt("0xa9d4f7be050d7f74")}`;
business.sameAs = [...socialLinks.map((s) => s.url), googleBusinessUrl];
business.hasMap = googleBusinessUrl;
// The live schema used the map viewport center; use the listing's actual marker.
business.geo = {
  "@type": "GeoCoordinates",
  latitude: 34.0624387,
  longitude: -118.3992683,
};
business.founder.jobTitle = "Owner and expert optician";
const areas = items.flatMap((item) =>
  item.schemas
    .filter((node) =>
      [node["@type"]].flat().some((type) => businessTypes.includes(type)),
    )
    .flatMap((node) => (node.areaServed ? [node.areaServed].flat() : [])),
);
business.areaServed = [
  ...new Map(areas.map((area) => [JSON.stringify(area), area])).values(),
];
const contact = items.find((item) => item.slug === "contact-us").schemas[0];
business.contactPoint = contact.contactPoint;
const website = baseNodes.find((node) => node["@type"] === "WebSite");
website.potentialAction.target = `${origin}/search/?q={search_term_string}`;
changes.push({
  path: "/",
  reason:
    "Preserve homepage business identity #business, consolidate duplicates and service areas, use owner-confirmed hours (Saturday closes 14:00), source footer social links and direct Google listing. Correct geo from viewport center to marker coordinates in the live Google listing link. SearchAction targets implemented search.",
});
function normalizeSchema(value) {
  if (Array.isArray(value)) return value.map(normalizeSchema);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      key,
      key === "@id" && businessIds.has(val) ? businessId : normalizeSchema(val),
    ]),
  );
}
for (const item of items) {
  const graph = [];
  for (const node of item.schemas) {
    const types = [node["@type"]].flat();
    if (types.some((type) => businessTypes.includes(type))) {
      if (item.path !== "/")
        changes.push({
          path: item.path,
          reason:
            "Business node merged with homepage #business. Conflicting descriptions, identities, hours and social handles replaced with current homepage/owner facts.",
          originalId: node["@id"] || null,
        });
      if (node.review || node.aggregateRating)
        changes.push({
          path: item.path,
          reason:
            "Self-serving third-party review/aggregate rating schema omitted; all visible reviews retained verbatim. Original schema archived in wordpress-source.json.",
        });
      if (node.department)
        graph.push({
          ...node.department,
          "@type": "Service",
          "@id": `${origin}${item.path}#service`,
          provider: { "@id": businessId },
        });
      for (const key of ["hasOfferCatalog", "makesOffer", "knowsAbout"]) {
        if (node[key] && item.path !== "/")
          graph.push({ "@id": businessId, [key]: normalizeSchema(node[key]) });
      }
      continue;
    }
    if (
      item.path === "/" &&
      ["WebSite", "ImageObject"].some((t) => types.includes(t))
    )
      continue;
    graph.push(normalizeSchema(node));
  }
  if (
    !graph.some((n) =>
      ["WebPage", "CollectionPage", "AboutPage", "ContactPage"].includes(
        n["@type"],
      ),
    )
  )
    graph.push({
      "@type":
        item.type === "post"
          ? "WebPage"
          : item.slug === "contact-us"
            ? "ContactPage"
            : item.slug === "blog"
              ? "CollectionPage"
              : "WebPage",
      "@id": `${origin}${item.path}#webpage`,
      url: `${origin}${item.path}`,
      name: item.seoTitle,
      description: item.description,
      isPartOf: { "@id": `${origin}/#website` },
      about: { "@id": businessId },
    });
  if (!graph.some((n) => n["@type"] === "BreadcrumbList"))
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${origin}${item.path}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
        ...(item.path === "/"
          ? []
          : [
              {
                "@type": "ListItem",
                position: 2,
                name: item.title,
                item: `${origin}${item.path}`,
              },
            ]),
      ],
    });
  item.schemas = graph;
}
const mapEmbedUrl = load(items.find((i) => i.slug === "contact-us").content)(
  "iframe",
).attr("src");
const inventory = items.map(
  ({ id, path, type, robots, modified, sourceTextHash }) => ({
    id,
    path,
    type,
    robots,
    modified,
    sourceTextHash,
  }),
);
await writeFile(
  "data/site-content.json",
  JSON.stringify(items, null, 2) + "\n",
);
await writeFile(
  "data/business-profiles.json",
  JSON.stringify({ socialLinks, googleBusinessUrl, mapEmbedUrl }, null, 2) +
    "\n",
);
await writeFile(
  "data/business-schema.json",
  JSON.stringify(
    { "@context": "https://schema.org", "@graph": baseNodes },
    null,
    2,
  ) + "\n",
);
await writeFile(
  "data/migration-inventory.json",
  JSON.stringify(inventory, null, 2) + "\n",
);
await writeFile(
  "data/schema-corrections.json",
  JSON.stringify(changes, null, 2) + "\n",
);
await writeFile(
  "data/wordpress-media.json",
  JSON.stringify(
    [...assets].map(([path, url]) => ({ path, url })),
    null,
    2,
  ) + "\n",
);
console.log(
  `Imported ${items.length} entries (${items.filter((i) => i.type === "post").length} posts), ${assets.size} media files. Visible text hashes verified.`,
);
