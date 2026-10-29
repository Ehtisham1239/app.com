import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { auditPage, launchAuditBrowser } from './lib/browser-audit.mjs';
import { COURSE_SUPPORT } from '../src/lib/course-support.js';
const base = process.argv[2] || 'http://127.0.0.1:3033';
const out = process.argv[3] || 'artifacts/report-remediation';
mkdirSync(out, { recursive: true });
const seed = JSON.parse(readFileSync(new URL('../src/lib/seed-content.json', import.meta.url)));
const weekend = seed.plans.find(p => /weekend/i.test(p.name));
const report = { base, errors: [], writes: 0, cases: [], scope: 'Local production build; vendors inert; no final enquiry submitted or real analytics sent' };
const browser = await launchAuditBrowser();
try {
  for (const width of [390, 1440]) {
    const session = await auditPage(browser, base, report, { viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 768 });
    const { page } = session;
    try {
      for (const course of seed.courses) {
        const response = await page.goto(`${base}/courses/${course.slug}`, { waitUntil: 'load' });
        assert.equal(response.status(), 200);
        assert.equal(await page.getByRole('heading', { name: 'Prepare for this learning path', exact: true }).count(), 1, 'no duplicate CMS/template support');
        for (const [path] of COURSE_SUPPORT[course.slug]) assert.ok(await page.locator(`.prose-oqc a[href="${path}"]`).count());
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        report.cases.push({ width, course: course.slug, contextualLinks: true, overflow: false });
      }
      const params = new URLSearchParams({ country: 'United States', city: 'Los Angeles', currency: 'USD', lesson_date: '2026-11-02', lesson_time: '18:00', lesson_timezone: 'America/Los_Angeles' });
      await page.goto(`${base}/free-trial?${params}`, { waitUntil: 'load' });
      const prefs = page.getByLabel('Your enquiry preferences');
      assert.match(await prefs.innerText(), /2026-11-02 18:00 \(America\/Los_Angeles\)/);
      assert.equal(await page.locator('#q-zone').inputValue(), 'America/Los_Angeles');
      await page.locator('#q-teacher_preference').selectOption('Female teacher');
      assert.equal(await page.locator('#q-teacher_preference').inputValue(), 'Female teacher');
      await page.getByRole('button', { name: 'Book my free trial', exact: true }).click();
      await page.locator('#q-learner_name-error').waitFor();
      assert.equal(await page.locator('#q-learner_name').evaluate(el => document.activeElement === el), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      report.cases.push({ width, plannerPreferenceVisible: true, teacherPreference: true, invalidSubmissionBlocked: true });
      await page.goto(`${base}/pricing`, { waitUntil: 'load' });
      const card = page.locator('.pricing-card').filter({ has: page.getByRole('heading', { name: 'Weekend', exact: true }) });
      await card.getByRole('link', { name: 'Enquire about this plan', exact: true }).click();
      await page.waitForURL(url => url.searchParams.get('plan') === weekend.id);
      assert.match(await page.locator('h1').innerText(), /Enquire about Weekend/);
      await page.getByRole('button', { name: 'Send package enquiry', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Book my free trial', exact: true }).count(), 0);
      assert.match(await page.getByLabel('Your enquiry preferences').innerText(), /Selected package: Weekend/);
      report.cases.push({ width, weekendEnquiry: true, planContext: true, noTrialOffer: true });
      const legacy = await session.context.request.get(`${base}/hifz-ul-quran-course?utm_source=oqc-migration-qa`, { maxRedirects: 0 });
      assert.equal(legacy.status(), 308);
      assert.match(legacy.headers().location, /\/courses\/hifz-quran\?utm_source=oqc-migration-qa$/);
      report.cases.push({ width, hifzPermanentRedirect: true, queryPreserved: true });
    } finally { await session.close(); }
  }
  assert.deepEqual(report.errors, []);
  assert.equal(report.writes, 0);
} finally { await browser.close(); writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify({ cases: report.cases.length, errors: report.errors.length, writes: report.writes }));
