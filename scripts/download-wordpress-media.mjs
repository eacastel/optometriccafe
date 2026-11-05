import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

const media = JSON.parse(await readFile("data/wordpress-media.json", "utf8"));
const root = resolve("public/wp-content/uploads");
const manifest = [];
for (const item of media) {
  const file = resolve(`public${decodeURIComponent(item.path)}`);
  if (!file.startsWith(`${root}/`))
    throw new Error(`Unexpected asset path: ${item.path}`);
  let buffer;
  try {
    await stat(file);
    buffer = await readFile(file);
  } catch {
    const response = await fetch(item.url, {
      signal: AbortSignal.timeout(90000),
    });
    if (!response.ok) throw new Error(`${item.url}: ${response.status}`);
    if (
      !/^(image|video|audio)\/|application\/pdf/.test(
        response.headers.get("content-type") || "",
      )
    )
      throw new Error(`Unexpected media type: ${item.url}`);
    buffer = Buffer.from(await response.arrayBuffer());
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, buffer);
  }
  manifest.push({
    ...item,
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  });
  console.log(`${item.path}: ${buffer.length} bytes`);
}
await writeFile(
  "data/wordpress-media.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
