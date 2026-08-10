export const verificationStates = [
  "unreviewed",
  "researching",
  "verified-current",
  "verified-earlier",
  "published",
  "duplicate-alias",
  "non-phone",
  "insufficient-first-party-evidence",
  "conflicting-identity",
  "rejected"
] as const;

export type VerificationState = (typeof verificationStates)[number];

export const deviceTypeHints = [
  "smartphone",
  "feature-phone",
  "tablet",
  "watch",
  "television",
  "chromebook",
  "automotive",
  "emulator",
  "other",
  "unknown"
] as const;

export type DeviceTypeHint = (typeof deviceTypeHints)[number];

export const formFactorHints = ["slab", "book-fold", "flip-fold", "rugged", "keyboard", "other", "unknown"] as const;

export type FormFactorHint = (typeof formFactorHints)[number];

export interface CandidateDiscoveryReference {
  readonly sourceId: string;
  readonly sourceRecordId?: string;
  readonly url?: string;
  readonly retrievedAt?: string;
  readonly sourceVersion?: string;
}

export interface CandidatePhone {
  readonly candidateId: string;
  readonly manufacturer: string;
  readonly brand: string;
  readonly model: string;
  readonly modelCodes?: readonly string[];
  readonly aliases?: readonly string[];
  readonly regionalHints?: readonly string[];
  readonly deviceTypeHint?: DeviceTypeHint;
  readonly formFactorHint?: FormFactorHint;
  readonly discoverySources: readonly CandidateDiscoveryReference[];
  readonly verificationState: VerificationState;
  readonly publishedSlug?: string;
  readonly duplicateOfCandidateId?: string;
  readonly dispositionReason?: string;
  readonly notes?: string;
  readonly reviewedAt?: string;
}

export type DiscoverySourceAutomation = "bulk-allowed" | "bounded-manual-only" | "excluded";
export type DiscoverySourcePersistence = "allowed" | "conditional" | "excluded";
export type DiscoverySourceUse = "bulk-candidate-import" | "bounded-manual-signal" | "not-used";

export interface DiscoverySourceProfile {
  readonly id: string;
  readonly name: string;
  readonly operator: string;
  readonly url: string;
  readonly assessedAt: string;
  readonly contributes: readonly string[];
  readonly completeness: string;
  readonly freshness: string;
  readonly deviceSemantics: string;
  readonly accessMechanism: string;
  readonly termsOrLicenseUrl?: string;
  readonly licenseOrTerms: string;
  readonly automatedCollection: DiscoverySourceAutomation;
  readonly repositoryPersistence: DiscoverySourcePersistence;
  readonly useDecision: DiscoverySourceUse;
  readonly limitations: readonly string[];
}

