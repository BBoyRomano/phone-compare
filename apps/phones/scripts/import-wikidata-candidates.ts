import { readFile, writeFile } from "node:fs/promises";
import { phones, sources } from "../data/catalog.ts";
import {
  mergeImportedCandidates,
  parseCandidateInventory,
  type CandidateDiscoveryReference,
  type CandidatePhone
} from "../inventory/candidate-inventory.ts";

const importDate = new Date().toISOString().slice(0, 10);
const userAgent = "ProductCompareCandidateInventory/1.0 (+https://github.com/BBoyRomano/product-compare)";
const wikidataApi = "https://www.wikidata.org/w/api.php";
const wikidataQueryService = "https://query.wikidata.org/sparql";
const smartphoneClass = "Q22645";

interface SparqlResponse {
  readonly results: { readonly bindings: readonly { readonly item: { readonly value: string } }[] };
}

interface WikidataSnak {
  readonly mainsnak?: { readonly datavalue?: { readonly value?: unknown } };
}

interface WikidataEntity {
  readonly id: string;
  readonly lastrevid?: number;
  readonly labels?: Readonly<Record<string, { readonly value: string }>>;
  readonly aliases?: Readonly<Record<string, readonly { readonly value: string }[]>>;
  readonly claims?: Readonly<Record<string, readonly WikidataSnak[]>>;
}

interface WikidataEntityResponse {
  readonly entities: Readonly<Record<string, WikidataEntity>>;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: { Accept: "application/json", "User-Agent": userAgent, ...init?.headers }
      });
      if (response.ok) return (await response.json()) as T;
      if (response.status !== 429 && response.status < 500) throw new Error(`${response.status} ${response.statusText}`);
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < 3) await delay(attempt * 1000);
  }
  throw new Error(
    `Wikidata request failed after three bounded attempts: ${lastError instanceof Error ? lastError.message : "unknown error"}`
  );
}

function chunks<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

async function fetchCandidateIds(): Promise<string[]> {
  const query = `SELECT ?item WHERE { ?item wdt:P279 wd:${smartphoneClass}. } ORDER BY ?item`;
  const response = await fetchJson<SparqlResponse>(wikidataQueryService, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams({ query }).toString()
  });
  return response.results.bindings
    .map(({ item }) => item.value.match(/Q\d+$/)?.[0])
    .filter((id): id is string => Boolean(id));
}

async function fetchEntities(ids: readonly string[], props: string): Promise<Map<string, WikidataEntity>> {
  const entities = new Map<string, WikidataEntity>();
  for (const batch of chunks(ids, 50)) {
    const parameters = new URLSearchParams({
      action: "wbgetentities",
      ids: batch.join("|"),
      props,
      languages: "en",
      languagefallback: "1",
      format: "json",
      formatversion: "2",
      origin: "*"
    });
    const response = await fetchJson<WikidataEntityResponse>(`${wikidataApi}?${parameters}`);
    for (const entity of Object.values(response.entities)) entities.set(entity.id, entity);
  }
  return entities;
}

function entityIdsForClaim(entity: WikidataEntity, property: string): string[] {
  return [...new Set((entity.claims?.[property] ?? []).flatMap(({ mainsnak }) => {
    const value = mainsnak?.datavalue?.value;
    if (typeof value !== "object" || value === null || !("id" in value) || typeof value.id !== "string") return [];
    return [value.id];
  }))];
}

function stringsForClaim(entity: WikidataEntity, property: string): string[] {
  return [...new Set((entity.claims?.[property] ?? []).flatMap(({ mainsnak }) => {
    const value = mainsnak?.datavalue?.value;
    return typeof value === "string" && value.trim() ? [value.trim()] : [];
  }))];
}

function labelFor(entity: WikidataEntity | undefined): string | null {
  return entity?.labels?.en?.value?.trim() || null;
}

function normalized(value: string): string {
  return value.normalize("NFKD").toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim();
}

function joinedLabels(
  ids: readonly string[],
  labels: ReadonlyMap<string, WikidataEntity>
): { value: string | null; all: string[] } {
  const all = [...new Set(ids.map((id) => labelFor(labels.get(id)) ?? id))].sort((a, b) => a.localeCompare(b));
  return { value: all.length > 0 ? all.join(" / ") : null, all };
}

