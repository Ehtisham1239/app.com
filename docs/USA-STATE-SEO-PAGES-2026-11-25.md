# USA state Quran landing pages — implementation and QA record

**Status:** Implemented in the main branch at commit `d464ee1d53a3709d88fcdd195c7c77289c3991ed`. The ten state pages, state directory, route rewrites and sitemap entries are present in the production release. This record replaces the earlier draft-only status.

## Scope and priority

The ten pages follow the supplied priority order:

1. Maryland — `/maryland-quran-classes`
2. Massachusetts — `/massachusetts-quran-classes`
3. North Carolina — `/north-carolina-quran-classes`
4. Minnesota — `/minnesota-quran-classes`
5. Arizona — `/arizona-quran-classes`
6. Wisconsin — `/wisconsin-quran-classes`
7. Missouri — `/missouri-quran-classes`
8. Connecticut — `/connecticut-quran-classes`
9. Indiana — `/indiana-quran-classes`
10. Tennessee — `/tennessee-quran-classes`

The directory is `/usa-quran-classes/states`. The main USA page links to this directory. All ten page routes and the directory are included in the sitemap generator and Next.js rewrites.

## Design and conversion

- Uses OQC's established green-and-gold palette, Inter/Outfit typography, logo mark and optimised USA Quran-learning hero image.
- Responsive hero, course cards, local scheduling notes, city examples, five visible FAQs, breadcrumbs and prominent free-trial CTAs.
- Conversion uses the existing `/free-trial` workflow; no duplicate lead form, database path or email integration was added.
- Every page explains that OQC provides online lessons and does not claim a physical office, campus or classroom in the state.
- State-specific content includes local city examples and time-zone guidance. Indiana and Tennessee note their time-zone splits; Arizona explains its daylight-saving exception.

## SEO and structured data

- Unique title, meta description, H1, canonical URL and Open Graph metadata per state.
- Index/follow directives and self-referencing canonicals.
- JSON-LD includes WebPage, Service with state areaServed, FAQPage, BreadcrumbList and the shared EducationalOrganization entity.
- The directory uses CollectionPage structured data and links to all ten state pages.
- State routes are explicitly included in the XML sitemap generator and text sitemap.
- No LocalBusiness schema, false local address, fabricated review/rating, unverified testimonial or unsupported population claim is used.

## Population-data integrity

The supplied Muslim-population figures were used to prioritise the states, but are not published on the landing pages. The source and estimation methodology are not documented in the supplied table. The US Census does not collect religious affiliation as a standard population count, so these figures should not be presented as official census counts. They can be published later only with a clearly identified, credible source, reference year and methodology.

## Verification

- Static tests check that all ten HTML pages exist, have unique state-specific SEO foundations, city examples, hero image dimensions, visible FAQs, trial CTAs, route rewrites and sitemap entries.
- The state-directory test checks its canonical, indexability, structured data, links to all ten pages and link from the main USA page.
- The production responsive audit now includes the state directory and all ten state URLs at 12 viewport widths (320–2560 px) and on four Playwright device profiles (iPhone 13, iPhone 14 Pro Max, Pixel 7 and iPad Pro 11).
- The live audit fails on non-200 responses or page-level horizontal overflow. It also checks the existing responsive table renderer/editor and the wider site routing checks.
- GitHub Actions logs are the authoritative record for each run's live HTTP and viewport results. Passing a deployment audit does not guarantee search-engine indexing, ranking or traffic.

## Rollback

Revert the QA commit or close its pull request. The QA change does not modify production data, DNS, environment variables, forms, lead routing or hosting settings.
