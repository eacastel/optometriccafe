import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import ts from "typescript";

async function moduleAt(path) {
  const compiled = ts.transpileModule(await readFile(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText.replace('from "cheerio"', `from ${JSON.stringify(import.meta.resolve("cheerio"))}`);
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}
const { layoutReviewTiles } = await moduleAt("lib/review-layout.ts");
const { classifyClick } = await moduleAt("lib/tracking.ts");
const { replaceContentImage } = await moduleAt("lib/content-layout.ts");
const items = JSON.parse(await readFile("data/site-content.json", "utf8"));
const profiles = JSON.parse(await readFile("data/business-profiles.json", "utf8"));
const additions = JSON.parse(await readFile("data/review-additions.json", "utf8"));
const photos = JSON.parse(await readFile("data/new-photography.json", "utf8"));
const original = items.find((item) => item.slug === "featured-reviews").content;
const rendered = layoutReviewTiles(original, profiles, additions);
const normalize = (text) => text.replace(/\s+/g, " ").trim();

test("Selected reviews include all 32 archived and 24 additional five-star testimonials", () => {
  const $ = load(rendered);
  assert.equal($(".review-tile").length, 56);
  assert.equal($("[data-added-reviews] .review-tile").length, 24);
  assert.equal($('[data-review-platform="google"]').length, 54);
  assert.equal($('[data-review-platform="yelp"]').length, 2);
  assert.equal($('[data-review-platform="archive"]').length, 0);
  assert.equal($(".review-stars[aria-label='5 out of 5 stars']").length, 56);
  assert.equal($(".google-star-icons i").length, 280);
  assert.equal($("script").length, 0, "No self-serving review schema added");
});

test("Archived wording and contextual destinations survive the tile transformation exactly", () => {
  const before = load(original);
  const after = load(rendered);
  after("[data-added-reviews]").remove();
  assert.equal(normalize(after.root().text()), normalize(before.root().text()));
  const oldLinks = before("a[href]").map((_, node) => before(node).attr("href")).get();
  for (const href of oldLinks) assert.equal(after(`a[href="${href}"]`).length, before(`a[href="${href}"]`).length);
  assert.equal(after("a a").length, 0);
  assert.equal(after(".review-family-photo").length, 1);
});

test("Each tile links safely to its attributed business profile", () => {
  const $ = load(rendered);
  $(".review-tile").each((_, node) => {
    const card = $(node);
    const platform = card.attr("data-review-platform");
    const link = card.find(".review-source-link");
    assert.equal(link.length, 1);
    assert.equal(link.attr("href"), platform === "google" ? profiles.googleBusinessUrl : profiles.socialLinks.find((p) => p.name === "Yelp").url);
    assert.equal(link.attr("target"), "_blank");
    assert.equal(link.attr("rel"), "noopener noreferrer");
    assert.equal(link.find("img").attr("alt"), platform === "google" ? "Google Maps" : "Yelp");
    assert.equal(link.attr("data-review-source"), platform);
  });
});

test("Additional quotes remain verbatim and excerpts are identified, without blank or unselected entries", () => {
  const $ = load(rendered);
  for (const review of additions.reviews) {
    const card = $("[data-added-author]").filter((_, node) => $(node).attr("data-added-author") === review.author);
    assert.equal(card.length, 1);
    assert.equal(card.children("p").first().text(), `“${review.quote}”`);
    assert.equal(card.find(".review-excerpt").length, review.excerpt ? 1 : 0);
  }
  const authors = $(".review-tile em").map((_, node) => $(node).text()).get();
  for (const name of [...additions.notSelected, ...additions.noReviewText, "Matt MacFarlane"]) {
    assert.ok(!authors.some((label) => label.startsWith(`– ${name},`)), name);
  }
});

test("Only five-star nonempty additions render, and user text is escaped", () => {
  const html = layoutReviewTiles('<div class="reviews"></div>', profiles, {
    confirmedLegacyGoogleAuthors: [],
    reviews: [
      { author: "<script>name</script>", rating: 5, quote: '<img src=x onerror="alert(1)">', excerpt: false, date: null },
      { author: "Not selected", rating: 1, quote: "Not selected", excerpt: false, date: null },
      { author: "No text", rating: 5, quote: " ", excerpt: false, date: null },
    ],
  });
  const $ = load(html);
  assert.equal($(".review-tile").length, 1);
  assert.equal($("script,[onerror]").length, 0);
  assert.equal($(".review-tile > p").first().text(), '“<img src=x onerror="alert(1)">”');
  assert.equal(layoutReviewTiles("<p>Unrelated</p>", profiles, additions), "<p>Unrelated</p>");
});

test("Review-profile intent is distinct from directions and excludes queries or reviewer names", () => {
  const page = "https://optometriccafe.com/featured-reviews/";
  const google = classifyClick(profiles.googleBusinessUrl, page, "google");
  assert.equal(google.event, "oc_review_click");
  assert.equal(google.cta_type, "reviews");
  assert.equal(google.link_url, "https://www.google.com/maps");
  assert.equal(classifyClick(profiles.googleBusinessUrl, page).event, "oc_directions_click");
  const yelpUrl = profiles.socialLinks.find((p) => p.name === "Yelp").url;
  assert.equal(classifyClick(yelpUrl, page, "yelp").event, "oc_review_click");
  assert.equal(classifyClick(yelpUrl, page), null);
  assert.equal(classifyClick("https://example.org/?reviewer=private", page, "google"), null);
  assert.equal(classifyClick(yelpUrl, page, "google"), null);
});

test("Sports image override changes only the requested tennis photo, preserving copy and other imagery", () => {
  const html = items.find((item) => item.slug === "sports-eye-glasses-and-sunglasses").content;
  const before = load(html);
  const after = load(replaceContentImage(html, { original: "/wp-content/uploads/2019/01/sports-glasses2.jpg", ...photos.cycling }));
  assert.equal(normalize(before.root().text()), normalize(after.root().text()));
  assert.equal(after(`img[src="${photos.cycling.src}"]`).length, 1);
  assert.equal(after('img[src="/wp-content/uploads/2019/01/sports-glasses2.jpg"]').length, 0);
  assert.equal(after('img[src="/wp-content/uploads/2019/01/sports-glasses.jpg"]').length, 1);
});
