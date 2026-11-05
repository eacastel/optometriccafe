import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const inventory = JSON.parse(
  await readFile("data/migration-inventory.json", "utf8"),
);
await mkdir("public/tmp/migration", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
const page = await browser.newPage();
const errors = [];
const results = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route(/googletagmanager\.com|google-analytics\.com/, (route) =>
  route.abort(),
);
try {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of inventory.map((item) => item.path)) {
      const response = await page.goto(`${base}${route}`, {
        waitUntil: "domcontentloaded",
      });
      assert.equal(response.status(), 200, route);
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (const image of document.images) image.loading = "eager";
        await Promise.all(
          [...document.images].map((image) => image.decode().catch(() => {})),
        );
      });
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        brokenImages: [...document.images]
          .filter((i) => !i.naturalWidth)
          .map((i) => i.src),
      }));
      assert.equal(layout.scrollWidth, width, `Overflow ${route} at ${width}`);
      assert.equal(
        layout.brokenImages.length,
        0,
        `Images ${route}: ${layout.brokenImages.join(",")}`,
      );
      if (
        [
          "/",
          "/blog/",
          "/contact-us/",
          "/featured-reviews/",
          "/optometry-lab-beverly-hills/",
          "/progressive-glasses-beverly-hills/",
        ].includes(route)
      ) {
        if (route === "/" || route === "/contact-us/") {
          const map = page.locator('iframe[src*="google.com/maps"]').first();
          await map.scrollIntoViewIfNeeded();
          await page.waitForTimeout(2000);
        }
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
        await page.waitForTimeout(1300);
        await page.screenshot({
          path: `public/tmp/migration/${route.replaceAll("/", "") || "home"}-${width}.png`,
          fullPage: true,
        });
      }
      results.push({ route, width, ...layout });
    }
  }
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1300);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      width,
    );
    await page.screenshot({
      path: `public/tmp/migration/home-top-${width}.png`,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  assert.ok(await page.locator("#mobile-nav").isVisible());
  await page.keyboard.press("Escape");
  assert.ok(!(await page.locator("#mobile-nav").isVisible()));
  await page
    .locator(".hero-copy")
    .getByRole("link", { name: "Book a Fitting", exact: true })
    .click();
  await page.waitForURL("**/visit/#book");
  assert.equal(
    await page.evaluate(
      () =>
        window.dataLayer.filter((e) => e.event === "oc_contact_click").length,
    ),
    1,
  );
  await page.evaluate(() => {
    window.dataLayer = [];
  });
  // Prevent browser handoff to a phone app, after the capture-phase measurement handler.
  await page
    .locator('main a[href="tel:+13108882848"]')
    .first()
    .evaluate((anchor) =>
      anchor.addEventListener("click", (e) => e.preventDefault(), {
        once: true,
      }),
    );
  await page.locator('main a[href="tel:+13108882848"]').first().click();
  let events = await page.evaluate(() =>
    window.dataLayer.filter((e) => String(e.event).startsWith("oc_")),
  );
  assert.equal(events.length, 1);
  assert.equal(events[0].event, "oc_phone_click");
  for (const field of [
    "cta_type",
    "cta_text",
    "link_url",
    "page_path",
    "destination_path",
    "service_interest",
    "link_placement",
    "measurement_version",
  ])
    assert.ok(events[0][field], field);
  await page.goto(`${base}/contact-us/`);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    window.dataLayer = [];
  });
  const importedPhone = page
    .locator('[data-preserved-content] a[href^="tel:"]')
    .first();
  await importedPhone.evaluate((anchor) =>
    anchor.addEventListener("click", (e) => e.preventDefault(), { once: true }),
  );
  await importedPhone.click();
  events = await page.evaluate(() =>
    window.dataLayer.filter((e) => String(e.event).startsWith("oc_")),
  );
  assert.equal(events.length, 1);
  assert.equal(events[0].event, "oc_phone_click");
  await page.goto(`${base}/blog/`);
  await page.getByRole("searchbox").fill("progressive");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.waitForURL("**/search/?q=progressive");
  assert.ok(
    await page
      .locator('main a[href="/progressive-glasses-beverly-hills/"]')
      .count(),
  );
  assert.deepEqual(errors, []);
  await writeFile(
    "docs/migration-browser-verification.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        base,
        errors,
        results,
        mobileMenu: "pass",
        search: "pass",
        singleFireTracking: "pass",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `PASS: ${results.length} page/viewport checks, responsive header, search, images, mobile menu and single-fire analytics.`,
  );
} finally {
  await browser.close();
}
