import assert from "node:assert/strict";
import test from "node:test";
import { productsFor, validateCatalogue } from "@product-compare/catalog";
import { tabletCatalogue } from "../data/catalog.ts";
test("tablet catalogue is valid and covers the assessed main-brand set", () => {
  assert.deepEqual(validateCatalogue(tabletCatalogue), []);
  assert.equal(tabletCatalogue.brands.length, 10);
  assert.equal(productsFor(tabletCatalogue).length, 42);
  assert.deepEqual(tabletCatalogue.brands.map(({ name }) => name), ["Apple", "Samsung", "Lenovo", "Microsoft", "Amazon", "OnePlus", "Xiaomi", "HUAWEI", "Google", "Motorola"]);
  const products = productsFor(tabletCatalogue);
  assert.ok(products.every((product) => product.evidence.length > 0 && product.lifecycle.status === "current"));
  assert.ok(products.some(({ name }) => name === "Galaxy Tab S10 Lite"));
  assert.ok(products.every(({ name }) => name !== "moto g play - 2026 tablet"));
});
