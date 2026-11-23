import { mkdir, writeFile } from "node:fs/promises";

await mkdir("public/tmp/review-assets", { recursive: true });
const assets = [
  ["google-maps-attribution.zip", "https://developers.google.com/static/maps/documentation/images/Google_Maps_Attribution_Assets.zip"],
  ["yelp-favicon.svg", "https://s3-media0.fl.yelpcdn.com/assets/public/yelp_favicon.yji-70908133d95b444ea335.svg"],
  ["google-star.png", "https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_14.png"],
];
for (const [file, url] of assets) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 20000000) throw new Error("Unexpectedly large brand asset");
  await writeFile(`public/tmp/review-assets/${file}`, buffer);
  console.log(file, buffer.length, "bytes", response.url);
}
