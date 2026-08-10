import assert from "node:assert/strict";
import test from "node:test";
import { factsFor, phones, sources, validateCatalog, type PhoneRecord } from "../data/catalog.ts";

test("catalog passes provenance and pricing-context validation", () => {
  assert.deepEqual(validateCatalog(), []);
});
test("the catalogue includes current standard models from every represented manufacturer", () => {
  assert.equal(phones.length, 121);
  assert.equal(Object.keys(sources).length, 179);
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
      "infinix-note-60-pro",
      "sony-xperia-1-viii",
      "honor-magic8-pro",
      "xiaomi-17",
      "redmi-note-15",
      "poco-x8-pro",
      "oppo-find-x9",
      "asus-zenfone-12-ultra",
      "vivo-x300",
      "realme-16-5g",
      "fairphone-gen-6",
      "nubia-z80-ultra",
      "zte-blade-a76"
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
      "infinix-note-60-pro",
      "sony-xperia-1-viii",
      "honor-magic8-pro",
      "xiaomi-17",
      "redmi-note-15",
      "poco-x8-pro",
      "oppo-find-x9",
      "asus-zenfone-12-ultra",
      "vivo-x300",
      "realme-16-5g",
      "fairphone-gen-6",
      "nubia-z80-ultra",
      "zte-blade-a76"
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
      "infinix-zero-flip",
      "sony-xperia-1-viii",
      "sony-xperia-10-vii",
      "sony-xperia-1-vii",
      "honor-magic-v6",
      "honor-600-pro",
      "honor-600",
      "honor-magic8-pro",
      "honor-magic8-lite",
      "honor-magic-v5",
      "honor-400-pro",
      "honor-400",
      "honor-600-smart-5g",
      "honor-600-lite",
      "honor-400-smart-5g",
      "honor-400-smart-4g",
      "xiaomi-17-ultra",
      "xiaomi-17",
      "xiaomi-leica-leitzphone",
      "xiaomi-17t",
      "xiaomi-17t-pro",
      "redmi-note-15-pro",
      "redmi-note-15-5g",
      "redmi-note-15",
      "redmi-note-15-pro-plus-5g",
      "redmi-note-15-pro-5g",
      "poco-x8-pro-max",
      "poco-x8-pro",
      "poco-m8-5g",
      "poco-m8-pro-5g",
      "poco-f8-ultra",
      "oppo-find-x9-ultra",
      "oppo-find-x9-pro",
      "oppo-find-x9",
      "oppo-reno16-pro-5g",
      "oppo-reno16-5g",
      "oppo-reno16-fs-5g",
      "oppo-reno16-f-5g",
      "oppo-find-n2-flip",
      "oppo-a6-pro-5g",
      "oppo-a6-5g",
      "oppo-a6x",
      "oppo-a60-5g",
      "asus-zenfone-12-ultra",
      "asus-rog-phone-9",
      "asus-rog-phone-9-pro",
      "vivo-x300-ultra",
      "vivo-x300-fe",
      "vivo-x300-pro",
      "vivo-x300",
      "vivo-v70-lite-5g",
      "vivo-y21-5g",
      "realme-16-pro-plus-5g",
      "realme-16-pro-5g",
      "realme-16-5g",
      "realme-gt-8-pro",
      "realme-c100-5g",
      "fairphone-gen-6",
      "nubia-neo-5-gt",
      "nubia-v80-max",
      "nubia-z80-ultra",
      "nubia-air",
      "zte-blade-a76"
    ]
  );
  assert.deepEqual(
    phones.filter(({ generation }) => generation.value === "earlier").map(({ slug }) => slug),
    ["apple-iphone-16", "google-pixel-9", "samsung-galaxy-s24", "tcl-50-xl-nxtpaper-5g", "asus-zenfone-11-ultra"]
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
      ["infinix-zero-flip", "flip-fold"],
      ["honor-magic-v6", "book-fold"],
      ["honor-magic-v5", "book-fold"],
      ["oppo-find-n2-flip", "flip-fold"],
      ["nubia-air", "thin-slab"]
    ]
  );

  const pricedCurrentPhones = phones
    .filter(({ generation, originalPrice }) => generation.value === "current" && originalPrice.value.amount !== null)
    .map(({ originalPrice }) => originalPrice.value.amount as number);
  assert.ok(Math.min(...pricedCurrentPhones) <= 499);
  assert.ok(Math.max(...pricedCurrentPhones) >= 1899.99);

  const folds = phones.filter(({ formFactor }) => formFactor.value === "book-fold" || formFactor.value === "flip-fold");
  assert.equal(folds.length, 10);
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

