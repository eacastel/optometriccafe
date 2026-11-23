import copy from "@/data/home-content.json";
import brands from "@/data/frame-brands.json";
import { applyBrandUpdates } from "@/lib/brand-content";

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
      dangerouslySetInnerHTML={{ __html: applyBrandUpdates(copy[name], "/", brands) }}
    />
  );
}
