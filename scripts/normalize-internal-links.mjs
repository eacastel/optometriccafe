import { readFile, writeFile, readdir } from "node:fs/promises";
import ts from "typescript";

const inventory = JSON.parse(
  await readFile("data/migration-inventory.json", "utf8"),
);
const known = new Set([
  ...inventory.map((item) => item.path.replace(/\/$/, "")),
  "/services",
  "/visit",
  "/blog",
  "/search",
]);
async function normalizeDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      await normalizeDirectory(file);
      continue;
    }
    if (!/\.tsx?$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    const source = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
    );
    const edits = [];
    function visit(node) {
      if (
        ts.isStringLiteral(node) &&
        node.text.startsWith("/") &&
        !node.text.startsWith("//")
      ) {
        const url = new URL(node.text, "https://optometriccafe.com");
        if (
          known.has(url.pathname) &&
          url.pathname !== "/" &&
          !url.pathname.endsWith("/")
        ) {
          edits.push({
            start: node.getStart(source),
            end: node.end,
            value: JSON.stringify(`${url.pathname}/${url.search}${url.hash}`),
          });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    let result = text;
    for (const edit of edits.reverse())
      result =
        result.slice(0, edit.start) + edit.value + result.slice(edit.end);
    if (edits.length) {
      await writeFile(file, result);
      console.log(`${file}: ${edits.length}`);
    }
  }
}
await normalizeDirectory("app");
await normalizeDirectory("components");
