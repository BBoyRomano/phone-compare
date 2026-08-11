import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { CURRENT_RELATIONAL_PROJECTION_REVISION, relationalCatalogueSql, validateRelationalCatalogue } from "../packages/catalog/src/relational.ts";

const appDirectory = resolve(process.argv[2] ?? ".");
const moduleUrl = pathToFileURL(resolve(appDirectory, "data", "relational.ts"));
const { relationalCatalogue } = await import(moduleUrl.href);
const errors = validateRelationalCatalogue(relationalCatalogue);
if (errors.length) throw new Error(errors.join("\n"));

let sourceCommit = process.env.GITHUB_SHA;
if (!sourceCommit) {
  try {
    sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: appDirectory, encoding: "utf8" }).trim();
  } catch {
    sourceCommit = "local-uncommitted";
  }
}

const { version, sql } = relationalCatalogueSql(relationalCatalogue, sourceCommit);
const outputDirectory = resolve(appDirectory, "dist", "catalog");
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(resolve(outputDirectory, "catalog.sql"), sql, "utf8"),
  writeFile(resolve(outputDirectory, "manifest.json"), `${JSON.stringify({
    appId: relationalCatalogue.appId,
    databaseName: `product-compare-${relationalCatalogue.appId}-production`,
    version,
    projectionRevision: CURRENT_RELATIONAL_PROJECTION_REVISION,
    variants: relationalCatalogue.variants.length,
    sources: relationalCatalogue.sources.length,
    facts: relationalCatalogue.facts.length
  }, null, 2)}\n`, "utf8")
]);
console.log(`Generated ${basename(appDirectory)} catalogue ${version} with ${relationalCatalogue.variants.length} variants.`);
