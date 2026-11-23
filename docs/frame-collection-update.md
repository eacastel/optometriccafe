# Owner-Approved Frame Collection Update

Source: Morteza's message and the seven uploads in `docs/images-pre-launch/`, received November 23, 2026.

The annotated screenshot `IMG_3853.jpeg` crosses out **Salt, Maui Jim and Lunor**. Those names are removed from current-stock lists on Home and About, and Maui Jim is removed from the current sunglasses Product schema's brand list. **Masunaga, Miu Miu, Res / Rei, ba&sh, Prada, Celine and iGreen** are included, with **Chopard** retained/prominent. **Revo** is included from Morteza's supplied Revo display photograph. Other unmarked designers and children's collections are retained; this is not a new assertion that every historical label was independently reconfirmed.

`data/frame-brands.json` records the exact four approved phrase replacements. The original WordPress snapshot, normalized archived content and original homepage fragments remain unchanged. `lib/brand-content.ts` applies only those explicit corrections for current page presentation and search text. Blog posts, customer quotations, headings, internal links, dates, metadata, URLs and legacy assets are not rewritten. Removing obsolete stock claims is an authorized exception to verbatim rendering, not a loss of the original archive.

## Images

| Source | Collection | Placement |
| --- | --- | --- |
| `Image_261123_122541.jpeg` | Res / Rei | Homepage and prescription glasses |
| `Image_261123_122623.jpeg` | Miu Miu | Homepage and sunglasses |
| `Image_261123_122751.jpeg` | Chopard | Homepage and sunglasses |
| `Image_261123_122811.jpeg` | ba&sh | Homepage and prescription glasses |
| `Image_261123_122848.jpeg` | iGreen | Homepage and prescription glasses |
| `Image_261123_123051.jpeg` | Revo | Homepage and sunglasses |

All six original product photographs are used. The marked-up browser screenshot is reference-only, not a public asset. Originals remain local, unchanged and excluded from Vercel uploads by the existing `docs/` exclusion. Web derivatives receive EXIF auto-orientation, proportional resizing, WebP encoding and metadata stripping only. No generated frames, recoloring, retouching, removal of price labels or invented brand artwork is used. Photos preserve the complete oriented 3:4 framing with no cover crop. Written prices, availability and product details are not inferred from display labels.

`data/frame-photography.json` records provenance, hashes, dimensions, bytes, captions and categories. Reproduce derivatives with `node scripts/import-prelaunch-frames.mjs`. The existing homepage hero, boutique photos and review selections remain as approved. No WordPress, domain, Google configuration or production deployment change is part of this update.
