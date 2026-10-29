import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { auditPage, launchAuditBrowser } from './lib/browser-audit.mjs';

const base = process.argv[2] || 'http://127.0.0.1:3046';
const out = process.argv[3] || 'artifacts/trial-hydration';
mkdirSync(out, { recursive: true });
const report = { base, errors: [], writes: 0, cases: [], scope: 'SSR/hydration across visitor time zones; vendors inert; invalid submissions only' };
const browser = await launchAuditBrowser();
try {
  for (const timezoneId of ['UTC', 'America/Los_Angeles', 'Asia/Karachi']) {
    const session = await auditPage(browser, base, report, { viewport: { width: 390, height: 900 }, timezoneId });
    try {
      for (const path of ['/free-trial', '/free-trial?country=United+States&city=Los+Angeles']) {
        const page = session.page;
        assert.equal((await page.goto(base + path, { waitUntil: 'domcontentloaded' })).status(), 200);
        await page.waitForLoadState('load');
        await page.getByRole('form', { name: 'Book a free trial', exact: true }).waitFor();
        // Exercise a real pointer interaction before programmatic selection; it
        // activates a selectively hydrated form on a slow connection.
        await page.locator('#q-country').click();
        await page.keyboard.press('Escape');
        if (path.includes('country=')) assert.equal(await page.locator('#q-country').inputValue(), 'United States');
        await page.locator('#q-country').selectOption('United States');
        await page.locator('#q-zone').selectOption('America/Chicago');
        await page.locator('#q-teacher_preference').selectOption('Female teacher');
        // Selecting another field must not overwrite a visitor's explicit time zone.
        assert.equal(await page.locator('#q-zone').inputValue(), 'America/Chicago');
        await page.getByRole('button', { name: 'Book my free trial', exact: true }).click();
        await page.locator('#q-learner_name-error').waitFor();
        assert.equal(await page.locator('#q-learner_name').evaluate(el => document.activeElement === el), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        report.cases.push({ timezoneId, path, queryCountryPreserved: true, manualZonePreserved: true, teacherPreference: true, invalidSubmissionBlocked: true });
      }
    } finally { await session.close(); }
  }
  assert.deepEqual(report.errors, []);
  assert.equal(report.writes, 0);
} finally { await browser.close(); writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify({ cases: report.cases.length, errors: report.errors.length, writes: report.writes }));