test("the Sony UK New Products catalogue is fully represented with announcement and price context", () => {
  const sony: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "Sony");
  assert.deepEqual(sony.map(({ slug }) => slug), [
    "sony-xperia-1-viii",
    "sony-xperia-10-vii",
    "sony-xperia-1-vii"
  ]);

  for (const phone of sony) {
    assert.equal(phone.generation.value, "current");
    assert.equal(phone.releasedOn.basis, "announcement");
    assert.equal(phone.originalPrice.value.currency, "GBP");
    assert.equal(phone.originalPrice.value.market, "United Kingdom");
    assert.notEqual(phone.originalPrice.value.amount, null);
    assert.ok(phone.configurations);
    assert.ok(phone.colors);
    assert.ok(phone.dimensions);
    assert.ok(phone.charging);
    assert.equal(phone.display.peakBrightness.value, null);
    assert.match(phone.display.peakBrightness.qualification ?? "", /numeric peak-brightness value is not stated/i);
    assert.match(phone.charging.qualification ?? "", /does not state maximum/i);
  }

  const oneViii = sony.find(({ slug }) => slug === "sony-xperia-1-viii");
  const tenVii = sony.find(({ slug }) => slug === "sony-xperia-10-vii");
  const oneVii = sony.find(({ slug }) => slug === "sony-xperia-1-vii");
  assert.ok(oneViii?.configurations);
  assert.ok(tenVii);
  assert.ok(oneVii);
  assert.equal(oneViii.releasedOn.value, "2026-05-13");
  assert.deepEqual(oneViii.originalPrice.value, {
    amount: 1399,
    currency: "GBP",
    market: "United Kingdom",
    configuration: "12 GB RAM + 256 GB storage"
  });
  assert.match(oneViii.configurations.value, /16 GB RAM \+ 1 TB storage/);
  assert.match(oneViii.originalPrice.qualification ?? "", /approximate UK price.*1 TB.*£1,849/i);
  assert.equal(tenVii.originalPrice.value.amount, 399);
  assert.equal(oneVii.originalPrice.value.amount, 1399);
});

test("the active HONOR UK store smartphone boundary is fully represented without sale-price substitution", () => {
  const honor: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "HONOR");
  assert.deepEqual(honor.map(({ slug }) => slug), [
    "honor-magic-v6",
    "honor-600-pro",
    "honor-600",
    "honor-magic8-pro",
    "honor-magic8-lite",
    "honor-magic-v5",
    "honor-400-pro",
    "honor-400",
    "honor-600-smart-5g",
    "honor-600-lite",
    "honor-400-smart-5g",
    "honor-400-smart-4g"
  ]);

  for (const phone of honor) {
    assert.equal(phone.generation.value, "current");
    assert.match(phone.generation.qualification ?? "", /UK store smartphone grid.*does not establish availability outside/i);
    assert.equal(phone.releasedOn.value, null);
    assert.match(phone.releasedOn.qualification ?? "", /do not state an exact announcement or first-availability date/i);
    assert.deepEqual(
      [phone.originalPrice.value.amount, phone.originalPrice.value.currency, phone.originalPrice.value.market],
      [null, null, "United Kingdom"]
    );
    assert.match(phone.originalPrice.qualification ?? "", /current UK store price and promotional discounts are not substituted/i);
    assert.ok(phone.configurations);
    assert.ok(phone.colors);
    assert.ok(phone.dimensions);
    assert.ok(phone.charging);
  }

  const magicV6 = honor.find(({ slug }) => slug === "honor-magic-v6");
  const honor600Pro = honor.find(({ slug }) => slug === "honor-600-pro");
  const smart5g = honor.find(({ slug }) => slug === "honor-400-smart-5g");
  const smart4g = honor.find(({ slug }) => slug === "honor-400-smart-4g");
  assert.ok(magicV6?.secondaryDisplay);
  assert.ok(honor600Pro?.configurations);
  assert.ok(smart5g);
  assert.ok(smart4g);
  assert.equal(magicV6.formFactor.value, "book-fold");
  assert.match(honor600Pro.configurations.qualification ?? "", /MOLLY Limited Edition.*edition rather than a duplicate/i);
  assert.equal(smart5g.processor.value, "Qualcomm Snapdragon 6s Gen 3");
  assert.equal(smart4g.processor.value, "Qualcomm Snapdragon 685");
  assert.match(smart4g.model.qualification ?? "", /store distinguishes.*4G/i);
  assert.equal(smart4g.resistance.value, null);
});

