export function ContentBody({
  html,
  className = "content-shell wp-content",
}: {
  html: string;
  className?: string;
}) {
  return (
    <article
      className={className}
      data-preserved-content
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
