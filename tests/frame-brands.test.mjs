import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import ts from "typescript";

const read = async (path) => JSON.parse(await readFile(path, "utf8"));
const updates = await read("data/frame-brands.json");
const photos = await read("data/frame-photography.json");
const items = await read("data/site-content.json");
const copy = await read("data/home-content.json");
const compiled = ts.transpileModule(await readFile("lib/brand-content.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText.replace('from "cheerio"', `from ${JSON.stringify(import.meta.resolve("cheerio"))}`);
const { applyBrandUpdates, applyBrandSchemas, applyBrandText } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const normalize = (text) => text.replace(/\s+/g, " ").trim();
const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");

test("Owner-confirmed additions and removals agree with the highlighted frame list", () => {
  for (const name of ["Masunaga", "Miu Miu", "Res / Rei", "ba&sh", "Prada", "Celine", "iGreen", "Chopard", "Revo"]) {
    assert.ok(updates.current.includes(name));
    assert.ok(updates.highlights.includes(name));
  }
  assert.deepEqual(updates.removed, ["Salt", "Maui Jim", "Lunor"]);
  assert.equal(new Set(updates.current).size, updates.current.length);
  for (const name of updates.removed) assert.ok(!updates.current.includes(name));
});

test("Every correction matches exactly one original stock-list phrase", () => {
  for (const edit of updates.edits) {
    const item = items.find((item) => item.path === edit.path);
    const text = load(item.content).root().text();
    assert.equal(text.split(edit.before).length - 1, 1, `${edit.path}: ${edit.before}`);
    const after = load(applyBrandUpdates(item.content, item.path, updates));
    assert.ok(after.root().text().includes(edit.after));
    assert.ok(!after.root().text().includes(edit.before));
  }
});

test("Only approved text changes; headings, links, images and all blog/review content remain unchanged", () => {
  for (const item of items) {
    const before = load(item.content, null, false);
    const result = applyBrandUpdates(item.content, item.path, updates);
    const after = load(result, null, false);
    assert.equal(normalize(after.root().text()), normalize(applyBrandText(before.root().text(), item.path, updates)), item.path);
    for (const selector of ["h1,h2,h3,h4", "a[href]", "img", "[id]"]) {
      const values = ($, expected = false) => $(selector).toArray().map((node) => ({ text: expected && selector === "[id]" ? applyBrandText($(node).text(), item.path, updates) : $(node).text(), attrs: node.attribs }));
      assert.deepEqual(values(after), values(before, true), `${item.path}: ${selector}`);
    }
    if (item.type === "post" || item.slug === "featured-reviews") assert.equal(result, item.content);
    if (["/", "/about-us/"].includes(item.path)) {
      assert.ok(!/\b(?:Salt|Maui Jim|Lunor)\b/i.test(after.root().text()));
      for (const name of updates.current) assert.ok(after.root().text().includes(name), `${item.path}: ${name}`);
    }
  }
});

test("Homepage fragments and search text match the approved rendered brand corrections", () => {
  for (const [key, html] of Object.entries(copy)) {
    const after = load(applyBrandUpdates(html, "/", updates));
    assert.equal(normalize(after.root().text()), normalize(applyBrandText(load(html).root().text(), "/", updates)), key);
  }
  const home = items.find((item) => item.path === "/");
  assert.ok(!/\b(?:Salt|Maui Jim|Lunor)\b/i.test(applyBrandText(home.plainText, "/", updates)));
});

test("Current sunglasses schema no longer advertises Maui Jim; unrelated and original schemas survive", () => {
  const item = items.find((item) => item.slug === "sunglasses-beverly-hills");
  const original = structuredClone(item.schemas);
  const result = applyBrandSchemas(item.schemas, item.path, updates);
  assert.deepEqual(result.find((node) => node["@type"] === "Product").brand, [{ "@type": "Brand", name: "Ray-Ban" }]);
  assert.deepEqual(item.schemas, original);
  assert.deepEqual(result.filter((node) => node["@type"] !== "Product"), original.filter((node) => node["@type"] !== "Product"));
  assert.equal(applyBrandSchemas(item.schemas, "/some-history/", updates), item.schemas);
});

test("All six uploaded photographs are optimized without altering the product images; annotation stays private", async () => {
  const files = (await readdir("docs/images-pre-launch")).filter((name) => name.startsWith("Image_"));
  assert.equal(files.length, 6);
  assert.equal(photos.length, 6);
  assert.equal(new Set(photos.map((photo) => photo.sha256)).size, 6);
  for (const photo of photos) {
    assert.ok(files.includes(photo.file));
    assert.equal(sha(await readFile(photo.source)), photo.sourceSha256);
    const buffer = await readFile(`public${photo.src}`);
    assert.equal(sha(buffer), photo.sha256);
    assert.equal(buffer.length, photo.bytes);
    assert.equal(photo.width / photo.height, 3 / 4);
    assert.ok(photo.bytes < 350000);
    assert.ok(!photo.src.includes("3853"));
    assert.equal(photo.processing.includes("no generative edits"), true);
  }
});
