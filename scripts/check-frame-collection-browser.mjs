import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const photos = JSON.parse(await readFile("data/frame-photography.json", "utf8"));
const brands = JSON.parse(await readFile("data/frame-brands.json", "utf8"));
const output = "public/tmp/prelaunch/browser";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const page = await browser.newPage();
const checks = [], errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, category] of [["/", "all"], ["/prescription-eyeglasses-beverly-hills/", "optical"], ["/sunglasses-beverly-hills/", "sun"]]) {
      assert.equal((await page.goto(`${base}${path}`, { waitUntil: "networkidle" })).status(), 200);
      const grid = page.locator(".frame-photo-grid");
      const selected = photos.filter((photo) => category === "all" || photo.category === category);
      assert.equal(await grid.locator("figure").count(), selected.length);
      const columns = await grid.evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length);
      assert.equal(columns, width < 600 ? 1 : width < 900 ? 2 : 3);
      for (const [index, photo] of selected.entries()) {
        const figure = grid.locator("figure").nth(index);
        const image = figure.locator("img");
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((img) => img.decode());
        assert.equal(await figure.locator("figcaption").innerText(), photo.brand);
        const state = await image.evaluate((img) => ({
          src: new URL(img.currentSrc).searchParams.get("url") || new URL(img.currentSrc).pathname,
          naturalWidth: img.naturalWidth, fit: getComputedStyle(img).objectFit,
          width: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height,
          left: img.getBoundingClientRect().left, right: img.getBoundingClientRect().right,
        }));
        assert.equal(state.src, photo.src);
        assert.equal(state.fit, "contain");
        assert.ok(state.naturalWidth > 100 && state.width > 150);
        assert.ok(Math.abs(state.width / state.height - 3 / 4) < 0.01);
        assert.ok(state.left >= 0 && state.right <= width + 1);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (path === "/") {
        const names = await page.locator(".designer-names li").allTextContents();
        assert.deepEqual(names, brands.highlights);
        const copy = await page.locator('[data-preserved-home="designers"]').innerText();
        for (const brand of brands.current) assert.ok(copy.includes(brand), brand);
        for (const name of brands.removed) assert.ok(!(await page.locator("main").innerText()).includes(name), name);
        assert.ok(await page.locator(".designer-names li").evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1)));
        await page.locator(".designer-band").scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/brands-${width}.jpg`, type: "jpeg", quality: 85 });
      } else {
        const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
        assert.ok(!schemas.join(" ").includes("Maui Jim"));
      }
      await page.locator(".frame-collection").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/${category}-${width}.jpg`, type: "jpeg", quality: 85 });
      checks.push({ path, width, category, photos: selected.length, columns, originalFraming: true, passed: true });
    }
    await page.goto(`${base}/about-us/`, { waitUntil: "networkidle" });
    const text = await page.locator("[data-preserved-content]").innerText();
    for (const brand of brands.current) assert.ok(text.includes(brand));
    for (const name of brands.removed) assert.ok(!text.includes(name));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    checks.push({ path: "/about-us/", width, currentBrandCopy: true, passed: true });
  }
  const search = await page.request.get(`${base}/search/?q=Masunaga`);
  assert.equal(search.status(), 200);
  assert.ok((await search.text()).includes('href="/about-us/"'));
  assert.deepEqual(errors, []);
  await writeFile("docs/frame-collection-verification.json", `${JSON.stringify({ checkedAt: new Date().toISOString(), base, checks, searchUsesUpdatedBrands: true, collectorsBlocked: true, browserErrors: errors, passed: true }, null, 2)}\n`);
  console.log(`PASS: ${checks.length} responsive frame collection checks; all original photographs loaded without cropping; updated search and schema; analytics blocked.`);
} finally {
  await browser.close();
}
