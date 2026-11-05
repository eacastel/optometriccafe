# Optical Boutique Visual Refresh

## Scope

Redesigned the Next.js homepage, shared navigation/footer, services and visit pages, and the presentation of imported content. The WordPress site was used as a read-only reference. Imported page HTML in `data/site-content.json`, existing slugs, redirects, schema, and GTM ID remain in place. The home review excerpts now match the supplied export verbatim.

The palette retains the existing Optometric orange (`#e87817`) and exact logo, with softer charcoal, near-white, and pale green surfaces. Manrope is hosted locally with its OFL license. Reduced-motion preferences disable entrance transitions. The gallery has manual controls and no autoplay.

## Photography Corrections

The inherited filenames did not describe the photographs accurately. These placements were verified visually:

| Existing filename | Actual subject | New use |
| --- | --- | --- |
| `selected/originals/store-fitting-room.jpg` | Boutique interior and eyewear displays | Gallery, services, visit, imported pages |
| `selected/originals/vintage-showroom.jpg` | Morteza smiling inside the boutique | Owner story, about/review/lab page headers |
| `selected/originals/store-frame-wall.jpg` | Orange orchids in the boutique | Gallery detail |
| `selected/originals/store-showroom-wide.jpg` | Optometric Cafe wall sign | Gallery detail |
| `selected/modern/family-portrait-modern.jpg` | Woman at an eye-exam machine | Removed from custom layout and header selection |
| `selected/modern/lab-workshop-modern.jpg` | Eye-exam equipment | Not used in the redesigned custom layouts |

## Generated Artwork

`public/images/eyewear-editorial.webp` is an AI-generated editorial still life, created using the built-in image-generation tool and converted to WebP for delivery. It is illustrative campaign artwork, not an inventory listing or a photograph of the shop. All people and shop photographs used in the site are from the supplied real assets.

Generation prompt:

> Create a photorealistic premium optical boutique campaign photograph for a modern Beverly Hills eyewear website. WIDE landscape 3:2 composition. Very bright airy contemporary product still life, high end magazine art direction. On the RIGHT HALF two beautiful unbranded eyeglasses: one clear translucent smoky olive oval acetate optical frame with crystal clear lenses in foreground, one polished dark tortoiseshell round sunglasses frame behind. Realistic correct optical geometry with two lenses and two temples each, elegant fine craftsmanship. Set them on a low sculptural pale cool sage curved plaster pedestal with a restrained burnt orange translucent acrylic semicircle leaning behind, beautiful sharp natural daylight shadows. Seamless nearly-white very pale green-gray studio background, NOT beige. LEFT 50 PERCENT MUST BE COMPLETELY EMPTY PALE GRAY-WHITE NEGATIVE SPACE for dark website text, only very faint natural shadows near bottom. Subject should occupy right x 55-95%, y35-75%; keep all glasses fully visible. Sophisticated clean gallery mood, no decorative orbs, no spheres, no people, no logos, NO TEXT, no watermarks. Not a website mockup, just the photographic asset.

## Launch Follow-up

- The existing dependency lockfile contains Next.js 16.2.7. The npm production audit on November 5, 2026 reports six vulnerable packages, including a critical rating for Next.js. Upgrade and revalidate before public deployment; this visual change does not attempt that framework upgrade.
- Some preserved imported HTML still uses remote WordPress media and inline styles. Complete the content/media migration audit before retiring WordPress.
- Booking links lead to visit details and phone scheduling; no online booking backend has been added.
- Google Maps remains a third-party embed, with an independent directions link available.

Local visual evidence is kept in ignored `public/tmp/`. QA blocks production analytics requests while checking that CTA events enter the browser data layer.
