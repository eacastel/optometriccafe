import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const source = "docs/images-pre-launch";
const output = "public/images/frame-collection";
const selections = [
  { file: "Image_261123_122541.jpeg", id: "res-rei", brand: "Res / Rei", category: "optical", alt: "Burgundy and black Res / Rei eyeglass frames in the Optometric Cafe display" },
  { file: "Image_261123_122623.jpeg", id: "miu-miu", brand: "Miu Miu", category: "sun", alt: "Miu Miu sunglasses and tortoiseshell eyeglass frames displayed in the boutique" },
  { file: "Image_261123_122751.jpeg", id: "chopard", brand: "Chopard", category: "sun", alt: "Chopard luxury sunglasses in the wood-lined Optometric Cafe display" },
  { file: "Image_261123_122811.jpeg", id: "ba-and-sh", brand: "ba&sh", category: "optical", alt: "ba&sh eyeglasses and sunglasses on display at Optometric Cafe" },
  { file: "Image_261123_122848.jpeg", id: "igreen", brand: "iGreen", category: "optical", alt: "Lightweight iGreen rimless eyeglasses in the boutique display" },
  { file: "Image_261123_123051.jpeg", id: "revo", brand: "Revo", category: "sun", alt: "Revo aviator sunglasses on a vertical display at Optometric Cafe" },
];
await mkdir(output, { recursive: true });
const photos = [];
const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");
for (const photo of selections) {
  const input = await readFile(`${source}/${photo.file}`);
  // Orientation and web encoding only: preserve actual frames, logos, color and reflections.
  const encoded = await sharp(input).rotate().resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 }).toBuffer({ resolveWithObject: true });
  const src = `/images/frame-collection/${photo.id}.webp`;
  await writeFile(`public${src}`, encoded.data);
  photos.push({ ...photo, source: `${source}/${photo.file}`, sourceSha256: sha(input), src,
    width: encoded.info.width, height: encoded.info.height, bytes: encoded.data.length, sha256: sha(encoded.data),
    processing: "EXIF orientation, proportional downsize, WebP encoding and metadata removal only; no generative edits or retouching" });
}
await writeFile("data/frame-photography.json", `${JSON.stringify(photos, null, 2)}\n`);
console.log(`Imported ${photos.length} original product photographs; ${photos.reduce((sum, photo) => sum + photo.bytes, 0)} bytes total.`);
