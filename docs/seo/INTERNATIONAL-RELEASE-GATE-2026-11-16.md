# International SEO release gate — 16 November 2026

## Scope
Production: https://www.onlinequrancollege.com. Growth markets: UK, USA, Canada, Australia, UAE. Preserve Pakistan in sitewide reporting but exclude it from the international acquisition campaign.

## Required evidence before claiming completion
- Confirm actual serving host and deploy target (Hostinger versus Vercel) with DNS, response headers, domain assignment and production commit. Do not infer host from a build script.
- Run `npm run seo:agent -- https://www.onlinequrancollege.com` and `npm run seo:search-engines -- https://www.onlinequrancollege.com` in an approved runner. Save outputs, inspect any access wall, do not treat partial crawls as passing.
- Verify robots.txt, sitemap.xml, canonical and noindex directives, 200/301/308/404 responses, internal links, schema and article images.
- Check legacy URLs `/basic-islamic-education`, `/how-to-learn-quran-by-heart-2`, `/start-teaching-the-quran-to-your-children`. Redirect only after confirming a semantically equivalent live replacement; otherwise retain honest 404/410 and repair inbound links.
- Verify Search Console and Bing Webmaster ownership, sitemap submission and page indexing with authenticated property evidence. Do not confuse a valid sitemap with indexed URLs.
- Capture mobile field Core Web Vitals (LCP, INP, CLS) and lab results separately, with page URLs, dates and device classes.
- Map each commercial search intent to one primary canonical page. Review titles, descriptions, headings, unique country-specific information, pricing claims, trust signals, FAQs and contextual internal links.
- Validate JSON-LD against rendered page content; avoid fabricated reviews, rankings, teacher qualifications or unsupported local business presence.
- Record earned backlinks and citations with actual published URLs and editorial relevance; never mark outreach as published.
- Compare GSC clicks/impressions/CTR and qualified free-trial enquiries by country, and measure enrolments where consented analytics supports attribution.

## Release safety
No production or DNS mutation until serving origin is verified. Use branch PR, test/build, stage, smoke test and then deploy through the actual hosting pipeline. Protect CMS, forms, lead data, Search Console verification files and existing routes.

## Status
This document is a release checklist, not evidence that fixes, indexing submissions, backlinks or ranking outcomes have been completed.
