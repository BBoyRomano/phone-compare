import assert from "node:assert/strict";
import test from "node:test";
import { loadWorkspace } from "./affected-workspaces.mjs";
import { validateWorkspace } from "./validate-workspaces.mjs";

test("the real workspace has unique app release identities", async () => {
  assert.deepEqual(await validateWorkspace(await loadWorkspace()), []);
});

test("release identity collisions are rejected", async () => {
  const workspace = await loadWorkspace();
  const [first, second, ...rest] = workspace.apps;
  const invalid = {
    ...workspace,
    apps: [first, {
      ...second,
      config: {
        ...second.config,
        databaseName: first.config.databaseName,
        workerName: first.config.workerName,
        productionUrl: first.config.productionUrl,
        smokeMarker: first.config.smokeMarker
      }
    }, ...rest]
  };
  const errors = await validateWorkspace(invalid);
  assert.ok(errors.some((error) => error.includes("workerName must be unique")));
  assert.ok(errors.some((error) => error.includes("databaseName must be unique")));
  assert.ok(errors.some((error) => error.includes("productionUrl must be unique")));
  assert.ok(errors.some((error) => error.includes("smokeMarker must be unique")));
});
