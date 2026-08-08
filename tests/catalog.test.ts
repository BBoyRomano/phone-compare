import assert from "node:assert/strict";
import test from "node:test";
import { factsFor, phones, sources, validateCatalog } from "../data/catalog.ts";

test("catalog passes provenance and pricing-context validation", () => {
  assert.deepEqual(validateCatalog(), []);
});
test("the initial slice remains intentionally small", () => {
  assert.equal(phones.length, 2);
  assert.equal(Object.keys(sources).length, 4);
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
