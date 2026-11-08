import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const source =
  "/home/eacastel/NAS/AI/AI - CLIENTS inactive/Optometric Cafe/2014-06-24 Optometric Cafe";
const photos = [
  {
    file: "DSC06046.JPG",
    output: "boutique-designer-display.webp",
    alt: "Designer optical frames and sunglasses displayed in the wood cabinets at Optometric Cafe",
  },
  {
    file: "DSC06077.JPG",
    output: "boutique-south-beverly-front.webp",
    alt: "Optometric Cafe storefront and original orange sign at 277 South Beverly Drive",
  },
];
await mkdir("public/images/boutique", { recursive: true });
const manifest = [];
for (const photo of photos) {
  const input = await readFile(`${source}/${photo.file}`);
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  await writeFile(`public/images/boutique/${photo.output}`, output);
  manifest.push({
    ...photo,
    sourceDate: "2014-06-24",
    sourceSha256: createHash("sha256").update(input).digest("hex"),
    bytes: output.length,
  });
}
await writeFile(
  "data/boutique-photos.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  `Imported ${manifest.length} real boutique photographs (${manifest.reduce((sum, p) => sum + p.bytes, 0)} bytes).`,
);
