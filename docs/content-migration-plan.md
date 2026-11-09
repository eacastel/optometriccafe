# Content Preservation Runbook

This is a design/framework replacement, not a content rewrite. WordPress stays live and is a read-only source until a separately approved cutover.

## Snapshot and Import

For a release delta, capture separately instead of replacing the approved source:

```sh
npm run content:capture -- --refresh --cache=public/tmp/release-source/wordpress --output=public/tmp/release-source/wordpress-source.json
npm run content:compare -- --candidate=public/tmp/release-source/wordpress-source.json
```

Comparison exits nonzero for additions, removals, changed copy/headings/anchors/links/media/metadata/schema, sitemap changes, or verification/GUID changes. Layout-only attributes and rotating Cloudflare email encoding are ignored. Empty or incomplete records fail closed. Never run `content:import` merely to clear a failed comparison; review and reconcile the actual changes first. `data/site-identity.json` retains the public Google verification token and original RSS GUIDs separately from the older source snapshot. Capture timestamps and full file hashes are recorded in `docs/source-delta-verification.json`.

1. `npm run content:capture -- --refresh` reads public, paginated WordPress REST lists, rendered pages, and all sitemap-index children. No credentials or WordPress mutations are used. Raw HTTP responses are cached in ignored `public/tmp/wordpress/`.
2. Review the diff in `data/wordpress-source.json`: original body HTML, metadata, dates, schema, footer, URL and response hash. Do not import a changed crawl blindly.
3. `npm run content:import` converts the saved source to `data/site-content.json`. It verifies visible-text equality, removes Divi styling/scripts, preserves semantic HTML, headings, anchor IDs, links and media. The first H1 moves into the page hero; extra H1s become H2s. On the approved homepage, 20 source fragments are integrated into the designed sections; the original eyewear/fittings wording forms the second line of the brand H1. The duplicate in-body logo is omitted. See `homepage-seo-integration.md`.
4. `npm run content:media` stores referenced images/video at their existing public WordPress upload paths and records byte sizes/SHA256. The source site is not needed to serve these assets after launch.
5. `npm test`, `npm run build`, then run the production server and `TEST_BASE_URL=http://localhost:3000 npm run test:migration` plus `npm run test:integrity`. Run `python3 scripts/verify-analytics-matrix.py` against Analytics' original CSV (override `--matrix` when needed). Use `node scripts/check-migration-browser.mjs` for browser checks (install Playwright Chromium or set `CHROMIUM_PATH`). Set `TEST_BASE_URL` consistently; the original browser/migration scripts default to port 3001.

`content:import` regenerates the media list; run `content:media` afterward to populate file hashes. Source snapshots contain only public material. Keep large scratch captures out of Git.

Cloudflare-protected email addresses are decoded to their original public address and working `mailto:` links during import. The retired `/cdn-cgi/l/email-protection` script is not a dependency of the Next.js site. Source-comparison tests apply the same decoding that the live browser performed.

## Preserved Surface

- 46 current published records: 20 pages (including homepage, blog index and an excluded draft) and all 26 posts.
- Exact visible body wording, original page titles/descriptions/canonicals, source dates, contextual links, FAQs, reviews, original award, NAP and hours.
- All 45 current sitemap URLs; blog pagination and noindex author archive remain navigable. Search works, including the old WordPress query entry point.
- The original public Search Console verification tag, RSS discovery and `/feed/` subscription URL. The full-text feed includes all 26 articles and retains each original opaque GUID, including historical www/staging identifiers. These are identifiers, not navigation destinations; links point to current canonical articles. No old comment or WordPress API functionality is invented.
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
- Recheck dependencies on the exact final lockfile. November 9: upgraded to Next.js 16.4.5, compatible transitive fixes applied, production npm audit reports zero vulnerabilities; see `dependency-audit-verification.json`. This is dependency-advisory clearance, not a full security assessment.
- Run production HTTP, source-preservation, mobile/browser, schema and GTM/GA4 checks. Verify calls, email, map, profiles and appointments with the owner.
- The owner requested a publicly accessible preview. All Vercel preview hosts retain the `X-Robots-Tag: noindex, nofollow, noarchive` header; production must be indexable and canonical to the apex domain. Verify host redirects, cache behavior, images and search after deployment.
- Keep a production backup/rollback path. Make no DNS change, sitemap submission or indexing request until Emilio approves cutover.
- Monitor GSC/GA4 and 404s immediately afterward, then weekly. Content preservation reduces migration risk; it cannot guarantee unchanged rankings.

## Rollback Preparation

No cutover or WordPress access is authorized by this runbook. Before approving launch:

1. The hosting owner must supply a fresh verified WordPress/files/database backup and full active redirect export. Existing June asset packs are not a current production backup. Record backup location, restore procedure and responsible operator without placing credentials or customer data in Git/Vercel.
2. Record current apex/www DNS values, proxy/CDN settings, TTLs and verification records in a private change record. Preserve MX, mail authentication, TXT and unrelated records. Do not remove or overwrite Search Console verification.
3. Freeze the candidate commit, lockfile hash, ready Vercel deployment ID and previous deployment. Attach the content delta, both HTTP audits, Analytics matrix, browser and blocked-collector evidence. Fresh imagery requires another asset/visual/performance check, not a content rewrite.
4. With explicit owner authorization, deploy/promote the tested candidate and change only approved web-domain records. Keep the old WordPress hosting intact and available for rollback. Check HTTPS/apex/www, indexability, canonicals, all preserved paths, assets, contacts and actual GA4 receipt immediately.
5. Roll back on material technical failures such as missing priority content, sustained 5xx, incorrect redirects/canonicals or production noindex. Restore the recorded web DNS/proxy routing to the intact old host; for Vercel-only code failures, restore the previous known-good deployment. Recheck public responses after caches/TTL propagation and record the incident. Do not destroy the old host or submit removal requests.

The same review alias can be reverted independently without touching production:

```sh
vercel alias set <previous-ready-preview-url> optometriccafe.vercel.app --scope emilio-castellanos-projects
```

DNS restoration and backup restoration have not been rehearsed or executed here. Production receipt, performance comparison, external schema validation, remaining historical rules and owner approval are still launch gates.
