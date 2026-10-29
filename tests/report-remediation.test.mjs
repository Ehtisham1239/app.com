import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COURSE_SUPPORT, supplementalCourseFaqs } from '../src/lib/course-support.js';
import { isTrialEligible } from '../src/lib/trial-eligibility.js';
import config from '../next.config.mjs';

const seed = JSON.parse(readFileSync(new URL('../src/lib/seed-content.json', import.meta.url)));
test('every course has useful existing support destinations and distinct visible FAQs', () => {
  const existing = new Set(['/learn#course-comparison', '/courses/tajweed', '/learn/islamic-studies-for-kids', ...seed.courses.map(c => `/courses/${c.slug}`), ...seed.posts.map(p => `/blog/${p.slug}`)]);
  for (const course of seed.courses) {
    assert.ok(COURSE_SUPPORT[course.slug].length >= 2);
    for (const [path] of COURSE_SUPPORT[course.slug]) { assert.ok(existing.has(path), path); assert.ok(course.description_html.includes(`href="${path}"`), `${course.slug}: contextual link`); }
    const faqs = supplementalCourseFaqs(course.slug);
    assert.ok(faqs.length >= 2);
    assert.equal(supplementalCourseFaqs(course.slug, faqs).length, 0, 'deduplicate editor-supplied questions');
  }
});
test('Weekend and trial-ineligible packages cannot advertise a trial; default enquiry keeps trial choice', () => {
  assert.equal(isTrialEligible(), true);
  assert.equal(isTrialEligible({ name: 'Package 1', trial_days: 3 }), true);
  assert.equal(isTrialEligible({ name: 'Weekend', trial_days: 3 }), false);
  assert.equal(isTrialEligible({ name: 'Other package', trial_days: 0 }), false);
  assert.equal(isTrialEligible({ name: 'Other package' }), false);
});
test('verified Hifz legacy alias is a single direct permanent route without a redirect chain', async () => {
  const rules = await config.redirects();
  const rule = rules.find(r => r.source === '/hifz-ul-quran-course');
  assert.equal(rule.destination, '/courses/hifz-quran');
  assert.equal(rule.permanent, true);
  assert.equal(rules.some(r => r.source === rule.destination), false);
});
