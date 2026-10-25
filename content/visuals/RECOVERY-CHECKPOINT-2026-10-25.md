# OQC mobile UI and imagery recovery checkpoint

Date: 2026-10-25

Owner request: improve responsive UI and footer using the original OQC emerald/mint/ivory branding; replace all regional maps with unique realistic online-learning scenes; use subject-specific course images; preserve the original homepage main image.

## Durable contents of this branch

- 16 complete photograph-style assets, each in 400/800/1200px WebP and AVIF: 96 files. Ten regional scenes (US country and all five US cities, UK, Australia, Canada, Germany) and six course scenes.
- The complete 171-scene production prompt plan (165 regional scenes and six courses), using built-in image_gen rather than CLI generation.
- Completed asset URLs and exact Git blob hashes in oqc-completed-scenes-v3.json.

These are AI-generated editorial scenes, not documentary photographs of actual students, teachers or local branches. They must not be used to imply physical local offices.

## Interrupted work; do not claim release complete

The shared development environment disconnected and was reported unavailable during generation and responsive verification. At least 54 source-scene records had been confirmed locally; only the 16 complete assets in this branch have been durably recovered through the GitHub connector. Further generated/encoded sources and uncommitted UI files may remain in the unavailable workspace and should be inspected before regeneration.

Local edits had redesigned the footer in emerald/mint with the original logo, improved inner-page hero layouts and mobile spacing, replaced regional thumbnail maps with full-width learning photographs, added AVIF country cards, retained legacy CMS image aliases, and corrected replacement image alt text. Final responsive/build/lint results were not available. These source changes were not committed to main and are not represented as deployed by this checkpoint.

## Resume safely

1. Recover the existing workspace first; inspect local changes, pending image tasks and artifacts/professional-source-jobs, artifacts/professional-assets, and artifacts/professional-uploads. Do not overwrite other user changes, including an observed change to AGENTS.md.
2. Reuse these 96 image blobs and inspect all generated assets before generating missing scenes. Never generate another scene for an asset already complete.
3. Finish all 171 scenes, responsive encodes, image-manifest aliases and all 165 country/city registry entries. The original home hero and logo files must remain byte-identical.
4. Run unit tests, lint, production build, all-page metadata/image checks, and representative 320/360/390/430/768/1024/1440/1920px browser checks. Verify home remains home, menus/links work, forms do not open automatically on home, and no regional map images remain in rendered pages, metadata or sitemap image references.
5. Commit the tested implementation to main, deploy it, verify production source/alias and repeat public checks. Preserve CMS custom records and analytics configuration. Do not merge this checkpoint as a completed UI release.

## Protected original files

- public/brand/hero.webp SHA256: 2b8d1ad32a0067f608e014544d9d384cb7a6308833e252b1775d6cf411cbed0e
- public/brand/hero-320.webp SHA256: dad63c68154b4c8b0a535706dad4c80b781f88d052321b5cd527002eec6ba173
- public/brand/logo-160.webp SHA256: 8a7e6365d2653d25343039a39980301960d86a199d383b778795c4adc9e9a4a0
- src/components/site/hero.jsx SHA256: b544a6d04841ee51933738a71fb4e077cce695cc417b016e5a3d8f08070ca996

Production before this checkpoint: eaa95a57f11d2af335f61e9e6a368a5a5a5344da, deployment dpl_E8w56fLzgwDAkVb8ZVdoSicGpcNc. Main base: f4cf1994df74704e7d796ed83c44453893d64a90. No production mutation is part of this checkpoint.
