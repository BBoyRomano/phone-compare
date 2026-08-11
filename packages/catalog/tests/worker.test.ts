import assert from "node:assert/strict";
import test from "node:test";
import { withCatalogueApi, type CatalogueDatabase } from "../src/worker.ts";

function database(rows: { readonly first?: unknown; readonly all?: readonly unknown[] }): CatalogueDatabase {
  return {
    prepare() {
      return {
        bind() { return this; },
        async first<T>() { return (rows.first ?? null) as T | null; },
        async all<T>() { return { results: (rows.all ?? []) as readonly T[] }; }
      };
    }
  };
}

const fallback = { async fetch() { return new Response("app"); } };

test("catalogue status exposes only the active release projection", async () => {
  const worker = withCatalogueApi(fallback, "phones");
  const response = await worker.fetch(new Request("https://example.test/api/catalog/status"), {
    CATALOG_DB: database({ first: { version: "phones-v1", recordCount: 2 } })
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { appId: "phones", release: { version: "phones-v1", recordCount: 2 } });
});

test("catalogue API fails closed when no release is active and delegates other routes", async () => {
  const worker = withCatalogueApi(fallback, "cars");
  const missing = await worker.fetch(new Request("https://example.test/api/catalog/status"), { CATALOG_DB: database({}) });
  assert.equal(missing.status, 503);
  const delegated = await worker.fetch(new Request("https://example.test/"), { CATALOG_DB: database({}) });
  assert.equal(await delegated.text(), "app");
});

test("catalogue products are read from the active app database", async () => {
  const worker = withCatalogueApi(fallback, "laptops");
  const products = [{ id: "acme-book", brand: "Acme", name: "Acme Book", variantId: "acme-book-13" }];
  const response = await worker.fetch(new Request("https://example.test/api/catalog/products"), {
    CATALOG_DB: database({ all: products })
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { appId: "laptops", products });
});
