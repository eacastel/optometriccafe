# Optometric Cafe Launch Redirect Map

Draft migration map for the first Vercel launch pass. Because the replacement site is intended to preserve and improve SEO visibility, the preferred launch outcome is to rebuild high-value URLs as full content pages. Use 301 redirects only when a page is intentionally consolidated, renamed, or removed after the live content inventory is complete.

Keep the current WordPress site live until this list is verified against Search Console, Rank Math sitemap URLs, analytics landing pages, and existing Redirection plugin rules.

| Current WordPress URL | New destination | Reason |
| --- | --- | --- |
| `/glasses-repair-adjustment-beverly-hills/` | Preserve as full page | High-value glasses repair intent |
| `/prescription-eyeglasses-beverly-hills/` | Preserve as full page | High-value prescription eyeglasses intent |
| `/optometry-services-in-beverly-hills/` | Preserve as full page or consolidate into `/eye-exams/` with 301 | Eye exam and optometry intent |
| `/contact-us/` | `/visit` | Contact and visit screen can consolidate safely if NAP/schema remain visible |
| `/featured-reviews/` | Preserve as full page or `/#reviews` with 301 | Review visibility and trust content |
| `/beverly-hills-eyewear-boutique/` | Preserve as full page | Local boutique discovery intent |
| `/eye-exam-beverly-hills-what-to-expect/` | Preserve as full article | Informational eye exam search intent |
| `/designer-eyewear-beverly-hills-great-fit/` | Preserve as full article | Designer eyewear content intent |
| `/prescription-sunglasses-vs-regular-sunglasses/` | Preserve as full article | Prescription sunglasses informational intent |
| `/kids-prescription-glasses-fit-durability-comfort/` | Preserve as full article | Children's glasses informational intent |

Before launch, expand this with every indexed URL from `sitemap_index.xml`, Cloudflare analytics, Search Console top pages, and the WordPress Redirection plugin export.
