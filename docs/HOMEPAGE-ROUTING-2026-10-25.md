# Homepage and country routing — 25 October 2026

The homepage now remains `/` for every visitor. Automatic desktop geo-redirects, the region-seen cookie decision and the `view=global` requirement have been removed. Existing `?view=global` bookmarks still open the homepage; a normal home link no longer needs that parameter. Country/city pages remain separate, explicitly selected pages at `/locations/{country}` and `/locations/{country}/{city}`.

The session proxy now runs only for `/admin/:path*` and `/auth/:path*`; the existing staff/auth handling is preserved. The obsolete geo-routing helper and its old smoke test are removed. Canonical country/city URLs and the existing redirect configuration are retained.

## Local verification

- Clean production build passes; 46 automated tests pass.
- Lint: zero errors and 19 existing warnings.
- 45 homepage checks cover desktop/mobile/crawler user agents, seven country-header values, fresh/returning cookies, campaign queries, legacy global-view queries and HEAD requests. Every case returns HTTP 200 without a Location header or new region cookie. Local headers simulate platform inputs; they are not physical-country tests.
- All 187 configured legacy redirects return their intended 308/307 status and preserve UTM/gclid query parameters. Their 178 distinct final destinations return 200 without another redirect. The 165 country/city CMS aliases lead to their own pages. There are no duplicate, self, external or chained configured targets.
- Three unknown pages remain 404, and unauthenticated `/admin` still redirects to `/admin/login`.
- Chromium checks pass for fresh desktop, returning desktop with the old region cookie and fresh Android emulation: home entry, explicit USA navigation, logo return to Home, reload at Home and direct UK/Australia pages. No browser JavaScript errors were observed and no form was submitted. Third-party chat was stubbed.

The newer GitHub commit adding the Google Search Console verification HTML file is preserved as the parent of this change. No database, environment, domain or private staff setting is changed.

## Release

Source commit, production deployment and live checks are recorded after publication. Local machine-readable evidence is in `artifacts/home-routing/` (ignored generated output). Browser emulation does not establish physical device coverage or a fresh SEO-platform score.
