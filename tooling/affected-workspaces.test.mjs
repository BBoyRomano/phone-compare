import assert from "node:assert/strict";
import test from "node:test";
import { impactForFiles, loadWorkspace, pathsFromNameStatus } from "./affected-workspaces.mjs";

const workspace = await loadWorkspace();

test("an app-only change affects only that app", () => {
  assert.deepEqual(impactForFiles(workspace, ["apps/phones/data/catalog.ts"]).apps, ["phones"]);
  assert.deepEqual(impactForFiles(workspace, ["apps/cars/app/page.tsx"]).apps, ["cars"]);
});

test("shared package changes affect only transitive consumers", () => {
  assert.deepEqual(impactForFiles(workspace, ["packages/catalog/src/index.ts"]).apps, ["cars", "laptops", "phones", "tablets"]);
  assert.deepEqual(impactForFiles(workspace, ["packages/web/src/index.tsx"]).apps, ["cars", "laptops", "tablets"]);
  assert.deepEqual(impactForFiles(workspace, ["packages/build/cloudflare-worker.ts"]).apps, ["cars", "laptops", "phones", "tablets"]);
});

test("toolchain changes affect all apps while documentation changes affect none", () => {
  assert.deepEqual(impactForFiles(workspace, ["pnpm-lock.yaml"]).apps, ["cars", "laptops", "phones", "tablets"]);
  assert.deepEqual(impactForFiles(workspace, ["docs/ARCHITECTURE.md"]).apps, []);
});

test("deployment matrix is sourced from app-owned metadata", () => {
  const impact = impactForFiles(workspace, ["apps/tablets/data/catalog.ts"]);
  assert.deepEqual(impact.matrix.include, [{
    app: "tablets",
    package: "@product-compare/tablets",
    databaseName: "product-compare-tablets-production",
    productionUrl: "https://product-compare-tablets.bboyromano.workers.dev",
    smokeMarker: "Tablet Compare",
    browserTests: false
  }]);
});

test("unknown production paths fail safe", () => {
  assert.deepEqual(impactForFiles(workspace, ["platform/new-runtime-config.ts"]).apps, ["cars", "laptops", "phones", "tablets"]);
});

test("rename parsing includes both the source and destination paths", () => {
  const paths = pathsFromNameStatus("R100\0apps/phones/data/old.ts\0docs/old-phone-data.md\0M\0README.md\0");
  assert.deepEqual(paths, ["apps/phones/data/old.ts", "docs/old-phone-data.md", "README.md"]);
  assert.deepEqual(impactForFiles(workspace, paths).apps, ["phones"]);
});
