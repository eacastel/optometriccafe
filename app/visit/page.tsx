import type { Metadata } from "next";
import Image from "next/image";
import { breadcrumbSchema, business, hours } from "@/app/data";
import { JsonLd } from "@/components/SiteChrome";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Visit & Contact",
  description:
    "Visit Optometric Cafe at 277 South Beverly Dr. in Beverly Hills. Call 310-888-2848 to book a fitting or ask about eye exams by appointment.",
};

export default function VisitPage() {
  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Visit", path: "/visit" }])} />
      <section className="page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="eyebrow">South Beverly Drive</p>
            <h1>Plan a fitting, repair, or eye exam visit.</h1>
            <p className="lead">
              Call ahead for the smoothest visit. Morteza leads eyewear fittings and optical work; optometrist appointments are available for eye exams and prescriptions.
            </p>
            <div className="hero-ctas">
              <TrackedLink className="button primary" href={business.phoneHref} eventName="oc_appointment_click" ctaText="Book a Fitting" ctaType="primary">
                Book a Fitting
              </TrackedLink>
              <TrackedLink className="button secondary" href={business.phoneHref} eventName="oc_phone_click" ctaText="Call Now" ctaType="secondary">
                Call Now
              </TrackedLink>
              <TrackedLink className="button ghost" href={business.emailHref} eventName="oc_email_click" ctaText="Email" ctaType="email">
                Email
              </TrackedLink>
            </div>
          </div>
          <div className="page-hero-media">
            <Image src="/images/selected/modern/store-showroom-wide-modern.jpg" alt="Optometric Cafe showroom on South Beverly Drive" width={2400} height={1800} priority />
          </div>
        </div>
      </section>

      <section className="band cloud" id="book">
        <div className="visit-grid">
          <div className="card contact-card">
            <div className="contact-row"><span>Address</span><strong>{business.address}</strong></div>
            <div className="contact-row">
              <span>Phone</span>
              <TrackedLink href={business.phoneHref} eventName="oc_phone_click" ctaText="Contact Phone" ctaType="phone">{business.phoneDisplay}</TrackedLink>
            </div>
            <div className="contact-row">
              <span>Email</span>
              <TrackedLink href={business.emailHref} eventName="oc_email_click" ctaText="Contact Email" ctaType="email">{business.email}</TrackedLink>
            </div>
            <div className="contact-row"><span>Best for</span><strong>Fittings, repairs, prescription glasses, sunglasses, and eye exams by appointment.</strong></div>
          </div>

          <div className="card contact-card">
            <h2>Hours</h2>
            <ul className="hours-list">
              {hours.map(([day, time]) => (
                <li key={day}><strong>{day}</strong><span>{time}</span></li>
              ))}
            </ul>
            <div className="section-ctas">
              <TrackedLink className="button primary" href={business.phoneHref} eventName="oc_appointment_click" ctaText="Book a Fitting From Hours" ctaType="primary">Book a Fitting</TrackedLink>
              <TrackedLink className="button secondary" href={business.mapsUrl} eventName="oc_directions_click" ctaText="Get Directions" ctaType="directions" target="_blank" rel="noreferrer">Get Directions</TrackedLink>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="split reverse">
          <div className="map-panel">
            <Image src="/images/selected/modern/vintage-showroom-modern.jpg" alt="Optometric Cafe Beverly Hills showroom" width={2400} height={1600} />
            <div>
              <h3>South Beverly Drive</h3>
              <p>277 South Beverly Dr., Beverly Hills, CA 90212</p>
              <TrackedLink className="button light" href={business.mapsUrl} eventName="oc_directions_click" ctaText="Directions Panel" ctaType="directions" target="_blank" rel="noreferrer">Open Directions</TrackedLink>
            </div>
          </div>
          <div>
            <p className="eyebrow">What to bring</p>
            <h2>Make the visit useful from the first minute.</h2>
            <p className="lead">
              Bring your current glasses, your prescription if available, and any frames that need repair or adjustment. For eye exams, call first so the optometrist appointment can be scheduled properly.
            </p>
            <p className="note">
              The contact page should become a strong local SEO page at launch with parking, nearby neighborhoods, appointment FAQs, and visible NAP/schema details.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
