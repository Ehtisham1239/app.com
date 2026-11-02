# Measurement dashboard spec (2 Nov 2026)

| KPI | Definition | Source | Cadence | Baseline (28 d to 2 Nov) |
|---|---|---|---|---|
| Non-brand clicks by market | GSC clicks, query not containing "quran college"/"oqc" | Search Console | Weekly | ≈0 in US/UK/CA/AU/AE |
| Impressions by market | GSC impressions per country | Search Console | Weekly | UK 129 · US 125 · AU 115 · CA 13 · AE 5 |
| Hub position | Avg position of each country hub | Search Console (page filter) | Weekly | UK hub n/a (city/legacy URLs carry data) · AU 89.4 · US 58.5 · CA 7 (1 imp) |
| Priority query position | "online quran classes {country}" | Search Console | Weekly | UK 13.3 · AU 89.7 · CA 83 |
| Trial form starts / submits | `form_start` / `generate_lead` | GA4 via GTM | Weekly | Pull from GA4 property 560748871 |
| Qualified leads, trials attended, paid enrolments by country | CRM/ERP records with source = organic | Admissions | Monthly | Not connected |
| GBP | Listings count, verification | GBP | Monthly | 3 unverified (target: 0 or 1 eligible) |
| Trustpilot | Reviews in last 90 days | Trustpilot | Monthly | 0 in last 12 months (29 Oct check) |
| AI-answer mentions | Prompt set in GEO framework | Manual log | Monthly | Not measured |

Rules: always show date range and source; separate measured values from estimates; never count CTA clicks as bookings.
