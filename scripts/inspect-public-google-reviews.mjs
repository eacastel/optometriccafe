import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "public/tmp/google-review-inspection";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const page = await browser.newPage({ locale: "en-US", viewport: { width: 1440, height: 1000 } });
try {
  await page.goto("https://www.google.com/maps?cid=12237678482973097844&hl=en", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(7000);
  const reject = page.getByRole("button", { name: /Reject all/i });
  if (await reject.count()) { await reject.first().click(); await page.waitForTimeout(5000); }
  const reviews = page.getByRole("tab", { name: /Reviews/i });
  if (await reviews.count()) { await reviews.first().click(); await page.waitForTimeout(4000); }
  const body = await page.locator("body").innerText();
  const starStyle = await page.locator(".rFrJzc").first().evaluate((star) => {
    const style = getComputedStyle(star);
    return { width: style.width, height: style.height, backgroundImage: style.backgroundImage,
      backgroundSize: style.backgroundSize, color: style.color };
  }).catch(() => null);
  await page.screenshot({ path: `${output}/profile.jpg`, quality: 80, type: "jpeg" });
  await writeFile(`${output}/visible.txt`, body);
  await writeFile(`${output}/page.html`, await page.content());
  console.log(JSON.stringify({ url: page.url(), title: await page.title(), starStyle, body: body.slice(0, 14000),
    tabs: await page.getByRole("tab").allTextContents(), buttons: (await page.getByRole("button").allTextContents()).slice(0, 45) }, null, 2));
} finally { await browser.close(); }
