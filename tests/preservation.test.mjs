import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import ts from "typescript";
import {
  decodeEmailProtection,
  correctPublishedHours,
} from "../scripts/wordpress-html.mjs";

const read = async (file) => JSON.parse(await readFile(file, "utf8"));
const source = await read("data/wordpress-source.json");
const items = await read("data/site-content.json");
const redirects = await read("data/redirects.json");
const normalize = (text) => text.replace(/\s+/g, " ").trim();
const flatten = (value) =>
  Array.isArray(value)
    ? value.flatMap(flatten)
    : value?.["@graph"]
      ? flatten(value["@graph"])
      : [value];
const paths = new Set(items.map((item) => item.path));

test("Every published REST record and sitemap landing URL is preserved", () => {
  assert.equal(items.length, source.entries.length);
  assert.equal(items.filter((item) => item.type === "post").length, 26);
  assert.equal(paths.size, items.length);
  for (const sitemap of source.sitemaps) {
    const $ = load(sitemap.xml, { xml: true });
    $("url > loc").each((_, node) =>
      assert.ok(paths.has(new URL($(node).text()).pathname), $(node).text()),
    );
  }
});
for (const entry of source.entries) {
  test(`Verbatim copy, headings, links, metadata and schema: ${entry.path}`, () => {
    const item = items.find((item) => item.id === entry.id);
    assert.ok(item);
    assert.equal(item.seoTitle, entry.seoTitle);
    assert.equal(item.description, entry.description);
    assert.equal(item.date, entry.date);
    assert.equal(item.modified, entry.modified);
    assert.equal(item.canonical, entry.canonical || entry.url);
    assert.equal(item.robots, entry.robots);
    const before = load(entry.content, null, false);
    decodeEmailProtection(before);
    correctPublishedHours(before, entry.path);
    const after = load(item.content, null, false);
    before("script,style,noscript,link").remove();
    if (entry.path !== "/" && before("h1").length) {
      assert.equal(item.heading, normalize(before("h1").first().text()));
      before("h1").first().remove();
    }
    assert.equal(
      normalize(after.root().text()),
      normalize(before.root().text()),
    );
    const headings = ($) =>
      $("h1,h2,h3,h4,h5,h6")
        .toArray()
        .map((node) => normalize($(node).text()));
    assert.deepEqual(headings(after), headings(before));
    assert.equal(after("script,style,[onclick],[onerror]").length, 0);
    assert.ok(!item.content.includes("[et_pb_"));
    assert.ok(!item.content.includes("/cdn-cgi/l/email-protection"));
    if (entry.path === "/contact-us/")
      assert.ok(
        normalize(after.root().text()).includes("Sat: 11:00 AM \u2013 2:00 PM"),
      );
    before("a[href]").each((_, node) => {
      const href = before(node).attr("href");
      const original = new URL(href, "https://optometriccafe.com");
      const redirect = redirects.find(
        (rule) => rule.source === original.pathname.replace(/\/$/, ""),
      );
      const expected = redirect?.destination || original.pathname;
      assert.ok(
        after("a[href]")
          .toArray()
          .some((n) => {
            const url = new URL(
              after(n).attr("href"),
              "https://optometriccafe.com",
            );
            return (
              url.pathname.replace(/\/$/, "") === expected.replace(/\/$/, "") &&
              url.search === original.search &&
              url.hash === original.hash &&
              normalize(after(n).text()) === normalize(before(node).text())
            );
          }),
        `Lost link: ${href}`,
      );
    });
    for (const schema of entry.schemas.flatMap(flatten)) {
      if (
        [
          "FAQPage",
          "BlogPosting",
          "AboutPage",
          "CollectionPage",
          "Service",
          "Product",
        ].includes(schema["@type"])
      ) {
        const migrated = item.schemas.find(
          (n) => n["@type"] === schema["@type"],
        );
        assert.ok(migrated, `Missing ${schema["@type"]}`);
        if (schema["@type"] === "FAQPage")
          assert.deepEqual(migrated.mainEntity, schema.mainEntity);
        if (schema["@type"] === "BlogPosting") {
          for (const key of [
            "headline",
            "datePublished",
            "dateModified",
            "description",
            "image",
          ])
            assert.deepEqual(migrated[key], schema[key]);
        }
      }
    }
  });
}
test("Canonical redirects terminate at a real page and never replace a preserved page", () => {
  assert.equal(new Set(redirects.map((r) => r.source)).size, redirects.length);
  for (const rule of redirects) {
    assert.ok(
      paths.has(rule.destination) || rule.destination === "/sitemap.xml",
      rule.destination,
    );
    assert.ok(!paths.has(`${rule.source}/`), rule.source);
    assert.ok(
      !redirects.some((r) => r.source === rule.destination.replace(/\/$/, "")),
      "Redirect chain",
    );
  }
});
test("Media are local, byte-verified, and retain original WordPress URLs", async () => {
  const media = await read("data/wordpress-media.json");
  const mediaPaths = new Set(media.map((item) => item.path));
  for (const page of [...source.entries, ...(source.archives || [])]) {
    for (const image of page.media || []) {
      const urls = [
        image.src,
        image.poster,
        ...(image.srcset || "")
          .split(",")
          .map((part) => part.trim().split(/\s+/)[0]),
      ].filter(Boolean);
      for (const value of urls) {
        const url = new URL(value, "https://optometriccafe.com");
        if (
          ["optometriccafe.com", "www.optometriccafe.com"].includes(
            url.hostname,
          ) &&
          url.pathname.startsWith("/wp-content/uploads/")
        )
          assert.ok(
            mediaPaths.has(url.pathname),
            `Missing original media URL: ${url.pathname}`,
          );
      }
    }
  }
  for (const item of media) {
    const buffer = await readFile(`public${decodeURIComponent(item.path)}`);
    assert.equal(buffer.length, item.bytes, item.path);
    assert.equal(
      createHash("sha256").update(buffer).digest("hex"),
      item.sha256,
      item.path,
    );
  }
});
test("Business identity, profiles, source FAQs, and source indexability are coherent", async () => {
  const schema = await read("data/business-schema.json");
  const business = schema["@graph"].find((n) => n["@id"].endsWith("#business"));
  assert.deepEqual(business["@type"], ["LocalBusiness", "Optician"]);
  assert.equal(
    business.openingHoursSpecification.find((n) => n.dayOfWeek === "Saturday")
      .closes,
    "14:00",
  );
  assert.equal(business.sameAs.length, 5);
  assert.equal(
    new URL(business.hasMap).searchParams.get("cid"),
    BigInt("0xa9d4f7be050d7f74").toString(),
  );
  assert.ok(
    items
      .find((i) => i.slug === "homepage-redesign-no-divi")
      .robots.includes("noindex"),
  );
});
const trackingModule = ts.transpileModule(
  await readFile("lib/tracking.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext } },
).outputText;
const { classifyClick } = await import(
  `data:text/javascript;base64,${Buffer.from(trackingModule).toString("base64")}`
);
test("Analytics classifies the actual destination and keeps the October contract", () => {
  const page =
    "https://optometriccafe.com/high-prescription-glasses-beverly-hills/";
  for (const [href, event, destination] of [
    ["tel:+13108882848", "oc_phone_click", "phone"],
    ["mailto:info@optometriccafe.com?body=private", "oc_email_click", "email"],
    [
      "https://www.google.com/maps?cid=123",
      "oc_directions_click",
      "directions",
    ],
    ["/visit/#book", "oc_contact_click", "/visit/"],
    [
      "/optometry-lab-beverly-hills/",
      "oc_service_cta_click",
      "/optometry-lab-beverly-hills/",
    ],
    ["/featured-reviews/", "oc_review_click", "/featured-reviews/"],
  ]) {
    const result = classifyClick(href, page);
    assert.equal(result.event, event);
    assert.equal(result.destination_path, destination);
    assert.equal(result.measurement_version, "2026-10-05");
    assert.ok(result.cta_type);
    assert.ok(result.service_interest);
    assert.ok(!result.link_url.includes("?"));
    assert.ok(!result.link_url.includes("#"));
  }
  assert.equal(classifyClick("#same-page", page), null);
  assert.equal(classifyClick("https://example.com", page), null);
});
