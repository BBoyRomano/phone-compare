import assert from "node:assert/strict";
import test from "node:test";
import { factsFor, phones, sources, validateCatalog, type PhoneRecord } from "../data/catalog.ts";

test("catalog passes provenance and pricing-context validation", () => {
  assert.deepEqual(validateCatalog(), []);
});
test("the catalogue remains intentionally small", () => {
  assert.equal(phones.length, 4);
  assert.equal(Object.keys(sources).length, 7);
});

test("iPhone 17e preserves its current-generation launch context and source gaps", () => {
  const phone: PhoneRecord | undefined = phones.find(({ slug }) => slug === "apple-iphone-17e");
  assert.ok(phone);
  assert.equal(phone.releasedOn.value, "2026-03-11");
  assert.deepEqual(phone.originalPrice.value, {
    amount: 599,
    currency: "USD",
    market: "United States",
    configuration: "256 GB"
  });
  assert.equal(phone.display.refreshRate.value, null);
  assert.match(phone.display.refreshRate.qualification ?? "", /Not stated/);
});

test("Galaxy S24 facts preserve U.S. configuration context and explicit source gaps", () => {
  const phone: PhoneRecord | undefined = phones.find(({ slug }) => slug === "samsung-galaxy-s24");
  assert.ok(phone);
  assert.match(phone.originalPrice.value.configuration, /128 GB and 256 GB/);
  assert.match(phone.weight.qualification ?? "", /U\.S\. mmWave/);
  assert.equal(phone.display.peakBrightness.value, null);
  assert.match(phone.display.peakBrightness.qualification ?? "", /Not stated specifically/);
});

test("every product fact resolves to at least one first-party source", () => {
  for (const phone of phones) {
    for (const fact of factsFor(phone)) {
      assert.ok(fact.sourceIds.length > 0, `${phone.slug} has an unsourced fact`);
      for (const sourceId of fact.sourceIds) {
        const source = sources[sourceId];
        assert.ok(source);
        assert.match(source.kind, /^manufacturer-/);
      }
    }
  }
});

test("original prices retain market, currency, and configuration context", () => {
  for (const phone of phones) {
    const price = phone.originalPrice.value;
    assert.equal(price.currency, "USD");
    assert.equal(price.market, "United States");
    assert.ok(price.configuration.length > 0);
  }
});
