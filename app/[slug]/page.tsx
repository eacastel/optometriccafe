import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { business } from "@/app/data";
import { JsonLd } from "@/components/SiteChrome";
import { TrackedLink } from "@/components/TrackedLink";
import { BusinessLinks } from "@/components/BusinessLinks";
import { BlogIndex } from "@/components/BlogIndex";
import { ContentBody } from "@/components/ContentBody";
import { OpticalNextSteps } from "@/components/OpticalNextSteps";
import { BoutiqueStoryPhotos } from "@/components/BoutiqueStoryPhotos";
import { ReviewProfiles } from "@/components/ReviewProfiles";
import photography from "@/data/new-photography.json";
import { FrameCollection } from "@/components/FrameCollection";
import { items, findItem, contentMetadata, dateLabel } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return items.filter((item) => item.slug).map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = findItem((await params).slug);
  return item ? contentMetadata(item) : {};
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = findItem((await params).slug);
  if (!item) notFound();
  const schema = (
    <JsonLd
      data={{ "@context": "https://schema.org", "@graph": item.schemas }}
    />
  );
  if (item.slug === "blog")
    return (
      <>
        {schema}
        <BlogIndex />
      </>
    );
  return (
    <main id="main-content">
      {schema}
      <section className="content-hero">
        <p className="eyebrow">
          {item.type === "post" ? (
            <Link href="/blog/">Journal &amp; guides</Link>
          ) : (
            "Optometric Cafe"
          )}
        </p>
        <h1 data-preserved-heading>{item.heading}</h1>
        {item.type === "post" && (
          <p className="article-byline">
            <time dateTime={item.date}>{dateLabel(item.date)}</time>
            {item.author && (
              <>
                {" "}
                · By{" "}
                <Link href={`/author/${item.author.slug}/`}>
                  {item.author.name}
                </Link>
              </>
            )}
          </p>
        )}
        {item.description && <p className="lead">{item.description}</p>}
        <div className="hero-ctas">
          <TrackedLink
            className="button primary"
            href="/visit/#book"
            eventName="oc_appointment_click"
            ctaText="Book a Fitting"
            ctaType="content_page"
          >
            Book a Fitting
          </TrackedLink>
          <TrackedLink
            className="button secondary"
            href={business.phoneHref}
            eventName="oc_phone_click"
            ctaText="Call Now"
            ctaType="content_page"
          >
            Call Now
          </TrackedLink>
        </div>
      </section>
      {item.featuredImage && (
        <div className="content-featured-image">
          <Image
            src={item.featuredImage}
            alt={item.featuredImageAlt}
            width={1200}
            height={800}
            loading="eager"
            sizes="(max-width: 1000px) 100vw, 950px"
          />
        </div>
      )}
      {item.slug === "featured-reviews" && <ReviewProfiles />}
      <ContentBody
        html={item.content}
        photoLayout={item.slug === "optometry-lab-beverly-hills" ? "workshop" : item.slug === "contact-lenses-beverly-hills" ? "contact-lenses" : undefined}
        reviews={item.slug === "featured-reviews"}
        imageOverride={item.slug === "sports-eye-glasses-and-sunglasses" ? { original: "/wp-content/uploads/2019/01/sports-glasses2.jpg", ...photography.cycling } : undefined}
      />
      <OpticalNextSteps slug={item.slug} />
      {item.slug === "prescription-eyeglasses-beverly-hills" && <FrameCollection category="optical" />}
      {item.slug === "sunglasses-beverly-hills" && <FrameCollection category="sun" />}
      {item.slug === "about-us" && <BoutiqueStoryPhotos />}
      {["contact-us", "featured-reviews"].includes(item.slug) && (
        <section className="content-shell profile-section">
          <BusinessLinks />
        </section>
      )}
    </main>
  );
}
