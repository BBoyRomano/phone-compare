import assert from "node:assert/strict";
import test from "node:test";
import { factsFor, phones, sources, validateCatalog, type PhoneRecord } from "../data/catalog.ts";

test("catalog passes provenance and pricing-context validation", () => {
  assert.deepEqual(validateCatalog(), []);
});
test("the catalogue includes current standard models from every represented manufacturer", () => {
  assert.equal(phones.length, 16);
  assert.equal(Object.keys(sources).length, 26);
  assert.deepEqual(
    phones.filter(({ slug }) => ["apple-iphone-17", "google-pixel-10", "samsung-galaxy-s26"].includes(slug)).map(({ slug }) => slug),
    ["apple-iphone-17", "google-pixel-10", "samsung-galaxy-s26"]
  );
});

test("every phone has a sourced, conservative generation classification", () => {
  assert.deepEqual(
    phones.filter(({ generation }) => generation.value === "current").map(({ slug }) => slug),
    [
      "apple-iphone-17-pro",
      "apple-iphone-17",
      "apple-iphone-17e",
      "apple-iphone-air",
      "google-pixel-10-pro-fold",
      "google-pixel-10-pro",
      "google-pixel-10",
      "google-pixel-10a",
      "samsung-galaxy-s26-ultra",
      "samsung-galaxy-s26",
      "samsung-galaxy-z-fold8",
      "samsung-galaxy-z-flip8",
      "samsung-galaxy-a57-5g"
    ]
  );
  assert.deepEqual(
    phones.filter(({ generation }) => generation.value === "earlier").map(({ slug }) => slug),
    ["apple-iphone-16", "google-pixel-9", "samsung-galaxy-s24"]
  );

  for (const phone of phones) {
    assert.equal(phone.generation.sourceIds.length, 1);
    assert.equal(sources[phone.generation.sourceIds[0]].kind, "manufacturer-catalogue");
  }
  const iphone16: PhoneRecord | undefined = phones.find(({ slug }) => slug === "apple-iphone-16");
  assert.ok(iphone16);
  assert.match(iphone16.generation.qualification ?? "", /still lists iPhone 16/i);
});

test("the public catalogue spans meaningful price bands and form factors", () => {
  assert.deepEqual(
    phones.filter(({ formFactor }) => formFactor.value !== "slab").map(({ slug, formFactor }) => [slug, formFactor.value]),
    [
      ["apple-iphone-air", "thin-slab"],
      ["google-pixel-10-pro-fold", "book-fold"],
      ["samsung-galaxy-z-fold8", "book-fold"],
      ["samsung-galaxy-z-flip8", "flip-fold"]
    ]
  );

  const pricedCurrentPhones = phones
    .filter(({ generation, originalPrice }) => generation.value === "current" && originalPrice.value.amount !== null)
    .map(({ originalPrice }) => originalPrice.value.amount as number);
  assert.ok(Math.min(...pricedCurrentPhones) <= 499);
  assert.ok(Math.max(...pricedCurrentPhones) >= 1899.99);

  const folds = phones.filter(({ formFactor }) => formFactor.value === "book-fold" || formFactor.value === "flip-fold");
  assert.equal(folds.length, 3);
  for (const fold of folds) assert.ok("secondaryDisplay" in fold && fold.secondaryDisplay);
});

test("catalogue gaps and source conflicts stay visible", () => {
  const pixelFold: PhoneRecord | undefined = phones.find(({ slug }) => slug === "google-pixel-10-pro-fold");
  const galaxyA57: PhoneRecord | undefined = phones.find(({ slug }) => slug === "samsung-galaxy-a57-5g");
  assert.ok(pixelFold);
  assert.ok(galaxyA57);
  assert.equal(pixelFold.originalPrice.value.amount, null);
  assert.match(pixelFold.originalPrice.qualification ?? "", /current store price is not substituted/i);
  assert.match(pixelFold.batteryClaim.qualification ?? "", /24\+ hours.*30\+ hours/i);
  assert.equal(galaxyA57.processor.value, null);
  assert.match(galaxyA57.processor.qualification ?? "", /not stated/i);
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
