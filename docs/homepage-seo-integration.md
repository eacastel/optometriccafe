# Homepage Design and SEO Integration

November 6, 2026. Implements the homepage recommendations in Analytics' November 5 pre-migration report while retaining the approved editorial design and headline copy.

Fixed review URL: **https://optometriccafe.vercel.app/**. After each successful preview deployment, use `vercel alias set <new-preview-url> optometriccafe.vercel.app --scope emilio-castellanos-projects` and verify that address. Keep this review URL unchanged for the user; do not substitute new per-deployment links. It remains public and no-index, separate from the unchanged WordPress production domain.

- Keep the Optometric Cafe brand, generated eyewear hero, "Great frames. An even better fit.", real shop gallery, owner portrait, workshop, attributed reviews, visit details and map.
- Add the existing "Eyewear & Personal Fittings in Beverly Hills" wording as a modest second line in the single H1. Preserve the live SEO title, description, canonical, social metadata and schema.
- Distribute all original homepage copy across the relevant designed sections instead of appending a second WordPress homepage below the redesign. No original paragraph, contextual link, heading text, award or video is deleted or hidden behind an accordion. Presentation order and heading levels can differ.
- Keep frame selection, repairs and workshop as the primary service pathways. Repairs link directly to the retained repair page, not only a generic service anchor. Eye-exam navigation remains secondary with call-to-confirm availability wording.
- Give high prescriptions, suitable existing-frame lens replacement and progressive fittings visible guide links. Preserve the original contextual links from the imported copy as well.
- The gallery's category list uses only the four original descriptive service blocks. Removed the parallel short marketing summaries and separate lower grid, so each category has one heading, full original paragraph and destination link in that list.
- The source snapshot and full imported homepage remain unchanged. `scripts/home-content.mjs` splits the copy into 20 named fragments and fails on an unexpected source structure. The import pipeline regenerates `data/home-content.json`; tests prove the complete original text, links and media are represented. HTTP acceptance checks every fragment exactly once in server-rendered HTML.

November 8 owner-requested exception: remove the "A little closer to the boutique / Step inside" video block and its "Call About a Fitting" link. Replace it with two real photographs from the supplied 2014 NAS shoot (designer display and storefront). The original video/CTA fragments stay in the source archive but are intentionally not rendered; HTTP acceptance verifies the other 18 fragments and the two-photo replacement. The original public video URL remains available for legacy links. No service copy, article or route was removed.

This is homepage implementation, not launch clearance. Full historical redirect reconciliation, dependency security updates, public production edge checks, comparative performance and final collector/SPA analytics acceptance remain release gates. No WordPress or DNS changes are part of this work.