export const discoverySources: readonly DiscoverySourceProfile[] = [
  {
    id: "repository-published-catalogue",
    name: "Phone Compare published catalogue",
    operator: "Phone Compare",
    url: "https://github.com/BBoyRomano/phone-compare/blob/main/data/catalog.ts",
    assessedAt: "2026-08-10",
    contributes: ["Existing canonical phone slugs", "Displayed brand and model names", "Published match reconciliation"],
    completeness: "Complete for records already published by Phone Compare; not an external discovery universe.",
    freshness: "Updated with each protected catalogue change.",
    deviceSemantics: "One curated comparison record per canonical product identity under the catalogue's documented qualifications.",
    accessMechanism: "Repository-local TypeScript import.",
    licenseOrTerms: "Repository-owned project data under the repository licence.",
    automatedCollection: "bulk-allowed",
    repositoryPersistence: "allowed",
    useDecision: "bulk-candidate-import",
    limitations: ["Cannot discover phones that are not already published."]
  },
  {
    id: "wikidata",
    name: "Wikidata",
    operator: "Wikimedia Foundation and Wikidata contributors",
    url: "https://www.wikidata.org/",
    assessedAt: "2026-08-10",
    contributes: ["Phone and product-family identity", "Manufacturers and brands", "Aliases", "Cross-source identifiers"],
    completeness: "Broad historical and international coverage, but uneven by manufacturer and generation.",
    freshness: "Continuously edited; individual items can be stale or incomplete.",
    deviceSemantics: "Community-authored entities can represent a model, family, edition, or ambiguous product identity and require resolution.",
    accessMechanism: "Wikidata Query Service, MediaWiki APIs, or official dumps.",
    termsOrLicenseUrl: "https://www.wikidata.org/wiki/Wikidata:Licensing",
    licenseOrTerms: "Structured data in the main, property, and lexeme namespaces is published under CC0.",
    automatedCollection: "bulk-allowed",
    repositoryPersistence: "allowed",
    useDecision: "bulk-candidate-import",
    limitations: [
      "Community data is a discovery signal, never first-party publication evidence.",
      "Subclass and instance modelling is inconsistent, so queries can omit phones or include non-phone products."
    ]
  },
  {
    id: "google-play-supported-devices",
    name: "Google Play supported Android devices",
    operator: "Google",
    url: "https://storage.googleapis.com/play_public/supported_devices.html",
    assessedAt: "2026-08-10",
    contributes: ["Manufacturer", "Marketing name", "Model identifier", "Play Protect certification signal"],
    completeness: "Very broad for Play Protect-certified Android devices, including many regional and hardware variants.",
    freshness: "Google publishes a live downloadable list; no stable snapshot version is exposed on the help page.",
    deviceSemantics: "Rows describe certified Android device identities and can include tablets and other non-phone form factors; presence does not prove current retail availability.",
    accessMechanism: "Official public download linked from Google Play Help.",
    termsOrLicenseUrl: "https://support.google.com/googleplay/answer/1727131",
    licenseOrTerms: "The public help page invites downloading and searching, but does not state a reusable bulk-data licence for repository ingestion.",
    automatedCollection: "bounded-manual-only",
    repositoryPersistence: "excluded",
    useDecision: "bounded-manual-signal",
    limitations: [
      "Do not commit or mirror the source list in bulk while repository reuse rights remain unstated.",
      "Certification is not evidence for price, specifications, launch timing, lifecycle, or market availability.",
      "Marketing names and identifiers contain duplicates, aliases, regional variants, and non-phone devices."
    ]
  },
  {
    id: "gsmarena-index",
    name: "GSMArena manufacturer and model index",
    operator: "GSMArena",
    url: "https://www.gsmarena.com/makers.php3",
    assessedAt: "2026-08-10",
    contributes: ["Manufacturer and model completeness signal", "Historical family discovery"],
    completeness: "Potentially broad across current and historical mobile phones.",
    freshness: "Frequently updated, but no reviewed machine-readable snapshot or version was identified.",
    deviceSemantics: "Editorial product pages and indexes can separate regional variants or editions differently from manufacturer catalogues.",
    accessMechanism: "Public website only; automated access was blocked during this assessment.",
    licenseOrTerms: "No clearly applicable bulk-reuse licence or supported bulk API was established.",
    automatedCollection: "excluded",
    repositoryPersistence: "excluded",
    useDecision: "not-used",
    limitations: [
      "Do not bypass access controls or automate bulk retrieval.",
      "Do not copy editorial text, images, reviews, descriptions, or specification records.",
      "A future bounded manual lookup may be reconsidered only if current site policy clearly permits it."
    ]
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    operator: "Wikimedia Foundation and Wikipedia contributors",
    url: "https://en.wikipedia.org/wiki/Category:Mobile_phones",
    assessedAt: "2026-08-10",
    contributes: ["Historical product-family discovery", "Aliases and common marketing names", "Niche form-factor discovery"],
    completeness: "Broad but list- and category-dependent, with uneven notability coverage.",
    freshness: "Continuously edited; lists and articles can lag official lineups.",
    deviceSemantics: "Article and category boundaries are editorial and may describe models, series, cancelled devices, or related concepts.",
    accessMechanism: "MediaWiki API, database dumps, or public pages.",
    termsOrLicenseUrl: "https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use",
    licenseOrTerms: "Article text is generally CC BY-SA; reuse requires attribution and share-alike handling.",
    automatedCollection: "bounded-manual-only",
    repositoryPersistence: "conditional",
    useDecision: "not-used",
    limitations: [
      "Wikidata supplies a cleaner CC0 structured source for the first bulk import.",
      "Do not persist Wikipedia-derived text or structured extracts without an explicit attribution and share-alike boundary."
    ]
  }
];

const candidateKeys = new Set([
  "candidateId",
  "manufacturer",
  "brand",
  "model",
  "modelCodes",
  "aliases",
  "regionalHints",
  "deviceTypeHint",
  "formFactorHint",
  "discoverySources",
  "verificationState",
  "publishedSlug",
  "duplicateOfCandidateId",
  "dispositionReason",
  "notes",
  "reviewedAt"
]);

const dispositionStates = new Set<VerificationState>([
  "non-phone",
  "insufficient-first-party-evidence",
  "conflicting-identity",
  "rejected"
]);

const queueStates = new Set<VerificationState>(["unreviewed", "researching", "verified-current", "verified-earlier"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString) && new Set(value).size === value.length;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?$/.test(value) && !Number.isNaN(Date.parse(value));
}

