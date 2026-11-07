# OQC CMS video and market SEO · 7 November 2026

## Implementation

- CMS → Pages → Video supports public YouTube URLs and MP4 uploads up to 10 MB for staff with existing media-create permission. Save uses the existing page version, RLS and publishing permissions. A thumbnail is required for MP4. The player accepts only normalized YouTube URLs and OQC-hosted video sources. Uploaded media objects are public even if the page is still a draft.
- Dedicated video pages show the player as the main content and publish matching VideoObject and sitemap entries when indexable. Supplementary videos on ordinary CMS pages do not get a watch-page sitemap entry. Publish only videos with rights, accurate metadata and an accessible transcript.
- The first-party 15-second admissions explainer includes the official OQC logo, approved 3-day offer, poster and visible transcript. The Free Trial page links to its watch page and the watch page links back to booking. No YouTube account or external video upload was used.
- The CMS SEO preview classifies internal links, external references, section links and unsafe placeholders. It does not perform a URL reachability test. The USA hub labels existing city links with New York, California, Illinois and Texas. No duplicate state pages or claims of local branches were added.
- [State and country keyword map](../../seo/OQC-MARKET-KEYWORD-TARGETS-2026-11-07.csv) assigns short terms, longer queries and question phrases to existing or prepared destinations. These editorial targets carry no invented volume, ranking or difficulty estimates. Keep the separate [500-keyword baseline](../../seo/OQC-500-KEYWORD-MAP-2026-11-05.csv) for dated Search Console evidence and semantic candidates.

## Free citation handoff

The [50-domain register](CITATION-QUALIFICATION-2026-11-07.csv) remains the screening record. Use the following listing text only after confirming duplicate status, address-free eligibility and the free tier. Leave the address blank where allowed.

**Name:** Online Quran College

**Category:** Online education / Quran classes

**Website:** https://www.onlinequrancollege.com/

**Description:** Online Quran College offers live one-to-one Quran lessons for children and adults. Admissions helps families choose a course and a suitable lesson time.

**Contact and logo:** [Official contact page](https://www.onlinequrancollege.com/contact) and [official mark](https://www.onlinequrancollege.com/brand/mark-v2-128.png).

| Candidate | Public evidence | Gate before submission |
|---|---|---|
| [MuslimMap](https://muslimmap.co.uk/for-businesses) | Advertises a free standard listing and a Quran Classes category | Confirm address-free eligibility in the current listing form |
| [The Ummah Directory](https://theummah.io/resources/businesses/submit/) | Accepts submissions from service brands and organizations | Confirm free listing, eligibility and whether the public profile has a website link |
| [Support Muslim](https://www.supportmuslim.com/directory/faq.aspx) | Free registration and listing described | Instructions ask for a business address. Hold unless the operator supports an accurate online-only listing |

No listings, link placements or paid activity were executed. Third-party backlinks are counted only after a public referring page is verified. The 130-domain and 5,000-new-link targets remain open. Search ranking and organic traffic outcomes require post-release evidence.

## Production sequence and evidence

1. Review the video schema and MP4 MIME migration. Apply it to the intended Supabase project before enabling CMS video saves and uploads. Existing page reads fall back when the optional column is absent.
2. Deploy the reviewed commit and verify the production domain, public video playback, thumbnail response, video sitemap, canonical and mobile layout. Sign in as an authorized page editor to verify draft, upload and publish workflows.
3. Connect the authorized YouTube channel only if cross-posting is wanted. Use Search Console and GA4 to measure indexed watch pages, impressions, clicks and enquiry outcomes. Use the existing test and read-only SEO audit commands before and after release. No external account, new production migration, new citation submission or authenticated CMS publish was performed in this pass.

References: [Google video SEO](https://developers.google.com/search/docs/appearance/video), [Google video structured data](https://developers.google.com/search/docs/appearance/structured-data/video), [Google search spam policies](https://developers.google.com/search/docs/essentials/spam-policies).
