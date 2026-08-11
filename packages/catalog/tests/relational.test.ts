import assert from "node:assert/strict";
import test from "node:test";
import {
  projectPhoneCatalogue,
  relationalCatalogueSql,
  validateRelationalCatalogue,
  type RelationalCatalogue
} from "../src/relational.ts";

const catalogue: RelationalCatalogue = {
  appId: "tablets",
  assessedAt: "2026-08-11",
  brands: [{ id: "acme", name: "Acme" }],
  families: [{ id: "acme-tab", brandId: "acme", name: "Acme Tab" }],
  offerings: [{
    id: "acme-tab-us",
    familyId: "acme-tab",
    market: "United States",
    lifecycleStatus: "current",
    lifecycleAssessedAt: "2026-08-11"
  }],
  variants: [{ id: "acme-tab-wifi", offeringId: "acme-tab-us", name: "Acme Tab Wi-Fi" }],
  aliases: [{ variantId: "acme-tab-wifi", alias: "Tab Wi-Fi" }],
  sources: [{
    id: "acme-lineup",
    publisher: "Acme",
    title: "Tablet lineup",
    url: "https://example.test/tablets",
    kind: "lineup",
    accessedAt: "2026-08-11",
    market: "United States"
  }],
  evidence: [{
    id: "acme-tab-evidence",
    entityType: "family",
    entityId: "acme-tab",
    sourceId: "acme-lineup",
    basis: "official-current-lineup",
    qualification: "Listed in the official lineup."
  }, {
    id: "acme-tab-offering-evidence",
    entityType: "offering",
    entityId: "acme-tab-us",
    sourceId: "acme-lineup",
    basis: "official-current-lineup",
    qualification: "Listed in the official United States lineup."
  }],
  facts: [{
    id: "acme-tab-display",
    variantId: "acme-tab-wifi",
    key: "display.size",
    value: 11,
    valueNumber: 11,
    unit: "in",
    sourceIds: ["acme-lineup"]
  }],
  prices: [{
    id: "acme-tab-price",
    variantId: "acme-tab-wifi",
    type: "original",
    amount: 499,
    currency: "USD",
    market: "United States",
    configuration: "128 GB Wi-Fi",
    sourceIds: ["acme-lineup"]
  }]
};

test("a valid relational catalogue generates a stable, activation-last import", () => {
  assert.deepEqual(validateRelationalCatalogue(catalogue), []);
  const first = relationalCatalogueSql(catalogue, "commit-one");
  const second = relationalCatalogueSql(catalogue, "commit-two");
  const revised = relationalCatalogueSql(catalogue, "commit-two", 2);
  assert.equal(first.version, second.version);
  assert.notEqual(first.version, revised.version);
  assert.match(first.sql, /INSERT INTO specification_facts \(release_version, fact_id,/);
  assert.ok(first.sql.indexOf("INSERT INTO catalog_state") > first.sql.indexOf("INSERT INTO specification_facts"));
  assert.match(first.sql, /ON CONFLICT DO NOTHING/);
});

test("validation rejects dangling evidence and unsourced comparison facts", () => {
  const errors = validateRelationalCatalogue({
    ...catalogue,
    evidence: [{ ...catalogue.evidence[0], entityId: "missing-family" }],
    facts: [{ ...catalogue.facts[0], sourceIds: [] }],
    prices: [{ ...catalogue.prices[0], sourceIds: [] }]
  });
  assert.ok(errors.some((error) => error.includes("unknown family missing-family")));
  assert.ok(errors.some((error) => error.includes("acme-tab-display must cite at least one source")));
  assert.ok(errors.some((error) => error.includes("acme-tab-price must cite at least one source")));
});

test("phone lifecycle context does not inherit price market or unrelated source dates", () => {
  const fact = <T>(value: T, sourceIds = ["spec"]) => ({ value, sourceIds });
  const projected = projectPhoneCatalogue({
    appId: "phones",
    sources: {
      lifecycle: { id: "lifecycle", publisher: "Acme", title: "Current phones", url: "https://example.test/phones", kind: "manufacturer-catalogue", accessedAt: "2026-06-01" },
      launch: { id: "launch", publisher: "Acme", title: "Launch", url: "https://example.test/launch", kind: "manufacturer-announcement", accessedAt: "2026-06-02" },
      spec: { id: "spec", publisher: "Acme", title: "Specs", url: "https://example.test/specs", kind: "manufacturer-specification", accessedAt: "2026-08-11" },
      price: { id: "price", publisher: "Acme", title: "Price", url: "https://example.test/price", kind: "manufacturer-announcement", accessedAt: "2026-08-11" }
    },
    phones: [{
      slug: "acme-phone",
      maker: fact("Acme"),
      model: fact("Acme Phone"),
      generation: fact("current" as const, ["lifecycle"]),
      formFactor: fact("slab"),
      releasedOn: { ...fact("2026-05-30", ["launch"]), basis: "availability" as const },
      originalPrice: fact({ amount: 499, currency: "USD", market: "United States", configuration: "128 GB" }, ["price"]),
      display: {
        size: fact("6.1 in"), panel: fact("OLED"), resolution: fact("2400 x 1080"),
        refreshRate: fact("120 Hz"), peakBrightness: fact("1,500 nits")
      },
      weight: fact("180 g"),
      storage: fact({ options: "128 GB", startsAtGb: 128 }),
      processor: fact("Acme A1"),
      rearCameras: fact("50 MP"),
      batteryClaim: fact("Up to 24 hours"),
      resistance: fact("IP68")
    }]
  });
  assert.equal(projected.offerings[0].market, "Unspecified");
  assert.equal(projected.offerings[0].lifecycleAssessedAt, "2026-06-01");
  assert.equal(projected.prices[0].market, "United States");
  assert.ok(projected.evidence.some(({ entityType, entityId, basis }) => entityType === "offering" && entityId === projected.offerings[0].id && basis === "lifecycle"));
  assert.deepEqual(validateRelationalCatalogue(projected), []);
});

test("validation rejects semantically malformed comparison context", () => {
  const errors = validateRelationalCatalogue({
    ...catalogue,
    offerings: [{ ...catalogue.offerings[0], market: " ", lifecycleAssessedAt: "2026-02-30" }],
    evidence: catalogue.evidence.filter(({ entityType }) => entityType !== "offering"),
    facts: [{ ...catalogue.facts[0], valueNumber: Number.POSITIVE_INFINITY }],
    prices: [{ ...catalogue.prices[0], configuration: "" }]
  });
  assert.ok(errors.some((error) => error.includes("market must not be empty")));
  assert.ok(errors.some((error) => error.includes("lifecycleAssessedAt must use a real")));
  assert.ok(errors.some((error) => error.includes("appropriate offering-level")));
  assert.ok(errors.some((error) => error.includes("valueNumber must be finite")));
  assert.ok(errors.some((error) => error.includes("configuration must not be empty")));
});
