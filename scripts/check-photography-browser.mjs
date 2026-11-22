import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const photos = JSON.parse(await readFile("data/new-photography.json", "utf8"));
const output = "public/tmp/photography-review/browser";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const page = await browser.newPage();
const errors = [];
const checks = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());

async function loaded(selector, expected) {
  const image = page.locator(selector);
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((image) => image.decode());
  const state = await image.evaluate((image) => ({
    src: new URL(image.currentSrc).searchParams.get("url") || new URL(image.currentSrc).pathname,
    naturalWidth: image.naturalWidth,
    width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height,
  }));
  assert.equal(state.src, expected.src);
  assert.ok(state.naturalWidth > 0 && state.width > 100 && state.height > 100);
  return state;
}

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, photo, selector] of [
      ["/", photos.showroom, ".gallery-frame img"],
      ["/services/", photos.interior, ".page-hero-media img"],
      ["/visit/", photos.storefront, ".page-hero-media img"],
    ]) {
      const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `${path} overflow at ${width}`);
      const state = await loaded(selector, photo);
      const name = `${path.replaceAll("/", "") || "home"}-${width}`;
      await page.locator(path === "/" ? ".shop-grid" : ".page-hero-grid").screenshot({ path: `${output}/${name}.png` });
      checks.push({ path, width, photo: state.src, state });
      if (path === "/") {
        const frame = await page.locator(".gallery-frame").boundingBox();
        for (const next of [photos.orchid, photos.storefront, photos.showroom]) {
          await page.getByRole("button", { name: "Next shop photo", exact: true }).click();
          await loaded(selector, next);
          const after = await page.locator(".gallery-frame").boundingBox();
          assert.equal(after.width, frame.width, "Carousel width is stable");
          assert.equal(after.height, frame.height, "Carousel height is stable");
          if ([390, 1440].includes(width)) await page.locator(".shop-photo").screenshot({ path: `${output}/gallery-${next.source.split("/").at(-1)}-${width}.png` });
        }
        await page.getByRole("button", { name: "Previous shop photo", exact: true }).click();
        await loaded(selector, photos.storefront);
      }
    }
  }
  assert.deepEqual(errors, []);
  const report = { checkedAt: new Date().toISOString(), base, passed: true,
    analyticsBlocked: true, errors, responsiveChecks: checks, carousel: "all slides, wraparound, previous and stable dimensions pass at every width" };
  await writeFile("docs/photography-verification.json", JSON.stringify(report, null, 2) + "\n");
  console.log(`PASS: ${checks.length} page/viewport checks, four new photos, all gallery controls and stable sizing; no browser errors.`);
} finally { await browser.close(); }