function validateDiscoveryReference(value: unknown, sourceIds: ReadonlySet<string>, label: string): string[] {
  if (!isRecord(value)) return [`${label}: discovery source must be an object`];
  const errors: string[] = [];
  const allowedKeys = new Set(["sourceId", "sourceRecordId", "url", "retrievedAt", "sourceVersion"]);
  for (const key of Object.keys(value)) if (!allowedKeys.has(key)) errors.push(`${label}: unknown discovery-source field ${key}`);
  if (!isNonEmptyString(value.sourceId) || !sourceIds.has(value.sourceId)) {
    errors.push(`${label}: sourceId must reference the discovery-source registry`);
  } else {
    const source = discoverySources.find(({ id }) => id === value.sourceId);
    if (source?.repositoryPersistence !== "allowed" || source.useDecision === "not-used") {
      errors.push(`${label}: ${value.sourceId} is not approved as persisted candidate provenance`);
    }
  }
  for (const key of ["sourceRecordId", "sourceVersion"] as const) {
    if (value[key] !== undefined && !isNonEmptyString(value[key])) errors.push(`${label}: ${key} must be a non-empty string`);
  }
  if (value.url !== undefined) {
    if (!isNonEmptyString(value.url)) errors.push(`${label}: url must be a non-empty HTTPS URL`);
    else {
      try {
        if (new URL(value.url).protocol !== "https:") errors.push(`${label}: url must use HTTPS`);
      } catch {
        errors.push(`${label}: url must be valid`);
      }
    }
  }
  if (value.retrievedAt !== undefined && (!isNonEmptyString(value.retrievedAt) || !isIsoDate(value.retrievedAt))) {
    errors.push(`${label}: retrievedAt must be an ISO date or UTC timestamp`);
  }
  return errors;
}

export function validateCandidate(value: unknown, lineNumber?: number): string[] {
  const prefix = lineNumber === undefined ? "candidate" : `line ${lineNumber}`;
  if (!isRecord(value)) return [`${prefix}: candidate must be an object`];
  const errors: string[] = [];
  for (const key of Object.keys(value)) if (!candidateKeys.has(key)) errors.push(`${prefix}: unknown candidate field ${key}`);
  if (!isNonEmptyString(value.candidateId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.candidateId)) {
    errors.push(`${prefix}: candidateId must be a lowercase kebab-case identifier`);
  }
  for (const key of ["manufacturer", "brand", "model"] as const) {
    if (!isNonEmptyString(value[key])) errors.push(`${prefix}: ${key} is required`);
  }
  for (const key of ["modelCodes", "aliases", "regionalHints"] as const) {
    if (value[key] !== undefined && !isStringArray(value[key])) errors.push(`${prefix}: ${key} must contain unique non-empty strings`);
  }
  if (value.deviceTypeHint !== undefined && !(deviceTypeHints as readonly unknown[]).includes(value.deviceTypeHint)) {
    errors.push(`${prefix}: invalid deviceTypeHint`);
  }
  if (value.formFactorHint !== undefined && !(formFactorHints as readonly unknown[]).includes(value.formFactorHint)) {
    errors.push(`${prefix}: invalid formFactorHint`);
  }
  const sourceIds = new Set(discoverySources.map(({ id }) => id));
  if (!Array.isArray(value.discoverySources) || value.discoverySources.length === 0) {
    errors.push(`${prefix}: at least one discovery source is required`);
  } else {
    value.discoverySources.forEach((source, index) => errors.push(...validateDiscoveryReference(source, sourceIds, `${prefix} source ${index + 1}`)));
  }
  if (!(verificationStates as readonly unknown[]).includes(value.verificationState)) errors.push(`${prefix}: invalid verificationState`);
  const state = value.verificationState as VerificationState | undefined;
  if (state === "published" && !isNonEmptyString(value.publishedSlug)) errors.push(`${prefix}: published candidates require publishedSlug`);
  if (state !== "published" && value.publishedSlug !== undefined && !isNonEmptyString(value.publishedSlug)) {
    errors.push(`${prefix}: publishedSlug must be a non-empty string when present`);
  }
  if (state === "duplicate-alias" && !isNonEmptyString(value.duplicateOfCandidateId)) {
    errors.push(`${prefix}: duplicate-alias candidates require duplicateOfCandidateId`);
  }
  if (state !== "duplicate-alias" && value.duplicateOfCandidateId !== undefined) {
    errors.push(`${prefix}: duplicateOfCandidateId is only valid for duplicate-alias candidates`);
  }
  if (state && dispositionStates.has(state) && !isNonEmptyString(value.dispositionReason)) {
    errors.push(`${prefix}: ${state} candidates require dispositionReason`);
  }
  for (const key of ["publishedSlug", "dispositionReason", "notes"] as const) {
    if (value[key] !== undefined && !isNonEmptyString(value[key])) errors.push(`${prefix}: ${key} must be a non-empty string`);
  }
  if (value.reviewedAt !== undefined && (!isNonEmptyString(value.reviewedAt) || !isIsoDate(value.reviewedAt))) {
    errors.push(`${prefix}: reviewedAt must be an ISO date or UTC timestamp`);
  }
  return errors;
}

