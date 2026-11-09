import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { load } from "cheerio";
import { decodeEmailProtection } from "./wordpress-html.mjs";

const normalize = (value) => value.replace(/\s+/g, " ").trim();
const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
};
const serialized = (value) => JSON.stringify(stable(value));
const sha = (value) => createHash("sha256").update(value).digest("hex");

function semanticHtml(html = "") {
  const $ = load(html, null, false);
  // Cloudflare rotates its email encoding without changing the public address.
  decodeEmailProtection($);
  $("script,style,noscript,link").remove();
  const elements = (selector, attributes) => $(selector).toArray().map((node) => ({
    tag: node.name,
    text: normalize($(node).text()),
    ...Object.fromEntries(attributes.map((name) => [name, $(node).attr(name) || ""])),
  }));
  return {
    text: normalize($.root().text()),
    headings: elements("h1,h2,h3,h4,h5,h6", ["id"]),
    links: elements("a[href]", ["href"]),
    anchors: elements("[id],a[name]", ["id", "name"]).map(({ text, ...rest }) => rest),
    media: elements("img,source,video,iframe", ["src", "srcset", "poster", "alt"]),
  };
}

function fields(entry) {
  const keys = ["type", "slug", "path", "url", "title", "seoTitle", "description", "canonical", "robots", "date", "modified", "featuredImage", "featuredImageAlt", "openGraph", "schemas", "microdata"];
  return {
    ...Object.fromEntries(keys.map((key) => [key, entry[key]])),
    author: entry.author ? {
      id: entry.author.id, name: entry.author.name, slug: entry.author.slug, url: entry.author.url,
    } : null,
    ...Object.fromEntries(Object.entries(semanticHtml(entry.content)).map(([key, value]) => [`content.${key}`, value])),
    footer: semanticHtml(entry.footer),
  };
}

function validate(snapshot) {
  if (!Array.isArray(snapshot.entries) || !snapshot.entries.length)
    throw new Error("Empty or missing content inventory");
  if (new Set(snapshot.entries.map((entry) => entry.id)).size !== snapshot.entries.length ||
      new Set(snapshot.entries.map((entry) => entry.path)).size !== snapshot.entries.length)
    throw new Error("Duplicate source record ID or path");
  for (const entry of snapshot.entries) {
    if (entry.slug !== "blog" && (!entry.contentFound || !semanticHtml(entry.content).text))
      throw new Error(`Missing rendered source content: ${entry.path}`);
  }
  if (!snapshot.sitemaps?.length) throw new Error("Missing source sitemaps");
}

function sitemapUrls(snapshot) {
  return [...new Set(snapshot.sitemaps.flatMap(({ xml }) => {
    const $ = load(xml, { xml: true });
    return $("url > loc").toArray().map((node) => $(node).text());
  }))].sort();
}

export function compareSnapshots(baseline, candidate, identity) {
  validate(baseline);
  validate(candidate);
  const old = new Map(baseline.entries.map((entry) => [entry.id, entry]));
  const current = new Map(candidate.entries.map((entry) => [entry.id, entry]));
  const added = candidate.entries.filter((entry) => !old.has(entry.id)).map(({ id, path }) => ({ id, path }));
  const removed = baseline.entries.filter((entry) => !current.has(entry.id)).map(({ id, path }) => ({ id, path }));
  const changed = [];
  for (const entry of candidate.entries) {
    if (!old.has(entry.id)) continue;
    const before = fields(old.get(entry.id));
    const after = fields(entry);
    const changes = Object.keys(before).filter((key) => serialized(before[key]) !== serialized(after[key]));
    if (changes.length) changed.push({ id: entry.id, path: entry.path, fields: changes,
      beforeHash: sha(serialized(before)), afterHash: sha(serialized(after)) });
  }
  const oldUrls = sitemapUrls(baseline);
  const newUrls = sitemapUrls(candidate);
  const sitemaps = {
    before: oldUrls.length, after: newUrls.length,
    added: newUrls.filter((url) => !oldUrls.includes(url)),
    removed: oldUrls.filter((url) => !newUrls.includes(url)),
  };
  const identityChanges = [];
  if (identity) {
    if (serialized(candidate.siteVerification) !== serialized(identity.verification))
      identityChanges.push({ field: "siteVerification" });
    for (const entry of candidate.entries.filter((entry) => entry.type === "post")) {
      if (entry.guid !== identity.feed.guids[String(entry.id)])
        identityChanges.push({ field: "feed.guid", id: entry.id, path: entry.path });
    }
  }
  return {
    passed: !added.length && !removed.length && !changed.length && !sitemaps.added.length && !sitemaps.removed.length && !identityChanges.length,
    baselineCapturedAt: baseline.capturedAt, candidateCapturedAt: candidate.capturedAt,
    baselineRecords: baseline.entries.length, candidateRecords: candidate.entries.length,
    candidatePosts: candidate.entries.filter((entry) => entry.type === "post").length,
    added, removed, changed, sitemaps, identityChanges,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const option = (name, fallback) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) || fallback;
  const baselinePath = option("baseline", "data/wordpress-source.json");
  const candidatePath = option("candidate", "");
  const output = option("output", "docs/source-delta-verification.json");
  if (!candidatePath) throw new Error("Specify --candidate=<separate fresh snapshot>; this command never imports content.");
  const baseline = await readFile(baselinePath, "utf8");
  const candidate = await readFile(candidatePath, "utf8");
  const identity = JSON.parse(await readFile("data/site-identity.json", "utf8"));
  const result = {
    checkedAt: new Date().toISOString(),
    baselineFile: baselinePath, baselineSha256: sha(baseline),
    candidateFile: candidatePath, candidateSha256: sha(candidate),
    ...compareSnapshots(JSON.parse(baseline), JSON.parse(candidate), identity),
  };
  await writeFile(output, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}
