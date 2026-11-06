import { load } from "cheerio";

// Split the archived copy into visible design sections without rewriting its text.
export function homeContent(html) {
  const $ = load(html, null, false);
  $('video').attr('poster', '/wp-content/uploads/2025/08/optometric-cafe-showroom-prescription-sunglasses-beverly-hills.jpg');
  const elements = $("#et-boc").children().toArray();
  const counts = [1, 1, 1, 1, 3, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 2, 4, 4, 2];
  const names = [
    "video",
    "heroHeading",
    "since",
    "fittingLink",
    "family",
    "visit",
    "repair",
    "prescription",
    "sunglasses",
    "children",
    "storyHeading",
    "story",
    "workshop",
    "complex",
    "designers",
    "invitation",
    "craft",
    "award",
    "hours",
    "neighborhood",
  ];
  if (counts.reduce((sum, count) => sum + count, 0) !== elements.length)
    throw new Error(
      "Homepage source structure changed; review its section mapping before importing.",
    );
  let offset = 0;
  return Object.fromEntries(
    names.map((name, index) => {
      const fragment = elements
        .slice(offset, (offset += counts[index]))
        .map((node) => $.html(node))
        .join("\n");
      return [name, fragment];
    }),
  );
}
