# Google Business Profile — eligibility and ownership (2 Nov 2026)

## Result: **NOT ELIGIBLE as currently operated · EXISTING PROFILES FOUND (3) · NEEDS OWNER DECISION**

## Policy (Google, checked 2 Nov 2026)
Google's [Business eligibility and ownership guidelines](https://support.google.com/business/answer/13763036) list online-only businesses as ineligible and require a business to make in-person contact with customers during its stated hours. A website, phone number, company registration or social page does not establish eligibility.

## OQC operating model (evidence)
- The website, CMS identity and GBP descriptions all describe **live one-to-one online classes**. No page describes students visiting an office or teachers visiting students.
- Owner memory notes "offices in the UK and Pakistan". Whether either is a staffed, signed place that customers visit during stated hours is **unknown** — this is the one fact that could change the decision.

## Existing profiles found (Windsor `google_my_business`, 2 Nov 2026)
| Location ID | Google account | Title | Category | Location data | Phone | State |
|---|---|---|---|---|---|---|
| `locations/15442025055679711918` | "Ahsan Khan" | Onlinequrancollege | Tutoring service (+ Language school, Adult education school) | Storefront: Office 86, 90 Paul St, London EC2A 4NE; open 24 h, 7 days; on Maps (place ID present) | 07864 710821 | Account UNVERIFIED; 0 reviews |
| `locations/5356844952591777351` | "Tech" | Online Quran College | Educational institution | Service-area: Canada, Australia, United States, United Kingdom (whole countries) | +44 7864 710821 | Account UNVERIFIED; 0 reviews |
| `locations/11885523329700989684` | "Tech" | Online Quran College | Educational institution | Service-area: Mansehra, Pakistan | +44 7864 710821 | Account UNVERIFIED; 0 reviews |

Performance metrics for these locations returned HTTP 403 ("caller does not have permission"), consistent with unverified profiles.

## Risk assessment
1. **London listing** — 90 Paul Street is a registered-office address shared by many unrelated organisations (see Companies House / Charity Commission search results), a typical virtual-office pattern. Listing it as a 24/7 storefront for an online-only service is the misrepresentation Google suspends for. The title "Onlinequrancollege" also differs from the brand name.
2. **Four-country service area** — service-area profiles are for businesses that travel to customers; OQC does not. Whole-country areas are a further red flag.
3. **Mansehra listing** — only defensible if a real, staffed, signed office there receives customers during stated hours. Its UK phone number does not match a Pakistan location.
4. **Three profiles, two Google accounts** — duplicates split the entity and risk all being suspended together. Primary ownership must sit with the business owner's account.

## Recommended decision (owner)
- **If no office receives customers in person:** remove all three listings (Business Profile Manager → Business Profile settings → Remove business profile, done by the account owner), then rely on the compliant alternative below. Zero reviews and no verification means nothing of value is lost.
- **If the Mansehra office genuinely receives customers during set hours:** keep **one** profile only, as a storefront at that real address, with a Pakistan phone, real hours, owner as primary owner; remove the London and four-country listings. Follow `OQC_GBP_SETUP_CHECKLIST.md`.
- Do not verify the London or four-country listings under any option.

Removal is irreversible and is the owner's call, so no profile was changed in this session (Windsor offers write actions; none were run).

## Compliant alternative (in force now)
Country hubs for USA/UK/Canada/Australia/UAE; consistent Organization data and `sameAs`; Search Console and Bing; Trustpilot neutral invitations; LinkedIn/YouTube/Facebook/Instagram brand profiles; curated education directories that accept online academies — per `../CITATION-AUTHORITY-IMPLEMENTATION-2026-11-02.md`.
