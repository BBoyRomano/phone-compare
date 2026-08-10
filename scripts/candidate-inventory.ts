import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildCoverageReport, parseCandidateInventory, validateDiscoverySourceRegistry } from "../inventory/candidate-inventory.ts";
import { phones } from "../data/catalog.ts";

const inventoryUrl = new URL("../inventory/candidates.ndjson", import.meta.url);
const inventoryContents = await readFile(inventoryUrl, "utf8");
const { candidates, errors: candidateErrors } = parseCandidateInventory(inventoryContents);
const registryErrors = validateDiscoverySourceRegistry();
const catalogueSlugs = new Set<string>(phones.map(({ slug }) => slug));
const publishedSlugErrors = candidates
  .filter(({ publishedSlug }) => publishedSlug && !catalogueSlugs.has(publishedSlug))
  .map(({ candidateId, publishedSlug }) => `${candidateId}: publishedSlug ${publishedSlug} does not exist in the catalogue`);
const errors = [...registryErrors, ...candidateErrors, ...publishedSlugErrors];

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else if (process.argv.includes("--coverage")) {
  const report = buildCoverageReport(
    candidates,
    phones.map((phone) => ({ slug: phone.slug, brand: phone.maker.value, generation: phone.generation.value }))
  );
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Candidate inventory is valid (${candidates.length} candidates, ${fileURLToPath(inventoryUrl)}).`);
}