test("the Xiaomi UK featured-phone boundary preserves Xiaomi, REDMI, and POCO identities", () => {
  const featuredSlugs = [
    "xiaomi-17-ultra",
    "xiaomi-17",
    "xiaomi-leica-leitzphone",
    "xiaomi-17t",
    "xiaomi-17t-pro",
    "redmi-note-15-pro",
    "redmi-note-15-5g",
    "redmi-note-15",
    "redmi-note-15-pro-plus-5g",
    "redmi-note-15-pro-5g",
    "poco-x8-pro-max",
    "poco-x8-pro",
    "poco-m8-5g",
    "poco-m8-pro-5g",
    "poco-f8-ultra"
  ];
  const featured: readonly PhoneRecord[] = phones.filter(({ slug }) => featuredSlugs.includes(slug));
  assert.deepEqual(featured.map(({ slug }) => slug), featuredSlugs);
  assert.deepEqual(
    featured.map(({ maker }) => maker.value),
    ["Xiaomi", "Xiaomi", "Xiaomi", "Xiaomi", "Xiaomi", "REDMI", "REDMI", "REDMI", "REDMI", "REDMI", "POCO", "POCO", "POCO", "POCO", "POCO"]
  );

  for (const phone of featured) {
    assert.equal(phone.generation.value, "current");
    assert.match(phone.generation.qualification ?? "", /official Xiaomi UK Mobile navigation.*2026-08-10/i);
    assert.equal(phone.releasedOn.value, null);
    assert.deepEqual(
      [phone.originalPrice.value.amount, phone.originalPrice.value.currency, phone.originalPrice.value.market],
      [null, null, "United Kingdom"]
    );
    assert.match(phone.originalPrice.qualification ?? "", /not substituted for an original UK launch price/i);
    assert.ok(phone.configurations);
    assert.ok(phone.colors);
    assert.ok(phone.dimensions);
    assert.ok(phone.charging);
  }

  const leitzphone = featured.find(({ slug }) => slug === "xiaomi-leica-leitzphone");
  const note15 = featured.find(({ slug }) => slug === "redmi-note-15");
  const note15Pro = featured.find(({ slug }) => slug === "redmi-note-15-pro");
  const m85g = featured.find(({ slug }) => slug === "poco-m8-5g");
  assert.match(leitzphone?.maker.qualification ?? "", /Leica-co-branded.*Xiaomi Series/i);
  assert.equal(note15?.storage.value.startsAtGb, 128);
  assert.match(note15Pro?.charging?.qualification ?? "", /battery section.*package-contents.*conflicting/i);
  assert.equal(m85g?.resistance.value, null);
});

