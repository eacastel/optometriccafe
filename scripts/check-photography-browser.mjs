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
      if (path === "/visit/") {
        const evening = await loaded(".boutique-evening img", photos.evening);
        checks.push({ path, width, component: "evening-window", photo: evening.src, state: evening });
        await page.locator(".boutique-evening").screenshot({ path: `${output}/evening-${width}.png` });
      }
    }
    for (const [path, count] of [
      ["/optometry-lab-beverly-hills/", 6], ["/contact-lenses-beverly-hills/", 3],
    ]) {
      const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const grid = page.locator(".preserved-photo-grid");
      await grid.scrollIntoViewIfNeeded();
      const state = await grid.evaluate(async (grid) => {
        const images = [...grid.querySelectorAll("img")];
        images.forEach((image) => { image.loading = "eager"; });
        await Promise.all(images.map((image) => image.decode()));
        return { columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
          images: images.map((image) => ({ width: image.getBoundingClientRect().width,
            height: image.getBoundingClientRect().height, naturalWidth: image.naturalWidth })) };
      });
      assert.equal(state.columns, width >= 900 ? 3 : width >= 600 ? 2 : 1);
      assert.equal(state.images.length, count);
      assert.ok(state.images.every((image) => image.naturalWidth > 0 && image.width > 100 && image.height > 100));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      await grid.screenshot({ path: `${output}/${path.split("/")[1]}-${width}.png` });
      checks.push({ path, width, component: "preserved-photo-grid", state });
    }
    await page.goto(`${base}/about-us/`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const people = await loaded(".boutique-story-grid figure:first-child img", photos.people);
    const detail = await loaded(".boutique-story-grid figure:last-child img", photos.detail);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    await page.locator(".boutique-story-grid").screenshot({ path: `${output}/about-${width}.png` });
    checks.push({ path: "/about-us/", width, component: "boutique-story", photos: [people.src, detail.src] });
  }
  assert.deepEqual(errors, []);
  const report = { checkedAt: new Date().toISOString(), base, passed: true,
    analyticsBlocked: true, errors, responsiveChecks: checks, carousel: "all slides, wraparound, previous and stable dimensions pass at every width" };
  await writeFile("docs/photography-verification.json", JSON.stringify(report, null, 2) + "\n");
  console.log(`PASS: ${checks.length} responsive component checks, seven distinct photos, workshop/contact-lens grids and all gallery controls; no browser errors.`);
} finally { await browser.close(); }
