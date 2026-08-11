import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadWorkspace } from "./affected-workspaces.mjs";

export async function validateWorkspace(workspace) {
  const errors = [];
  const names = new Set();

  for (const item of [...workspace.apps, ...workspace.packages]) {
    if (!item.name) errors.push(`${item.directory} must declare a package name.`);
    if (names.has(item.name)) errors.push(`Duplicate workspace package name: ${item.name}.`);
    names.add(item.name);
    if (item.manifest.private !== true) errors.push(`${item.name} must remain private until an explicit package publication policy exists.`);

    for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      for (const [name, version] of Object.entries(item.manifest[field] ?? {})) {
        if (workspace.byName.has(name) && !String(version).startsWith("workspace:")) {
          errors.push(`${item.name} must depend on ${name} through the workspace protocol.`);
        }
      }
    }
  }

  const workerNames = new Set();
  const databaseNames = new Set();
  const productionUrls = new Set();
  const smokeMarkers = new Set();
  for (const app of workspace.apps) {
    for (const script of ["dev", "build", "typecheck", "lint", "test:data", "test:render", "catalog:sql", "test:database", "check"]) {
      if (!app.manifest.scripts?.[script]) errors.push(`${app.name} is missing the ${script} script.`);
    }
    if (app.config.id !== app.directory.split("/").at(-1)) errors.push(`${app.name} app id must match its directory.`);
    if (app.config.packageName !== app.name) errors.push(`${app.name} app.config.json packageName must match package.json.`);
    if (!String(app.config.productionUrl).startsWith("https://")) errors.push(`${app.name} productionUrl must use HTTPS.`);
    for (const [field, value, values] of [
      ["workerName", app.config.workerName, workerNames],
      ["databaseName", app.config.databaseName, databaseNames],
      ["productionUrl", app.config.productionUrl, productionUrls],
      ["smokeMarker", app.config.smokeMarker, smokeMarkers]
    ]) {
      if (!String(value ?? "").trim()) errors.push(`${app.name} ${field} must not be empty.`);
      if (values.has(value)) errors.push(`${app.name} ${field} must be unique: ${value}.`);
      values.add(value);
    }
    if (app.config.databaseName !== `product-compare-${app.config.id}-production`) {
      errors.push(`${app.name} databaseName must follow product-compare-<app>-production.`);
    }
  }

  const appNames = new Set(workspace.apps.map((app) => app.name));
  for (const pkg of workspace.packages) {
    for (const dependency of pkg.dependencies) {
      if (appNames.has(dependency)) errors.push(`${pkg.name} must not depend on app package ${dependency}.`);
    }
    const packageJson = await readFile(join(workspace.root, pkg.directory, "package.json"), "utf8");
    if (/\.\.\/\.\.\/apps\//.test(packageJson)) errors.push(`${pkg.name} must not export files from an app.`);
  }

  return errors;
}

async function main() {
  const workspace = await loadWorkspace();
  const errors = await validateWorkspace(workspace);
  if (errors.length) {
    errors.forEach((error) => console.error(error));
    process.exitCode = 1;
  } else {
    console.log(`Validated ${workspace.apps.length} independently runnable apps and ${workspace.packages.length} shared packages.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
