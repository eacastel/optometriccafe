import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const photos = JSON.parse(await readFile("data/new-photography.json", "utf8"));
const profiles = JSON.parse(await readFile("data/business-profiles.json", "utf8"));
const output = "public/tmp/review-checks";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const page = await browser.newPage();
const checks = [], errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());

async function capturedClick(locator, options) {
  await page.evaluate(() => {
    window.__clickedHref = null;
    document.addEventListener("click", (event) => {
      window.__clickedHref = event.target.closest("a")?.getAttribute("href");
      event.preventDefault();
    }, { once: true, capture: true });
  });
  await locator.click(options);
  return page.evaluate(() => window.__clickedHref);
}

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal((await page.goto(`${base}/featured-reviews/`, { waitUntil: "networkidle" })).status(), 200);
    assert.equal(await page.locator(".review-tile").count(), 56);
    const state = await page.locator(".review-tiles").evaluate((wall) => ({
      columns: getComputedStyle(wall).columnCount,
      overflow: document.documentElement.scrollWidth > innerWidth,
      tiles: [...wall.querySelectorAll(".review-tile")].map((tile) => {
        const rect = tile.getBoundingClientRect();
        const star = tile.querySelector(".google-star-icons i");
        const style = getComputedStyle(star);
        return { width: rect.width, height: rect.height, left: rect.left, right: rect.right,
          padding: getComputedStyle(tile).paddingLeft, starWidth: style.width, starHeight: style.height,
          starImage: style.backgroundImage, stars: tile.querySelectorAll(".google-star-icons i").length };
      }),
    }));
    assert.equal(state.columns, width < 700 ? "1" : width < 1100 ? "2" : "3");
    assert.equal(state.overflow, false);
    for (const tile of state.tiles) {
      assert.ok(tile.width > 200 && tile.height > 100);
      assert.ok(tile.left >= 0 && tile.right <= width + 1);
      assert.equal(tile.padding, "24px");
      assert.equal(tile.stars, 5);
      assert.equal(tile.starWidth, "14px");
      assert.equal(tile.starHeight, "13px");
      assert.ok(tile.starImage.includes("/images/review-brands/google-star.png"));
    }
    for (const badge of await page.locator(".review-source-mark").all()) {
      await badge.scrollIntoViewIfNeeded();
      await badge.evaluate((img) => img.decode());
      assert.equal(await badge.evaluate((img) => img.getBoundingClientRect().height), 18);
    }
    assert.equal(await capturedClick(page.locator(".review-tile").first(), { position: { x: 24, y: 30 } }), profiles.googleBusinessUrl);
    const service = page.locator('.review-tile a:not(.review-source-link)').first();
    assert.equal(await capturedClick(service), await service.getAttribute("href"));
    await page.locator(".review-profile-bar").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/reviews-${width}.jpg`, type: "jpeg", quality: 85 });
    checks.push({ path: "/featured-reviews/", width, tiles: 56, google: 54, yelp: 2, columns: Number(state.columns), wholeTileLink: true, contextualServiceLink: true, passed: true });

    await page.goto(`${base}/sports-eye-glasses-and-sunglasses/`, { waitUntil: "networkidle" });
    const cycling = page.locator("img.sports-owner-photo");
    await cycling.scrollIntoViewIfNeeded();
    await cycling.evaluate((img) => img.decode());
    const image = await cycling.evaluate((img) => ({ src: new URL(img.src).pathname, width: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }));
    assert.equal(image.src, photos.cycling.src);
    assert.ok(image.width > 200 && image.height > 300);
    assert.ok(Math.abs(image.width / image.height - image.naturalWidth / image.naturalHeight) < 0.01);
    assert.equal(await page.locator('img[src="/wp-content/uploads/2019/01/sports-glasses2.jpg"]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${output}/sports-${width}.jpg`, type: "jpeg", quality: 85 });
    checks.push({ path: "/sports-eye-glasses-and-sunglasses/", width, image, passed: true });
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".home-review-source[data-review-source=google]").count(), 3);
    assert.equal(await page.locator(".review-grid .google-star-icons i").count(), 15);
    const footersFit = await page.locator(".home-review-source").evaluateAll((links) => links.every((link) => {
      const bounds = link.getBoundingClientRect();
      return [...link.children].every((child) => {
        const rect = child.getBoundingClientRect();
        return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
      });
    }));
    assert.equal(footersFit, true, "Homepage reviewer identity and branding fit their tiles");
    assert.equal(await capturedClick(page.locator(".review-grid .review-card").first(), { position: { x: 24, y: 30 } }), profiles.googleBusinessUrl);
    checks.push({ path: "/", width, homeReviewProfiles: 3, passed: true });
  }
  assert.equal((await page.request.get(`${base}/wp-content/uploads/2019/01/sports-glasses2.jpg`)).status(), 200);
  assert.deepEqual(errors, []);
  const result = { checkedAt: new Date().toISOString(), base, checks, browserErrors: errors, collectorsBlocked: true, passed: true };
  await writeFile("docs/reviews-verification.json", `${JSON.stringify(result, null, 2)}\n`);
  console.log(`PASS: ${checks.length} responsive review / sports checks; analytics collectors blocked.`);
} finally {
  await browser.close();
}
