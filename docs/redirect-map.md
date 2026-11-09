# URL Preservation and Redirects

Updated November 9, 2026. No production cutover authorized.

Latest candidate check: 165 variants pass, including every known record's `p` and `page_id` entry points with UTMs/gclid, slash/AMP aliases and uppercase AMP controls. Analytics' original 84-row matrix is also reconciled: all 81 candidate-testable rows pass; three HTTP/www hosting checks remain pending. Evidence: `migration-http-verification.json` and `analytics-matrix-verification.json`.

## Preserve

Every published current WordPress page and post keeps its path. The authoritative inventory is `data/migration-inventory.json`: 46 records, including 26 posts. The 45 current sitemap URLs remain indexable; the published `homepage-redesign-no-divi` draft remains `noindex,nofollow` and outside the sitemap.

In particular, **do not consolidate** `/contact-us/`, `/featured-reviews/`, `/optometry-lab-beverly-hills/`, the prescription categories, or any article into the new `/services/`, `/visit/`, or homepage. `/reviews/` already redirects to `/featured-reviews/`; it must not become a duplicate 200 page again.

## Redirect

`data/redirects.json` is the executable exact-path map, with provenance for each rule. `proxy.ts` applies it with HTTP **301**, preserving unrelated query parameters. Slash and no-slash aliases resolve directly to the final trailing-slash destination, without the old Gunnar/computer-glasses chain.

Rules include:

- All 16 June Redirection plugin aliases.
- Two broken contextual links found in the live articles: `/sports-glasses-sunglasses/` and `/optometry-services-beverly-hills/` now reach their corresponding existing service pages. Both were 404 on the source site.
- Three October gender/children eyeglasses aliases.
- `/reviews/`, `/category/blog/`, and `/preparing-for-eye-exam-beverly-hills/`.
- The three observed AMP article aliases, plus the general server AMP rule.
- `/sitemap_index.xml`, `/page-sitemap.xml`, `/post-sitemap.xml`, and `/wp-sitemap.xml` directly to the new valid `/sitemap.xml`.
- Server patterns: `/index.php/<path>`, `/<path>/amp/`, and `amp`/`noamp` query flags normalize in the same hop. AMP matching remains case-insensitive, consistent with the recovered source rules. Other query parameters survive.
- `/category/blog/page/<number>/` redirects to `/blog/`, matching the existing MU plugin.
- Old `/author/morteza/page/<number>/` archives redirect to the noindex author archive, which now lists all 26 articles without pagination.
- WordPress `?p=<known id>` and `?page_id=<known id>` resolve to their retained pages. `?s=` opens functional site search.

The clean `/prescription-glasses/` alias consistently targets the prescription service page, even with UTMs. Analytics observed WordPress sometimes guessing a different article for the query-string variant; this inconsistency is not reproduced.

## Canonicals

Keep the existing HTTPS apex domain and trailing slash for content paths. Page canonical, internal navigation, imported contextual links and sitemap agree. Media retain their exact `/wp-content/uploads/...` paths. Static files and XML do not gain trailing slashes. Unknown pages return a genuine 404; there is no blanket homepage redirect.

Vercel must redirect the `www` domain and HTTP requests to the production HTTPS apex domain. This hosting configuration has **not** been changed here.

## Remaining Gate

The June plugin export, November public checks and analytics agent's read-only Apache/MU-plugin findings are covered. They are **not proof of every current database/plugin/CDN redirect**. Before launch, obtain the full current rules/export and the analytics must-keep list, compare against this manifest, and run `npm run test:migration` against the final preview. Keep redirects in place after launch and monitor 404s and landing-page performance.
