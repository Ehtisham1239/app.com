# International SEO — five markets (2 Nov 2026)

## Architecture (observed in source; keep)
| Market | Hub URL | Locale | Currency | Indexable |
|---|---|---|---|---|
| United Kingdom | /locations/united-kingdom | en-GB | GBP | Yes |
| United States | /locations/united-states | en-US | USD | Yes |
| Canada | /locations/canada | en-CA | CAD | Yes |
| Australia | /locations/australia | en-AU | AUD | Yes |
| United Arab Emirates | /locations/united-arab-emirates | en-AE | AED | Yes (since #60) |
| Cities and all other countries | /locations/{country}/{city} | — | — | noindex,follow until local proof |

## Decisions
- **Keep `/locations/{country}`**; do not add `/usa/`, `/uk/` duplicates — they would cannibalise hubs that already carry redirects from the WordPress URLs.
- **No hreflang for now.** All pages are English with one URL per market topic; hreflang is for alternate-language/region versions of the *same* page. Revisit if separate localized versions of course pages are ever made.
- **No IP redirects.** Currency is preselected from the visitor's country without redirecting (owner decision, 29 Oct).
- **City pages stay noindex.** Search Console shows impressions on Houston, Perth, Melbourne pages; that demand is served by country hubs until a city has real local proof.

## Per-market differentiation required on each hub
Local time-zone table (exists), currency fee answer, local spelling, market FAQ, one supporting guide (UK ✔ several, USA ✔, Australia ✔, Canada ✗, UAE ✗), statement that lessons are online with no local branch.

Details per market: `../FOUR-MARKET-ORGANIC-GROWTH-PLAN-2026-11-02.md` and `../UAE-ORGANIC-GROWTH-AND-CITATION-PLAN-2026-11-02.md`.
