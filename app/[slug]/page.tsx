import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import content from "@/data/site-content.json";
import { breadcrumbSchema, business } from "@/app/data";
import { JsonLd } from "@/components/SiteChrome";
import { TrackedLink } from "@/components/TrackedLink";

type ContentItem = {
  id: number;
  type: "page" | "post";
  slug: string;
  title: string;
  description: string;
  date: string;
  modified: string;
  content: string;
  plainText: string;
};

const items = content as ContentItem[];
const posts = items.filter((item) => item.type === "post");

function findItem(slug: string) {
  return items.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = findItem(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description || item.plainText.slice(0, 155),
    alternates: {
      canonical: `${business.url}/${item.slug}/`,
    },
  };
}


function imageForItem(item: ContentItem) {
  const slug = item.slug;
  if (slug.includes("lab")) return ["/images/selected/modern/store-frame-wall-modern.jpg", "Optometric Cafe eyewear frame wall"] as const;
  if (slug.includes("about") || slug.includes("family")) return ["/images/selected/modern/family-portrait-modern.jpg", "Optometric Cafe family-owned eyewear boutique"] as const;
  if (slug.includes("review")) return ["/images/optometric-cafe-reviews.jpg", "Optometric Cafe featured reviews"] as const;
  if (slug.includes("sunglass") || slug.includes("eyewear") || slug.includes("frame")) return ["/images/selected/modern/store-frame-wall-modern.jpg", "Designer eyewear at Optometric Cafe"] as const;
  if (slug.includes("contact") || slug.includes("beverly-hills")) return ["/images/selected/modern/store-showroom-wide-modern.jpg", "Optometric Cafe Beverly Hills showroom"] as const;
  return ["/images/selected/modern/store-showroom-wide-modern.jpg", "Optometric Cafe Beverly Hills showroom"] as const;
}

function BlogIndex() {
  return (
    <main>
      <section className="content-hero">
        <p className="eyebrow">Optometric Cafe blog</p>
        <h1>Blog</h1>
        <p className="lead">Articles and guides from the current Optometric Cafe website, preserved from the WordPress export.</p>
      </section>
      <section className="content-shell blog-list">
        {posts.map((post) => (
          <article className="content-card" key={post.slug}>
            <p className="content-type">Article</p>
            <h2><Link href={`/${post.slug}`}>{post.title}</Link></h2>
            <p>{post.description || post.plainText.slice(0, 180)}</p>
            <Link className="content-button" href={`/${post.slug}`}>Read article</Link>
          </article>
        ))}
      </section>
    </main>
  );
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findItem(slug);
  if (!item) notFound();

  if (item.slug === "blog") {
    return <BlogIndex />;
  }

  const [imageSrc, imageAlt] = imageForItem(item);

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: item.title, path: `/${item.slug}` },
        ])}
      />
      <section className="content-hero">
        <p className="eyebrow">{item.type === "post" ? "Article" : "Optometric Cafe"}</p>
        <h1>{item.title}</h1>
        {item.description ? <p className="lead">{item.description}</p> : null}
        <div className="hero-ctas">
          <TrackedLink className="button primary" href="/visit#book" eventName="oc_appointment_click" ctaText="Book a Fitting" ctaType="content_page">
            Book a Fitting
          </TrackedLink>
          <TrackedLink className="button secondary" href={business.phoneHref} eventName="oc_phone_click" ctaText="Call Now" ctaType="content_page">
            Call Now
          </TrackedLink>
        </div>
      </section>
      <section className="content-featured-image">
        <img src={imageSrc} alt={imageAlt} />
      </section>
      <article className="content-shell wp-content" dangerouslySetInnerHTML={{ __html: item.content }} />
    </main>
  );
}
