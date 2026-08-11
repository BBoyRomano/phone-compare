import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

function objectsIn(value, output = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => objectsIn(item, output));
  } else if (value && typeof value === "object") {
    output.push(value);
    Object.values(value).forEach((item) => objectsIn(item, output));
  }
  return output;
}

export function verifyD1Identity(payload, expectedName, expectedId) {
  const match = objectsIn(payload).find((item) => {
    const names = [item.name, item.database_name].filter((value) => typeof value === "string");
    const ids = [item.uuid, item.id, item.database_id].filter((value) => typeof value === "string");
    return names.includes(expectedName) && ids.includes(expectedId);
  });
  if (!match) throw new Error(`Cloudflare D1 identity mismatch: expected ${expectedName} (${expectedId}).`);
  return match;
}

async function main() {
  const [path, expectedName, expectedId] = process.argv.slice(2);
  if (!path || !expectedName || !expectedId) throw new Error("Usage: verify-d1-identity.mjs <info.json> <expected-name> <expected-id>");
  verifyD1Identity(JSON.parse(await readFile(resolve(path), "utf8")), expectedName, expectedId);
  console.log(`Verified Cloudflare D1 identity ${expectedName} (${expectedId}).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
