import test from "node:test";
import assert from "node:assert/strict";
import { compareSnapshots } from "../scripts/content-delta.mjs";

const snapshot = () => ({
  capturedAt: "2026-11-05T00:00:00Z",
  entries: [{ id: 1, type: "post", slug: "guide", path: "/guide/", contentFound: true,
    seoTitle: "Original title", schemas: [{ "@type": "BlogPosting", headline: "Guide" }],
    content: '<h1 id="guide">Guide</h1><p>Original wording.</p><a href="/contact-us/#hours">Visit</a><img src="/photo.jpg" alt="Boutique">',
  }],
  sitemaps: [{ xml: "<urlset><url><loc>https://optometriccafe.com/guide/</loc></url></urlset>" }],
});

test("Source comparison ignores capture timestamps, schema key order and layout attributes", () => {
  const before = snapshot();
  const after = snapshot();
  after.capturedAt = "2026-11-09T00:00:00Z";
  after.entries[0].sourceHash = "different full-page cache output";
  after.entries[0].content = after.entries[0].content.replace('<p>', '<p class="new-style">');
  after.entries[0].schemas = [{ headline: "Guide", "@type": "BlogPosting" }];
  assert.equal(compareSnapshots(before, after).passed, true);
});

for (const [field, change] of [
  ["content.text", (entry) => { entry.content = entry.content.replace("Original wording", "Rewritten wording"); }],
  ["content.links", (entry) => { entry.content = entry.content.replace("#hours", "#location"); }],
  ["content.media", (entry) => { entry.content = entry.content.replace("Boutique", "Wrong alt"); }],
  ["content.anchors", (entry) => { entry.content = entry.content.replace('id="guide"', 'id="lost"'); }],
  ["seoTitle", (entry) => { entry.seoTitle = "Changed title"; }],
  ["schemas", (entry) => { entry.schemas = []; }],
]) test(`Source comparison detects ${field}`, () => {
  const before = snapshot();
  const after = snapshot();
  change(after.entries[0]);
  const result = compareSnapshots(before, after);
  assert.equal(result.passed, false);
  assert.ok(result.changed[0].fields.includes(field));
});

test("Source comparison detects additions, removals and sitemap changes", () => {
  const after = snapshot();
  after.entries[0].id = 2;
  after.sitemaps[0].xml = after.sitemaps[0].xml.replaceAll("/guide/", "/new-guide/");
  const result = compareSnapshots(snapshot(), after);
  assert.equal(result.added.length, 1);
  assert.equal(result.removed.length, 1);
  assert.equal(result.sitemaps.removed.length, 1);
  assert.equal(result.sitemaps.added.length, 1);
  assert.equal(result.passed, false);
});

test("Incomplete/empty/duplicate captures fail closed", () => {
  for (const mutate of [
    (s) => { s.entries = []; },
    (s) => { s.entries.push({ ...s.entries[0] }); },
    (s) => { s.entries[0].content = ""; },
    (s) => { s.sitemaps = []; },
  ]) {
    const after = snapshot();
    mutate(after);
    assert.throws(() => compareSnapshots(snapshot(), after));
  }
});

test("Verification tokens and RSS GUIDs cannot change unnoticed", () => {
  const before = snapshot();
  const after = snapshot();
  after.siteVerification = { google: "verified-token" };
  after.entries[0].guid = "original-opaque-guid";
  const identity = { verification: { google: "verified-token" }, feed: { guids: { 1: "original-opaque-guid" } } };
  assert.equal(compareSnapshots(before, after, identity).passed, true);
  after.siteVerification.google = "different-token";
  after.entries[0].guid = "changed-guid";
  const result = compareSnapshots(before, after, identity);
  assert.equal(result.passed, false);
  assert.deepEqual(result.identityChanges.map((change) => change.field), ["siteVerification", "feed.guid"]);
});
