import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const local = process.env.TEST_BASE_URL || "http://localhost:3000";
const origin = "https://optometriccafe.com";
const stream = "G-CCNQVYK5KJ";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
const context = await browser.newContext({ serviceWorkers: "block" });
const packets = [],
  scripts = [],
  blocked = [],
  checks = [];
let passed = false;
// Production hostname is simulated locally to exercise the existing GTM host gate.
// Only public Google tag scripts may leave the browser; all collectors are fulfilled locally.
await context.route("**/*", async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.origin === origin) {
    const response = await route.fetch({
      url: `${local}${url.pathname}${url.search}`,
      maxRedirects: 0,
    });
    return route.fulfill({ response });
  }
  if (
    request.method() === "GET" &&
    url.hostname === "www.googletagmanager.com" &&
    ["/gtm.js", "/gtag/js", "/gtag/destination"].includes(url.pathname)
  ) {
    scripts.push(url.pathname);
    return route.continue();
  }
  if (/collect/.test(url.pathname)) {
    for (const line of (request.postData() || "").split("\n")) {
      const params = new URLSearchParams(url.search);
      for (const [key, value] of new URLSearchParams(line))
        params.set(key, value);
      if (params.get("tid") === stream && params.get("en")) {
        // Deliberately exclude generated client/session identifiers from saved evidence.
        packets.push(
          Object.fromEntries(
            [...params].filter(
              ([key]) =>
                ["tid", "en", "dl", "dr", "dt", "dp"].includes(key) ||
                key.startsWith("ep."),
            ),
          ),
        );
      }
    }
    return route.fulfill({ status: 204, body: "" });
  }
  blocked.push(`${request.method()} ${url.origin}${url.pathname}`);
  return route.abort();
});
const page = await context.newPage();
const pageviews = () => packets.filter((packet) => packet.en === "page_view");
async function waitUntil(predicate, label) {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await page.waitForTimeout(100);
  }
  throw new Error(
    `Timed out: ${label}; observed ${packets.map((p) => p.en).join(",")}`,
  );
}
async function assertPageview(count, path, referrer) {
  await waitUntil(() => pageviews().length >= count, `pageview ${path}`);
  await page.waitForTimeout(1500);
  assert.equal(pageviews().length, count, `Exactly one pageview: ${path}`);
  const packet = pageviews().at(-1);
  assert.equal(new URL(packet.dl).pathname, path);
  assert.equal(packet.dt, await page.title(), `Page title: ${path}`);
  if (referrer)
    assert.equal(new URL(packet.dr).pathname, referrer, `Referrer: ${path}`);
  checks.push({
    check: "pageview",
    path,
    count,
    location: packet.dl,
    referrer: packet.dr,
    title: packet.dt,
  });
}
async function clickEvent(selector, name, interest, keyboard = false) {
  const anchor = page.locator(selector).first();
  await anchor.waitFor({ state: "visible" });
  const before = packets.length;
  const start = await page.evaluate(() => window.dataLayer.length);
  await anchor.evaluate((a) =>
    a.addEventListener("click", (e) => e.preventDefault(), { once: true }),
  );
  const label =
    (await anchor.getAttribute("aria-label")) || (await anchor.innerText());
  if (keyboard) {
    await anchor.focus();
    await page.keyboard.press("Enter");
  } else await anchor.click();
  await waitUntil(() => packets.slice(before).some((p) => p.en === name), name);
  await page.waitForTimeout(700);
  const sent = packets.slice(before).filter((p) => p.en === name);
  assert.equal(sent.length, 1, `Single collector event: ${name}`);
  const data = await page.evaluate(
    ({ start, name }) =>
      window.dataLayer.slice(start).filter((e) => e.event === name),
    { start, name },
  );
  assert.equal(data.length, 1, `Single dataLayer event: ${name}`);
  for (const key of [
    "cta_type",
    "cta_text",
    "link_url",
    "destination_path",
    "page_path",
    "service_interest",
    "link_placement",
    "measurement_version",
  ]) {
    assert.ok(data[0][key], key);
    assert.equal(
      sent[0][key === "page_path" ? "dp" : `ep.${key}`],
      data[0][key],
      `Collector field: ${key}`,
    );
  }
  assert.equal(
    data[0].cta_text,
    label.replace(/\s+/g, " ").trim().slice(0, 100),
  );
  if (interest) assert.equal(data[0].service_interest, interest);
  assert.ok(!/[?#]/.test(data[0].link_url), "No query/hash in CTA URL");
  checks.push({
    check: "click",
    name,
    selector,
    keyboard,
    parameters: data[0],
  });
}
try {
  await page.goto(
    `${origin}/?utm_source=qa_analytics&utm_medium=test&utm_campaign=release-check`,
    { waitUntil: "domcontentloaded", referer: "https://example.org/" },
  );
  await assertPageview(1, "/");
  assert.equal(
    new URL(pageviews()[0].dl).searchParams.get("utm_source"),
    "qa_analytics",
  );
  await page.locator('.hero-copy a[href="/visit/#book"]').click();
  await page.waitForURL("**/visit/#book");
  await assertPageview(2, "/visit/", "/");
  const count = pageviews().length;
  await page.locator('.actions a[href="/visit/#book"]').click();
  await page.waitForTimeout(1700);
  assert.equal(
    pageviews().length,
    count,
    "Same-page anchor must not duplicate pageview",
  );
  await clickEvent(
    'main a[href="tel:+13108882848"]',
    "oc_phone_click",
    "general_inquiry",
    true,
  );
  await clickEvent(
    'main a[href="mailto:info@optometriccafe.com"]',
    "oc_email_click",
    "general_inquiry",
  );
  await clickEvent(
    'main a[href*="google.com/maps?cid="]',
    "oc_directions_click",
    "general_inquiry",
  );
  await page
    .locator(".nav summary")
    .filter({ hasText: "Optical services" })
    .click();
  await page.locator('.nav a[href="/optometry-lab-beverly-hills/"]').click();
  await page.waitForURL("**/optometry-lab-beverly-hills/");
  await assertPageview(3, "/optometry-lab-beverly-hills/", "/visit/");
  await clickEvent(
    '.content-hero a[href="tel:+13108882848"]',
    "oc_phone_click",
    "optical_workshop",
  );
  await clickEvent(
    '.optical-next-steps a[href="/prescription-eyeglasses-beverly-hills/"]',
    "oc_service_cta_click",
    "prescription_glasses",
  );
  await clickEvent(
    '.optical-next-steps a[href="/contact-us/"]',
    "oc_contact_click",
    "optical_workshop",
  );
  await clickEvent(
    '[data-preserved-content] a[href="/contact-us/"]',
    "oc_contact_click",
    "optical_workshop",
  );
  await clickEvent(
    'footer a[href="/featured-reviews/"]',
    "oc_review_click",
    "optical_workshop",
  );
  await page.goBack();
  await page.waitForURL("**/visit/#book");
  await assertPageview(4, "/visit/", "/optometry-lab-beverly-hills/");
  await page.goto(`${origin}/contact-us/`, { waitUntil: "domcontentloaded" });
  await waitUntil(
    () => pageviews().some((p) => new URL(p.dl).pathname === "/contact-us/"),
    "contact page load",
  );
  await clickEvent(
    '[data-preserved-content] a[href^="tel:"]',
    "oc_phone_click",
    "general_inquiry",
    true,
  );
  await clickEvent(
    '[data-preserved-content] a[href^="mailto:"]',
    "oc_email_click",
    "general_inquiry",
  );
  await clickEvent(
    '[data-preserved-content] a[href*="maps"]',
    "oc_directions_click",
    "general_inquiry",
  );
  await clickEvent(
    '[data-preserved-content] a[href="/optometry-lab-beverly-hills/"]',
    "oc_service_cta_click",
    "optical_workshop",
  );
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await clickEvent(
    '[data-preserved-home="family"] a[href="/featured-reviews/"]',
    "oc_review_click",
    "general_inquiry",
  );
  await clickEvent(
    '.hero-copy a[href="/visit/#book"]',
    "oc_contact_click",
    "general_inquiry",
  );
  assert.equal(
    await page.locator('script[src*="gtm.js?id=GTM-WGHNXHX9"]').count(),
    1,
  );
  const previewOrigin = "https://optometriccafe.vercel.app";
  const previewContext = await browser.newContext({ serviceWorkers: "block" });
  const previewCollectors = [];
  await previewContext.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === previewOrigin)
      return route.fulfill({
        response: await route.fetch({
          url: `${local}${url.pathname}${url.search}`,
        }),
      });
    if (
      request.method() === "GET" &&
      url.hostname === "www.googletagmanager.com" &&
      ["/gtm.js", "/gtag/js", "/gtag/destination"].includes(url.pathname)
    )
      return route.continue();
    if (/collect/.test(url.pathname)) {
      previewCollectors.push(url.pathname);
      return route.fulfill({ status: 204, body: "" });
    }
    return route.abort();
  });
  const previewPage = await previewContext.newPage();
  await previewPage.goto(previewOrigin, { waitUntil: "domcontentloaded" });
  await previewPage.waitForTimeout(2500);
  await previewPage.locator('.hero-copy a[href="/visit/#book"]').click();
  await previewPage.waitForURL("**/visit/#book");
  const previewPhone = previewPage
    .locator('main a[href="tel:+13108882848"]')
    .first();
  await previewPhone.evaluate((a) =>
    a.addEventListener("click", (e) => e.preventDefault(), { once: true }),
  );
  await previewPhone.click();
  await previewPage.waitForTimeout(2500);
  assert.equal(
    previewCollectors.length,
    0,
    "Preview host must not send GA collection",
  );
  assert.ok(
    await previewPage.evaluate(() =>
      window.dataLayer.some((e) => e.event === "oc_phone_click"),
    ),
    "Intent is available in preview dataLayer",
  );
  checks.push({
    check: "preview-host-gate",
    origin: previewOrigin,
    collectorRequests: 0,
    dataLayerIntent: true,
  });
  await previewContext.close();
  passed = true;
  console.log(
    `PASS: ${checks.length} collector-blocked measurement checks; existing GTM and GA4 stream; no collection requests transmitted.`,
  );
} finally {
  await mkdir("public/tmp", { recursive: true });
  const evidence =
    JSON.stringify(
      {
        passed,
        checkedAt: new Date().toISOString(),
        local,
        simulatedOrigin: origin,
        stream,
        allCollectorsBlocked: true,
        scripts,
        blocked: [...new Set(blocked)],
        checks,
        packets,
      },
      null,
      2,
    ) + "\n";
  await writeFile("public/tmp/analytics-acceptance.json", evidence);
  if (passed)
    await writeFile(
      "docs/analytics-implementation-verification.json",
      evidence,
    );
  await browser.close();
}
