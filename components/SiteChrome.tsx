import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { business } from "@/app/data";
import { Navigation } from "@/components/Navigation";
import { TrackedLink } from "@/components/TrackedLink";
import { BusinessLinks } from "@/components/BusinessLinks";

export function Header() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="location-bar">
        <span>Family-owned. Personally fitted. Since 2005.</span>
        <TrackedLink
          href={business.mapsUrl}
          target="_blank"
          rel="noreferrer"
          eventName="oc_directions_click"
          ctaText="Header Address"
          ctaType="header"
        >
          277 South Beverly Dr.{" "}
          <span className="location-city">Beverly Hills, CA</span>
          <ArrowUpRight size={12} />
        </TrackedLink>
      </div>
      <Navigation />
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" aria-label="Optometric Cafe home">
            <Image
              src="/images/original_optometric_cafe_logo.png"
              alt="Optometric Cafe"
              width={260}
              height={80}
              loading="eager"
            />
          </Link>
          <p>
            Independent eyewear.
            <br />
            Individual attention.
            <br />
            Beverly Hills, since 2005.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/prescription-eyeglasses-beverly-hills/">
            Prescription eyeglasses
          </Link>
          <Link href="/sunglasses-beverly-hills/">Designer sunglasses</Link>
          <Link href="/childrens-prescription-glasses-beverly-hills/">
            Children&apos;s eyewear
          </Link>
          <Link href="/glasses-repair-adjustment-beverly-hills/">
            Glasses repairs
          </Link>
        </div>
        <div>
          <h2>Our boutique</h2>
          <Link href="/about-us/">Meet the family</Link>
          <Link href="/optometry-lab-beverly-hills/">In-house workshop</Link>
          <Link href="/featured-reviews/">Featured reviews</Link>
          <Link href="/optometry-services-in-beverly-hills/">Eye exams</Link>
          <Link href="/blog/">Journal & guides</Link>
        </div>
        <div>
          <h2>Come say hello</h2>
          <p>
            277 South Beverly Dr.
            <br />
            Beverly Hills, CA 90212
          </p>
          <TrackedLink
            href={business.phoneHref}
            eventName="oc_phone_click"
            ctaText="Footer Phone"
            ctaType="footer"
          >
            {business.phoneDisplay}
          </TrackedLink>
          <TrackedLink
            href={business.emailHref}
            eventName="oc_email_click"
            ctaText="Footer Email"
            ctaType="footer"
          >
            {business.email}
          </TrackedLink>
          <Link className="text-link" href="/visit/">
            Plan your visit <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          &copy; {new Date().getFullYear()} Optometric Cafe. All rights
          reserved.
        </span>
        <span>Made personal in Beverly Hills.</span>
      </div>
      <BusinessLinks />
    </footer>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
