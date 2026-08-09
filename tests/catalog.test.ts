import assert from "node:assert/strict";
import test from "node:test";
import { factsFor, phones, sources, validateCatalog, type PhoneRecord } from "../data/catalog.ts";

test("catalog passes provenance and pricing-context validation", () => {
  assert.deepEqual(validateCatalog(), []);
});
test("the catalogue includes current standard models from every represented manufacturer", () => {
  assert.equal(phones.length, 10);
  assert.equal(Object.keys(sources).length, 15);
  assert.deepEqual(
    phones.filter(({ slug }) => ["apple-iphone-17", "google-pixel-10", "samsung-galaxy-s26"].includes(slug)).map(({ slug }) => slug),
    ["apple-iphone-17", "google-pixel-10", "samsung-galaxy-s26"]
  );
});

test("the catalogue includes a sourced premium flagship from every represented manufacturer", () => {
  const premiumSlugs = ["apple-iphone-17-pro", "google-pixel-10-pro", "samsung-galaxy-s26-ultra"];
  assert.deepEqual(
    phones.filter(({ slug }) => premiumSlugs.includes(slug)).map(({ slug }) => slug),
    premiumSlugs
  );

  const iphone = phones.find(({ slug }) => slug === "apple-iphone-17-pro");
  const pixel = phones.find(({ slug }) => slug === "google-pixel-10-pro");
  const galaxy = phones.find(({ slug }) => slug === "samsung-galaxy-s26-ultra");
  assert.ok(iphone);
  assert.ok(pixel);
  assert.ok(galaxy);

  assert.deepEqual(iphone.originalPrice.value, {
    amount: 1099,
    currency: "USD",
    market: "United States",
    configuration: "256 GB"
  });
  assert.equal(iphone.weight.value, "206 g");
  assert.match(iphone.weight.qualification ?? "", /7\.27 oz/);

  assert.equal(pixel.originalPrice.value.amount, 999);
  assert.equal(pixel.weight.value, "7.3 oz");
  assert.match(pixel.weight.qualification ?? "", /not silently converted/i);

  assert.equal(galaxy.originalPrice.value.amount, 1299.99);
  assert.equal(galaxy.display.resolution.value, "QHD+");
  assert.match(galaxy.display.resolution.qualification ?? "", /Pixel dimensions are not stated/);
});

test("current standard models preserve official launch context and source-local measurements", () => {
  const iphone: PhoneRecord | undefined = phones.find(({ slug }) => slug === "apple-iphone-17");
  const pixel: PhoneRecord | undefined = phones.find(({ slug }) => slug === "google-pixel-10");
  const galaxy: PhoneRecord | undefined = phones.find(({ slug }) => slug === "samsung-galaxy-s26");
  assert.ok(iphone);
  assert.ok(pixel);
  assert.ok(galaxy);

  assert.equal(iphone.releasedOn.value, "2025-09-19");
  assert.match(iphone.originalPrice.value.configuration, /connectivity discount/);
  assert.equal(iphone.display.refreshRate.value, "Up to 120 Hz");

  assert.equal(pixel.releasedOn.value, "2025-08-28");
  assert.equal(pixel.weight.value, "7.2 oz");
  assert.match(pixel.weight.qualification ?? "", /not silently converted/i);

  assert.equal(galaxy.releasedOn.value, "2026-03-11");
  assert.equal(galaxy.originalPrice.value.amount, 899.99);
  assert.match(galaxy.processor.qualification ?? "", /cited U\.S\. announcement/);
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
