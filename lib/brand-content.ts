import { load } from "cheerio";

type BrandUpdates = {
  removed: string[];
  schemaRemovalPaths: string[];
  edits: { path: string; before: string; after: string }[];
};

export function applyBrandText(text: string, path: string, updates: BrandUpdates) {
  for (const edit of updates.edits.filter((edit) => edit.path === path)) {
    text = text.replaceAll(edit.before, edit.after);
  }
  return text;
}

// Apply only the owner's exact stock-list corrections, not historical brand mentions.
export function applyBrandUpdates(html: string, path: string, updates: BrandUpdates) {
  if (!updates.edits.some((edit) => edit.path === path && html.includes(edit.before))) return html;
  const $ = load(html, null, false);
  $.root().find("*").contents().each((_, node) => {
    if (node.type === "text") node.data = applyBrandText(node.data, path, updates);
  });
  return $.html();
}

export function applyBrandSchemas(schemas: Record<string, unknown>[], path: string, updates: BrandUpdates) {
  if (!updates.schemaRemovalPaths.includes(path)) return schemas;
  return schemas.map((schema) => schema["@type"] === "Product" && Array.isArray(schema.brand)
    ? { ...schema, brand: schema.brand.filter((brand) => !updates.removed.some((removed) => removed.toLowerCase() === String(brand.name).toLowerCase())) }
    : schema);
}
