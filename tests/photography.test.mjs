import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const photos = JSON.parse(await readFile("data/new-photography.json", "utf8"));
const prompts = JSON.parse(await readFile("data/photography-prompts.json", "utf8"));
const usage = JSON.parse(await readFile("data/photography-usage.json", "utf8"));
const sha = (value) => createHash("sha256").update(value).digest("hex");

test("Seven distinct photographs have local, versioned, optimized derivatives", async () => {
  assert.deepEqual(Object.keys(photos).sort(), ["detail", "evening", "interior", "orchid", "people", "showroom", "storefront"]);
  for (const photo of Object.values(photos)) {
    assert.match(photo.src, /^\/images\/boutique-refresh\/.+-v1\.webp$/);
    const image = await readFile(`public${photo.src}`);
    const metadata = await sharp(image).metadata();
    assert.equal(sha(image), photo.sha256);
    assert.equal(image.length, photo.bytes);
    assert.equal(metadata.width, photo.width);
    assert.equal(metadata.height, photo.height);
    assert.ok(image.length < 300000);
    assert.ok(photo.alt.length > 30);
    assert.match(photo.enhancement, /AI-assisted/);
    assert.equal(photo.capturedOn, null, "Do not invent the original photograph date");
    assert.ok(prompts[photo.source.split("/").at(-1)]?.prompt);
  }
});

test("Every upload has a real placement or a documented duplicate/reference decision", () => {
  assert.equal(usage.length, 17);
  assert.equal(new Set(usage.map((entry) => entry.source)).size, usage.length);
  const used = usage.filter((entry) => entry.status === "used");
  assert.equal(used.length, Object.keys(photos).length);
  assert.deepEqual(new Set(used.map((entry) => entry.photo)), new Set(Object.keys(photos)));
  for (const entry of usage) {
    assert.ok(entry.reason);
    if (entry.status === "used") {
      assert.ok(entry.pages.length);
      assert.equal(photos[entry.photo].source, `docs/new-images/${entry.source}`);
    } else if (entry.status === "duplicate")
      assert.ok(usage.some((candidate) => candidate.source === entry.representedBy && candidate.status === "used"));
    else assert.equal(entry.status, "reference");
  }
});

for (const [name, photo] of Object.entries(photos)) {
  test(`Original uploaded ${name} image remains unchanged when available`, async (t) => {
    let original;
    try { original = await readFile(photo.source); }
    catch (error) {
      if (error.code === "ENOENT") return t.skip("Original uploads are local review material, not required by CI/deployment");
      throw error;
    }
    assert.equal(sha(original), photo.sourceSha256);
  });
}
