import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLocation, locationLocale } from '../src/lib/locations.js';
import { schedulePreview, schedulingLocations } from '../src/lib/location-schedule.js';

test('western Canada future bookings use the 2026 provincial rules and preserve historical dates', () => {
  assert.equal(schedulePreview('2026-11-10', '18:00', 'America/Vancouver').utc, '2026-11-11T01:00:00.000Z');
  assert.equal(schedulePreview('2026-11-10', '18:00', 'America/Edmonton').utc, '2026-11-11T00:00:00.000Z');
  assert.equal(schedulePreview('2026-11-01', '01:30', 'America/Vancouver').ambiguous, false);
  assert.equal(schedulePreview('2027-03-14', '02:30', 'America/Edmonton').utc, '2027-03-14T08:30:00.000Z');
  assert.equal(schedulePreview('2026-01-15', '18:00', 'America/Vancouver').utc, '2026-01-16T02:00:00.000Z');
  assert.equal(schedulePreview('2026-11-10', '18:00', 'America/Toronto').utc, '2026-11-10T23:00:00.000Z');
  assert.equal(schedulePreview('2026-11-01', '01:30', 'America/Los_Angeles').ambiguous, true);
});

test('Canadian planner includes half-hour and non-seasonal clocks without inventing indexed city pages', () => {
  const country = getLocation('canada'), places = schedulingLocations(country);
  assert.equal(schedulePreview('2026-11-10', '18:00', places.find(p => p.slug === 'st-johns').timezone).utc, '2026-11-10T21:30:00.000Z');
  assert.equal(schedulePreview('2026-07-15', '18:00', places.find(p => p.slug === 'regina').timezone).utc, '2026-07-16T00:00:00.000Z');
  assert.equal(places.find(p => p.slug === 'halifax').timezone, 'America/Halifax');
  assert.equal(country.cities.some(p => p.slug === 'st-johns'), false);
  assert.equal(new Set(places.map(p => p.slug)).size, places.length);
});

test('priority country language and Open Graph regional identities agree', () => {
  for (const [slug, locale] of [['united-states', 'en_US'], ['united-kingdom', 'en_GB'], ['canada', 'en_CA'], ['australia', 'en_AU']]) assert.equal(locationLocale(getLocation(slug)), locale);
});
