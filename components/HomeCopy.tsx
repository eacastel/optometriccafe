import copy from "@/data/home-content.json";

export function HomeCopy({
  name,
  className = "",
}: {
  name: keyof typeof copy;
  className?: string;
}) {
  return (
    <div
      className={`home-copy ${className}`}
      data-preserved-home={name}
      dangerouslySetInnerHTML={{ __html: copy[name] }}
    />
  );
}
