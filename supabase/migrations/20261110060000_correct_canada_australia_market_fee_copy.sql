-- Correct two public market-guide copy issues against the approved pricing configuration.
-- Canada is currently quoted in USD; do not imply an approved CAD package.
-- Australia may show an approximate AUD conversion, so describe the source as the
-- latest available exchange rate rather than promising a same-day rate.
update public.pages
set body_html = replace(
  replace(
    replace(
      replace(
        body_html,
        '<p>Request approved fees in CAD before enrolling. Classes take place online; this location page does not represent a physical branch.</p>',
        '<p>OQC currently quotes Canadian learners in USD. Request the written USD fee before enrolling. Classes take place online; this location page does not represent a physical branch.</p>'
      ),
      '<h2>CAD prices: a guide first, then a confirmed quote</h2>',
      '<h2>Canadian fees: USD quotes and currency guidance</h2>'
    ),
    '<p>Where the college has published an approved CAD price, the package section below shows it. If no approved CAD amount exists, the site shows an approximate CAD figure converted from the US dollar price at today’s exchange rate. Treat it as a guide and request a written quote before enrolling; the converted figure is not itself the college’s fee. A quote should state the currency, billing period, lesson length and number of lessons.</p>',
    '<p>OQC currently quotes Canadian learners in USD. The package information on this page shows the published USD amounts. Ask Admissions to confirm the exact USD fee, lesson frequency, lesson length and accepted payment method before enrolling. If you use a CAD conversion to plan your budget, treat it as an estimate only; it is not a CAD price quoted by OQC. The final fee and payment currency are confirmed in writing before enrolment.</p>'
  ),
  'country=Canada&amp;currency=CAD',
  'country=Canada&amp;currency=USD'
)
where slug = 'locations-canada'
  and status = 'published'
  and deleted_at is null
  and body_html like '%Request approved fees in CAD before enrolling%'
  and body_html like '%CAD prices: a guide first, then a confirmed quote%'
  and body_html like '%at today’s exchange rate%';

update public.pages
set body_html = replace(
  body_html,
  'at today’s exchange rate',
  'at the latest available exchange rate'
)
where slug = 'locations-australia'
  and status = 'published'
  and deleted_at is null
  and body_html like '%at today’s exchange rate%';