export function parseCandidateInventory(contents: string): { candidates: CandidatePhone[]; errors: string[] } {
  const candidates: CandidatePhone[] = [];
  const errors: string[] = [];
  for (const [index, rawLine] of contents.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line) continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch (error) {
      errors.push(`line ${index + 1}: invalid JSON (${error instanceof Error ? error.message : "unknown parse error"})`);
      continue;
    }
    const candidateErrors = validateCandidate(value, index + 1);
    errors.push(...candidateErrors);
    if (candidateErrors.length === 0) candidates.push(value as unknown as CandidatePhone);
  }

  const candidateIds = new Set<string>();
  for (const candidate of candidates) {
    if (candidateIds.has(candidate.candidateId)) errors.push(`${candidate.candidateId}: duplicate candidateId`);
    candidateIds.add(candidate.candidateId);
  }
  for (const candidate of candidates) {
    if (candidate.duplicateOfCandidateId === candidate.candidateId) errors.push(`${candidate.candidateId}: duplicate cannot reference itself`);
    if (candidate.duplicateOfCandidateId && !candidateIds.has(candidate.duplicateOfCandidateId)) {
      errors.push(`${candidate.candidateId}: duplicate target ${candidate.duplicateOfCandidateId} does not exist`);
    }
  }
  const sortedIds = [...candidateIds].sort((a, b) => a.localeCompare(b));
  if (candidates.some((candidate, index) => candidate.candidateId !== sortedIds[index])) {
    errors.push("inventory: candidates must be sorted by candidateId for stable diffs");
  }
  return { candidates, errors };
}

export interface PublishedCatalogueIdentity {
  readonly slug: string;
  readonly brand: string;
  readonly generation: "current" | "earlier";
}

export interface CandidateCoverageReport {
  readonly inventoryCandidates: number;
  readonly manufacturers: number;
  readonly brands: number;
  readonly verificationStates: Readonly<Record<VerificationState, number>>;
  readonly dispositionReasons: Readonly<Record<string, number>>;
  readonly catalogue: {
    readonly phones: number;
    readonly current: number;
    readonly earlier: number;
    readonly matchedByInventory: number;
    readonly notYetInInventory: number;
    readonly unknownPublishedSlugs: readonly string[];
  };
  readonly candidateInventoryByManufacturer: readonly {
    readonly manufacturer: string;
    readonly candidateCount: number;
    readonly publishedMatches: number;
    readonly openVerificationQueue: number;
  }[];
  readonly publishedCoverageByBrand: readonly {
    readonly brand: string;
    readonly candidateCount: number;
    readonly publishedMatches: number;
    readonly currentPublished: number;
    readonly earlierPublished: number;
  }[];
  readonly largestRemainingQueues: readonly { readonly manufacturer: string; readonly count: number }[];
}

