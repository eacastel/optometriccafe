import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile("lib/feed.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace('from "cheerio"', `from ${JSON.stringify(import.meta.resolve("cheerio"))}`);
const { feedXml } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const post = {
  id: 1, title: 'Frames & "fit" <guide>', canonical: "https://optometriccafe.com/guide/",
  date: "2026-01-01T12:00:00Z", modified: "2026-01-02T12:00:00Z",
  author: { name: "Optometric Cafe" }, description: "A description with ]]> and & symbols.",
  content: '<h2>Original wording</h2><p>Not rewritten.</p><a href="/contact-us/#hours">Visit</a><img alt="Shop" src="/shop.jpg" srcset="/small.jpg 320w, /large.jpg 900w">',
};
const metadata = { title: "Cafe & frames", description: "Original feed description.", guids: { 1: "https://staging.optometriccafe.com/?p=1" } };

test("RSS escapes XML and safely splits CDATA terminators", () => {
  const $ = load(feedXml([post], metadata), { xml: true });
  assert.equal($("channel > title").text(), metadata.title);
  assert.equal($("item > title").text(), post.title);
  assert.equal($("item > description").text(), post.description);
});
test("RSS preserves opaque legacy GUIDs separately from canonical links", () => {
  const $ = load(feedXml([post], metadata), { xml: true });
  assert.equal($("guid").text(), metadata.guids[1]);
  assert.equal($("guid").attr("isPermaLink"), "false");
  assert.equal($("item > link").text(), post.canonical);
});
test("RSS preserves full body wording and makes image and link destinations absolute", () => {
  const feed = load(feedXml([post], metadata), { xml: true });
  const body = load(feed("content\\:encoded").text(), null, false);
  assert.equal(body.root().text(), load(post.content, null, false).root().text());
  assert.equal(body("a").attr("href"), "https://optometriccafe.com/contact-us/#hours");
  assert.equal(body("img").attr("src"), "https://optometriccafe.com/shop.jpg");
  assert.equal(body("img").attr("srcset"), "https://optometriccafe.com/small.jpg 320w, https://optometriccafe.com/large.jpg 900w");
});
