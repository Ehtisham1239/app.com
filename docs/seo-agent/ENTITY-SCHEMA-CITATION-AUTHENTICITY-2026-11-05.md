# OQC Organization entity and citation authenticity review
**Date:** 5 November 2026  
**Repository:** Ehtisham1239/app.com  
**Production domain:** https://www.onlinequrancollege.com

## Organization JSON-LD
The shared site layout emits a stable WebSite and EducationalOrganization/Organization graph with:
- Stable `/#website` and `/#organization` identifiers.
- Public brand name, alternate name, canonical URL and logo imagery.
- Description, public email/telephone and Admissions contact point.
- Online service coverage across the five indexed markets and the subjects visible on the website.
- A claimed Trustpilot profile as the only currently verified `sameAs` identity link.
- A postal address only when a complete street address and two-letter country code are explicitly configured.

The graph intentionally omits `legalName`, `foundingDate`, company number and postal address until the owner confirms the current contracting legal entity and supplies documentary evidence. The CMS legal-name and established-year fields are not sufficient on their own to reconcile the public company history.

## Identity evidence requiring owner reconciliation
- CMS currently contains legal name text “Online Quran College Ltd” and a residual `established=2018` value.
- A LinkedIn page for Online Quran College LTD surfaced with “Trusted since 2014” wording; the profile's ownership and claim basis were not independently verified.
- Companies House directly confirms a same-name company 13629654 was incorporated on 17 September 2021 and dissolved on 20 February 2024: https://find-and-update.company-information.service.gov.uk/company/13629654
- A secondary company index lists a current same-name company 17075457, incorporated 6 March 2026, but the corresponding official Companies House page could not be retrieved in this audit: https://companystack.co.uk/company/17075457
- These records may represent different entities or brand-history periods. Do not infer that they are the same legal entity. Owner/legal confirmation is required before publishing a founding year, legal name, company number or registered office.

## Citation and review evidence
- Trustpilot public profile is marked claimed and, in the latest search snapshot, shows 9 reviews and a 4.3 TrustScore, with one review in the last 12 months. This is a small sample and not a basis for Review/AggregateRating structured data.
- Facebook, Instagram and X URLs are configured in CMS but direct profile retrieval and account-admin ownership were not verified. They remain normal outbound links, not Organization `sameAs` entries, until confirmed by the owner.
- Read-only CMS aggregates on 5 November show six public active teacher records. Each has qualification text, language entries, years-of-experience values and a verification note; none has a public photo URL. The existence of a note is not independent proof of credentials. Publish only evidence that Admissions/Academics can substantiate and that the teacher has consented to share.
- The public testimonials table has zero published rows and zero published rows with a consent timestamp. Do not invent on-site reviews or create Review/AggregateRating schema from third-party reviews.
- Government/regulator links on market hubs are reader references, not endorsements, inbound backlinks or business directory citations.

## Structured data guardrails
- Mark up only facts visible to users and supported by evidence.
- Do not add foundingDate, legalName, employee counts, student counts, awards, licences, teacher credentials, ratings or testimonials without documentation and approval.
- Country/city Service schema represents remote tuition availability; it does not imply a local branch.
- Do not add LocalBusiness or a physical address for the online-only model.
- Structured data may help search engines interpret a page, but does not guarantee rich results, knowledge panels, AI citations or ranking gains.

## Official references
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Companies House public register: https://find-and-update.company-information.service.gov.uk/

## Release checks
Regression tests ensure the Organization graph does not publish an unsupported `foundingDate` or `legalName`, and only the claimed Trustpilot URL is included in `sameAs`. After deployment, validate the homepage JSON-LD with Google's Rich Results Test and Search Console URL Inspection. A successful syntax test does not guarantee a rich result or ranking change.
