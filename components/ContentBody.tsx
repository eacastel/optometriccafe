import { layoutPreservedPhotos, type PreservedPhotoLayout } from "@/lib/content-layout";

export function ContentBody({
  html,
  className = "content-shell wp-content",
  photoLayout,
}: {
  html: string;
  className?: string;
  photoLayout?: PreservedPhotoLayout;
}) {
  return (
    <article
      className={className}
      data-preserved-content
      dangerouslySetInnerHTML={{ __html: layoutPreservedPhotos(html, photoLayout) }}
    />
  );
}
