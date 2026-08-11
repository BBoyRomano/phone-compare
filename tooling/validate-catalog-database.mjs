import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const appDirectory = resolve(process.argv[2] ?? ".");
const taskRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = resolve(appDirectory, "dist", "server", "wrangler.json");
const sql = resolve(appDirectory, "dist", "catalog", "catalog.sql");
const manifest = JSON.parse(await readFile(resolve(appDirectory, "dist", "catalog", "manifest.json"), "utf8"));
const persistence = await mkdtemp(resolve(tmpdir(), `product-compare-${manifest.appId}-d1-`));
const wranglerBin = resolve(taskRoot, "node_modules", "wrangler", "bin", "wrangler.js");
const environment = {
  ...process.env,
  WRANGLER_LOG_PATH: resolve(persistence, "wrangler.log")
};

function wrangler(args) {
  const result = spawnSync(process.execPath, [wranglerBin, ...args], {
    cwd: taskRoot,
    env: environment,
    encoding: "utf8",
    stdio: "pipe"
  });
  if (result.status !== 0) throw new Error(result.error?.message ?? result.stderr ?? `Wrangler exited with status ${result.status}.`);
  return result.stdout;
}

try {
  const common = ["--local", "--config", config, "--persist-to", persistence];
  wrangler(["d1", "migrations", "apply", "CATALOG_DB", ...common]);
  wrangler(["d1", "execute", "CATALOG_DB", ...common, "--file", sql]);
  wrangler(["d1", "execute", "CATALOG_DB", ...common, "--file", sql]);
  const output = wrangler([
    "d1", "execute", "CATALOG_DB", ...common, "--json",
    "--command", `SELECT r.version, r.record_count, COUNT(v.variant_id) AS variants FROM catalog_state s JOIN catalog_releases r ON r.version = s.active_version JOIN variants v ON v.release_version = r.version WHERE s.app_id = '${manifest.appId}' GROUP BY r.version, r.record_count;`
  ]);
  const payload = JSON.parse(output);
  const rows = payload.flatMap((item) => item.results ?? []);
  const row = rows.find((item) => item.version === manifest.version);
  if (!row || row.record_count !== manifest.variants || row.variants !== manifest.variants) {
    throw new Error(`D1 projection mismatch for ${manifest.appId}: ${JSON.stringify(row ?? null)}.`);
  }
  console.log(`Validated ${manifest.appId} D1 projection ${manifest.version} with ${manifest.variants} variants.`);
} finally {
  await rm(persistence, { recursive: true, force: true });
}