const brandRules: readonly { readonly pattern: RegExp; readonly brand: string; readonly manufacturer?: string }[] = [
  { pattern: /\b(?:apple|iphone)\b/i, brand: "Apple", manufacturer: "Apple" },
  { pattern: /\bsamsung(?: galaxy)?\b/i, brand: "Samsung", manufacturer: "Samsung" },
  { pattern: /\b(?:google pixel|pixel)\b/i, brand: "Google", manufacturer: "Google" },
  { pattern: /\b(?:sony|xperia)\b/i, brand: "Sony", manufacturer: "Sony" },
  { pattern: /\bredmi\b/i, brand: "REDMI", manufacturer: "Xiaomi" },
  { pattern: /\bpoco\b/i, brand: "POCO", manufacturer: "Xiaomi" },
  { pattern: /\bxiaomi\b/i, brand: "Xiaomi", manufacturer: "Xiaomi" },
  { pattern: /\bhonor\b/i, brand: "HONOR", manufacturer: "HONOR" },
  { pattern: /\bhuawei\b/i, brand: "HUAWEI", manufacturer: "HUAWEI" },
  { pattern: /\brealme\b/i, brand: "realme", manufacturer: "realme" },
  { pattern: /\boppo\b/i, brand: "OPPO", manufacturer: "OPPO" },
  { pattern: /\bvivo\b/i, brand: "vivo", manufacturer: "vivo" },
  { pattern: /\boneplus\b/i, brand: "OnePlus", manufacturer: "OnePlus" },
  { pattern: /\bnothing\b/i, brand: "Nothing", manufacturer: "Nothing" },
  { pattern: /\b(?:motorola|moto)\b/i, brand: "Motorola", manufacturer: "Motorola" },
  { pattern: /\basus\b/i, brand: "ASUS", manufacturer: "ASUS" },
  { pattern: /\bhmd\b/i, brand: "HMD", manufacturer: "HMD" },
  { pattern: /\bnokia\b/i, brand: "Nokia" },
  { pattern: /\bhtc\b/i, brand: "HTC", manufacturer: "HTC" },
  { pattern: /\blg\b/i, brand: "LG", manufacturer: "LG" },
  { pattern: /\bblackberry\b/i, brand: "BlackBerry", manufacturer: "BlackBerry" },
  { pattern: /\bacer\b/i, brand: "Acer", manufacturer: "Acer" },
  { pattern: /\bmeizu\b/i, brand: "MEIZU", manufacturer: "MEIZU" },
  { pattern: /\bzte\b/i, brand: "ZTE", manufacturer: "ZTE" },
  { pattern: /\btecno\b/i, brand: "TECNO", manufacturer: "TECNO" },
  { pattern: /\binfinix\b/i, brand: "Infinix", manufacturer: "Infinix" },
  { pattern: /\btcl\b/i, brand: "TCL", manufacturer: "TCL" },
  { pattern: /\bfairphone\b/i, brand: "Fairphone", manufacturer: "Fairphone" },
  { pattern: /\bkyocera\b/i, brand: "Kyocera", manufacturer: "Kyocera" },
  { pattern: /\bunihertz\b/i, brand: "Unihertz", manufacturer: "Unihertz" },
  { pattern: /\bsharp\b/i, brand: "Sharp", manufacturer: "Sharp" }
];

const manufacturerRules: readonly { readonly pattern: RegExp; readonly manufacturer: string }[] = [
  { pattern: /\bapple(?: inc\.)?\b/i, manufacturer: "Apple" },
  { pattern: /\bsamsung(?: electronics| group)?\b/i, manufacturer: "Samsung" },
  { pattern: /\bgoogle\b/i, manufacturer: "Google" },
  { pattern: /\bsony(?: mobile communications| group)?\b/i, manufacturer: "Sony" },
  { pattern: /\bhonor(?: device co\., ltd\.)?\b/i, manufacturer: "HONOR" },
  { pattern: /\bhuawei\b/i, manufacturer: "HUAWEI" },
  { pattern: /\brealme\b/i, manufacturer: "realme" },
  { pattern: /\boppo\b/i, manufacturer: "OPPO" },
  { pattern: /\bxiaomi\b/i, manufacturer: "Xiaomi" },
  { pattern: /\bmotorola(?: mobility)?\b/i, manufacturer: "Motorola" },
  { pattern: /\bhmd(?: global)?\b/i, manufacturer: "HMD" },
  { pattern: /\blg(?: electronics| group)?\b/i, manufacturer: "LG" },
  { pattern: /\btcl(?: technology)?\b/i, manufacturer: "TCL" },
  { pattern: /\btecno(?: mobile)?\b/i, manufacturer: "TECNO" },
  { pattern: /\bmeizu\b/i, manufacturer: "MEIZU" },
  { pattern: /\bsharp(?: corporation)?\b/i, manufacturer: "Sharp" },
  { pattern: /\basus\b/i, manufacturer: "ASUS" },
  { pattern: /\bvivo\b/i, manufacturer: "vivo" }
];