test("the OPPO UK navigation boundary remains distinct from live stock status", () => {
  const oppo: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "OPPO");
  assert.deepEqual(oppo.map(({ slug }) => slug), [
    "oppo-find-x9-ultra",
    "oppo-find-x9-pro",
    "oppo-find-x9",
    "oppo-reno16-pro-5g",
    "oppo-reno16-5g",
    "oppo-reno16-fs-5g",
    "oppo-reno16-f-5g",
    "oppo-find-n2-flip",
    "oppo-a6-pro-5g",
    "oppo-a6-5g",
    "oppo-a6x",
    "oppo-a60-5g"
  ]);

  for (const phone of oppo) {
    assert.equal(phone.generation.value, "current");
    assert.match(phone.generation.qualification ?? "", /OPPO UK.*stable smartphone navigation.*2026-08-10.*out of stock/is);
    assert.equal(phone.releasedOn.value, null);
    assert.deepEqual(
      [phone.originalPrice.value.amount, phone.originalPrice.value.currency, phone.originalPrice.value.market],
      [null, null, "United Kingdom"]
    );
    assert.match(phone.originalPrice.qualification ?? "", /do not establish an original launch price/i);
    assert.ok(phone.configurations);
    assert.ok(phone.colors);
    assert.ok(phone.dimensions);
    assert.ok(phone.charging);
  }

  const ultra = oppo.find(({ slug }) => slug === "oppo-find-x9-ultra");
  const x9Pro = oppo.find(({ slug }) => slug === "oppo-find-x9-pro");
  const n2Flip = oppo.find(({ slug }) => slug === "oppo-find-n2-flip");
  const a6x = oppo.find(({ slug }) => slug === "oppo-a6x");
  assert.ok(ultra);
  assert.ok(x9Pro);
  assert.ok(n2Flip?.secondaryDisplay);
  assert.ok(a6x?.charging);
  assert.equal(n2Flip.formFactor.value, "flip-fold");
  assert.equal(x9Pro.resistance.value, null);
  assert.equal(a6x.charging.value, "Fast charging unsupported");
  assert.match(ultra.resistance.qualification ?? "", /EU eco-design interface displays IP68.*IP69/is);
});

test("the ASUS global catalogues publish the active Zenfone and ROG boundaries conservatively", () => {
  const asus: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "ASUS");
  assert.deepEqual(asus.map(({ slug }) => slug), [
    "asus-zenfone-12-ultra",
    "asus-zenfone-11-ultra",
    "asus-rog-phone-9",
    "asus-rog-phone-9-pro"
  ]);
  assert.deepEqual(asus.map(({ generation }) => generation.value), ["current", "earlier", "current", "current"]);
  assert.ok(asus.every(({ releasedOn }) => releasedOn.basis === "announcement"));
  assert.ok(asus.every(({ originalPrice }) => originalPrice.value.amount === null && originalPrice.qualification));

  const rog9 = asus.find(({ slug }) => slug === "asus-rog-phone-9");
  const rog9Pro = asus.find(({ slug }) => slug === "asus-rog-phone-9-pro");
  assert.equal(rog9?.rearCameras.value, "50 MP main + 13 MP ultrawide + 5 MP macro");
  assert.equal(rog9Pro?.rearCameras.value, "50 MP main + 13 MP ultrawide + 32 MP 3× telephoto");
  assert.match(rog9Pro?.configurations?.qualification ?? "", /separately named Pro Edition.*not merged/i);
  assert.deepEqual(rog9?.generation.sourceIds, ["asus-global-rog-phone-catalogue"]);
});

test("the vivo Europe navigation publishes a bounded six-phone current lineup", () => {
  const vivo: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "vivo");
  assert.deepEqual(vivo.map(({ slug }) => slug), [
    "vivo-x300-ultra",
    "vivo-x300-fe",
    "vivo-x300-pro",
    "vivo-x300",
    "vivo-v70-lite-5g",
    "vivo-y21-5g"
  ]);
  assert.ok(vivo.every(({ generation }) => generation.value === "current"));
  assert.ok(vivo.every(({ generation }) => generation.sourceIds.length === 1 && generation.sourceIds[0] === "vivo-eu-phone-catalogue"));
  assert.ok(vivo.every(({ releasedOn, originalPrice }) => releasedOn.value === null && releasedOn.qualification && originalPrice.value.amount === null && originalPrice.qualification));

  const ultra = vivo.find(({ slug }) => slug === "vivo-x300-ultra");
  const pro = vivo.find(({ slug }) => slug === "vivo-x300-pro");
  const v70Lite = vivo.find(({ slug }) => slug === "vivo-v70-lite-5g");
  const y21 = vivo.find(({ slug }) => slug === "vivo-y21-5g");
  assert.equal(ultra?.storage.value.startsAtGb, 1024);
  assert.equal(pro?.display.refreshRate.value, "1–120 Hz LTPO adaptive");
  assert.equal(v70Lite?.resistance.value, "IP65");
  assert.match(v70Lite?.configurations?.qualification ?? "", /Spain-market.*not merged/i);
  assert.match(y21?.batteryClaim.qualification ?? "", /Austria-market variant/i);
});

