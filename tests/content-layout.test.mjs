import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile("lib/content-layout.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText.replace('from "cheerio"', `from ${JSON.stringify(import.meta.resolve("cheerio"))}`);
const { layoutPreservedPhotos } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const items = JSON.parse(await readFile("data/site-content.json", "utf8"));
const normalize = (text) => text.replace(/\s+/g, " ").trim();

for (const [slug, layout, count] of [
  ["optometry-lab-beverly-hills", "workshop", 6],
  ["contact-lenses-beverly-hills", "contact-lenses", 3],
]) test(`${layout} grid preserves all wording, headings, links and image attributes`, () => {
  const original = items.find((item) => item.slug === slug).content;
  const before = load(original, null, false);
  const after = load(layoutPreservedPhotos(original, layout), null, false);
  assert.equal(after(".preserved-photo-grid").length, 1);
  assert.equal(after(".preserved-photo-grid > img").length, count);
  assert.equal(normalize(before.root().text()), normalize(after.root().text()));
  for (const selector of ["a[href]", "img", "h2,h3,h4", "[id]"]) {
    const values = ($) => $(selector).toArray().map((node) => ({
      tag: node.name, text: normalize($(node).text()), attrs: node.attribs,
    }));
    assert.deepEqual(values(after), values(before));
  }
  assert.equal(after('img[src$="contacts.jpg"]').closest(".preserved-photo-grid").length, 0, "The later supporting image stays in its original context");
});

test("Unrelated imported pages are not reparsed or changed", () => {
  const html = items.find((item) => item.slug === "about-us").content;
  assert.equal(layoutPreservedPhotos(html), html);
});
test("Incomplete photo groups fall back without moving partial content", () => {
  const html = '<p>Preserved text.</p><img src="/wp-content/uploads/2019/01/lab1.jpg">';
  assert.equal(layoutPreservedPhotos(html, "workshop"), html);
});
