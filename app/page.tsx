import Image from "next/image";
import { breadcrumbSchema, business, reviews, services } from "@/app/data";
import { JsonLd } from "@/components/SiteChrome";
import { TrackedLink } from "@/components/TrackedLink";

export default function Home() {
  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }])} />
      <section className="atelier-hero reference-hero">
        <div className="reference-hero-grid">
          <div className="reference-copy">
            <p className="eyebrow">Family-owned Beverly Hills optical atelier</p>
            <h1>Modern eyewear, personally fitted.</h1>
            <p className="lead">
              Owner-led fittings by Morteza Talebi, in-house lens work, careful
              repairs, designer eyewear, children&apos;s glasses, and eye exams by
              appointment.
            </p>
            <div className="hero-ctas">
              <TrackedLink className="button primary" href="/visit#book" eventName="oc_appointment_click" ctaText="Book a Fitting" ctaType="primary">
                Book a Fitting
              </TrackedLink>
              <TrackedLink className="button secondary" href={business.phoneHref} eventName="oc_phone_click" ctaText="Call Now" ctaType="secondary">
                Call Now
              </TrackedLink>
              <TrackedLink className="button ghost" href="/services#eye-exams" eventName="oc_service_cta_click" ctaText="Eye Exams" ctaType="tertiary">
                Eye Exams
              </TrackedLink>
            </div>
          </div>

          <div className="reference-visual" aria-label="Optometric Cafe showroom">
            <div className="reference-photo">
              <Image
                src="/images/selected/modern/store-showroom-wide-modern.jpg"
                alt="Optometric Cafe Beverly Hills eyewear showroom"
                width={2400}
                height={1800}
                priority
              />
            </div>
            <div className="reference-thumb">
              <Image
                src="/images/selected/modern/vintage-showroom-modern.jpg"
                alt="Optometric Cafe Beverly Hills showroom details"
                width={900}
                height={600}
              />
            </div>
            <div className="reference-note">
              <strong>Since 2005</strong>
              <span>Fittings, repairs, lenses, and exams by appointment.</span>
            </div>
          </div>
        </div>

        <div className="hero-service-strip" aria-label="Popular visit reasons">
          <a href="/services#prescription-eyeglasses"><strong>Prescription glasses</strong><span>Everyday lenses, progressives, complex prescriptions.</span></a>
          <a href="/services#glasses-repair"><strong>Repairs and adjustments</strong><span>Fast practical help for frames and sunglasses.</span></a>
          <a href="/services#designer-eyewear"><strong>Designer eyewear</strong><span>Warm Beverly Hills style without a cold retail feel.</span></a>
        </div>
      </section>

      <section className="signal-strip" aria-label="Optometric Cafe strengths">
        <div><strong>01</strong><span>Owner-led eyewear fittings by Morteza Talebi.</span></div>
        <div><strong>02</strong><span>Not a doctor: Morteza is the owner and expert optician.</span></div>
        <div><strong>03</strong><span>Optometrist available by appointment for eye exams.</span></div>
        <div><strong>04</strong><span>In-house lab support for complex prescriptions and repairs.</span></div>
      </section>

      <section className="band cloud">
        <div className="split">
          <div>
            <p className="eyebrow">The shop point of view</p>
            <h2>Polished, useful, and unmistakably personal.</h2>
            <p className="lead">
              The site should feel like the shop: bright, personal, exacting, and a little unexpected. Every section is built around a real customer decision: fix what I own, fit what I wear, or check my vision.
            </p>
            <p className="note">
              The new launch should keep the live site&apos;s strong SEO content, but make the experience feel more like a Beverly Hills fitting appointment than a WordPress service directory.
            </p>
          </div>
          <div className="image-frame tall">
            <Image src="/images/selected/modern/family-portrait-modern.jpg" alt="Morteza Talebi and the Optometric Cafe family" width={2400} height={1800} />
          </div>
        </div>
      </section>

      <section className="band motion-band">
        <div className="section-head">
          <div>
            <p className="eyebrow">Inside the shop</p>
            <h2>Movement belongs in the details, not in the way.</h2>
          </div>
          <p>
            A tighter kinetic reel can bring the workshop, frames, and Beverly Hills shop texture into the page without making the hero fight for position.
          </p>
        </div>
        <div className="motion-reel" aria-label="Optometric Cafe shop imagery">
          <figure className="motion-item wide">
            <Image src="/images/selected/modern/store-frame-wall-modern.jpg" alt="Optometric Cafe showroom and sunglasses display" width={1200} height={516} />
          </figure>
          <figure className="motion-item">
            <Image src="/images/optometric-cafe-showroom-prescription-sunglasses-beverly-hills.jpg" alt="Optometric Cafe eyewear showroom display" width={1200} height={800} />
          </figure>
          <figure className="motion-item tall">
            <Image src="/images/selected/modern/vintage-showroom-modern.jpg" alt="Optometric Cafe Beverly Hills showroom details" width={1200} height={800} />
          </figure>
        </div>
      </section>

      <section className="band">
        <div className="section-head">
          <div>
            <p className="eyebrow">Services</p>
            <h2>Built around real visit needs.</h2>
          </div>
          <p>
            These are the prototype service pathways. The launch build should expand each high-value WordPress URL into a full page, not bury its SEO content.
          </p>
        </div>
        <div className="service-grid">
          {services.map((service, index) => (
            <a className="card service-card" href={`/services#${service.id}`} key={service.id}>
              <span className="number">0{index + 1}</span>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
            </a>
          ))}
        </div>
        <div className="section-ctas">
          <TrackedLink className="button primary" href="/services" eventName="oc_service_cta_click" ctaText="Explore Services" ctaType="services">
            Explore Services
          </TrackedLink>
        </div>
      </section>

      <section className="band black">
        <div className="atelier-grid">
          <div>
            <p className="eyebrow">In-house lens workshop</p>
            <h2>The workshop is the quiet advantage.</h2>
            <p className="lead">
              Lens choices, frame geometry, comfort, and repairs happen close to the fitting conversation. That is the useful story for complex prescriptions, progressives, sunglasses, and people who have been disappointed by chain-store shortcuts.
            </p>
            <div className="section-ctas">
              <TrackedLink className="button primary" href="/visit#book" eventName="oc_appointment_click" ctaText="Book a Workshop Fitting" ctaType="primary">
                Book a Fitting
              </TrackedLink>
              <TrackedLink className="button light" href="/services#glasses-repair" eventName="oc_service_cta_click" ctaText="Repair Services" ctaType="repair">
                Repair Services
              </TrackedLink>
            </div>
          </div>
          <div className="image-frame">
            <Image src="/images/selected/modern/store-frame-wall-modern.jpg" alt="Optometric Cafe eyewear frame wall" width={1350} height={1800} />
          </div>
        </div>
      </section>

      <section className="band" id="reviews">
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured reviews</p>
            <h2>Proof that feels specific.</h2>
          </div>
          <p>Real Google review excerpts should stay visible because they support trust, repair intent, and the owner-led fitting story.</p>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <article className="card review-card" key={review.name}>
              <div className="review-stars" aria-label="5 star review">★★★★★</div>
              <div className="review-name">{review.name}</div>
              <p>&ldquo;{review.quote}&rdquo;</p>
            </article>
          ))}
        </div>
        <div className="section-ctas">
          <TrackedLink className="button secondary" href="/visit" eventName="oc_review_click" ctaText="Visit After Reviews" ctaType="review">
            Visit the Shop
          </TrackedLink>
        </div>
      </section>
    </main>
  );
}
