import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Glasses,
  Wrench,
  Phone,
  Star,
} from "lucide-react";
import { BoutiqueGallery } from "@/components/BoutiqueGallery";
import { business, reviews } from "@/app/data";
import { JsonLd } from "@/components/SiteChrome";
import { TrackedLink } from "@/components/TrackedLink";
import { HomeCopy } from "@/components/HomeCopy";
import { BusinessLinks, GoogleMap } from "@/components/BusinessLinks";
import { home, contentMetadata } from "@/lib/content";

export const metadata = contentMetadata(home);

const pathways = [
  {
    number: "01",
    title: "Find your frames",
    text: "Prescription glasses, designer eyewear, and a fit that feels like you.",
    href: "/prescription-eyeglasses-beverly-hills/",
    icon: Glasses,
  },
  {
    number: "02",
    title: "Love them longer",
    text: "Thoughtful repairs, adjustments, and new lenses for favorite frames.",
    href: "/glasses-repair-adjustment-beverly-hills/",
    icon: Wrench,
  },
  {
    number: "03",
    title: "Made for your prescription",
    text: "An in-house optical workshop. Personal care, down to the last detail.",
    href: "/optometry-lab-beverly-hills/",
    icon: Glasses,
  },
];

export default function Home() {
  return (
    <main id="main-content">
      <JsonLd
        data={{ "@context": "https://schema.org", "@graph": home.schemas }}
      />
      <section className="editorial-hero" aria-labelledby="home-title">
        <Image
          className="hero-art"
          src="/images/eyewear-editorial.webp"
          alt="An editorial still life of olive optical frames and tortoiseshell sunglasses"
          fill
          sizes="100vw"
          priority
        />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="orange-dot" /> Beverly Hills. Family-owned since
              2005.
            </p>
            <h1 id="home-title">
              Optometric Cafe
              <span className="hero-subject" data-preserved-home="heroHeading">
                {home.heading}
              </span>
            </h1>
            <p className="hero-statement">
              Great frames.
              <br />
              An even better fit.
            </p>
            <p className="hero-description">
              Personal fittings. Exceptional eyewear.
              <br />A familiar face who gets every detail right.
            </p>
            <div className="hero-ctas">
              <TrackedLink
                className="button primary"
                href="/visit/#book"
                eventName="oc_appointment_click"
                ctaText="Book a Fitting"
                ctaType="hero"
              >
                Book a Fitting <ArrowUpRight size={18} />
              </TrackedLink>
              <TrackedLink
                className="text-link"
                href={business.phoneHref}
                eventName="oc_phone_click"
                ctaText="Call Now"
                ctaType="hero"
              >
                <Phone size={16} /> Call Now
              </TrackedLink>
            </div>
            <Link
              className="hero-exam"
              href="/optometry-services-in-beverly-hills/"
            >
              Looking for an eye exam? <ArrowRight size={15} />
            </Link>
          </div>
          <div className="hero-bottom">
            <span>Independent eyewear. Individual attention.</span>
            <a href="#discover" aria-label="Discover Optometric Cafe">
              <ArrowDown size={19} />
            </a>
          </div>
        </div>
      </section>

      <section className="pathways" id="discover" aria-label="How can we help?">
        {pathways.map(({ number, title, text, href, icon: Icon }) => (
          <Link className="pathway" href={href} key={number}>
            <span className="pathway-meta">
              <Icon size={24} strokeWidth={1.4} />
              <span>{number}</span>
            </span>
            <h2>
              {title}
              <ArrowUpRight size={22} />
            </h2>
            <p>{text}</p>
          </Link>
        ))}
      </section>

      <section className="band shop-section">
        <div className="boutique-introduction">
          <HomeCopy name="since" />
          <HomeCopy name="family" />
        </div>
        <div className="section-head">
          <div>
            <p className="eyebrow">A different kind of optical shop</p>
            <h2>
              Good taste.
              <br />
              Personal attention.
            </h2>
          </div>
        </div>
        <div className="shop-grid">
          <div className="shop-gallery">
            <BoutiqueGallery />
            <p className="gallery-intro">
              Designer frames, carefully crafted lenses, and someone who takes the
              time to find what works for you.
            </p>
          </div>
          <div className="collection-list">
            <p className="eyebrow">Find your point of view</p>
            {(
              ["prescription", "sunglasses", "children", "repair"] as const
            ).map((name) => (
              <HomeCopy key={name} name={name} />
            ))}
            <Link className="text-link" href="/services/">
              All optical services <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="designer-band" aria-label="Designer eyewear brands">
        <p>Independent spirit. Exceptional designers.</p>
        <div>
          <span>OLIVER PEOPLES</span>
          <span>MYKITA</span>
          <span>SALT.</span>
          <span>Persol</span>
          <span>MAUI JIM</span>
          <span>LUNOR</span>
        </div>
        <HomeCopy name="designers" />
      </section>

      <section className="band owner-section">
        <HomeCopy name="storyHeading" className="owner-context" />
        <div className="owner-grid">
          <div className="owner-copy">
            <p className="eyebrow">Meet your optician</p>
            <h2>
              A real person.
              <br />A truly personal fit.
            </h2>
            <p className="lead">
              Owner Morteza Talebi is the person behind your fitting, your
              lenses, and that final adjustment that makes all the difference.
            </p>
            <HomeCopy name="story" />
            <Link className="text-link" href="/about-us/">
              Get to know us <ArrowUpRight size={18} />
            </Link>
            <div className="owner-signoff">
              <strong>Morteza Talebi</strong>
              <span>Owner & expert optician</span>
            </div>
          </div>
          <figure className="owner-photo">
            <Image
              src="/images/selected/originals/vintage-showroom.jpg"
              alt="Morteza Talebi smiling in his Optometric Cafe boutique"
              width={2400}
              height={1600}
              loading="lazy"
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <figcaption>
              Eyewear is personal. Your fitting should be, too.
            </figcaption>
          </figure>
        </div>
        <div className="boutique-film">
          <div>
            <p className="eyebrow">A little closer to the boutique</p>
            <h3>Step inside.</h3>
            <HomeCopy name="fittingLink" />
          </div>
          <HomeCopy name="video" />
        </div>
      </section>

      <section className="workshop-band">
        <div>
          <p className="eyebrow">Made personal, made here</p>
          <h2>
            Our workshop.
            <br />
            Your better everyday.
          </h2>
        </div>
        <div>
          <p>
            Complex prescriptions, progressive lenses, and the smallest
            adjustments deserve close attention. Our in-house lens workshop
            keeps that care right here, with your optician.
          </p>
          <Link className="text-link" href="/optometry-lab-beverly-hills/">
            Inside our optical workshop <ArrowUpRight size={18} />
          </Link>
          <HomeCopy name="workshop" />
          <p className="exam-note">
            Morteza makes and fits glasses. Eye exams are provided by an
            optometrist. Please call to confirm availability before your visit.
          </p>
        </div>
      </section>

      <section
        className="band specialist-section"
        aria-label="Specialist eyewear guidance"
      >
        <div className="specialist-intro">
          <div>
            <p className="eyebrow">More than a new pair</p>
            <HomeCopy name="craft" />
          </div>
          <HomeCopy name="complex" />
        </div>
        <div className="specialist-guides">
          {[
            [
              "01",
              "High-prescription glasses",
              "Thoughtful frame choices. Precise measurements. A fit made for your prescription.",
              "/high-prescription-glasses-beverly-hills/",
            ],
            [
              "02",
              "New lenses. Favorite frames.",
              "Find out whether your existing frames are suitable for replacement lenses.",
              "/replacement-lenses-existing-frames-beverly-hills/",
            ],
            [
              "03",
              "Progressives, personally fitted.",
              "Why frame fit and lens placement matter at every viewing distance.",
              "/progressive-glasses-beverly-hills/",
            ],
          ].map(([number, title, text, href]) => (
            <Link key={href} href={href} className="specialist-guide">
              <span>
                {number}
                <ArrowUpRight size={20} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="band reviews-section" id="reviews">
        <div className="section-head">
          <div>
            <p className="eyebrow">Kind words, real people</p>
            <h2>
              A neighborhood favorite.
              <br />
              For a reason.
            </h2>
          </div>
          <Link className="text-link" href="/featured-reviews/">
            Read more reviews <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="review-grid">
          {[reviews[0], reviews[5], reviews[6]].map((review) => (
            <article className="review-card" key={review.name}>
              <div className="review-stars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    size={15}
                    fill="currentColor"
                    key={i}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote>{review.quote}</blockquote>
              <div className="review-person">
                <span className="review-avatar" aria-hidden="true">
                  {review.name[0]}
                </span>
                <div>
                  <strong>{review.name}</strong>
                  <span>Google review</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <HomeCopy name="award" className="recognition-award" />
      </section>

      <section className="visit-banner">
        <div>
          <p className="eyebrow">Come find your next favorite pair</p>
          <h2>
            See you on
            <br />
            South Beverly Drive.
          </h2>
          <p>{business.address}</p>
          <HomeCopy name="invitation" />
          <div className="section-ctas">
            <TrackedLink
              className="button primary"
              href="/visit/#book"
              eventName="oc_appointment_click"
              ctaText="Book a Fitting"
              ctaType="home_visit"
            >
              Book a Fitting <ArrowUpRight size={18} />
            </TrackedLink>
            <TrackedLink
              className="text-link"
              href={business.mapsUrl}
              target="_blank"
              rel="noreferrer"
              eventName="oc_directions_click"
              ctaText="Get Directions"
              ctaType="home_visit"
            >
              Get directions <ArrowUpRight size={18} />
            </TrackedLink>
          </div>
        </div>
        <div className="visit-hours">
          <HomeCopy name="hours" />
          <TrackedLink
            className="text-link"
            href={business.phoneHref}
            eventName="oc_phone_click"
            ctaText="Home Hours Phone"
            ctaType="home_visit"
          >
            <Phone size={16} /> {business.phoneDisplay}
          </TrackedLink>
        </div>
      </section>
      <section className="home-map">
        <div className="neighborhood-intro">
          <HomeCopy name="visit" />
          <HomeCopy name="neighborhood" />
        </div>
        <GoogleMap />
        <BusinessLinks />
      </section>
    </main>
  );
}
