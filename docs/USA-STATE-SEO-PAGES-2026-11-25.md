# USA state Quran landing pages — draft for owner review

**Status:** Draft PR only. Not merged, not deployed, and not published to the production domain.

## Scope

The supplied state-priority PDF was used to select these ten pages, in its exact order:

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

A directory page is available at `/usa-quran-classes/states`. The existing `/usa-quran-classes` page is retained and gets one footer link to the state directory.

## Design and conversion

- Uses OQC's existing green, gold, typography, logo mark and existing optimized USA Quran-learning hero image; no new unapproved brand assets or stock imagery were introduced.
- Mobile-responsive page layout, course cards, clear trial CTA, local scheduling note, example cities, FAQs and breadcrumbs.
- Main conversion path goes to the existing `/free-trial` workflow. No copied USA lead form, new database path, or new email integration is introduced.
- All pages clearly say lessons are online and do not imply OQC has a physical branch or classroom in any state.

## SEO / AEO / GEO foundations

- Unique state title, meta description, H1, canonical URL and Open Graph metadata.
- Index/follow directives; each page has a self-referencing canonical.
- State-specific explanatory copy, example city names and local time-zone guidance. Indiana and Tennessee explicitly note their time-zone split; Arizona notes its daylight-saving exception.
- JSON-LD: WebPage, Service with state areaServed, FAQPage and BreadcrumbList. No fabricated LocalBusiness, address, rating, testimonial or state Muslim-population statistic.
- State directory and existing USA landing page link to the new pages; all new URLs are included in the XML and text sitemap via the shared sitemap generator.
- Existing robots policy already permits search and AI input for public pages; no crawler policy or consent setting was changed.

## Data integrity

The PDF's population values are retained as planning context only and are not published on the pages because the source/estimate methodology is not documented in the supplied file. City names are examples for local relevance and scheduling context, not claimed office locations.

## Verification still required before merge/publish

- Run `npm test`, lint and production build on the branch.
- Browser-check all 11 URLs at mobile and desktop sizes; verify the hero image and CSS load.
- Test CTA path to `/free-trial`, forms and analytics event behavior.
- Validate JSON-LD and canonical/robots/sitemap output on the preview host.
- Review factual wording and SEO content; only then approve merge and a separate deployment.
- After deployment, verify each URL returns 200, is self-canonical, indexable, present in sitemap, and request indexing through Search Console. Indexing/ranking/traffic are not guaranteed by page publication.

## Rollback

Close the draft PR or revert its branch changes. No production database, DNS, environment variables, Hostinger settings or production content has been changed.