test("the realme Europe navigation publishes five current phones without inventing entry storage", () => {
  const realme: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "realme");
  assert.deepEqual(realme.map(({ slug }) => slug), [
    "realme-16-pro-plus-5g",
    "realme-16-pro-5g",
    "realme-16-5g",
    "realme-gt-8-pro",
    "realme-c100-5g"
  ]);
  assert.ok(realme.every(({ generation }) => generation.value === "current"));
  assert.ok(realme.every(({ releasedOn, originalPrice }) => releasedOn.value === null && releasedOn.qualification && originalPrice.value.amount === null && originalPrice.qualification));

  const gt8Pro = realme.find(({ slug }) => slug === "realme-gt-8-pro");
  const c100 = realme.find(({ slug }) => slug === "realme-c100-5g");
  assert.equal(gt8Pro?.storage.value.startsAtGb, null);
  assert.match(gt8Pro?.storage.qualification ?? "", /maximum.*starting storage remains unknown/i);
  assert.equal(gt8Pro?.charging?.value, "Up to 120 W wired; up to 50 W wireless");
  assert.equal(c100?.resistance.value, "IP64");
});

test("the Fairphone European store publishes one physical Gen. 6 phone across two OS configurations", () => {
  const fairphones: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "Fairphone");
  assert.deepEqual(fairphones.map(({ slug }) => slug), ["fairphone-gen-6"]);

  const phone = fairphones[0];
  assert.ok(phone);
  assert.equal(phone.generation.value, "current");
  assert.deepEqual(phone.generation.sourceIds, ["fairphone-eu-smartphone-catalogue"]);
  assert.equal(phone.releasedOn.value, "2025-06-25");
  assert.deepEqual(phone.originalPrice.value, {
    amount: 599,
    currency: "EUR",
    market: "Europe",
    configuration: "8 GB RAM + 256 GB storage, Android"
  });
  assert.match(phone.configurations?.qualification ?? "", /physical device as the same/i);
  assert.equal(phone.batteryClaim.value, "4,415 mAh removable");
  assert.equal(phone.resistance.value, "IP55");
});

test("the ZTE global catalogue publishes a bounded five-phone Blade and nubia headline set", () => {
  const zteAndNubia: readonly PhoneRecord[] = phones.filter(({ maker }) => maker.value === "ZTE" || maker.value === "nubia");
  assert.deepEqual(zteAndNubia.map(({ slug }) => slug), [
    "nubia-neo-5-gt",
    "nubia-v80-max",
    "nubia-z80-ultra",
    "nubia-air",
    "zte-blade-a76"
  ]);
  assert.ok(zteAndNubia.every(({ generation }) => generation.value === "current"));
  assert.ok(zteAndNubia.every(({ generation }) => generation.sourceIds.length === 1 && generation.sourceIds[0] === "zte-global-smartphone-catalogue"));
  assert.ok(zteAndNubia.every(({ releasedOn, originalPrice }) => releasedOn.value === null && releasedOn.qualification && originalPrice.value.amount === null && originalPrice.qualification));

  const neo5Gt = zteAndNubia.find(({ slug }) => slug === "nubia-neo-5-gt");
  const z80Ultra = zteAndNubia.find(({ slug }) => slug === "nubia-z80-ultra");
  const air = zteAndNubia.find(({ slug }) => slug === "nubia-air");
  const bladeA76 = zteAndNubia.find(({ slug }) => slug === "zte-blade-a76");
  assert.match(neo5Gt?.resistance.value ?? "", /IP64 body.*IP54 cooling-air ducts/i);
  assert.equal(z80Ultra?.charging?.value, "80 W wired; 80 W wireless; wireless reverse charging");
  assert.equal(air?.formFactor.value, "thin-slab");
  assert.equal(bladeA76?.storage.value.startsAtGb, null);
  assert.match(bladeA76?.batteryClaim.qualification ?? "", /does not state its capacity/i);
});

test("source registry keys and URLs resolve to reviewed first-party domains", () => {
  const firstPartyDomains = ["apple.com", "google.com", "blog.google", "samsung.com", "motorola.com", "motorolanews.com", "oneplus.com", "nothing.tech", "nothing.community", "tcl.com", "unihertz.com", "hmd.com", "infinixmobiles.in", "sony.co.uk", "honor.com", "mi.com", "oppo.com", "asus.com", "vivo.com", "realme.com", "fairphone.com", "ztedevices.com"];

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
