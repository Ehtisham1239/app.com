import { test } from "node:test";
import assert from "node:assert/strict";
import { convertMinor, currencyForCountry, displayPrice, isFreshRateTimestamp } from "../src/lib/fx.js";

const fx = { base: "USD", rates: { USD: 1, GBP: 0.79, PKR: 278.4, JPY: 151.2 } };

test("conversion rounds to a whole unit and needs both rates", () => {
  assert.equal(convertMinor(3000, "USD", "GBP", fx), 2400);
  assert.equal(convertMinor(3000, "USD", "PKR", fx), 835200);
  assert.equal(convertMinor(3000, "USD", "NOK", fx), null);
  assert.equal(convertMinor(3000, "USD", "GBP", null), null);
});

test("an approved price wins over a converted one, which is marked approximate", () => {
  const prices = [{ currency: "USD", amount_minor: 3000 }, { currency: "JPY", amount_minor: 450000 }];
  assert.deepEqual(displayPrice(prices, "JPY", fx), { amount_minor: 450000, currency: "JPY", approximate: false });
  const gbp = displayPrice(prices, "GBP", fx);
  assert.equal(gbp.approximate, true);
  assert.equal(gbp.amount_minor, 2400);
  assert.equal(gbp.from.currency, "USD");
  assert.equal(displayPrice(prices, "GBP", null), null);
});

test("daily FX snapshots are accepted only within the 36-hour freshness window", () => {
  const now = Date.parse("2026-11-11T00:00:00.000Z");
  const fresh = new Date(now - 24 * 60 * 60 * 1000).toUTCString();
  const stale = new Date(now - 37 * 60 * 60 * 1000).toUTCString();
  const future = new Date(now + 10 * 60 * 1000).toUTCString();

  assert.equal(isFreshRateTimestamp(fresh, now), true);
  assert.equal(isFreshRateTimestamp(stale, now), false);
  assert.equal(isFreshRateTimestamp(future, now), false);
  assert.equal(isFreshRateTimestamp("not-a-date", now), false);
  assert.equal(isFreshRateTimestamp(null, now), false);
});

test("visitor country maps to a display currency", () => {
  assert.equal(currencyForCountry("gb"), "GBP");
  assert.equal(currencyForCountry("us"), "USD");
  assert.equal(currencyForCountry("AU"), "AUD");
  assert.equal(currencyForCountry("AE"), "AED");
  // Owner decision (8 Nov 2026): every other country falls back to USD on the page.
  assert.equal(currencyForCountry("PK"), null);
  assert.equal(currencyForCountry("CA"), null);
  assert.equal(currencyForCountry("ZZ"), null);
  assert.equal(currencyForCountry(""), null);
});

test("currency options are limited to GBP, USD, AUD and AED", async () => {
  const { currencyOptions, DISPLAY_CURRENCIES } = await import("../src/lib/fx.js");
  assert.deepEqual(DISPLAY_CURRENCIES, ["AED", "AUD", "GBP", "USD"]);
  const plans = [{ prices: [{ currency: "USD" }, { currency: "ISK" }] }];
  const live = { rates: { USD: 1, GBP: 0.79, AUD: 1.5, AED: 3.67, PKR: 278, CAD: 1.4 } };
  assert.deepEqual(currencyOptions(plans, live, ["CAD", "PKR"]), ["AED", "AUD", "GBP", "USD"]);
  assert.deepEqual(currencyOptions(plans, { rates: { USD: 1, GBP: 0.79 } }), ["GBP", "USD"]);
  assert.deepEqual(currencyOptions(plans, null, ["NOK"]), ["AED", "AUD", "GBP", "USD"]);
});
