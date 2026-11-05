import type { Metadata } from "next";
import Image from "next/image";
import { breadcrumbSchema, business, hours } from "@/app/data";
import { JsonLd } from "@/components/SiteChrome";
import { TrackedLink } from "@/components/TrackedLink";
import { BusinessLinks } from "@/components/BusinessLinks";

export const metadata: Metadata = {
  alternates: { canonical: "https://optometriccafe.com/visit/" },
  title: "Visit & Contact",
  description:
    "Visit Optometric Cafe at 277 South Beverly Dr. in Beverly Hills. Call 310-888-2848 to book a fitting or ask about eye exams by appointment.",
};

export default function VisitPage() {
  return (
    <main id="main-content">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Visit", path: "/visit/" },
        ])}
      />
      <section className="page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="eyebrow">South Beverly Drive</p>
            <h1>Visit Optometric Cafe.</h1>
            <p className="lead">
              Call ahead for the smoothest visit. Morteza leads eyewear fittings
              and optical work; optometrist appointments are available for eye
              exams and prescriptions.
            </p>
            <div className="hero-ctas">
              <TrackedLink
                className="button primary"
                href={business.phoneHref}
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
              <TrackedLink
                className="button ghost"
                href={business.emailHref}
                eventName="oc_email_click"
                ctaText="Email"
                ctaType="email"
              >
                Email
              </TrackedLink>
            </div>
          </div>
          <div className="page-hero-media">
            <Image
              src="/images/selected/originals/store-fitting-room.jpg"
              alt="The Optometric Cafe boutique on South Beverly Drive"
              width={2400}
              height={1800}
              sizes="(max-width: 760px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="band cloud" id="book">
        <div className="visit-grid">
          <div className="card contact-card">
            <div className="contact-row">
              <span>Address</span>
              <strong>{business.address}</strong>
            </div>
            <div className="contact-row">
              <span>Phone</span>
              <TrackedLink
                href={business.phoneHref}
                eventName="oc_phone_click"
                ctaText="Contact Phone"
                ctaType="phone"
              >
                {business.phoneDisplay}
              </TrackedLink>
            </div>
            <div className="contact-row">
              <span>Email</span>
              <TrackedLink
                href={business.emailHref}
                eventName="oc_email_click"
                ctaText="Contact Email"
                ctaType="email"
              >
                {business.email}
              </TrackedLink>
            </div>
            <div className="contact-row">
              <span>Best for</span>
              <strong>
                Fittings, repairs, prescription glasses, sunglasses, and eye
                exams by appointment.
              </strong>
            </div>
          </div>

          <div className="card contact-card">
            <h2>Hours</h2>
            <ul className="hours-list">
              {hours.map(([day, time]) => (
                <li key={day}>
                  <strong>{day}</strong>
                  <span>{time}</span>
                </li>
              ))}
            </ul>
            <div className="section-ctas">
              <TrackedLink
                className="button primary"
                href={business.phoneHref}
                eventName="oc_appointment_click"
                ctaText="Book a Fitting From Hours"
                ctaType="primary"
              >
                Book a Fitting
              </TrackedLink>
              <TrackedLink
                className="button secondary"
                href={business.mapsUrl}
                eventName="oc_directions_click"
                ctaText="Get Directions"
                ctaType="directions"
                target="_blank"
                rel="noreferrer"
              >
                Get Directions
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="split reverse">
          <div className="map-panel">
            <iframe
              title="Optometric Cafe at 277 South Beverly Drive, Beverly Hills"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6610.551982048929!2d-118.40184858737193!3d34.06243867304126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bbfb81f19c99%3A0xa9d4f7be050d7f74!2sOptometric%20Cafe!5e0!3m2!1sen!2sus!4v1755187937456!5m2!1sen!2sus"
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div>
            <p className="eyebrow">What to bring</p>
            <h2>Make the visit useful from the first minute.</h2>
            <p className="lead">
              Bring your current glasses, your prescription if available, and
              any frames that need repair or adjustment. For eye exams, call
              first so the optometrist appointment can be scheduled properly.
            </p>
            <p className="note">
              Eye exams are provided by an optometrist, by appointment. Morteza
              is the owner and expert optician who makes and fits your glasses.
            </p>
          </div>
        </div>
      </section>
      <section className="content-shell profile-section">
        <BusinessLinks />
      </section>
    </main>
  );
}
