import sharp from "sharp";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const source = "docs/new-images";
const output = "public/tmp/photography-review";
const files = (await readdir(source)).filter((file) => /\.(png|jpe?g)$/i.test(file)).sort();
await mkdir(output, { recursive: true });
const cells = [];
const inventory = [];
for (const [index, file] of files.entries()) {
  const input = await readFile(`${source}/${file}`);
  const metadata = await sharp(input).metadata();
  await sharp(input).trim({ background: "#000000", threshold: 8 })
    .resize({ width: 1000, withoutEnlargement: true }).jpeg({ quality: 90 })
    .toFile(`${output}/${file.replace(/\.[^.]+$/, "-review.jpg")}`);
  inventory.push({ file, width: metadata.width, height: metadata.height, bytes: input.length,
    sha256: createHash("sha256").update(input).digest("hex") });
  const thumbnail = await sharp(input).rotate().trim({ background: "#000000", threshold: 8 }).resize(380, 300, { fit: "contain", background: "#eceeec" }).jpeg().toBuffer();
  const label = Buffer.from(`<svg width="380" height="30"><rect width="380" height="30" fill="white"/><text x="12" y="21" font-family="sans-serif" font-size="16" fill="#303a35">${file}</text></svg>`);
  cells.push({ input: thumbnail, left: (index % 4) * 380, top: Math.floor(index / 4) * 330 });
  cells.push({ input: label, left: (index % 4) * 380, top: Math.floor(index / 4) * 330 + 300 });
}
await sharp({ create: { width: 1520, height: Math.ceil(files.length / 4) * 330, channels: 3, background: "white" } }).composite(cells).jpeg({ quality: 90 }).toFile(`${output}/contact-sheet.jpg`);
await writeFile(`${output}/inventory.json`, JSON.stringify(inventory, null, 2) + "\n");
console.log(JSON.stringify(inventory, null, 2));
