import assert from "node:assert/strict";
import test from "node:test";
import { factsFor, phones, sources, validateCatalog, type PhoneRecord } from "../data/catalog.ts";

test("catalog passes provenance and pricing-context validation", () => {
  assert.deepEqual(validateCatalog(), []);
});
test("the catalogue includes current standard models from every represented manufacturer", () => {
  assert.equal(phones.length, 58);
  assert.equal(Object.keys(sources).length, 92);
  assert.deepEqual(
    phones.filter(({ slug }) => [
      "apple-iphone-17",
      "google-pixel-10",
      "samsung-galaxy-s26",
      "motorola-edge-2026",
      "oneplus-13",
      "nothing-phone-4a-pro",
      "tcl-nxtpaper-70-pro",
      "unihertz-titan-2",
      "hmd-skyline",
      "infinix-note-60-pro"
    ].includes(slug)).map(({ slug }) => slug),
    [
      "apple-iphone-17",
      "google-pixel-10",
      "samsung-galaxy-s26",
      "motorola-edge-2026",
      "oneplus-13",
      "nothing-phone-4a-pro",
      "tcl-nxtpaper-70-pro",
      "unihertz-titan-2",
      "hmd-skyline",
      "infinix-note-60-pro"
    ]
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
      "samsung-galaxy-a57-5g",
      "motorola-razr-ultra-2026",
      "motorola-razr-plus-2026",
      "motorola-razr-2026",
      "motorola-edge-2026",
      "oneplus-13",
      "oneplus-13r",
      "nothing-phone-4a-pro",
      "nothing-phone-3",
      "motorola-moto-g-stylus-2026",
      "motorola-moto-g-power-2026",
      "motorola-moto-g-2026",
      "tcl-nxtpaper-70-pro",
      "tcl-60-xe-nxtpaper-5g",
      "unihertz-titan-2",
      "unihertz-jelly-max",
      "hmd-arc2",
      "hmd-fuse",
      "hmd-barca-fusion",
      "hmd-aura2",
      "hmd-key",
      "hmd-arc",
      "hmd-crest-max-5g",
      "hmd-fusion",
      "hmd-crest-5g",
      "hmd-skyline",
      "hmd-aura",
      "hmd-xr21",
      "hmd-pulse",
      "hmd-pulse-plus",
      "hmd-pulse-pro",
      "infinix-gt-30-5g-plus",
      "infinix-gt-30-pro-5g-plus",
      "infinix-hot-60-5g-plus",
      "infinix-hot-60i-5g",
      "infinix-note-60-pro",
      "infinix-note-40-5g",
      "infinix-note-edge",
      "infinix-smart-10",
      "infinix-smart-20",
      "infinix-zero-40-5g",
      "infinix-zero-flip"
    ]
  );
  assert.deepEqual(
    phones.filter(({ generation }) => generation.value === "earlier").map(({ slug }) => slug),
    ["apple-iphone-16", "google-pixel-9", "samsung-galaxy-s24", "tcl-50-xl-nxtpaper-5g"]
  );

  for (const phone of phones) {
    const generationSources = phone.generation.sourceIds.map((sourceId) => sources[sourceId]);
    assert.equal(generationSources.filter(({ kind }) => kind === "manufacturer-catalogue").length, 1);
    assert.ok(generationSources.every(({ kind }) => kind === "manufacturer-catalogue" || kind === "manufacturer-specification"));
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
      ["samsung-galaxy-z-flip8", "flip-fold"],
      ["motorola-razr-ultra-2026", "flip-fold"],
      ["motorola-razr-plus-2026", "flip-fold"],
      ["motorola-razr-2026", "flip-fold"],
      ["infinix-zero-flip", "flip-fold"]
    ]
  );

  const pricedCurrentPhones = phones
    .filter(({ generation, originalPrice }) => generation.value === "current" && originalPrice.value.amount !== null)
    .map(({ originalPrice }) => originalPrice.value.amount as number);
  assert.ok(Math.min(...pricedCurrentPhones) <= 499);
  assert.ok(Math.max(...pricedCurrentPhones) >= 1899.99);

  const folds = phones.filter(({ formFactor }) => formFactor.value === "book-fold" || formFactor.value === "flip-fold");
  assert.equal(folds.length, 7);
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