function canonicalBrand(rawNames: readonly string[], model: string): { value: string | null; inferred: boolean } {
  const rawText = rawNames.join(" / ");
  const rawMatch = brandRules.find(({ pattern }) => pattern.test(rawText));
  if (rawMatch) return { value: rawMatch.brand, inferred: false };
  if (rawNames.length > 0) return { value: rawNames.join(" / "), inferred: false };
  const modelMatch = brandRules.find(({ pattern }) => pattern.test(model));
  return { value: modelMatch?.brand ?? null, inferred: Boolean(modelMatch) };
}

function canonicalManufacturer(
  rawNames: readonly string[],
  brand: { value: string | null; inferred: boolean }
): { value: string | null; inferred: boolean } {
  const rawText = rawNames.join(" / ");
  const rawMatch = manufacturerRules.find(({ pattern }) => pattern.test(rawText));
  if (rawMatch) return { value: rawMatch.manufacturer, inferred: false };
  const brandMatch = brandRules.find(({ brand: candidateBrand }) => candidateBrand === brand.value);
  const contractManufacturer = /^(?:Foxconn|FIH Mobile Limited|Flex Ltd\.|Compal Electronics|Hi-P International Limited|Tinno)$/i;
  if (rawNames.length > 0 && rawNames.every((name) => contractManufacturer.test(name)) && brandMatch?.manufacturer) {
    return { value: brandMatch.manufacturer, inferred: true };
  }
  if (rawNames.length > 0) return { value: rawNames.join(" / "), inferred: false };
  return { value: brandMatch?.manufacturer ?? null, inferred: Boolean(brandMatch?.manufacturer) };
}

function publishedDiscoverySources(phone: (typeof phones)[number]): CandidateDiscoveryReference[] {
  const sourceId = phone.model.sourceIds[0];
  const source = sources[sourceId];
  return [
    { sourceId: "repository-published-catalogue", sourceRecordId: phone.slug, retrievedAt: importDate },
    {
      sourceId: "manufacturer-first-party",
      sourceRecordId: sourceId,
      url: source.url,
      retrievedAt: source.accessedAt
    }
  ];
}

const candidateIds = await fetchCandidateIds();
const entities = await fetchEntities(candidateIds, "labels|aliases|claims");
const referencedIds = [...new Set([...entities.values()].flatMap((entity) => [
  ...entityIdsForClaim(entity, "P176"),
  ...entityIdsForClaim(entity, "P1716")
]))];
const referencedEntities = await fetchEntities(referencedIds, "labels");

const catalogueByModel = new Map<string, (typeof phones)[number][]>();
for (const phone of phones) {
  const key = normalized(phone.model.value);
  catalogueByModel.set(key, [...(catalogueByModel.get(key) ?? []), phone]);
}

const matchedCatalogueSlugs = new Set<string>();
const generatedCandidates: CandidatePhone[] = [];
let skippedWithoutLabel = 0;

for (const id of candidateIds) {
  const entity = entities.get(id);
  if (!entity) continue;
  const model = labelFor(entity);
  if (!model) {
    skippedWithoutLabel += 1;
    continue;
  }
  const discoveredManufacturers = joinedLabels(entityIdsForClaim(entity, "P176"), referencedEntities);
  const discoveredBrands = joinedLabels(entityIdsForClaim(entity, "P1716"), referencedEntities);
  const brand = canonicalBrand(discoveredBrands.all, model);
  const manufacturer = canonicalManufacturer(discoveredManufacturers.all, brand);
  const aliases = [...new Set((entity.aliases?.en ?? []).map(({ value }) => value.trim()).filter((value) => value && value !== model))]
    .sort((a, b) => a.localeCompare(b));
  const modelCodes = stringsForClaim(entity, "P13351").sort((a, b) => a.localeCompare(b));
  const exactCatalogueMatches = catalogueByModel.get(normalized(model)) ?? [];
  const publishedMatch = exactCatalogueMatches.length === 1 ? exactCatalogueMatches[0] : undefined;
  if (publishedMatch) matchedCatalogueSlugs.add(publishedMatch.slug);
  const notes = [
    manufacturer.inferred ? `Manufacturer identity inferred from the Wikidata marketing name or brand; first-party resolution remains required.` : null,
    brand.inferred ? `Displayed brand inferred from the Wikidata marketing name; first-party resolution remains required.` : null,
    publishedMatch ? `Matched to the published catalogue by a unique exact normalized marketing name (${publishedMatch.model.value}).` : null
  ].filter((note): note is string => Boolean(note));

  generatedCandidates.push({
    candidateId: `wikidata-${id.toLocaleLowerCase("en")}`,
    manufacturer: manufacturer.value,
    brand: brand.value,
    ...(discoveredManufacturers.all.length > 0 ? { discoveredManufacturerNames: discoveredManufacturers.all } : {}),
    ...(discoveredBrands.all.length > 0 ? { discoveredBrandNames: discoveredBrands.all } : {}),
    model,
    ...(modelCodes.length > 0 ? { modelCodes } : {}),
    ...(aliases.length > 0 ? { aliases } : {}),
    deviceTypeHint: "smartphone",
    discoverySources: [
      {
        sourceId: "wikidata",
        sourceRecordId: id,
        url: `https://www.wikidata.org/wiki/${id}`,
        retrievedAt: importDate,
        ...(entity.lastrevid ? { sourceVersion: `revision-${entity.lastrevid}` } : {})
      },
      ...(publishedMatch ? publishedDiscoverySources(publishedMatch) : [])
    ],
    verificationState: publishedMatch ? "published" : "unreviewed",
    ...(publishedMatch ? { publishedSlug: publishedMatch.slug } : {}),
    ...(notes.length > 0 ? { notes: notes.join(" ") } : {})
  });
}

