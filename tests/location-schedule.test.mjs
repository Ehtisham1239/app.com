import { test } from "node:test";
import assert from "node:assert/strict";
import { schedulePreview, schedulingLocations } from "../src/lib/location-schedule.js";
import { getLocation, locationTimeZone } from "../src/lib/locations.js";
import { CURRENCIES } from "../src/lib/constants.js";
import { LOCATIONS } from "../src/lib/locations.js";
import { validPriceAmount, formatMoney, toMinor, fromMinor } from "../src/lib/format.js";
import config from "../next.config.mjs";
test("city scheduling respects different zones and seasonal clock changes", () => {
  const us=getLocation("united-states"),la=us.cities.find(c=>c.slug==='los-angeles');
  assert.equal(locationTimeZone(us,la),'America/Los_Angeles');
  const winter=schedulePreview('2026-01-15','18:00',locationTimeZone(us,la));
  const summer=schedulePreview('2026-07-15','18:00',locationTimeZone(us,la));
  assert.equal(winter.utc,'2026-01-16T02:00:00.000Z');
  assert.equal(summer.utc,'2026-07-16T01:00:00.000Z');
  assert.equal(schedulePreview('2026-03-08','02:30','America/Los_Angeles'),null);
  assert.equal(schedulePreview('2026-11-01','01:30','America/Los_Angeles').ambiguous,true);
  assert.equal(schedulePreview('2026-02-30','18:00','Europe/London'),null);
  assert.equal(schedulePreview('','18:00','Europe/London'),null);
  assert.equal(schedulingLocations(getLocation('australia')).find(c=>c.slug==='perth').timezone,'Australia/Perth');
});
test("all location currencies are editable without creating or converting prices",()=>{
  for(const c of LOCATIONS)assert.ok(CURRENCIES.includes(c.currency),c.currency);
  assert.equal(new Set(CURRENCIES).size,CURRENCIES.length);
  assert.equal(validPriceAmount('1200','ISK'),true);
  assert.equal(validPriceAmount('12.50','ISK'),false);
  for(const input of ['', '-1', '0x100','1e4','1.234','999999999'])assert.equal(validPriceAmount(input,'EUR'),false,input);
  assert.equal(validPriceAmount('12.50','EUR'),true);
  assert.equal(fromMinor(toMinor('12.50')),'12.50');
  assert.match(formatMoney(120000,'ISK'),/1,200/);
});
test("legacy regional paths resolve directly to relevant routes",async()=>{
  const redirects=await config.redirects();
  const uk=getLocation('united-kingdom');
  for(const name of ['london','birmingham','manchester','leeds','bradford','leicester']){
    assert.ok(uk.cities.some(c=>c.slug===name));
    const r=redirects.find(r=>r.source===`/online-quran-classes-${name}`);
    assert.equal(r.destination,`/locations/united-kingdom/${name}`);assert.equal(r.permanent,true);
  }
  assert.equal(redirects.find(r=>r.source==='/online-quran-classes-uk').destination,'/locations/united-kingdom');
});
