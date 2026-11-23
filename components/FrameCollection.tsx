import Image from "next/image";
import photos from "@/data/frame-photography.json";

export function FrameCollection({ category = "all" }: { category?: "all" | "optical" | "sun" }) {
  const selected = photos.filter((photo) => category === "all" || photo.category === category);
  return (
    <section className="frame-collection content-shell" aria-label="Eyewear photographed in our boutique" data-frame-collection={category}>
      <div className="frame-collection-heading">
        <p className="eyebrow">In the boutique</p>
        <h2>{category === "sun" ? "Sunglasses with character." : "Find a frame that feels like you."}</h2>
      </div>
      <div className="frame-photo-grid">
        {selected.map((photo) => (
          <figure key={photo.src}>
            <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}
              sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 33vw" loading="lazy" />
            <figcaption>{photo.brand}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
