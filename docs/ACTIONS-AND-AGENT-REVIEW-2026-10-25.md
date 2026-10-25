# Public interactions and agent-reference review — 25 October 2026

## Scope and evidence

The supplied `Custom_GPT_and_SEO_Workflow_Reference(1).pdf` is identical to the previous reference. Its evidence-first audit, USA-first content priorities, privacy, controlled implementation, QA and rollback practices inform this release. The owner's existing written instructions authorize these changes and deployment to the existing project. This is an implementation workflow, not a newly created or connected persistent Custom GPT. GA4, Search Console performance and rank-tracker access are not established.

A delegated read-only review independently reproduced the desktop Courses disclosure's hover/click conflict and the lost currency/planner preferences. The following concrete changes address them:

- Courses uses one click/keyboard disclosure model, with Escape returning focus and outside dismissal retained.
- Pricing passes the selected quote currency into the trial request. Valid currency and DST-aware local planner preferences appear in editable request notes and use the existing submission field. No currency conversion, price invention or confirmed scheduling is introduced.
- All 50 country directory cards have responsive, lazy-loaded map illustrations, reserved dimensions, descriptive alternatives and country links. Attribution remains visible.
- Certificate verification recovers from thrown network/configuration failures and enables retry with a useful message.

## Verification before publication

50 automated tests pass. ESLint has zero errors and 19 existing warnings; the production build passes. React review retained labelled controls, native semantics, stable keys, cleanup of document listeners, lazy images and server-generated image descriptors rather than sending the image manifest to the browser.

Twelve local browser check groups pass: home anchors; mobile navigation; explicit home enquiry; location search/reset and 50 illustrated cards; both currency selectors; planner query continuity; FAQ keyboard interaction; contact validation/confirmation; trial validation, back/next and prefills; certificate failure recovery/not-found; desktop pointer and keyboard navigation; article contents links. Two submissions and two certificate responses are browser fixtures, with zero unexpected writes and zero JavaScript errors. The local build uses test-only catalog transport fixtures to avoid unreliable local upstream access; these are ignored artifacts and are not deployed. No real message or trial record was created.

On the preceding live source `f2b8e3d309ee76f4fe14d076beacf7e121d869c6`, the public crawl fetched 206 pages including all 205 sitemap pages, with zero findings. All 205 metadata/schema/page-identity checks pass; 196 top images respond correctly. Nineteen desktop/mobile layouts pass. A separate read-only link audit checks 415 distinct internal destinations, 344 fragment targets and two contact-action syntaxes, with zero failures. All 21 distinct external destinations return HTTP 200; this does not validate social-profile identity or content.

The existing public certificate RPC was also checked read-only using a synthetic unissued identifier; it returned JSON null as expected. This does not verify issued student records or authenticated staff workflows. Live browser form checks will continue to use fixtures rather than writing dummy enquiries.

## Publication and limits

Final production source and post-release evidence are recorded after READY. Previous READY application deployment `dpl_EhaXFqmyP1pS6Y8HJy6R4U6CGgvw` is the immediate rollback candidate; it preserves homepage/country separation and the requested original homepage illustration.

No database, environment, DNS or original college website change is included. Actual remote form persistence, physical-device Safari, field Core Web Vitals, Google indexing/rank positions, a fresh Semrush score and the old report's unidentified certificate/SNI hostname remain unverified. The supplied overview does not establish that all original warnings are closed. See the visual/SEO issue ledger for those limits.
