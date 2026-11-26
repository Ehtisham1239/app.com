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

The supplied figures match the 2020 "Muslim Estimate" adherent counts in the Association of Religion Data Archives (ARDA) U.S. Religion Census state reports:

| Priority | State | 2020 ARDA Muslim Estimate (adherents) | ARDA state report |
|---:|---|---:|---|
| 1 | Maryland | 188,914 | https://www.thearda.com/us-religion/census/congregational-membership?c=24&t=1&y=2020 |
| 2 | Massachusetts | 131,749 | https://www.thearda.com/us-religion/census/congregational-membership?c=25&t=1&y=2020 |
| 3 | North Carolina | 130,661 | https://www.thearda.com/us-religion/census/congregational-membership?c=37&t=1&y=2020 |
| 4 | Minnesota | 114,590 | https://www.thearda.com/us-religion/census/congregational-membership?c=27&t=1&y=2020 |
| 5 | Arizona | 109,765 | https://www.thearda.com/us-religion/census/congregational-membership?c=04&t=1&y=2020 |
| 6 | Wisconsin | 68,699 | https://www.thearda.com/us-religion/census/congregational-membership?c=55&t=1&y=2020 |
| 7 | Missouri | 53,443 | https://www.thearda.com/us-religion/census/congregational-membership?c=29&t=1&y=2020 |
| 8 | Connecticut | 43,905 | https://www.thearda.com/us-religion/census/congregational-membership?c=09&t=1&y=2020 |
| 9 | Indiana | 41,400 | https://www.thearda.com/us-religion/census/congregational-membership?c=18&t=1&y=2020 |
| 10 | Tennessee | 39,745 | https://www.thearda.com/us-religion/census/congregational-membership?c=47&t=1&y=2020 |

**Important interpretation:** These are not official U.S. Census Bureau counts and must not be described as a complete count of all Muslim residents. ARDA labels them "Muslim Estimate" in its adherent column. ARDA explains that adherents can include full members, non-member children and other regular participants. The Muslim estimates draw on the 2019–2020 Mosque Survey: the survey identified 2,771 mosques and interviewed a random sample of 700, of which 470 completed questionnaires. ARDA also notes that some Muslim organizations outside the American Muslim community mainstream were not included. See [ARDA's data-source and methodology notes](https://www.thearda.com/us-religion/sources-for-religious-congregations-membership-data), especially its sections "What are adherents?" and "How were the Muslim estimates computed?"

The figures remain internal market-prioritisation context and are not displayed on public landing pages. If a future owner-approved page displays them, use the label **"2020 ARDA Muslim Estimate (adherents)"**, cite the relevant state report, and show the methodology caveat adjacent to the figures. Do not shorten the label to "Muslim population" or imply that the figures measure every Muslim resident.

## Verification

- Static tests check that all ten HTML pages exist, have unique state-specific SEO foundations, city examples, hero image dimensions, visible FAQs, trial CTAs, route rewrites and sitemap entries.
- The state-directory test checks its canonical, indexability, structured data, links to all ten pages and link from the main USA page.
- The production responsive audit now includes the state directory and all ten state URLs at 12 viewport widths (320–2560 px) and on four Playwright device profiles (iPhone 13, iPhone 14 Pro Max, Pixel 7 and iPad Pro 11).
- The live audit fails on non-200 responses or page-level horizontal overflow. It also checks the existing responsive table renderer/editor and the wider site routing checks.
- GitHub Actions logs are the authoritative record for each run's live HTTP and viewport results. Passing a deployment audit does not guarantee search-engine indexing, ranking or traffic.

## Rollback

Revert the QA commit or close its pull request. The QA change does not modify production data, DNS, environment variables, forms, lead routing or hosting settings.