const manufacturerOverrides: Readonly<Record<string, string>> = { POCO: "Xiaomi", REDMI: "Xiaomi" };
for (const phone of phones) {
  if (matchedCatalogueSlugs.has(phone.slug)) continue;
  generatedCandidates.push({
    candidateId: `catalog-${phone.slug}`,
    manufacturer: manufacturerOverrides[phone.maker.value] ?? phone.maker.value,
    brand: phone.maker.value,
    model: phone.model.value,
    deviceTypeHint: "smartphone",
    formFactorHint: phone.formFactor.value,
    discoverySources: publishedDiscoverySources(phone),
    verificationState: "published",
    publishedSlug: phone.slug,
    notes: "Bootstrapped from the verified published catalogue because no unique exact-name Wikidata candidate match was established."
  });
}

const inventoryUrl = new URL("../inventory/candidates.ndjson", import.meta.url);
const existingContents = await readFile(inventoryUrl, "utf8").catch(() => "");
const existingInventory = parseCandidateInventory(existingContents);
if (existingInventory.errors.length > 0) {
  throw new Error(`Existing candidate inventory is invalid:\n${existingInventory.errors.join("\n")}`);
}
const generatedIds = new Set(generatedCandidates.map(({ candidateId }) => candidateId));
const preservedExistingCandidates = existingInventory.candidates.filter(({ candidateId }) => !generatedIds.has(candidateId));
const candidates = mergeImportedCandidates(generatedCandidates, existingInventory.candidates);
const ndjson = `${candidates.map((candidate) => JSON.stringify(candidate)).join("\n")}\n`;
const summary = {
  wikidataClass: smartphoneClass,
  wikidataEntities: candidateIds.length,
  skippedWithoutEnglishOrFallbackLabel: skippedWithoutLabel,
  wikidataCandidates: candidateIds.length - skippedWithoutLabel,
  totalCandidatesAfterReconciliation: candidates.length,
  publishedMatchesFromWikidata: matchedCatalogueSlugs.size,
  publishedCatalogueBootstrapCandidates: phones.length - matchedCatalogueSlugs.size,
  preservedExistingCandidatesAbsentFromCurrentImport: preservedExistingCandidates.length,
  candidatesWithManufacturer: candidates.filter(({ manufacturer }) => manufacturer !== null).length,
  candidatesWithBrand: candidates.filter(({ brand }) => brand !== null).length
};

if (process.argv.includes("--write")) {
  await writeFile(inventoryUrl, ndjson, "utf8");
  await writeFile(
    new URL("../inventory/imports/wikidata-smartphones.json", import.meta.url),
    `${JSON.stringify({
      sourceId: "wikidata",
      importedAt: importDate,
      queryService: wikidataQueryService,
      entityApi: wikidataApi,
      class: { id: smartphoneClass, url: `https://www.wikidata.org/wiki/${smartphoneClass}`, relationship: "direct subclass" },
      query: `SELECT ?item WHERE { ?item wdt:P279 wd:${smartphoneClass}. } ORDER BY ?item`,
      license: { expression: "CC0-1.0", url: "https://www.wikidata.org/wiki/Wikidata:Licensing" },
      result: summary,
      limitations: [
        "Direct subclasses provide a bounded reproducible slice but omit phones modelled elsewhere in Wikidata.",
        "Entities without an English or language-fallback label are skipped because a Q identifier alone is not a useful marketing-name candidate.",
        "Manufacturer, brand, alias, and model-code claims are community discovery signals and require first-party resolution before publication."
      ]
    }, null, 2)}\n`,
    "utf8"
  );
  console.log(`Wrote ${candidates.length} candidates to inventory/candidates.ndjson.`);
}
console.log(JSON.stringify(summary, null, 2));
