import { layoutPreservedPhotos, replaceContentImage, type PreservedPhotoLayout } from "@/lib/content-layout";
import { layoutReviewTiles } from "@/lib/review-layout";
import profiles from "@/data/business-profiles.json";
import reviewAdditions from "@/data/review-additions.json";

export function ContentBody({
  html,
  className = "content-shell wp-content",
  photoLayout,
  reviews = false,
  imageOverride,
}: {
  html: string;
  className?: string;
  photoLayout?: PreservedPhotoLayout;
  reviews?: boolean;
  imageOverride?: { original: string; src: string; alt: string; width: number; height: number };
}) {
  let content = layoutPreservedPhotos(html, photoLayout);
  if (reviews) content = layoutReviewTiles(content, profiles, reviewAdditions);
  if (imageOverride) content = replaceContentImage(content, imageOverride);
  return (
    <article
      className={`${className}${reviews ? " featured-review-content" : ""}`}
      data-preserved-content
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
