# Professional imagery and page SEO — 23 October 2026

Added a new AI-generated family learning illustration in the college's green/cream palette to the homepage introduction and the editable About-page cover. The CMS media entry identifies it as illustrative imagery, not an actual student/staff photograph. The source original is retained outside the application bundle.

The new image is encoded as 400/800/1200px WebP (16.3/39.9/65.0 KB), with responsive source selection, descriptive alt text, intrinsic dimensions and lazy loading. Homepage USA/Australia/learning-path cards now use the existing matching educational imagery. Contact and trial pages use relevant existing images; mobile trial registration stays before its supporting image.

Removed the left floating WhatsApp shortcut from the public layout. The existing Hatchium chat integration and contextual contact links remain. No chat messages or forms are submitted by this release's visual checks.

Updated contact/trial search descriptions, canonical and social metadata with image alternatives; added FAQ structured data matching the homepage's visible questions. Image sitemap entries now reference the locally served responsive masters, including homepage, About, contact and trial images. No ranking or rich-result guarantee is implied.

Migration `20261023000100_about_learning_image.sql` only fills an empty About cover and preserves an editor's existing image. A backup of the original About cover fields is stored outside Git under `/workspace/reports/oqc-visuals-2026-10-23/`.

Validation: `npm test`, `npm run lint`, `npm run build`; `scripts/visuals-seo-smoke.mjs`, `scripts/hatchium-smoke.mjs`, `scripts/responsive-smoke.mjs`, and `scripts/image-smoke.mjs`. Visual checks use Chromium and a stubbed chat vendor, not physical device tests or live chat delivery tests.