export function buildCoverageReport(
  candidates: readonly CandidatePhone[],
  publishedCatalogue: readonly PublishedCatalogueIdentity[]
): CandidateCoverageReport {
  const stateCounts = Object.fromEntries(verificationStates.map((state) => [state, 0])) as Record<VerificationState, number>;
  const dispositionReasons: Record<string, number> = {};
  const perManufacturer = new Map<string, { candidates: number; published: number; queue: number }>();
  const matchedSlugs = new Set<string>();

  for (const candidate of candidates) {
    stateCounts[candidate.verificationState] += 1;
    if (candidate.dispositionReason) dispositionReasons[candidate.dispositionReason] = (dispositionReasons[candidate.dispositionReason] ?? 0) + 1;
    const aggregate = perManufacturer.get(candidate.manufacturer) ?? { candidates: 0, published: 0, queue: 0 };
    aggregate.candidates += 1;
    if (candidate.publishedSlug) {
      aggregate.published += 1;
      matchedSlugs.add(candidate.publishedSlug);
    }
    if (queueStates.has(candidate.verificationState)) aggregate.queue += 1;
    perManufacturer.set(candidate.manufacturer, aggregate);
  }

  const publishedByBrand = new Map<string, { current: number; earlier: number }>();
  for (const phone of publishedCatalogue) {
    const aggregate = publishedByBrand.get(phone.brand) ?? { current: 0, earlier: 0 };
    aggregate[phone.generation] += 1;
    publishedByBrand.set(phone.brand, aggregate);
  }
  const candidateInventoryByManufacturer = [...perManufacturer.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((manufacturer) => {
      const inventory = perManufacturer.get(manufacturer)!;
      return {
        manufacturer,
        candidateCount: inventory.candidates,
        publishedMatches: inventory.published,
        openVerificationQueue: inventory.queue
      };
    });
  const candidateByBrand = new Map<string, { candidates: number; published: number }>();
  for (const candidate of candidates) {
    const aggregate = candidateByBrand.get(candidate.brand) ?? { candidates: 0, published: 0 };
    aggregate.candidates += 1;
    if (candidate.publishedSlug) aggregate.published += 1;
    candidateByBrand.set(candidate.brand, aggregate);
  }
  const allBrands = new Set([...candidateByBrand.keys(), ...publishedByBrand.keys()]);
  const publishedCoverageByBrand = [...allBrands]
    .sort((a, b) => a.localeCompare(b))
    .map((brand) => {
      const inventory = candidateByBrand.get(brand) ?? { candidates: 0, published: 0 };
      const published = publishedByBrand.get(brand) ?? { current: 0, earlier: 0 };
      return {
        brand,
        candidateCount: inventory.candidates,
        publishedMatches: inventory.published,
        currentPublished: published.current,
        earlierPublished: published.earlier
      };
    });

  const catalogueSlugs = new Set(publishedCatalogue.map(({ slug }) => slug));
  const unknownPublishedSlugs = [...matchedSlugs].filter((slug) => !catalogueSlugs.has(slug)).sort((a, b) => a.localeCompare(b));
  return {
    inventoryCandidates: candidates.length,
    manufacturers: new Set(candidates.map(({ manufacturer }) => manufacturer)).size,
    brands: new Set(candidates.map(({ brand }) => brand)).size,
    verificationStates: stateCounts,
    dispositionReasons: Object.fromEntries(Object.entries(dispositionReasons).sort(([a], [b]) => a.localeCompare(b))),
    catalogue: {
      phones: publishedCatalogue.length,
      current: publishedCatalogue.filter(({ generation }) => generation === "current").length,
      earlier: publishedCatalogue.filter(({ generation }) => generation === "earlier").length,
      matchedByInventory: [...matchedSlugs].filter((slug) => catalogueSlugs.has(slug)).length,
      notYetInInventory: publishedCatalogue.filter(({ slug }) => !matchedSlugs.has(slug)).length,
      unknownPublishedSlugs
    },
    candidateInventoryByManufacturer,
    publishedCoverageByBrand,
    largestRemainingQueues: [...perManufacturer.entries()]
      .filter(([, value]) => value.queue > 0)
      .sort(([nameA, valueA], [nameB, valueB]) => valueB.queue - valueA.queue || nameA.localeCompare(nameB))
      .map(([manufacturer, value]) => ({ manufacturer, count: value.queue }))
  };
}

export function validateDiscoverySourceRegistry(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const source of discoverySources) {
    if (ids.has(source.id)) errors.push(`${source.id}: duplicate discovery source id`);
    ids.add(source.id);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id)) errors.push(`${source.id}: source id must be kebab-case`);
    try {
      if (new URL(source.url).protocol !== "https:") errors.push(`${source.id}: source URL must use HTTPS`);
      if (source.termsOrLicenseUrl && new URL(source.termsOrLicenseUrl).protocol !== "https:") {
        errors.push(`${source.id}: terms or licence URL must use HTTPS`);
      }
    } catch {
      errors.push(`${source.id}: source URLs must be valid`);
    }
    if (!isIsoDate(source.assessedAt)) errors.push(`${source.id}: assessedAt must be an ISO date`);
    if (source.useDecision === "bulk-candidate-import" && (source.automatedCollection !== "bulk-allowed" || source.repositoryPersistence !== "allowed")) {
      errors.push(`${source.id}: bulk import requires both bulk collection and repository persistence to be allowed`);
    }
    if (source.useDecision !== "not-used" && source.automatedCollection === "excluded") {
      errors.push(`${source.id}: an excluded source cannot be marked as used`);
    }
  }
  return errors;
}
