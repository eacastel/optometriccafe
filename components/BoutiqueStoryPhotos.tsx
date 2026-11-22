import Image from "next/image";
import photography from "@/data/new-photography.json";

export function BoutiqueStoryPhotos() {
  return (
    <section className="content-shell boutique-story-grid" aria-label="People and details of Optometric Cafe">
      {[photography.people, photography.detail].map((photo) => (
        <figure key={photo.src}>
          <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}
            sizes="(max-width: 599px) 100vw, (max-width: 1000px) 50vw, 500px" loading="lazy" />
        </figure>
      ))}
    </section>
  );
}
