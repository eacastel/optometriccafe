# Optometric Cafe Content Migration Plan

The three-screen prototype establishes the visual system and primary conversion paths. The launch build should then import the live WordPress content so the new site replaces the current site without losing local SEO coverage.

## Launch Principle

Preserve high-value URLs as full Next.js pages wherever the existing page already ranks, receives impressions, has backlinks, or covers a distinct search intent. Redirect only duplicate, obsolete, or intentionally consolidated URLs.

## Content To Bring Forward

Core service pages:

- Glasses repair and adjustment in Beverly Hills
- Prescription eyeglasses in Beverly Hills
- Designer eyewear in Beverly Hills
- Prescription sunglasses
- Children's prescription glasses
- Eye exams and optometry services
- Contact lenses if still offered and present in the current sitemap
- Optometry lab / in-house lens workshop

Trust and local pages:

- Featured reviews
- About / Beverly Hills eyewear boutique
- Contact / visit
- Family-owned story
- Owner-led fitting story for Morteza Talebi, with clear language that he is the owner and expert optician, not a doctor

Article or supporting pages:

- Eye exam Beverly Hills: what to expect
- Designer eyewear Beverly Hills: great fit
- Prescription sunglasses vs. regular sunglasses
- Kids prescription glasses: fit, durability, comfort
- Any indexed blog posts or service variants currently in Rank Math sitemap

## Implementation Shape

- Keep the 3 primary screens: `/`, `/services`, `/visit`.
- Add full content pages under the existing WordPress slugs when possible.
- Use shared page components for service detail pages so schema, CTAs, reviews, and NAP stay consistent.
- Add page-level `Service`, `Article`, `BreadcrumbList`, and visible review content where appropriate.
- Keep GTM event names consistent: `oc_phone_click`, `oc_email_click`, `oc_directions_click`, `oc_appointment_click`, `oc_review_click`, `oc_service_cta_click`.
- Generate `sitemap.xml` from the final page inventory, not only the three prototype routes.

## Pre-Launch Checklist

- Export current sitemap URL list.
- Export Search Console top pages and top queries.
- Export current WordPress Redirection plugin rules.
- Crawl the live site and record status, title, description, canonical, H1, schema type, and word count for each indexable URL.
- Import or rewrite all useful body content into Next.js pages.
- Decide preserve vs. 301 for every URL.
- Validate schema with rendered HTML.
- Verify GTM events in preview.
- Confirm forms, phone links, email links, and directions links.
- Submit new sitemap only after DNS points to Vercel and redirects are verified.
