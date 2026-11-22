import sharp from "sharp";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

const masters = "docs/new-images/enhanced";
const generatedRoot = process.env.GENERATED_PHOTOGRAPHY_ROOT;
const output = "public/images/boutique-refresh";
const selections = {
  showroom: {
    source: "IMG_3614.png", master: "showroom-enhanced-v1.png",
    generated: "exec-7083c6fe-666f-497c-ad0b-135002808bf5.png",
    alt: "Wood and glass eyewear displays inside Optometric Cafe on South Beverly Drive",
    caption: "Our boutique on South Beverly Drive", objectPosition: "50% 62%",
    use: "Homepage boutique gallery",
  },
  interior: {
    source: "IMG_3617.png", master: "interior-enhanced-v1.png",
    generated: "exec-58d3a13e-d583-43df-b695-97fd49599420.png",
    alt: "A view through Optometric Cafe with eyewear cabinets, fitting mirrors and wood floors",
    caption: "Personal fittings, in a place that feels personal", objectPosition: "50% 67%",
    use: "Services hero",
  },
  storefront: {
    source: "IMG_3613.png", master: "storefront-enhanced-v1.png",
    generated: "exec-0f700d97-561a-4cd3-b922-f7dfcd310916.png",
    alt: "Optometric Cafe storefront, shop sign and entrance at 277 South Beverly Drive",
    caption: "Find us at 277 South Beverly Drive", objectPosition: "50% 50%",
    use: "Visit hero and homepage gallery",
  },
  orchid: {
    source: "IMG_3621.png", master: "orchid-sign-enhanced-v1.png",
    generated: "exec-f1e65d33-f5b8-49ef-aa61-a7c383342418.png",
    alt: "Yellow orchids beside the orange Optometric Cafe wall sign and eyewear display",
    caption: "A little color. A lot of character.", objectPosition: "50% 30%",
    use: "Homepage boutique gallery detail",
  },
  people: {
    source: "IMG_3618.png", master: "people-cropped-v1.png",
    generated: "exec-70b2b9c8-c366-4f3f-b55f-a28a4a87360e.png",
    alt: "Two people pictured inside Optometric Cafe beneath the shop sign",
    caption: "At Optometric Cafe", objectPosition: "50% 45%",
    use: "About page; counter paperwork excluded from the published crop",
  },
  detail: {
    source: "IMG_3624.png", master: "boutique-detail-enhanced-v1.png",
    generated: "exec-a6f50ce1-9222-42a3-9463-16e8e17cbc45.png",
    alt: "Optometric Cafe wall sign and illuminated glass-fish display in a wood surround",
    caption: "A little character, inside the boutique", objectPosition: "50% 50%",
    use: "About page boutique detail",
  },
  evening: {
    source: "IMG_3630.png", master: "evening-window-enhanced-v1.png",
    generated: "exec-1a7d0241-1c9a-499d-a688-3c04224b4b80.png",
    alt: "Optometric Cafe's illuminated eyewear window on South Beverly Drive in the evening",
    caption: "An evening view of the boutique window", objectPosition: "50% 50%",
    use: "Visit page supporting photograph; not a statement of opening hours",
  },
};
await mkdir(masters, { recursive: true });
await mkdir(output, { recursive: true });
const manifest = {};
const comparisons = [];
const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");
for (const [index, [id, photo]] of Object.entries(selections).entries()) {
  const original = await readFile(`docs/new-images/${photo.source}`);
  const master = join(masters, photo.master);
  if (generatedRoot) await copyFile(join(generatedRoot, photo.generated), master);
  const enhanced = await readFile(master);
  const filename = photo.master.replace(/\.png$/, ".webp");
  const encoded = await sharp(enhanced).rotate().resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
  await writeFile(join(output, filename), encoded.data);
  manifest[id] = {
    src: `/images/boutique-refresh/${filename}`, width: encoded.info.width, height: encoded.info.height,
    alt: photo.alt, caption: photo.caption, objectPosition: photo.objectPosition,
    source: `docs/new-images/${photo.source}`, sourceSha256: sha(original),
    master, masterSha256: sha(enhanced), bytes: encoded.data.length, sha256: sha(encoded.data),
    enhancement: "AI-assisted lighting and white-balance retouch using built-in image_gen; not a pixel-preserving filter",
    editedOn: "2026-11-22", capturedOn: null, use: photo.use,
  };
  for (const [column, [buffer, label]] of [[original, `${photo.source} - before`], [enhanced, "Enhanced - review"]].entries()) {
    const preview = await sharp(buffer).trim({ background: "#000000", threshold: 8 })
      .resize(480, 330, { fit: "contain", background: "#edf0ed" }).jpeg().toBuffer();
    comparisons.push({ input: preview, left: column * 480, top: index * 360 });
    comparisons.push({ input: Buffer.from(`<svg width="480" height="30"><rect width="480" height="30" fill="white"/><text x="12" y="21" font-family="sans-serif" font-size="16" fill="#303a35">${label}</text></svg>`), left: column * 480, top: index * 360 + 330 });
  }
}
await sharp({ create: { width: 960, height: Object.keys(selections).length * 360, channels: 3, background: "white" } })
  .composite(comparisons).jpeg({ quality: 90 }).toFile(join(masters, "comparison.jpg"));
await writeFile("data/new-photography.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(Object.fromEntries(Object.entries(manifest).map(([id, photo]) => [id, { src: photo.src, width: photo.width, height: photo.height, bytes: photo.bytes }])), null, 2));
