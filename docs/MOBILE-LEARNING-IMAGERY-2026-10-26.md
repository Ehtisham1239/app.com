# Mobile layout and Quran-learning imagery — 26 October 2026

The interrupted visual redesign has been implemented. Production deployment is still pending: the connected Vercel account returns `404 Project not found` for the documented production project, and its project listing is empty. No production alias, CMS record, analytics setting or audience has been changed.

## Result

- Footer redesigned in the college's emerald/mint palette with the original logo, clear course/company/policy navigation, contact links, a trial invitation, and at least 44px link targets. Small screens use two navigation columns; policies wrap beneath them.
- Country/city heroes now use full-width learning scenes. Country-directory cards support AVIF with responsive WebP fallback. Inner-page typography, mobile button wrapping and image spacing were refined.
- All 165 regional maps and six course covers have distinct photograph-style learning scenes. The 16 recovered scenes were reused; 155 missing scenes were generated with the built-in image generator. These are editorial AI imagery, not documentary photographs of enrolled learners or local offices.
- All 171 images have 400/800/1200px WebP and AVIF versions: 1,026 responsive files. New 1200px WebP masters are stored in Git; `npm run dev`, `npm test` and `npm run build` prepare missing derived sizes locally before running. This avoids runtime image transformation and preserves intrinsic image dimensions.
- Legacy CMS image URLs resolve through the image manifest to the new covers, alt descriptions, sharing metadata and sitemap images. Custom CMS records remain untouched. The old map files are removed from the source tree; two permanent redirect patterns preserve both generations of old map-image URLs and their requested widths.
- Country/city metadata fallback titles now define the place name even if a CMS record is unavailable.
- The original main homepage image, smaller homepage image, logo bytes and homepage hero component are protected by SHA256 regression checks.

## Sources and reproducibility

- Prompt set and art direction: `content/visuals/oqc-scene-plan-v3.json`.
- Recovered original scene records: `content/visuals/oqc-completed-scenes-v3.json`.
- Complete active registry: `content/visuals/oqc-active-scenes-v3.json`.
- Responsive preparation: `scripts/prepare-responsive-learning.mjs`.
- Rendered-image and legacy-link checks: `scripts/learning-imagery-audit.mjs`.
- Browser checks: `scripts/run-mobile-visual-verification.mjs` and `scripts/mobile-visual-smoke.mjs`. Install Playwright Chromium or provide `CHROMIUM_PATH` and optional `CHROMIUM_ARGS_JSON` for the environment.

## Validation

- Automated tests: 64 passed, zero failed. Includes original-file hashes, all regional-image assignments, CMS alias ownership, image dimensions and payload budgets.
- ESLint: zero errors, 19 existing warnings.
- Optimised production build: passed.
- All 171 scenes inspected in contact sheets.
- Browser checks: 80 route/viewport cases passed at 320/360/390/430/768/1024/1440/1920px, zero browser errors. Mobile menu dismissal, desktop course navigation, original homepage image, footer touch targets, overflow and image decoding passed.
- Full public-page audit: 205 URLs returned 200; all 165 regional scenes rendered with non-map sharing images; all 1,026 responsive files returned the correct MIME type within the 200KB budget. Sitemap image references contain no maps. Twelve legacy map-image URL/width cases returned permanent redirects to the matching learning image.
- Existing Sharp 0.35.5 is explicitly pinned as a required image-build dependency. Offline `npm ci --dry-run --ignore-scripts --omit=optional` passed lock consistency; a full fresh dependency installation was not run because this environment lacks cached optional Tailwind packages.

Local content checks use the application's read-only seeded fallback because this session does not have a production CMS publishable-key configuration. Browser checks stub the external chat vendor and do not submit enquiries. They establish Chromium viewport behaviour, not physical-device Safari coverage or field Core Web Vitals. The production site must be verified after a deployment from this source.