test("the catalogue retains sourced premium references across its established manufacturers", () => {
  const premiumSlugs = [
    "apple-iphone-17-pro",
    "google-pixel-10-pro",
    "samsung-galaxy-s26-ultra",
    "motorola-razr-ultra-2026",
    "oneplus-13",
    "nothing-phone-3"
  ];
  assert.deepEqual(
    phones.filter(({ slug }) => premiumSlugs.includes(slug)).map(({ slug }) => slug),
    premiumSlugs
  );

  const iphone: PhoneRecord | undefined = phones.find(({ slug }) => slug === "apple-iphone-17-pro");
  const pixel: PhoneRecord | undefined = phones.find(({ slug }) => slug === "google-pixel-10-pro");
  const galaxy: PhoneRecord | undefined = phones.find(({ slug }) => slug === "samsung-galaxy-s26-ultra");
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

test("the expansion preserves U.S. launch context and explicit timing bases", () => {
  const expansionSlugs = [
    "motorola-razr-ultra-2026",
    "motorola-razr-plus-2026",
    "motorola-razr-2026",
    "motorola-edge-2026",
    "oneplus-13",
    "oneplus-13r",
    "nothing-phone-4a-pro",
    "nothing-phone-3"
  ];
  const expansion: readonly PhoneRecord[] = phones.filter(({ slug }) => expansionSlugs.includes(slug));
  assert.deepEqual(expansion.map(({ slug }) => slug), expansionSlugs);

  for (const phone of expansion) {
    assert.equal(phone.originalPrice.value.currency, "USD");
    assert.equal(phone.originalPrice.value.market, "United States");
    assert.ok(phone.configurations);
    assert.ok(phone.colors);
    assert.ok(phone.dimensions);
    assert.ok(phone.charging);
  }

  assert.deepEqual(
    expansion.filter(({ releasedOn }) => releasedOn.basis === "announcement").map(({ slug }) => slug),
    ["oneplus-13", "oneplus-13r"]
  );
  const onePlus = expansion.find(({ slug }) => slug === "oneplus-13");
  const nothing = expansion.find(({ slug }) => slug === "nothing-phone-4a-pro");
  assert.ok(onePlus);
  assert.ok(nothing?.colors);
  assert.deepEqual(onePlus.generation.sourceIds, ["oneplus-us-phone-catalogue", "oneplus-13-specs"]);
  assert.match(onePlus.releasedOn.qualification ?? "", /does not state a first-sale date/i);
  assert.match(nothing.colors.qualification ?? "", /global colours are not inferred/i);
});

test("the next catalogue batch adds affordable, eye-comfort, compact, and keyboard breadth", () => {
  const batchSlugs = [
    "motorola-moto-g-stylus-2026",
    "motorola-moto-g-power-2026",
    "motorola-moto-g-2026",
    "tcl-nxtpaper-70-pro",
    "tcl-60-xe-nxtpaper-5g",
    "tcl-50-xl-nxtpaper-5g",
    "unihertz-titan-2",
    "unihertz-jelly-max"
  ];
  const batch: readonly PhoneRecord[] = phones.filter(({ slug }) => batchSlugs.includes(slug));
  assert.deepEqual(batch.map(({ slug }) => slug), batchSlugs);

  for (const phone of batch) {
    assert.equal(phone.originalPrice.value.currency, "USD");
    assert.equal(phone.originalPrice.value.market, "United States");
    assert.ok(phone.configurations);
    assert.ok(phone.colors);
    assert.ok(phone.dimensions);
    assert.ok(phone.charging);
  }

  assert.deepEqual(
    batch.filter(({ originalPrice }) => originalPrice.value.amount !== null).map(({ slug, originalPrice }) => [slug, originalPrice.value.amount]),
    [
      ["motorola-moto-g-stylus-2026", 499.99],
      ["motorola-moto-g-power-2026", 299.99],
      ["motorola-moto-g-2026", 199.99]
    ]
  );
  for (const phone of batch.filter(({ originalPrice }) => originalPrice.value.amount === null)) {
    assert.match(phone.originalPrice.qualification ?? "", /current (?:store|direct-store) pricing is not substituted/i);
  }

  const titan = batch.find(({ slug }) => slug === "unihertz-titan-2");
  const jelly = batch.find(({ slug }) => slug === "unihertz-jelly-max");
  const tcl50 = batch.find(({ slug }) => slug === "tcl-50-xl-nxtpaper-5g");
  assert.ok(titan);
  assert.ok(jelly);
  assert.ok(tcl50);
  assert.match(titan.formFactor.qualification ?? "", /physical QWERTY keyboard/i);
  assert.equal(jelly.display.size.value, "5.05 inches");
  assert.equal(tcl50.generation.value, "earlier");
  assert.equal(tcl50.resistance.value, null);
});

test("the HMD international catalogue is substantially covered without invented price or timing", () => {
  const hmd: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "HMD");
  assert.deepEqual(hmd.map(({ slug }) => slug), [
    "hmd-arc2",
    "hmd-fuse",
    "hmd-barca-fusion",
    "hmd-aura2",
    "hmd-key",
    "hmd-arc",
    "hmd-crest-max-5g",
    "hmd-fusion",
    "hmd-crest-5g",
    "hmd-skyline",
    "hmd-aura",
    "hmd-xr21",
    "hmd-pulse",
    "hmd-pulse-plus",
    "hmd-pulse-pro"
  ]);

  for (const phone of hmd) {
    assert.equal(phone.generation.value, "current");
    assert.equal(phone.releasedOn.value, null);
    assert.match(phone.releasedOn.qualification ?? "", /do not state an exact announcement or first-availability date/i);
    assert.deepEqual(
      [phone.originalPrice.value.amount, phone.originalPrice.value.currency, phone.originalPrice.value.market],
      [null, null, "HMD international product-information scope"]
    );
    assert.match(phone.originalPrice.qualification ?? "", /current regional pricing is not substituted/i);
    assert.ok(phone.configurations);
    assert.ok(phone.colors);
    assert.ok(phone.dimensions);
  }

  assert.equal(hmd.find(({ slug }) => slug === "hmd-arc2")?.charging, undefined);
  assert.equal(hmd.find(({ slug }) => slug === "hmd-key")?.storage.value.startsAtGb, 32);
  assert.equal(hmd.find(({ slug }) => slug === "hmd-skyline")?.display.refreshRate.value, "144 Hz");
  assert.equal(hmd.find(({ slug }) => slug === "hmd-xr21")?.resistance.value, "IP68 / IP69K");
});

test("the Infinix India collection is substantially covered without duplicating editions or hiding conflicts", () => {
  const infinix: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "Infinix");
  assert.deepEqual(infinix.map(({ slug }) => slug), [
    "infinix-gt-30-5g-plus",
    "infinix-gt-30-pro-5g-plus",
    "infinix-hot-60-5g-plus",
    "infinix-hot-60i-5g",
    "infinix-note-60-pro",
    "infinix-note-40-5g",
    "infinix-note-edge",
    "infinix-smart-10",
    "infinix-smart-20",
    "infinix-zero-40-5g",
    "infinix-zero-flip"
  ]);

  for (const phone of infinix) {
    assert.equal(phone.generation.value, "current");
    assert.equal(phone.releasedOn.value, null);
    assert.match(phone.releasedOn.qualification ?? "", /do not state an exact announcement or first-availability date/i);
    assert.deepEqual(
      [phone.originalPrice.value.amount, phone.originalPrice.value.currency, phone.originalPrice.value.market],
      [null, "INR", "India"]
    );
    assert.match(phone.originalPrice.qualification ?? "", /current sale price and MRP are not substituted/i);
    assert.ok(phone.configurations);
    assert.ok(phone.colors);
    assert.ok(phone.dimensions);
  }

  const note60 = infinix.find(({ slug }) => slug === "infinix-note-60-pro");
  const noteEdge = infinix.find(({ slug }) => slug === "infinix-note-edge");
  const smart20 = infinix.find(({ slug }) => slug === "infinix-smart-20");
  const zero40 = infinix.find(({ slug }) => slug === "infinix-zero-40-5g");
  const zeroFlip = infinix.find(({ slug }) => slug === "infinix-zero-flip");
  assert.ok(note60?.configurations);
  assert.ok(noteEdge?.configurations);
  assert.ok(smart20);
  assert.ok(zero40?.charging);
  assert.ok(zeroFlip?.secondaryDisplay);
  assert.match(note60.configurations.qualification ?? "", /Pininfarina and CODM editions.*rather than duplicate phone records/i);
  assert.match(noteEdge.configurations.qualification ?? "", /JBL edition.*rather than a duplicate phone record/i);
  assert.equal(smart20.weight.value, null);
  assert.match(smart20.weight.qualification ?? "", /not stated/i);
  assert.match(zero40.processor.qualification ?? "", /Dimensity 8200 Ultimate.*Dimensity 8020/i);
  assert.match(zero40.charging.qualification ?? "", /58 W.*68 W/i);
  assert.equal(zeroFlip.formFactor.value, "flip-fold");
  assert.match(zeroFlip.secondaryDisplay.value, /3\.64-inch AMOLED cover display/i);
});

test("source registry keys and URLs resolve to reviewed first-party domains", () => {
  const firstPartyDomains = ["apple.com", "google.com", "blog.google", "samsung.com", "motorola.com", "motorolanews.com", "oneplus.com", "nothing.tech", "nothing.community", "tcl.com", "unihertz.com", "hmd.com", "infinixmobiles.in"];

  for (const [sourceId, source] of Object.entries(sources)) {
    assert.equal(source.id, sourceId);
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    assert.ok(
      firstPartyDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)),
      `${sourceId} uses an unreviewed domain: ${url.hostname}`
    );
  }
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
    if (price.currency === null) assert.equal(price.amount, null);
    else assert.match(price.currency, /^[A-Z]{3}$/);
    assert.ok(price.market.length > 0);
    assert.ok(price.configuration.length > 0);
  }
});
