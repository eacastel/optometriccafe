# Review selection and attribution

## Sources

- Existing WordPress content: 32 archived five-star testimonials, preserved verbatim in `data/site-content.json`.
- Owner-pasted Google Business Profile list, 23 November 2026: 62 entries, reported overall rating 4.7. This is owner-supplied evidence, not an API-verified current aggregate.
- `data/review-additions.json` records 24 additional positive selections, dates where explicitly supplied, excerpt flags, aliases and exclusions. Relative dates were not converted into invented publication dates.
- The resulting page contains **56 selected five-star testimonials: 54 Google and 2 Yelp**. This is not a complete live review feed and does not represent a 5.0 overall business rating.

## Preservation

All 32 archived quotations and their contextual service links remain. Ten formerly date-only attributions are identified as Google from the owner's list. The archived `Matt` selection is the same reviewer as the supplied `Matt MacFarlane`; it is not duplicated. Additional excerpts use the supplied wording, explicitly labelled `Excerpt`. Truncated source reviews have not been completed or rewritten. Historical reviewer references to doctors do not establish current staffing or describe Morteza as a doctor.

Four negative entries are outside the requested five-star selection. Four entries with no customer review text are omitted. This selection does not assert that any review is fraudulent. No owner responses or unsupported author profile URLs have been fabricated.

Tiles open the verified business profile, not an individual review permalink (none was supplied). Yelp's two archived review dates remain unavailable; no dates are invented. Profile navigation uses the separate `oc_review_click` intent and generic labels, never the reviewer's name, while actual directions links retain `oc_directions_click`.

## Branding

- Google Maps official attribution asset: https://developers.google.com/static/maps/documentation/images/Google_Maps_Attribution_Assets.zip
- Google Maps star bitmap: https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_14.png
- Yelp official favicon: https://s3-media0.fl.yelpcdn.com/assets/public/yelp_favicon.yji-70908133d95b444ea335.svg
- Google Maps logo displayed unaltered at 18px height. Stars use the actual 14px-wide Google bitmap, five per selected review; dominant gold is `#fbbc04`.
- Yelp is identified separately, without a fabricated Yelp aggregate or five-star business badge.
- No self-serving Review or AggregateRating schema is added.

## Analytics access

Analytics confirmed access to the Business Profile, but the legacy Reviews API request returned 403 because `mybusiness.googleapis.com` was not enabled for its project. No reviews were obtained through that API and no Google configuration was changed. The owner-pasted list is sufficient for this curated display; enabling API access is not a blocker and was not attempted.

## Sports photograph

The owner identified Morteza in `docs/new-images/IMG_3629.png`. A separately versioned lighting/color-corrected derivative replaces only the four-player tennis photograph on the existing Sports Glasses URL. The original legacy image remains available at its original URL, the other sports image and all page wording remain unchanged. The edit prompt and asset hashes are recorded in the existing photography manifests.

## Delivery

Application commit `6722b5e` is pushed on `design/optical-boutique-refresh` and published to the unchanged https://optometriccafe.vercel.app/ review alias. `review-deployment.json` records the exact preview deployment and previous rollback target. No live WordPress, DNS or Google account settings changed.

Verification: 87 tests pass and the production build generates 57 routes. Fifteen responsive browser checks pass locally and on the public alias at 320/390/768/1024/1440px, including all 56 tiles, 3/2/1 column layouts, exact 14px Google stars, source logos, full-tile links, preserved contextual service links, homepage branding fit and the Sports Glasses photograph's natural aspect ratio. The legacy tennis image still returns 200. Screenshots were visually reviewed on desktop and mobile; collectors were blocked throughout browser QA. The public cycling WebP hash matches the manifest.

`analytics-implementation-verification.json` records 22 real-tag, collector-blocked checks, including exactly one `oc_review_click` for homepage Google, imported Google and imported Yelp source links, separate from directions. No collector requests were transmitted and reviewer names are not placed in event labels. The existing 35 gallery/grid checks also pass locally; rendered-content integrity passes for 51 pages including all 26 blog posts and full-text RSS. Production launch approval and final migration/measurement gates remain separate from this preview delivery.

`reviews-public-migration-verification.json` records the full audit on the updated public alias: 46 content records, 165 redirect variants, 48 internal destinations, 47 sitemap URLs, 76 legacy media URLs, search and genuine 404s. The original November 9 public HTTP evidence remains unchanged in `migration-http-verification.json`.
