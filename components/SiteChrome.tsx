import Image from "next/image";
import Link from "next/link";
import { business } from "@/app/data";
import { TrackedLink } from "@/components/TrackedLink";

const eyeglassesLinks = [
  ["Prescription Glasses", "/prescription-eyeglasses-beverly-hills"],
  ["Women's Glasses", "/womens-prescription-glasses-beverly-hills"],
  ["Men's Glasses", "/mens-prescription-eye-glasses-beverly-hills"],
  ["Children's Glasses", "/childrens-prescription-glasses-beverly-hills"],
  ["Sports Glasses", "/sports-eye-glasses-and-sunglasses"],
  ["Computer Glasses", "/computer-gaming-eye-glasses-beverly-hills"],
];

const sunglassesLinks = [
  ["Sunglasses", "/sunglasses-beverly-hills"],
  ["Women's Sunglasses", "/womens-sunglasses-beverly-hills"],
  ["Men's Sunglasses", "/mens-sunglasses-beverly-hills"],
  ["Children's Sunglasses", "/childrens-sunglasses-beverly-hills"],
  ["Prescription Sunglasses", "/prescription-sunglasses-vs-regular-sunglasses"],
];

const aboutLinks = [
  ["About Us", "/about-us"],
  ["Featured Reviews", "/featured-reviews"],
  ["Our Lab", "/optometry-lab-beverly-hills"],
  ["Blog", "/blog"],
];

function NavGroup({ label, links }: { label: string; links: string[][] }) {
  return (
    <details className="nav-group">
      <summary>{label}</summary>
      <div className="nav-panel">
        {links.map(([text, href]) => (
          <Link href={href} key={href}>{text}</Link>
        ))}
      </div>
    </details>
  );
}

function MobileSection({ label, links }: { label: string; links: string[][] }) {
  return (
    <div className="mobile-menu-section">
      <span>{label}</span>
      {links.map(([text, href]) => (
        <Link href={href} key={href}>{text}</Link>
      ))}
    </div>
  );
}

export function Header() {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Optometric Cafe home">
        <Image
          src="/images/original_optometric_cafe_logo.png"
          alt="Optometric Cafe"
          width={260}
          height={80}
          priority
        />
      </Link>
      <nav className="nav" aria-label="Primary navigation">
        <NavGroup label="Eyeglasses" links={eyeglassesLinks} />
        <NavGroup label="Sunglasses" links={sunglassesLinks} />
        <Link href="/contact-lenses-beverly-hills">Contact Lenses</Link>
        <Link href="/optometry-services-in-beverly-hills">Optometry</Link>
        <NavGroup label="About" links={aboutLinks} />
        <Link href="/contact-us">Contact</Link>
      </nav>
      <div className="actions">
        <TrackedLink
          className="button primary"
          href="/contact-us"
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
      <details className="mobile-menu">
        <summary aria-label="Open menu">
          <span />
          <span />
          <span />
        </summary>
        <div className="mobile-menu-panel">
          <Link href="/">Home</Link>
          <MobileSection label="Eyeglasses" links={eyeglassesLinks} />
          <MobileSection label="Sunglasses" links={sunglassesLinks} />
          <Link href="/contact-lenses-beverly-hills">Contact Lenses</Link>
          <Link href="/optometry-services-in-beverly-hills">Optometry</Link>
          <MobileSection label="About" links={aboutLinks} />
          <Link href="/contact-us">Contact</Link>
          <TrackedLink
            className="button primary"
            href="/contact-us"
            eventName="oc_appointment_click"
            ctaText="Mobile Book a Fitting"
            ctaType="primary"
          >
            Book a Fitting
          </TrackedLink>
          <TrackedLink
            className="button secondary"
            href={business.phoneHref}
            eventName="oc_phone_click"
            ctaText="Mobile Call Now"
            ctaType="secondary"
          >
            Call Now
          </TrackedLink>
        </div>
      </details>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>Optometric Cafe</strong>
        <p>Family-owned Beverly Hills eyewear boutique since 2005.</p>
      </div>
      <div className="footer-links">
        <TrackedLink
          href={business.phoneHref}
          eventName="oc_phone_click"
          ctaText="Footer Call"
          ctaType="phone"
        >
          {business.phoneDisplay}
        </TrackedLink>
        <TrackedLink
          href={business.emailHref}
          eventName="oc_email_click"
          ctaText="Footer Email"
          ctaType="email"
        >
          Email
        </TrackedLink>
        <TrackedLink
          href={business.mapsUrl}
          eventName="oc_directions_click"
          ctaText="Footer Directions"
          ctaType="directions"
          target="_blank"
          rel="noreferrer"
        >
          Directions
        </TrackedLink>
      </div>
    </footer>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
