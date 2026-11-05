# OQC entity schema and citation authenticity closeout — 5 November 2026

## Scope
Review of the existing Organization JSON-LD, CMS identity settings, country-hub reference links and external citation register. This document distinguishes website implementation from independently verified third-party profiles and search outcomes.

## Organization entity — source review
The shared site layout emits one JSON-LD graph containing:
- WebSite with a stable `/#website` identifier and publisher reference.
- EducationalOrganization with a stable `/#organization` identifier.
- Brand name and alternate name, canonical website, logo and representative site imagery.
- CMS-configured legal name, description, public email and phone/contact point.
- Online service areas for the five indexed markets and a list of the education topics shown on the site.
- Public profile URLs configured in CMS social settings as `sameAs` references.
- A postal address only if a complete street address and a two-letter country code are explicitly configured.

### Authenticity correction in this release
The prior layout conditionally emitted `foundingDate` from the CMS `site.identity.established` field. The CMS currently contains 2018. Public records show a dissolved company with the same legal name (company number 13629654; incorporated 17 September 2021; dissolved 20 February 2024), while a secondary register aggregator reports a separate active same-name company (number 17075457; incorporated 6 March 2026). The official Companies House page for the latter could not be directly retrieved in this audit. These records must not be conflated, and neither proves that the CMS 2018 value is the legal entity's founding date. The schema therefore no longer emits `foundingDate` from this field pending owner-confirmed documentary evidence.

The public About page CMS content inspected for this closeout contains no founding-year, student-count or country-count claim. The unused CMS `established` value remains an administrative field and must not be reintroduced into structured data without documentary evidence and owner approval.

No registered-office address is emitted as a customer-facing location. OQC remains represented as an online-only provider with no walk-in office. Do not add LocalBusiness, a fictitious branch, local city NAP, or a virtual-office address.

## On-page authoritative references
The five market hubs expose a visible “Official guidance and reference links” section. Its links are primary government/regulator resources relevant to the specific guidance on those pages:
- UK: GOV.UK, Information Commissioner's Office and ASA/CAP.
- USA: US Department of Transportation and Federal Trade Commission.
- Canada: National Research Council, CRTC and Office of the Privacy Commissioner.
- Australia: Fair Work Ombudsman, ACMA and ACCC.
- UAE: UAE Government and Abu Dhabi Department of Economic Development.

These are references supporting time-zone, privacy, marketing, consumer-protection and licensing explanations. They are not endorsements of OQC and must not be described as acquired backlinks or business citations.

## External entity/profile citations
The global citation tracker records existing website-linked Facebook, Instagram, X and Trustpilot profiles. Their public URLs are known from the website/CMS, but account-admin ownership and third-party profile edits were not independently verified in this closeout. LinkedIn, YouTube and Apple Business remain owner-controlled optional work.

No new third-party profile was created, no editorial outreach was sent, and no external backlink placement is claimed. RISE, ISRE and ISLA opportunities remain conditional on owner approval and academic review. Google Business Profile and generic local directories remain excluded while OQC is online-only and has no eligible in-person customer-contact location.

## Remaining verification gates
1. Owner/admin should verify each existing social and Trustpilot account and confirm public contact details before editing third-party profiles.
2. Verify the legal entity directly on the official Companies House record before adding a company number, registry URL, registered-office address or incorporation date to structured data.
3. Keep the CMS `established` field out of JSON-LD until the 2018 brand-start claim has documentary evidence and owner approval.
4. Use Google's Rich Results Test and Search Console URL Inspection on the deployed homepage. A syntactically valid schema graph does not guarantee a knowledge panel, rich result or ranking improvement.
5. Obtain owner approval before any external publisher submission or outreach.

## Official policy references
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google general structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Companies House register: https://find-and-update.company-information.service.gov.uk/

## Release boundary
This closeout covers a source-code correction and automated regression coverage. Production deployment, live Rich Results validation, authenticated Search Console URL Inspection and third-party account verification must be recorded only after their respective systems return evidence.
