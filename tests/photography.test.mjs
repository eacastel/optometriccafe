import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const photos = JSON.parse(await readFile("data/new-photography.json", "utf8"));
const prompts = JSON.parse(await readFile("data/photography-prompts.json", "utf8"));
const sha = (value) => createHash("sha256").update(value).digest("hex");

test("Four selected photographs have local, versioned, optimized derivatives", async () => {
  assert.deepEqual(Object.keys(photos).sort(), ["interior", "orchid", "showroom", "storefront"]);
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
