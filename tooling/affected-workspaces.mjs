import { appendFile, readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const taskRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dependencyFields = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
const rootWideFiles = new Set([
  "eslint.config.mjs",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.base.json"
]);
const rootWidePrefixes = [".github/workflows/", "tooling/"];
const nonRuntimePrefixes = [".codex/", "docs/"];
const nonRuntimeFiles = new Set([".gitignore", "AGENTS.md", "LICENSE", "README.md"]);

function slash(path) {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

async function json(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function packageDirectories(root, group) {
  const base = join(root, group);
  const entries = await readdir(base, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => join(base, entry.name));
}

export async function loadWorkspace(root = taskRoot) {
  const [appDirectories, packageDirectoriesList] = await Promise.all([
    packageDirectories(root, "apps"),
    packageDirectories(root, "packages")
  ]);

  const loadPackage = async (directory, type) => {
    const manifest = await json(join(directory, "package.json"));
    const dependencies = new Set(dependencyFields.flatMap((field) => Object.keys(manifest[field] ?? {})));
    const item = {
      type,
      directory: slash(relative(root, directory)),
      name: manifest.name,
      manifest,
      dependencies
    };
    if (type === "app") item.config = await json(join(directory, "app.config.json"));
    return item;
  };

  const apps = await Promise.all(appDirectories.map((directory) => loadPackage(directory, "app")));
  const packages = await Promise.all(packageDirectoriesList.map((directory) => loadPackage(directory, "package")));
  return { root, apps, packages, byName: new Map([...apps, ...packages].map((item) => [item.name, item])) };
}

function dependsOn(workspace, item, targetName, seen = new Set()) {
  if (item.dependencies.has(targetName)) return true;
  if (seen.has(item.name)) return false;
  seen.add(item.name);
  return [...item.dependencies].some((name) => {
    const dependency = workspace.byName.get(name);
    return dependency ? dependsOn(workspace, dependency, targetName, seen) : false;
  });
}

export function impactForFiles(workspace, inputFiles) {
  const files = [...new Set(inputFiles.map(slash).filter(Boolean))];
  const affectedApps = new Set();
  const affectedPackages = new Set();
  let shared = false;

  const affectAll = () => {
    workspace.apps.forEach((app) => affectedApps.add(app.config.id));
    workspace.packages.forEach((pkg) => affectedPackages.add(pkg.name));
    shared = true;
  };

  for (const file of files) {
    const app = workspace.apps.find((candidate) => file === candidate.directory || file.startsWith(`${candidate.directory}/`));
    if (app) {
      affectedApps.add(app.config.id);
      continue;
    }

    const pkg = workspace.packages.find((candidate) => file === candidate.directory || file.startsWith(`${candidate.directory}/`));
    if (pkg) {
      shared = true;
      affectedPackages.add(pkg.name);
      workspace.apps.filter((appItem) => dependsOn(workspace, appItem, pkg.name)).forEach((appItem) => affectedApps.add(appItem.config.id));
      continue;
    }

    if (rootWideFiles.has(file) || rootWidePrefixes.some((prefix) => file.startsWith(prefix))) {
      affectAll();
      continue;
    }

    if (nonRuntimeFiles.has(file) || nonRuntimePrefixes.some((prefix) => file.startsWith(prefix))) continue;

    // An unclassified production file must fail safe as the platform grows.
    affectAll();
  }

  const apps = [...affectedApps].sort();
  const packages = [...affectedPackages].sort();
  const include = apps.map((id) => {
    const app = workspace.apps.find((candidate) => candidate.config.id === id);
    if (!app) throw new Error(`Missing app metadata for ${id}.`);
    return {
      app: id,
      package: app.name,
      productionUrl: app.config.productionUrl,
      smokeMarker: app.config.smokeMarker,
      browserTests: app.config.browserTests
    };
  });

  return { apps, packages, shared, files, matrix: { include } };
}

function argument(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function gitChangedFiles(base, head) {
  if (!base || /^0+$/.test(base)) return null;
  try {
    const output = execFileSync("git", ["diff", "--name-status", "--find-renames", "-z", "--diff-filter=ACMRD", base, head], {
      cwd: taskRoot,
      encoding: "utf8"
    });
    return pathsFromNameStatus(output);
  } catch {
    return null;
  }
}

export function pathsFromNameStatus(output) {
  const parts = output.split("\0");
  const paths = [];
  for (let index = 0; index < parts.length;) {
    const status = parts[index++];
    if (!status) break;
    const firstPath = parts[index++];
    if (firstPath) paths.push(firstPath);
    if (status.startsWith("R") || status.startsWith("C")) {
      const secondPath = parts[index++];
      if (secondPath) paths.push(secondPath);
    }
  }
  return paths;
}

async function main() {
  const workspace = await loadWorkspace();
  const selection = argument("select");
  let impact;

  if (selection !== undefined) {
    const ids = selection === "all" ? workspace.apps.map((app) => app.config.id) : selection.split(",").map((id) => id.trim()).filter(Boolean);
    const unknown = ids.filter((id) => !workspace.apps.some((app) => app.config.id === id));
    if (unknown.length) throw new Error(`Unknown app selection: ${unknown.join(", ")}.`);
    impact = impactForFiles(workspace, ids.map((id) => `apps/${id}/app.config.json`));
  } else {
    const explicitFiles = argument("files-json");
    const changedFiles = explicitFiles ? JSON.parse(explicitFiles) : gitChangedFiles(argument("base"), argument("head") ?? "HEAD");
    impact = changedFiles ? impactForFiles(workspace, changedFiles) : impactForFiles(workspace, ["package.json"]);
  }

  const output = {
    apps: JSON.stringify(impact.apps),
    packages: JSON.stringify(impact.packages),
    shared: String(impact.shared),
    matrix: JSON.stringify(impact.matrix),
    has_apps: String(impact.apps.length > 0)
  };
  const githubOutput = argument("github-output");
  if (githubOutput) {
    await appendFile(githubOutput, `${Object.entries(output).map(([key, value]) => `${key}=${value}`).join("\n")}\n`);
  } else {
    process.stdout.write(`${JSON.stringify({ ...impact, ...output }, null, 2)}\n`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
