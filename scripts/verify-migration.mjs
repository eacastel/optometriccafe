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
  if (item.path === "/") {
    assert.equal($("main video").length, 0, "Owner requested video removal");
    assert.equal(
      $(".boutique-photo-strip img").length,
      2,
      "Real boutique photo pair",
    );
    assert.ok(!$("main").text().includes("A little closer to the boutique"));
    assert.ok(!$("main").text().includes("Step inside."));
    const fragments = JSON.parse(
      await readFile("data/home-content.json", "utf8"),
    );
    for (const [name, html] of Object.entries(fragments)) {
      if (["video", "fittingLink"].includes(name)) {
        assert.equal(
          $(`[data-preserved-home="${name}"]`).length,
          0,
          `Owner-requested removal: ${name}`,
        );
        continue;
      }
      const actual = $(`[data-preserved-home="${name}"]`);
      assert.equal(actual.length, 1, `Homepage section: ${name}`);
      assert.equal(
        text(actual.text()),
        text(load(html, null, false).root().text()),
        `Homepage copy: ${name}`,
      );
      const before = load(html, null, false);
      before("a[href]").each((_, node) => {
        assert.ok(
          actual
            .find("a")
            .toArray()
            .some(
              (n) =>
                $(n).attr("href") === before(node).attr("href") &&
                text($(n).text()) === text(before(node).text()),
            ),
          `Homepage link: ${before(node).attr("href")}`,
        );
      });
    }
    assert.match(
      $("h1").text(),
      /Optometric Cafe.*Eyewear.*Personal Fittings in Beverly Hills/,
    );
    for (const slug of [
      "high-prescription-glasses-beverly-hills",
      "replacement-lenses-existing-frames-beverly-hills",
      "progressive-glasses-beverly-hills",
      "optometry-lab-beverly-hills",
      "glasses-repair-adjustment-beverly-hills",
    ])
      assert.ok($(`main a[href="/${slug}/"]`).length, slug);
    assert.equal(
      $(".home-preserved").length,
      0,
      "No appended duplicate homepage",
    );
    assert.equal(
      $(".collection-details").length,
      0,
      "No duplicate collection grid",
    );
    assert.equal($(".collection-list [data-preserved-home]").length, 4);
    for (const slug of [
      "prescription-eyeglasses-beverly-hills",
      "sunglasses-beverly-hills",
      "childrens-prescription-glasses-beverly-hills",
      "glasses-repair-adjustment-beverly-hills",
    ]) {
      assert.equal(
        $(`.collection-list a[href="/${slug}/"]`).length,
        1,
        `One collection link per destination: ${slug}`,
      );
    }
  } else if (item.slug !== "blog") {
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
  assert.equal(
    $(
      'nav[aria-label="Primary navigation"] a[href="/glasses-repair-adjustment-beverly-hills/"]',
    ).length,
    1,
    "Repair nav links directly to retained repair page",
  );
  for (const slug of [
    "high-prescription-glasses-beverly-hills",
    "replacement-lenses-existing-frames-beverly-hills",
    "progressive-glasses-beverly-hills",
  ])
    assert.equal(
      $(`nav[aria-label="Primary navigation"] a[href="/${slug}/"]`).length,
      1,
      `Guide in navigation: ${slug}`,
    );
  const nextSteps =
    item.slug === "optometry-lab-beverly-hills"
      ? [
          "prescription-eyeglasses-beverly-hills",
          "glasses-repair-adjustment-beverly-hills",
        ]
      : item.slug === "about-us"
        ? [
            "high-prescription-glasses-beverly-hills",
            "replacement-lenses-existing-frames-beverly-hills",
            "glasses-repair-adjustment-beverly-hills",
          ]
        : [];
  for (const slug of nextSteps)
    assert.ok(
      $(`.optical-next-steps a[href="/${slug}/"]`).length,
      `Contextual optical link from ${item.path} to ${slug}`,
    );
  $("a[href]").each((_, node) => {
    const value = $(node).attr("href");
    const url = new URL(value, base);
    if (url.origin === new URL(base).origin) links.add(url.pathname);
  });
  results.push({
    path: item.path,
    status: 200,
    copy:
      item.path === "/"
        ? "18 retained source fragments exact; video/CTA removed at owner request"
        : "exact",
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
for (const path of ["/services/", "/visit/"]) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  const $ = load(await response.text());
  assert.equal(
    $('meta[property="og:url"]').attr("content"),
    `https://optometriccafe.com${path}`,
    `Page-specific social URL: ${path}`,
  );
  if (path === "/services/") {
    for (const slug of [
      "prescription-eyeglasses-beverly-hills",
      "glasses-repair-adjustment-beverly-hills",
      "high-prescription-glasses-beverly-hills",
      "replacement-lenses-existing-frames-beverly-hills",
      "progressive-glasses-beverly-hills",
      "optometry-lab-beverly-hills",
    ])
      assert.ok(
        $(`main a[href="/${slug}/"]`).length,
        `Service hub links to ${slug}`,
      );
  }
}
const media = JSON.parse(await readFile("data/wordpress-media.json", "utf8"));
for (const item of media) {
  const response = await fetch(new URL(item.path, base), {
    method: "HEAD",
    redirect: "manual",
  });
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
