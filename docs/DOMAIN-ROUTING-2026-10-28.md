# Domain and 404 verification — 28 October 2026

Production application release: `28a2e64bf8a587ddbbed69519f8a7ed0bb55c444`, deployment `dpl_5PrY4r83ZHeo3XYteZ9wmMqAajHq` (READY).

## Observed

- `https://www.onlinequrancollege.com/` returns 200.
- `https://onlinequrancollege.com/` returns 308 to the www HTTPS homepage.
- Both project domains are verified; www resolves to the new production deployment.
- All 202 declared sitemap URLs return 200 with zero technical findings or request errors. The three additional internally linked paths are staff portal, RSS and certificate verification; their responses are expected 307/200/200.
- Legacy `/login.html`, `/register`, `/terms-conditions`, `/noorani-qaida` and `/online-quran-classes-usa` redirect to their intended destinations.
- Unknown-route probes correctly return real 404/noindex responses. These deliberate probe URLs are not published pages or evidence of broken navigation.
- HTTP-only probes failed from this execution network; this is not evidence that the user's HTTP domain is broken. HTTPS checks above succeeded.

## DNS warning

The Vercel configuration API reports external nameservers `ns1.dns-parking.com` and `ns2.dns-parking.com`, `misconfigured:false`, no conflicts, and `ipStatus:required-change`. Apex currently resolves to `216.198.79.1`; www uses `9813a7ebd246ed1c.vercel-dns-017.com`. The current domain/project inspection recommends apex A `76.76.21.21` and CNAME `cname.vercel-dns.com`. These are observations of this API response, not a universal DNS prescription or proof that the warning causes a 404.

No authoritative DNS change was made. This external DNS zone cannot be changed through the existing Vercel project connection; the registrar/domain-account read also returns provider 403. No DNS-management connector for the external provider was found (Hostinger Mail does not manage DNS). Preserve MX/TXT/email records and re-inspect the exact current recommendations in the domain's dashboard before an authorized record update.

## Missing reproduction

No broken published route was reproduced. Obtain the exact failing URL and the domain dashboard's error text before adding a redirect, changing DNS or claiming the reported issue fixed. Do not redirect all unknown URLs to the homepage or change nameservers to conceal a 404.

Raw HTTP probes, technical sitemap results and browser reports are under ignored `artifacts/live-release-20261028/`. These checks are not a Google Search Console coverage report or a guarantee of global DNS propagation.
