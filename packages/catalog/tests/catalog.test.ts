import assert from "node:assert/strict";
import test from "node:test";
import { productsFor, validateCatalogue, type CatalogueSource, type ProductCatalogue } from "../src/index.ts";

const alphaSource: CatalogueSource = {
  title: "Alpha products",
  url: "https://products.alpha.example/catalogue",
  publisher: "Alpha",
  accessedAt: "2026-08-11",
  market: "United States",
  role: "lineup"
};

const fixture: ProductCatalogue = {
  id: "tablets",
  title: "Tablet fixture",
  singular: "tablet",
  plural: "tablets",
  description: "Fixture",
  market: "United States",
  assessedAt: "2026-08-11",
  coverageNote: "Fixture scope",
  coverageRule: "Every family listed by the two fixture manufacturers.",
  taxonomyNote: "Segments are editorial navigation labels.",
  accent: "#155eef",
  defaults: ["alpha-one", "beta-two"],
  brands: [
    {
      slug: "alpha",
      name: "Alpha",
      officialHosts: ["alpha.example"],
      lineupSource: alphaSource,
      products: [{
        slug: "alpha-one",
        name: "One",
        segment: "Tablet",
        market: "United States",
        lifecycle: { status: "current", assessedAt: "2026-08-11" },
        evidence: [{ source: alphaSource, basis: "official-current-lineup", qualification: "Listed in the official fixture lineup." }]
      }]
    },
    {
      slug: "beta",
      name: "Beta",
      officialHosts: ["beta.example"],
      lineupSource: { ...alphaSource, title: "Beta products", url: "https://beta.example/products", publisher: "Beta" },
      products: [{
        slug: "beta-two",
        name: "Two",
        segment: "Tablet",
        aliases: ["Two Wi-Fi"],
        market: "United States",
        lifecycle: { status: "current", assessedAt: "2026-08-11" },
        evidence: [
          {
            source: { ...alphaSource, title: "Beta products", url: "https://beta.example/products", publisher: "Beta" },
            basis: "official-current-lineup",
            qualification: "Listed in the official fixture lineup."
          },
          {
            source: { ...alphaSource, title: "Beta Two", url: "https://beta.example/two", publisher: "Beta", role: "product" },
            basis: "official-product-page",
            qualification: "Identity only; configurations are not separate families."
          }
        ]
      }]
    }
  ]
};

test("valid catalogues resolve explicit product-level first-party evidence", () => {
  assert.deepEqual(validateCatalogue(fixture), []);
  assert.deepEqual(productsFor(fixture).map(({ slug, effectiveSourceUrl }) => [slug, effectiveSourceUrl]), [
    ["alpha-one", "https://products.alpha.example/catalogue"],
    ["beta-two", "https://beta.example/two"]
  ]);
});

test("validation rejects missing evidence and undeclared source hosts", () => {
  const invalid: ProductCatalogue = {
    ...fixture,
    brands: [{
      ...fixture.brands[0],
      products: [{
        ...fixture.brands[0].products[0],
        evidence: []
      }, {
        ...fixture.brands[0].products[0],
        slug: "alpha-unsafe",
        evidence: [{
          source: { ...alphaSource, url: "https://aggregator.example/alpha", role: "product" },
          basis: "official-product-page",
          qualification: "Wrong host."
        }]
      }]
    }, fixture.brands[1]]
  };
  assert.deepEqual(validateCatalogue(invalid), [
    "alpha-one must have product-level identity evidence.",
    "alpha-unsafe current lifecycle must cite an official current lineup.",
    "alpha-unsafe source must use a declared Alpha host."
  ]);
});
