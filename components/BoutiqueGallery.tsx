"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import photography from "@/data/new-photography.json";

const photos = [photography.showroom, photography.orchid, photography.storefront];

export function BoutiqueGallery() {
  const [active, setActive] = useState(0);
  const photo = photos[active];
  function step(direction: number) {
    setActive((active + direction + photos.length) % photos.length);
  }
  return (
    <figure
      className="shop-photo"
      aria-label="The Optometric Cafe boutique"
      aria-roledescription="carousel"
    >
      <div className="gallery-frame">
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          style={{ objectPosition: photo.objectPosition }}
          loading="lazy"
          sizes="(max-width: 760px) 100vw, (max-width: 1440px) 50vw, 660px"
        />
      </div>
      <div className="gallery-bottom">
        <figcaption aria-live="polite">
          <MapPin size={14} />
          {photo.caption}
        </figcaption>
        <div className="gallery-controls">
          <button
            type="button"
            title="Previous shop photo"
            aria-label="Previous shop photo"
            onClick={() => step(-1)}
          >
            <ArrowLeft size={16} />
          </button>
          <span aria-label={`Photo ${active + 1} of ${photos.length}`}>
            {active + 1} / {photos.length}
          </span>
          <button
            type="button"
            title="Next shop photo"
            aria-label="Next shop photo"
            onClick={() => step(1)}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </figure>
  );
}
