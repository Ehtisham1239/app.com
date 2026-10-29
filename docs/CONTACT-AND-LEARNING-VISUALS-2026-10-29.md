# Contact and learning visual refresh — 29 October 2026

Owner request: improve the supplied contact-page screenshot, create attractive new imagery, show a child learning with male/female teachers on relevant pages, and use the supplied full-width green-fade banner style. Deployment to the existing onlinequrancollege.com domain is authorized.

## Implemented scope

- Three new AI-generated editorial images: a welcoming contact/learning desk, a boy with a remote male teacher, and a girl with a remote female teacher. These are fictional illustrations, not documented students, faculty portraits or OQC premises. No legible generated Quranic quotations, credentials, ratings or testimonials were added.
- 22 optimized AVIF/WebP files. The three card-sized scenes have 400/800/1200px variants; the male scene additionally has 1600/2000px variants for full-width use. Width/height, descriptive alternatives, eager loading for hero images and responsive source sets are recorded.
- Full-width desktop banners with a green readability fade on Contact, Courses, Teachers, Fees, Learning Centre, Blog index, FAQ, Careers and Locations. Male/female scenes are matched to the route; the trial page uses the female lesson scene. Mobile layouts separate the image and text.
- Contact has primary WhatsApp and in-page message actions, a keyboard-focusable enquiry destination, a clear form heading, scheduling wording and useful course/FAQ links. Existing form validation, consent, persistence, analytics and privacy behavior are preserved.
- Header navigation switches to its existing compact menu when text enlargement leaves insufficient room. This corrects a verified 1440px/200%-root-text overflow; keyboard close/focus behavior is retained.
- Contact, trial, pricing and locations sitemap image references agree with the visible artwork; social images use the appropriate route artwork.

## Validation and release

99 tests pass. Lint has zero errors and 13 existing warnings. Production build passes with 212 rendered HTML files and zero missing references. 22 local Chromium cases pass with zero browser errors or writes: Contact at 320/390/768/1440px, 200% root-text reflow and compact-menu keyboard behavior, plus nine learning routes at 390/1440px. The trial visual remains deliberately hidden on phones so the form stays first. Validation and actual release evidence are in docs/seo-agent/evidence/2026-10-29-visual-refresh/. A source commit alone is not a live-deployment result. The release record is updated only after the existing Vercel project's build and public-domain checks have completed.

The latest source was taken from main at 87f51fd6366ddae55989a264803380762488f5b8. Later approved staff changes, including founding-year and currency work, were preserved. No CMS articles, price data, logo or protected homepage artwork were replaced by this work.

## Artwork production brief

Built-in image generation produced all three new scenes. The production prompts called for a 3:2 landscape, deep forest/logo green, ivory, sage and soft gold, natural lighting, realistic materials, a clear laptop video lesson, subjects within the central 80% for responsive crops, anatomically natural faces/hands, no logos, watermark, badges or text overlays, and no legible invented Quranic printing. The contact prompt specified a laptop with abstract call shapes, a green headset, a closed book on a carved stand, and an arched-window home study. The male prompt specified a fictional boy around nine with a white-capped male teacher visible only on the laptop. The female prompt specified a fictional girl around ten in a pale sage hijab with a female teacher in an emerald hijab visible only on the laptop. Original generation files are retained by the generation service; production-ready encodings are committed under public/images/learning/*-v4-*.

## Recovery and limits

Revert the visual-refresh source commit to restore the previous banners and header behavior. Original assets remain available. This source-only rollback does not require database, DNS, price, tracking or permission changes. Browser checks use Chromium viewport emulation and cannot establish physical Safari compatibility, WCAG certification, search indexation, ranking gains or field Core Web Vitals. No real enquiry or recipient-directed message is submitted during QA.

## Production verification and follow-up repair

The visual release 04e2e90a73b256f6e692bc132d8f5636b8b4a644 deployed Ready as dpl_3mhee3UgqZSWvtiFcVxXJ3cH9xh6, Production/main, to www.onlinequrancollege.com (1m 21s). The apex returns 308 to www. The actual Weekend CMS link, teacher preference, planner summary, Hifz direct 308/query retention and sitemap imagery are publicly verified. Seed plan UUIDs differ from current CMS IDs and were not substituted for live links.

The 22 distinct visual/functional cases completed across an initial 19-case sweep and a bounded three-route retry after a load-event timeout. The initial sweep also recorded two React #418 hydration errors on the trial form. These were investigated instead of being called a clean run. A local reproduction in UTC, America/Los_Angeles and Asia/Karachi reproduced the pre-existing browser-time-zone initialization mismatch. The form now starts with deterministic query-only state, detects the browser zone after mount, preserves an explicit country/manual zone, and adds localized time-zone names only after hydration. Nine local route/time-zone checks and six interaction regressions pass with zero errors or writes. The follow-up fix awaits production verification. No prices were changed.

Existing build notices were reviewed: broad Node engine range, npm cache-dir configuration, pinned ESLint deprecation, and existing esbuild/unrs-resolver install-script notices. No dependency or security setting was changed to hide a notice.
