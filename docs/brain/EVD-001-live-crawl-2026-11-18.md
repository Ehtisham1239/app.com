---
id: EVD-001
type: evidence
date: 2026-11-18
method: in-browser fetch of all sitemap URLs on https://www.onlinequrancollege.com, 145 URLs
---
# EVD-001 Live crawl

**Observed**
- 145/145 sitemap URLs 200; 0 noindex; 0 canonical mismatches; 0 pages without exactly one h1; 0 invalid JSON-LD; 0 images without alt; 0 duplicate titles or descriptions.
- Schema: country/city = Service+FAQPage+BreadcrumbList+WebPage; blog = BlogPosting+BreadcrumbList; courses = Course (6 of 7) +FAQPage; teachers = Person (no BreadcrumbList).
- hreflang only on the 5 hubs (reciprocal), as designed.
- Median words: blog 774, courses 641, country 666, city 557, teachers 138 (126 to 141).
- Inbound internal links: 51 restored location pages had exactly 1 (the /locations directory); `/usa-quran-classes` 0; 4 teacher pages and 1 blog post had 1.
- Headers: HSTS preload, nosniff, referrer-policy, gzip. robots.txt lists both sitemaps; llms.txt 200; sitemap.txt 200. Unknown URL -> 404 + noindex.
- `/favicon.ico` -> 404.
- Home: TTFB 135 ms, load ~1.5 s, CLS 0.009. Oslo page: TTFB 317 ms, load 0.8 s, CLS 0, 62 KB.

**Limits (Unknown):** no field Core Web Vitals, no Search Console performance data (Windsor reads paused), 2 pages sampled for speed, crawl ran from one browser.
