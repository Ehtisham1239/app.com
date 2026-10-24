# Image regeneration and card redesign — 24 October 2026

The user rejected the previous imagery and then requested removal of logos from images, redesigned course/blog/FAQ/fees/area/About cards and broader SEO improvements.

## Content and visuals

- Regenerated all 32 photographic illustrations with clearer learning scenes and brighter green/ivory photography. These are educational AI illustrations, not actual college student/staff portraits.
- Removed HTML logo badges and re-rendered all 165 geographic diagrams without the college logo. Header/footer branding remains. Old image files remain available for cached pages and historical links; current image delivery and published covers use versioned `-r2-` assets.
- Uploaded 197 revision masters to Supabase Media Library. Updated the 191 previous generated content covers with exact previous-value guards, preserving custom editor uploads. Separate descriptive alt review follows the actual generated scene.
- Course/blog/home learning cards use inset imagery, lighter borders, clearer actions and smaller level labels. Guide directory and related-article cards now show their content images. Fee cards preserve approved amounts and quote fallbacks. Area search, native FAQ disclosure controls and About editorial sections retain existing content and routes.
- FAQ category labels show readable country names instead of internal `Market:` prefixes. Structured FAQ data uses the shared JSON-LD escaping helper.

## Editorial and SEO work

- Revised 15 articles with individual practical exercises/checklists and contextual internal links. Removed two unsupported generalisations about fixed learning pace. References for existing Quran/Hadith quotations were added to the relevant source pages.
- Added article contents navigation with collision-safe heading anchors, visible/structured breadcrumbs, topic-based related articles, current cover URLs in social metadata and article schema, and article word counts. Reading estimates follow revised content length.
- Current image sitemap resolves prior cover aliases to revised local images. Canonical routing, publication controls, forms, pricing values, geo redirects and access checks are preserved.
- The full local crawl passed 205 public pages with unique titles/canonicals, 389 internal destinations, 4 guide aliases, pagination and 173 FAQ-schema instances matched to their visible questions. No live search positions, Search Console submissions or backlinks are claimed. Search engines decide indexing and ranking; no first-place outcome is guaranteed.

## Delivery and validation

- Photos: responsive 400/800/1200px AVIF and WebP. Maps: three WebP sizes. Explicit dimensions, intentional eager primary covers and lazy supporting images remain. Revision URLs prevent stale CDN imagery.
- Pricing rendering now has a small dedicated component. CMS settings import a small defaults module instead of the database loader and its complete public-content fallback snapshot. This addresses an observed 381,953-byte uncompressed browser chunk containing that snapshot; it is a bundle observation, not a field speed measurement.
- 40 automated tests pass; lint has zero errors and 19 existing warnings; npm audit reports zero known vulnerabilities. Production build and 24 focused browser viewport checks pass. Browser checks cover image loading, no image logo badges, FAQ keyboard operation, currency selection, About sections and article anchors/schema. Additional final responsive and live verification is recorded in DEPLOYMENT.md.
- Forms/chat transport is stubbed for browser checks. No real test enquiries or chat messages were submitted. Tests use Chromium viewports, not physical Safari devices.
- Backups and evidence: `/workspace/reports/oqc-card-redesign-2026-10-24/`. Original image generation files remain under `/workspace/generated_images`. The source inventory is retained in that report directory. Geographic source attribution and CC BY links remain on regional pages.

## Reproduction

`prepare-regenerated-visuals.mjs` consumes the generated-source checkpoints in ignored `artifacts/` and the diagram manifest from `prepare-location-visuals.mjs`. It writes versioned assets, the manifest, fallback covers and guarded content migration. `refresh-learning-articles.mjs` contains the reviewed editorial additions and writes a guarded article migration; it deliberately refuses to append a second copy of the same revision. Final alt text corrections are in `20261024000100_visual_alt_review.sql`.
