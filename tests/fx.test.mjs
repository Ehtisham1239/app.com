import { test } from "node:test";
import assert from "node:assert/strict";
import { convertMinor, currencyForCountry, displayPrice } from "../src/lib/fx.js";

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

test("visitor country maps to a display currency", () => {
  assert.equal(currencyForCountry("gb"), "GBP");
  assert.equal(currencyForCountry("PK"), "PKR");
  assert.equal(currencyForCountry("ZZ"), null);
  assert.equal(currencyForCountry(""), null);
});

test("currency options keep USD and approved currencies and drop codes without a live rate", async () => {
  const { currencyOptions } = await import("../src/lib/fx.js");
  const plans = [{ prices: [{ currency: "USD" }, { currency: "ISK" }] }];
  const options = currencyOptions(plans, { rates: { USD: 1, GBP: 0.79, PKR: 278 } }, ["GBP"]);
  assert.ok(options.includes("USD") && options.includes("ISK") && options.includes("GBP") && options.includes("PKR"));
  assert.ok(!options.includes("NOK"));
  assert.ok(currencyOptions(plans, null, ["NOK"]).includes("NOK"));
});
