# OQC single-repository source of truth

**Status:** consolidation baseline, 4 November 2026  
**Canonical public website:** https://www.onlinequrancollege.com/  
**Canonical Git repository:** https://github.com/Ehtisham1239/app.com  
**Default/release branch:** `main`  
**Vercel project:** `appcom-online-quran-college` (`prj_ohTvpaIwR1bWHFJWl23QiNfOoJG7`)  
**Supabase project:** `lgbwidraztavhhbnbfhr`

## Decision

All maintained OQC application code belongs in this repository and is released from `main` to the single Vercel project above. The custom domain is the canonical public identity; Vercel preview URLs are deployment/testing aliases, not separate websites or content sources.

Do not create another repository or Vercel project for the public site, CMS, parent portal, results portal, or country pages. Keep those capabilities as routes/modules in this Next.js application and use the existing Supabase project as their shared data layer.

## Existing application map

| Capability | Canonical source |
|---|---|
| Public website, homepage, courses, pricing, FAQs, contact, articles, country/city hubs, reviews | `src/app/(site)/` |
| CMS and staff administration | `src/app/admin/` |
| Parent portal and results | `src/app/parents/` |
| Public/server API routes | `src/app/api/` |
| Shared UI | `src/components/` |
| Business logic, analytics, SEO, routing and data access | `src/lib/` |
| Database schema changes | `supabase/migrations/` |
| Public brand assets and the static paid-campaign landing page | `public/` |
| Automated tests and quality checks | `tests/`, `scripts/`, `.github/workflows/` |
| SEO evidence, decisions, operations and runbooks | `docs/`, `seo/`, `content/` |

The static `/usa-quran-classes` landing page is retained as a distinct campaign experience; it is not a second application. The country hubs under `/locations/` remain the canonical organic country navigation. Do not merge these different intents into duplicate URLs.

## Domain and duplicate-site findings

- `www.onlinequrancollege.com` is verified on the Vercel project. Keep it as the canonical host.
- The apex `onlinequrancollege.com` is configured to redirect to `www` (308).
- The public search snapshot for `go.onlinequrancollege.com` shows a separate, older landing page with inconsistent claims: a five-day trial, “since 2014”, 1,000+ families/students, a 5/5 Trustpilot claim, named tutor credentials and a London virtual-office address. These claims conflict with the current canonical website and the approved OQC evidence register. Do not copy those claims, testimonials, tutor profiles, contact details or address into the main site.
- The `go` hostname is not registered as a domain on the current Vercel project (domain lookup returned not found). Its current hosting/DNS owner therefore remains unverified. It is not source code in this repository and cannot be safely migrated or redirected from this Vercel project until its hosting control is established.
- Do not remove or redirect the `go` host blindly: first identify live campaign links, form destinations and the host/DNS owner. Then map any valid campaign content into the existing app, validate submissions and analytics, and obtain owner approval for the external 301/308 retirement.
- Do not present a registered office, virtual office or service-area country as a customer-facing branch. OQC's canonical homepage currently identifies the academy as online-only with no walk-in office.

## Duplicate-control rules

1. `main` is the only production source branch. Feature branches and Vercel previews are temporary development/review artifacts, not independent websites.
2. Every new feature must be implemented in this repository, use the existing shared components/data layer, and have one canonical route.
3. Before adding a page, search existing routes, CMS slugs, sitemap entries and redirects. Reuse or improve an existing route where the search intent is the same.
4. Keep country hubs, paid campaign pages, course detail pages, and editorial guides only when they serve distinct user/search intents. Avoid thin city/country clones.
5. Never copy unverified claims from legacy pages. Evidence-backed business facts, offers and teacher credentials must come from approved CMS records and the claim register.
6. Keep portal and CMS authentication, noindex headers, privacy controls and API protections intact. Never duplicate production credentials or service-role keys.
7. Merge feature work through reviewed PRs after tests, lint and build checks. Delete/archive branches only after confirming they have no open PR, unique unreleased work or rollback value.
8. After each release, verify the production deployment is READY, the `www` alias resolves to it, critical routes/forms work, and the apex still resolves to `www`. A READY Vercel preview alone is not proof of custom-domain production.
9. Do not change canonical URLs, mass redirects, DNS, external profiles or live campaign destinations without explicit owner approval and a tested rollback plan.

## Consolidation acceptance checklist

- [x] One canonical repository identified: `Ehtisham1239/app.com`.
- [x] One default/release branch identified: `main`.
- [x] Public site, CMS, parent portal and APIs already coexist in the same Next.js app.
- [x] One Supabase project is configured as the shared application data layer.
- [x] Canonical `www` host verified on the OQC Vercel project.
- [x] Apex-to-`www` redirect configured.
- [x] Legacy `go` duplicate identified as externally hosted/unverified and its unsupported claims quarantined from migration.
- [ ] Confirm control/hosting provider for `go.onlinequrancollege.com`.
- [ ] Inventory any live campaign links and form/analytics destinations on `go`.
- [ ] Owner approval and tested migration/redirect plan for retiring `go`.
- [ ] Audit and archive obsolete Git branches after PR and rollback review.
- [ ] Fresh production smoke, form, analytics and Search Console verification after the final release.

## What this record does not claim

This is the repository/domain consolidation baseline. It does not claim that the external `go` website has already been migrated, redirected or shut down; that obsolete Git branches have been deleted; that Google indexing or GA4 event receipt has been verified; or that the current production release has passed a fresh browser test. Those actions require the relevant hosting/account access and evidence above.
