# Content Preservation Runbook

This is a design/framework replacement, not a content rewrite. WordPress stays live and is a read-only source until a separately approved cutover.

## Snapshot and Import

1. `npm run content:capture -- --refresh` reads public, paginated WordPress REST lists, rendered pages, and all sitemap-index children. No credentials or WordPress mutations are used. Raw HTTP responses are cached in ignored `public/tmp/wordpress/`.
2. Review the diff in `data/wordpress-source.json`: original body HTML, metadata, dates, schema, footer, URL and response hash. Do not import a changed crawl blindly.
3. `npm run content:import` converts the saved source to `data/site-content.json`. It verifies visible-text equality, removes Divi styling/scripts, preserves semantic HTML, headings, anchor IDs, links and media. The first H1 moves into the page hero; extra H1s become H2s. On the approved homepage, 20 source fragments are integrated into the designed sections; the original eyewear/fittings wording forms the second line of the brand H1. The duplicate in-body logo is omitted. See `homepage-seo-integration.md`.
4. `npm run content:media` stores referenced images/video at their existing public WordPress upload paths and records byte sizes/SHA256. The source site is not needed to serve these assets after launch.
5. `npm test`, `npm run build`, then run the production server and `npm run test:migration`. Use `node scripts/check-migration-browser.mjs` for browser checks (install Playwright Chromium or set `CHROMIUM_PATH`).

`content:import` regenerates the media list; run `content:media` afterward to populate file hashes. Source snapshots contain only public material. Keep large scratch captures out of Git.

Cloudflare-protected email addresses are decoded to their original public address and working `mailto:` links during import. The retired `/cdn-cgi/l/email-protection` script is not a dependency of the Next.js site. Source-comparison tests apply the same decoding that the live browser performed.

## Preserved Surface

- 46 current published records: 20 pages (including homepage, blog index and an excluded draft) and all 26 posts.
- Exact visible body wording, original page titles/descriptions/canonicals, source dates, contextual links, FAQs, reviews, original award, NAP and hours.
- All 45 current sitemap URLs; blog pagination and noindex author archive remain navigable. Search works, including the old WordPress query entry point.
- Separate `/contact-us/` and `/featured-reviews/` pages. New `/visit/` and `/services/` supplement them, not replace them.
- Original media URLs, Open Graph images, and source BlogPosting/FAQ/CollectionPage/AboutPage/Service/Product semantics. See the explicit schema corrections below.

The old June `/reviews/` record is not resurrected: production already redirects it to `/featured-reviews/`. The archived June pack remains available; the current published review page is preserved in full.

## Structured Data

The original JSON-LD is archived per page in `data/wordpress-source.json`. No microdata blocks were present in the current crawl. `data/schema-corrections.json` records intentional changes:

- Reuse the current homepage `#business`, `#website`, and `#heroimage` identities; collapse competing business nodes.
- Keep Morteza an owner/expert optician, not an optometrist. Preserve optical service catalogs and service areas.
- Use owner-confirmed Saturday closing time 14:00, replacing older 15:00 values in schema and the contact page's visible hours. This factual correction is the only intentional body-wording change; the source remains archived. Use the Google listing marker rather than a map viewport center for coordinates.
- Use social profiles linked in the live footer. Discard empty/contradictory schema handles and internal pages incorrectly used as `sameAs`.
- Retain all visible reviews, but do not emit the old self-serving third-party review/aggregate-rating markup. Its count and paraphrased review bodies did not reliably represent the visible page. Google's [review snippet policy](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) excludes self-serving LocalBusiness review stars.
- Preserve existing BlogPosting dates/authorship and FAQ questions/answers. Add missing WebPage/ContactPage/breadcrumb nodes. Make SearchAction point to implemented search.

The legacy sunglasses Product description is retained without inventing a price; this category is not a single purchasable SKU. Review its rich-result eligibility before launch. Valid JSON/schema.org semantics do not guarantee Google rich results; run Google's Rich Results Test and Schema.org Validator on final rendered pages.

## Measurement

One capture-phase delegated handler covers React links and preserved HTML. It follows the existing October 5 contract: actual telephone destination means `oc_phone_click`, email means `oc_email_click`, maps mean `oc_directions_click`, contact/visit navigation means `oc_contact_click`, and service/review navigation uses the existing corresponding events. A click is not a completed appointment.

Fields: `cta_type`, `cta_text`, `link_url`, `destination_path`, `page_path`, `service_interest`, `link_placement`, `measurement_version=2026-10-05`. Query/hash content is stripped from event URLs. The existing GTM container remains unchanged. No extra manual page_view event was introduced; validate exactly one pageview per SPA navigation with Analytics before cutover. Browser QA blocks GTM/GA network requests.

## Cutover Gates

- Obtain and approve the analytics agent's six-month report, URL must-keep list, rankings/landing-page baseline and current redirect inventory.
- Re-capture content immediately before launch; compare any intervening WordPress edits and import without rewriting them.
- Check current plugin/database/CDN rules beyond the recovered exports. See `docs/redirect-map.md`.
- Resolve the existing dependency audit findings recorded in `docs/visual-refresh.md`; this content pass is not security clearance.
- Run production HTTP, source-preservation, mobile/browser, schema and GTM/GA4 checks. Verify calls, email, map, profiles and appointments with the owner.
- Keep previews protected/noindex using Vercel deployment protection; production must be indexable and canonical to the apex domain. Verify host redirects, cache behavior, images and search after deployment.
- Keep a production backup/rollback path. Make no DNS change, sitemap submission or indexing request until Emilio approves cutover.
- Monitor GSC/GA4 and 404s immediately afterward, then weekly. Content preservation reduces migration risk; it cannot guarantee unchanged rankings.
