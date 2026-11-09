# Analytics-Informed Website Implementation

November 9, 2026. Based on the November 5 migration brief and November 8 two-year report. The approved homepage layout remains unchanged; WordPress, DNS, Google account settings and the published GTM container are not modified.

## Implemented

- Navigation now leads with the optical workshop and repairs, exposes all three specialist guides, and links repairs directly to the established repair page. The footer uses that same repair destination.
- The services hub links each service to its retained full page and connects prescription needs to high-prescription, progressive and suitable-existing-frame lens guides. It is not a replacement for those pages.
- About and workshop pages have short, page-specific contextual next steps toward relevant optical services. The imported body copy is unchanged; no generic link grid is repeated across every article.
- Eye-exam wording in the custom pages and service summary calls for confirming optometrist availability. Morteza remains the owner/expert optician, not a doctor.
- Services and Visit now have their own Open Graph URL/title/description/images instead of inheriting homepage social metadata. Original WordPress page titles, descriptions and canonicals remain intact.
- Click labels use the visible/accessible label rather than internal CTA naming. The existing destination-based event names and eight-field October contract remain, including phone intent for a telephone link labelled Book a Fitting.
- Article feature images and blog thumbnails use responsive Next.js image delivery. Below-fold gallery/portrait/map loading is deferred. Original WordPress upload paths, source images and schema image references stay available. The approved hero is unchanged.

## Measurement Proof

`scripts/check-analytics-acceptance.mjs` runs the actual public Google tag scripts against a locally simulated production hostname. All collection endpoints are intercepted and fulfilled locally with 204; no QA collection request is transmitted. Only public Google tag script GET requests are allowed out. The test saves sanitized evidence without generated client/session identifiers.

The test checks initial and SPA/Back pageviews, titles, previous-page referrers, initial UTM retention, no extra pageview for a same-page anchor, and single-fire phone/email/directions/contact/service/review events. It exercises React links, imported HTML and keyboard activation, comparing the dataLayer fields with the blocked collector payload. GA4 transports the configured `page_path` field as `dp`, which the acceptance test accounts for.

The original GA4 stream `G-CCNQVYK5KJ` and GTM container `GTM-WGHNXHX9` remain the measurement owners. No manual pageview or extra history trigger is added. Google's [SPA measurement guidance](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications) emphasizes one consistent pageview implementation with correct page location/referrer; the existing published setup is tested as configured, not replaced based on assumptions.

An additional simulated `optometriccafe.vercel.app` run checks that the published production-host gate sends no collection requests even when local intent events enter the dataLayer. This is browser dispatch proof, not proof of downstream GA4 processing or public-production acceptance. That requires a separately controlled release check by Analytics.

Evidence: `analytics-implementation-verification.json`, `analytics-media-verification.json`, `migration-http-verification.json`, and `migration-browser-verification.json`. Media transfer samples are not Lighthouse or Core Web Vitals certification.

## Preserved Interpretation

The historical 69-day GA4 gap is missing measurement, not zero visitors. Suspected low-engagement Direct traffic is not treated as customers, and country alone is not used to block traffic. No history, attribution settings, filters or country rules are changed. No traffic totals are turned into sales claims or decorative customer counters.

All 45 indexable baseline URLs, 26 blog posts, the excluded draft, source body copy, source metadata, redirects, and 76 legacy media paths remain covered by the preservation suite. Customer exports stay private and excluded from deployment.

## Still Required Before Cutover

Owner approval; fresh source delta and full historical redirect inventory; security/dependency clearance; comparable current-versus-candidate mobile/desktop performance runs; external schema validation; production HTTPS/apex/WWW/robots/canonical checks; controlled GA4 receipt/processing confirmation; rollback readiness; and post-launch monitoring. The fixed public review URL remains no-index. No live-domain switch or sitemap submission is performed by this implementation.
