# OQC Organization entity and citation authenticity review
**Date:** 5 November 2026  
**Repository:** Ehtisham1239/app.com  
**Production domain:** https://www.onlinequrancollege.com

## Organization JSON-LD
The shared site layout already emits a stable WebSite and EducationalOrganization/Organization graph with:
- Stable `/#website` and `/#organization` identifiers.
- Public brand name, alternate name, canonical URL, logo imagery, description, contact email/telephone and Admissions contact point. The optional `legalName` property is withheld until the exact active Companies House entity is confirmed.
- Online service coverage across the five indexed markets and the subjects visible on the website.
- Only the exact OQC Trustpilot profile URL in `sameAs`; other social URLs remain footer links until account identity is confirmed.
- A postal address only when a complete street address and two-letter country code are explicitly configured.

### Authenticity correction
The CMS has an `identity.established` value of 2018, but the available evidence does not establish that this is the legal entity's incorporation date. An older same-name Companies House entity (13629654) is officially dissolved; a newer same-name company record (17075457) appears in secondary registry sources but needs direct Companies House and owner confirmation. Brand trading history and company incorporation are different facts. This release omits both `foundingDate` and `legalName` until the exact active legal entity and documentary evidence are confirmed.

Do not add a company number, legalName, registered office, LocalBusiness, virtual office, country branch or physical address without an official source and owner confirmation. OQC's public positioning is online-only with no walk-in office.

## Structured data guardrails
- Mark up only facts visible to users and supported by the page.
- Do not add AggregateRating/Review schema for third-party Trustpilot reviews or unsupported ratings.
- Do not add foundingDate, employee counts, student counts, awards, licences or credential claims unless documented and publicly visible.
- Country/city service schema represents remote tuition availability; it does not imply a local branch.
- Structured data may help search engines interpret a page, but does not guarantee rich results or ranking gains.

## Citation and review evidence
- Existing website-linked Facebook, Instagram, X and Trustpilot URLs are present in the citation tracker; profile admin ownership and third-party profile edits have not been verified in this review. Only the exact OQC Trustpilot review URL is retained as `sameAs` because the official site links directly to that exact brand profile; this does not certify account-admin ownership. Other social links remain ordinary outbound links.
- A read-only CMS count on 5 November 2026 returned six public teacher records (all six active) and zero published testimonial records, including zero published records with a consent timestamp.
- Teacher records include owner-confirmation notes dated 3 November 2026 for the six public profiles. Preserve those records and publish only the verified individual fields.
- Do not publish testimonial cards, review aggregate schema, review counts or average ratings until genuine review records and explicit publication consent are recorded.
- Government/regulator links on market hubs are reader references, not endorsements, inbound backlinks or business directory citations.

## Official references
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Companies House public register: https://find-and-update.company-information.service.gov.uk/

## Release checks
The PR includes regression tests that fail if `foundingDate` or `legalName` is reintroduced without verification, and that restrict `sameAs` to the exact OQC Trustpilot profile. After deployment, validate the homepage JSON-LD with Google's Rich Results Test and Search Console URL Inspection. A successful syntax test does not guarantee a rich result or ranking change.
