# Content Preservation Audit

## November 9 Recheck

Read-only fresh capture matches the November 5 approved source: 46 records, 26 posts, 45 source sitemap URLs, no content/metadata/schema/link/media changes. The approved homepage design and explicit owner-requested removal of its video/fitting link remain unchanged. Source hashes and field-level comparison are in `source-delta-verification.json`.

Closed omissions: preserved the live public Google Search Console verification tag; restored `/feed/` with full article bodies and original opaque GUIDs; corrected inherited homepage Open Graph URLs on blog pagination and author archives. AMP path/query cleanup now retains the source server's case-insensitive behavior without dropping unrelated UTMs/gclid.

Candidate production evidence:

- 66 automated tests, successful Next.js 16.4.5 build with 57 generated routes.
- `migration-http-verification.json`: all 46 original records, 165 redirect variants, 47 sitemap URLs and 76 legacy media URLs pass; real 404 and search checks pass.
- `content-integrity-verification.json`: 51 page routes, 26 discoverable posts across three blog pages, 59 anchor targets, 255 referenced asset URLs, resolved JSON-LD identities, correct per-page social URLs, full-text RSS, verification tag and private export exclusions pass.
- `analytics-matrix-verification.json`: all 81 candidate-testable rows in Analytics' original 84-row matrix pass. Three production HTTP/www host cases remain explicitly pending.
- `dependency-audit-verification.json`: production npm advisory count reduced from six (including critical Next.js) to zero. A full-tree audit request returned a registry endpoint error; do not infer full security clearance from the production result. Next.js [16.4.5 release notes](https://github.com/vercel/next.js/releases/tag/v16.4.5) confirm the security release.

The raw fresh source remains in ignored local scratch; the approved snapshot is not overwritten. No WordPress, DNS, Google-account, indexing or production-domain changes were made. Future edits before cutover still require a new source delta. See the updated preservation runbook for rollback prerequisites and remaining gates.

## Historical Acceptance

Status: implemented and independently checked locally; **not launched**. Final launch sign-off and the cutover gates in `content-migration-plan.md` remain outstanding.

November 6 homepage refinement: integrated the original source into 20 design fragments, retained the approved editorial copy and imagery, strengthened the H1's local eyewear/fittings relevance, linked repairs directly, and added prominent links to all three specialist guides. The current build and 52 preservation tests pass; refreshed HTTP evidence validates every original homepage fragment exactly once, in addition to the existing page/redirect/media coverage. See `homepage-seo-integration.md`. The November 5 independent acceptance below applies to that earlier candidate, not a new independent sign-off on this layout change.

Local production acceptance: build passes (56 generated routes), all 51 preservation tests pass, and the HTTP audit passes for 46 records, 72 redirect variants, 48 internal targets, 47 sitemap URLs, all 76 legacy media URLs, search and genuine 404s. Browser evidence covers all 46 imported pages at 390px and 1440px, plus 320/768/1024px homepage/header checks and single-fire click tracking. This is not production GA4 collector or ranking verification.

Analytics supplied its independent handoff at `../analytics/2026-11-05-optometric-premigration/OPTOMETRIC-HANDOFF.txt`. Its November 5 local production HTTP review confirmed all 46 records return 200 with single correct canonicals and matching source titles/descriptions, plus 30 local legacy path/query variants, sitemap endpoints, draft noindex and real 404 behavior. Host-level redirects and production measurement remain outside that local acceptance.

The final independent 18:07 UTC recheck also passed all 60 observed legacy image paths (including 12 archive thumbnails) and both repaired contextual-link aliases. The full local media manifest covers 76 paths including additional schema/footer assets.

## Evidence

- `data/wordpress-source.json`: public live HTML/content/metadata/schema capture, including the October SEO updates missing from June's export.
- `data/migration-inventory.json`: 46 current published records, 26 posts, 45 indexable sitemap URLs. Published draft remains noindex.
- `data/redirects.json` and `proxy.ts`: retained aliases, one-hop 301 normalization and recovered server patterns.
- `data/wordpress-media.json`: 76 local assets retaining original upload URLs and verified hashes, including original blog/archive thumbnails and responsive image variants.
- `data/schema-corrections.json`: explicit fixes for conflicting business identities, hours, coordinates, social handles and review markup. Original schema is preserved in the source snapshot.
- `tests/preservation.test.mjs`: checks every source record's wording, headings, contextual links, title, description, canonical, dates, FAQ/BlogPosting data and media integrity.
- `docs/migration-http-verification.json` and `docs/migration-browser-verification.json`: generated acceptance results from the local production build.

## Boundaries

The source WordPress server, DNS, Google accounts and GTM configuration were not modified. Existing `docs/analytics/` evidence and the user's README changes were not edited. The analytics agent independently recovered additional read-only production evidence and is preparing the launch report.

The redesigned homepage hero and sections remain. As of November 6, original homepage wording, contextual guide links, award and video are integrated into the relevant designed sections instead of appended as a duplicate homepage. Every source fragment is verified exactly once in rendered HTML; see `homepage-seo-integration.md`. The Google map and original social profiles are available on the new site; Google links target the actual business listing, not a generic address search.

Additional issues caught by runtime crawling: decoded old Cloudflare email-protection links into working email links, repaired two pre-existing 404 contextual service links, and aligned the contact page's old Saturday 3 p.m. closing with the owner-confirmed 2 p.m. hours. These changes are explicit exceptions to byte-for-byte markup preservation, not copy rewrites.

Do not interpret passing local tests as launch approval. Current database/plugin/CDN redirect completeness, final source delta, security updates, external rich-result validation and production measurement acceptance remain explicit launch gates.
