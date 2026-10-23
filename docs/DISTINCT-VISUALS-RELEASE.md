# Distinct content visuals and responsive image delivery

Every distinct published course, blog post, guide, About page and location page has an individual cover assignment: 191 records, 191 unique cover URLs. The catalogue includes 197 visuals: 32 photographs (25 newly generated) and 165 original geographic diagrams. Cards linking to the same course/article keep that content's image for recognisable navigation; unrelated content no longer shares one generic cover. The existing mobile homepage portrait remains the user's branding reference.

Geographic diagrams use the original college logo, a regional outline, named city marker where applicable, currency and time-zone context. They are regional illustrations, not claims of local premises. Photo subjects are fictional AI-generated illustrations, not real staff/student endorsements. Photos display the original logo in a separate HTML badge to keep its Arabic lettering intact; master photo files are clean editorial images.

Photos have 400/800/1200px AVIF and WebP variants, dimensions, descriptive alternatives and lazy loading outside primary covers. The combined 1200px photographic AVIF files are approximately 45% smaller than their WebP fallbacks. That is an asset-size measurement, not a field Core Web Vitals claim. Maps have three WebP sizes and a maximum master size below 35 KB. The original 1536px generation files and SVG maps are retained outside the web bundle.

The UI uses taller course-card photography, restrained original-logo badges, and a two-column regional introduction with its own cover and trial action. Published titles, canonical URLs, routing and lead submission logic are preserved. Cover metadata and image sitemap entries follow the new assets. No ranking guarantee is implied by distinct imagery.

## Sources and reproducibility

- College logo: existing user-provided `/public/brand/logo-160.webp`, unchanged.
- Photographs: generated for this project with OpenAI image generation; originals under `/workspace/generated_images`.
- Country outlines: Natural Earth, public domain, distributed by https://github.com/datasets/geo-countries . Simplified and projected for regional diagrams; distant overseas areas may be omitted. Natural Earth uses de facto boundaries.
- City coordinates: GeoNames Gazetteer via https://github.com/lutangar/cities.json , CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ . Adapted as named point markers. Credit links appear on location pages and in media captions. Ambiguous cities are resolved explicitly by state/administrative region in the generator.
- `scripts/prepare-location-visuals.mjs` reads downloaded `countries.geojson` and `cities.json` from `VISUAL_SOURCE_DIR` (default `/workspace/oqc-visual-sources`). Use `XDG_CACHE_HOME=/tmp/oqc-cache` for font caching in this environment.
- `scripts/prepare-editorial-visuals.mjs` reads the generated source inventory in ignored `artifacts/next-visual-sources.json` and makes responsive encodings. Originals are never overwritten.

Supabase migration `20261023000200_distinct_visual_covers.sql` updates only empty covers or this project's previous generated namespaces; editor-uploaded custom covers are preserved. Before-state backup is outside Git under `/workspace/reports/oqc-distinct-visuals-2026-10-23/`. Media masters are stored in the project's public Media Library with descriptive alt text and provenance captions.

## Dependency maintenance during release

The production install reported new advisories. Next.js and its ESLint configuration were upgraded from 16.3.8 to 16.4.3, and sanitize-html from 2.18.0 to 2.18.1. A scoped override moves the typography plugin's pinned postcss-selector-parser from 6.0.10 to patched 7.1.6; the plugin itself remains 0.5.20. The override can be removed when an upstream typography release includes a patched parser. Build and browser typography checks cover this compatibility change.

Deployment uploads individual files to Vercel and submits their SHA-1 content identifiers, avoiding one large base64 media payload. SHA-1 here is Vercel's file-addressing protocol, not a password or integrity-security mechanism.
