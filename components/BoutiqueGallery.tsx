"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";

const photos = [
  {
    src: "/images/selected/originals/store-fitting-room.jpg",
    alt: "Glass eyewear displays and wood cabinetry inside Optometric Cafe",
    caption: "Our boutique on South Beverly Drive",
    width: 2400,
    height: 1800,
  },
  {
    src: "/images/selected/originals/store-frame-wall.jpg",
    alt: "Orange orchids against the textured walls of the boutique",
    caption: "A little color. A lot of character.",
    width: 1350,
    height: 1800,
  },
  {
    src: "/images/selected/originals/store-showroom-wide.jpg",
    alt: "The original orange and black Optometric Cafe sign inside the shop",
    caption: "An independent spirit, since 2005",
    width: 2400,
    height: 1800,
  },
];

export function BoutiqueGallery() {
  const [active, setActive] = useState(0);
  const photo = photos[active];
  function step(direction: number) {
    setActive((active + direction + photos.length) % photos.length);
  }
  return (
    <figure
      className="shop-photo"
      aria-label="Inside the boutique"
      aria-roledescription="carousel"
    >
      <div className="gallery-frame">
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="eager"
          sizes="(max-width: 760px) 100vw, 60vw"
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
