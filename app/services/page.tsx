import type { Metadata } from "next";
import Image from "next/image";
import { breadcrumbSchema, business, services } from "@/app/data";
import { JsonLd } from "@/components/SiteChrome";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Prescription eyeglasses, designer eyewear, glasses repair, prescription sunglasses, children's glasses, eye exams, and in-house lens work in Beverly Hills.",
};

const details = [
  {
    id: "glasses-repair",
    meta: "Repair / adjustment",
    title: "Glasses repair and adjustments",
    body: "Small hardware issues, loose hinges, alignment problems, nose pads, cleaning, and honest triage for scratches or damage. Many visitors come in with an urgent sunglasses or frame problem and leave with a practical fix.",
  },
  {
    id: "prescription-eyeglasses",
    meta: "Prescription / fit",
    title: "Prescription eyeglasses",
    body: "Single vision, progressives, high prescriptions, and everyday lenses are fit around the way the frame sits on your face. The goal is wearable clarity, not a rushed transaction.",
  },
  {
    id: "designer-eyewear",
    meta: "Selection / style",
    title: "Designer eyewear",
    body: "Frames are selected for shape, material, finish, and fit. The boutique point of view is polished Beverly Hills eyewear with warmth and restraint.",
  },
  {
    id: "prescription-sunglasses",
    meta: "Sunwear / lens craft",
    title: "Prescription sunglasses",
    body: "Sunwear can be made with prescription lenses for driving, travel, outdoor comfort, and daily use. Lens color, protection, and frame fit are considered together.",
  },
  {
    id: "childrens-glasses",
    meta: "Kids / durability",
    title: "Children's glasses",
    body: "Kids need frames that fit securely, survive daily wear, and feel good enough to keep on. The fitting is patient and practical.",
  },
  {
    id: "eye-exams",
    meta: "Optometrist / appointment",
    title: "Eye exams by appointment",
    body: "An optometrist is available by appointment for eye exams and prescriptions. Morteza Talebi is the owner and expert optician who makes and fits glasses; he is not a doctor.",
  },
] as const;

export default function ServicesPage() {
  return (
    <main id="main-content">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <section className="page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="eyebrow">Personal attention, from start to finish</p>
            <h1>
              Optical services.
              <br />
              Made personal.
            </h1>
            <p className="lead">
              Repairs, prescription glasses, designer frames, sunglasses,
              children&apos;s eyewear, in-house lens work, and optometrist
              appointments all connect back to the same promise: glasses that
              fit your life.
            </p>
            <div className="hero-ctas">
              <TrackedLink
                className="button primary"
                href="/visit#book"
                eventName="oc_appointment_click"
                ctaText="Book a Fitting"
                ctaType="primary"
              >
                Book a Fitting
              </TrackedLink>
              <TrackedLink
                className="button secondary"
                href={business.phoneHref}
                eventName="oc_phone_click"
                ctaText="Call Now"
                ctaType="secondary"
              >
                Call Now
              </TrackedLink>
            </div>
          </div>
          <div className="page-hero-media">
            <Image
              src="/images/selected/originals/store-fitting-room.jpg"
              alt="Eyewear displays inside the Optometric Cafe boutique"
              width={2400}
              height={1800}
              sizes="(max-width: 760px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="band cloud">
        <div className="quick-grid">
          {services.map((service) => (
            <a className="card" href={`#${service.id}`} key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="section-head">
          <div>
            <p className="eyebrow">How can we help?</p>
            <h2>
              Your glasses.
              <br />
              Our full attention.
            </h2>
          </div>
          <p>
            From a small adjustment to a complex prescription, start with a
            conversation with your optician.
          </p>
        </div>
        <div className="workflow">
          {details.map((detail) => (
            <article className="service-detail" id={detail.id} key={detail.id}>
              <div>
                <span className="detail-meta">{detail.meta}</span>
                <h3>{detail.title}</h3>
              </div>
              <div>
                <p>{detail.body}</p>
                <TrackedLink
                  className="button secondary"
                  href="/visit#book"
                  eventName="oc_service_cta_click"
                  ctaText={`Book for ${detail.title}`}
                  ctaType={detail.id}
                >
                  Book a Fitting
                </TrackedLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="band stone">
        <div className="split">
          <div>
            <p className="eyebrow">Workshop advantage</p>
            <h2>For complex prescriptions, the details are the product.</h2>
            <p className="lead">
              Lens height, frame wrap, bridge feel, temple pressure, and reading
              zones are handled with a hands-on process. Morteza personally
              guides the measurements, lens choices, and final fit.
            </p>
            <div className="section-ctas">
              <TrackedLink
                className="button primary"
                href="/visit#book"
                eventName="oc_appointment_click"
                ctaText="Book a Lens Workshop Fitting"
                ctaType="primary"
              >
                Book a Fitting
              </TrackedLink>
              <TrackedLink
                className="button secondary"
                href="/services#eye-exams"
                eventName="oc_service_cta_click"
                ctaText="Eye Exams"
                ctaType="tertiary"
              >
                Eye Exams
              </TrackedLink>
            </div>
          </div>
          <div className="image-frame">
            <Image
              src="/images/selected/originals/vintage-showroom.jpg"
              alt="Morteza Talebi, owner and expert optician at Optometric Cafe"
              width={2400}
              height={1600}
              loading="eager"
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
