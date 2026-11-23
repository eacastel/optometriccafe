import { load } from "cheerio";

export type PreservedPhotoLayout = "workshop" | "contact-lenses";

const layouts = {
  workshop: {
    files: ["lab1.jpg", "lab3.jpg", "optometric-cafe-lab.png", "lab4.jpg", "lab2.jpg", "lab5.jpg"],
    label: "In-house optical workshop photographs",
  },
  "contact-lenses": {
    files: ["contact1.jpg", "contact2.jpg", "contact3_0.jpg"],
    label: "Contact lens brands",
  },
};

export function layoutPreservedPhotos(html: string, layout?: PreservedPhotoLayout) {
  if (!layout) return html;
  const config = layouts[layout];
  const $ = load(html, null, false);
  const images = $("img[src]").filter((_, node) =>
    config.files.some((file) => $(node).attr("src") === `/wp-content/uploads/2019/01/${file}`),
  );
  if (images.length !== config.files.length) return html;
  images.wrapAll(`<div class="preserved-photo-grid preserved-photo-grid--${layout}" role="group" aria-label="${config.label}"></div>`);
  return $.html();
}

export function replaceContentImage(html: string, photo: { original: string; src: string; alt: string; width: number; height: number }) {
  const $ = load(html, null, false);
  $("img[src]").filter((_, node) => $(node).attr("src") === photo.original)
    .attr({ src: photo.src, alt: photo.alt, width: String(photo.width), height: String(photo.height) })
    .removeAttr("srcset").addClass("sports-owner-photo");
  return $.html();
}
