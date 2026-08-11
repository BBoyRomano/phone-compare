import { createHash } from "node:crypto";
import type { CatalogueEvidence, CatalogueSource, ProductCatalogue } from "./index.ts";

export interface RelationalBrand { readonly id: string; readonly name: string }
export interface RelationalFamily { readonly id: string; readonly brandId: string; readonly name: string; readonly segment?: string }
export interface RelationalOffering {
  readonly id: string;
  readonly familyId: string;
  readonly market: string;
  readonly lifecycleStatus: "announced" | "current" | "earlier" | "archived" | "unknown";
  readonly lifecycleAssessedAt: string;
  readonly releasedOn?: string | null;
  readonly releaseBasis?: "availability" | "announcement";
  readonly qualification?: string;
}
export interface RelationalVariant { readonly id: string; readonly offeringId: string; readonly name: string }
export interface RelationalAlias { readonly variantId: string; readonly alias: string }
export interface RelationalSource {
  readonly id: string;
  readonly publisher: string;
  readonly title: string;
  readonly url: string;
  readonly kind: string;
  readonly publishedAt?: string;
  readonly accessedAt: string;
  readonly market?: string;
}
export interface RelationalEvidence {
  readonly id: string;
  readonly entityType: "family" | "offering" | "variant";
  readonly entityId: string;
  readonly sourceId: string;
  readonly basis: string;
  readonly qualification: string;
}
export interface RelationalFact {
  readonly id: string;
  readonly variantId: string;
  readonly key: string;
  readonly value: unknown;
  readonly valueNumber?: number;
  readonly unit?: string;
  readonly displayValue?: string;
  readonly qualification?: string;
  readonly sourceIds: readonly string[];
}
export interface RelationalPrice {
  readonly id: string;
  readonly variantId: string;
  readonly type: "original" | "current";
  readonly amount: number | null;
  readonly currency: string | null;
  readonly market: string;
  readonly configuration: string;
  readonly qualification?: string;
  readonly sourceIds: readonly string[];
}
export interface RelationalCatalogue {
  readonly appId: string;
  readonly assessedAt: string;
  readonly brands: readonly RelationalBrand[];
  readonly families: readonly RelationalFamily[];
  readonly offerings: readonly RelationalOffering[];
  readonly variants: readonly RelationalVariant[];
  readonly aliases: readonly RelationalAlias[];
  readonly sources: readonly RelationalSource[];
  readonly evidence: readonly RelationalEvidence[];
  readonly facts: readonly RelationalFact[];
  readonly prices: readonly RelationalPrice[];
}

export const CURRENT_RELATIONAL_PROJECTION_REVISION = 1;

interface PhoneSource {
  readonly id: string;
  readonly publisher: string;
  readonly title: string;
  readonly url: string;
  readonly kind: string;
  readonly publishedAt?: string;
  readonly accessedAt: string;
}
interface PhoneFact<T = unknown> { readonly value: T; readonly sourceIds: readonly string[]; readonly qualification?: string }
interface PhoneInput {
  readonly slug: string;
  readonly maker: PhoneFact<string>;
  readonly model: PhoneFact<string>;
  readonly generation: PhoneFact<"current" | "earlier">;
  readonly formFactor: PhoneFact;
  readonly releasedOn: PhoneFact<string | null> & { readonly basis?: "availability" | "announcement" };
  readonly originalPrice: PhoneFact<{ readonly amount: number | null; readonly currency: string | null; readonly market: string; readonly configuration: string }>;
  readonly display: Readonly<Record<string, PhoneFact>>;
  readonly secondaryDisplay?: PhoneFact;
  readonly weight: PhoneFact;
  readonly storage: PhoneFact<{ readonly options: string; readonly startsAtGb: number | null }>;
  readonly configurations?: PhoneFact;
  readonly colors?: PhoneFact;
  readonly dimensions?: PhoneFact;
  readonly charging?: PhoneFact;
  readonly processor: PhoneFact;
  readonly rearCameras: PhoneFact;
  readonly batteryClaim: PhoneFact;
  readonly resistance: PhoneFact;
}

function identifier(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 20);
}

function sourceKey(source: Omit<RelationalSource, "id">): string {
  return `source-${digest(JSON.stringify([source.publisher, source.url, source.title]))}`;
}

function catalogueSource(source: CatalogueSource): RelationalSource {
  const value = {
    publisher: source.publisher,
    title: source.title,
    url: source.url,
    kind: source.role,
    accessedAt: source.accessedAt,
    market: source.market
  };
  return { id: sourceKey(value), ...value };
}

export function projectProductCatalogue(catalogue: ProductCatalogue): RelationalCatalogue {
  const brands: RelationalBrand[] = [];
  const families: RelationalFamily[] = [];
  const offerings: RelationalOffering[] = [];
  const variants: RelationalVariant[] = [];
  const aliases: RelationalAlias[] = [];
  const sourceMap = new Map<string, RelationalSource>();
  const evidence: RelationalEvidence[] = [];

  const linkEvidence = (entityType: RelationalEvidence["entityType"], entityId: string, item: CatalogueEvidence) => {
    const source = catalogueSource(item.source);
    sourceMap.set(source.id, source);
    evidence.push({
      id: `evidence-${digest(JSON.stringify([entityType, entityId, source.id, item.basis, item.qualification]))}`,
      entityType,
      entityId,
      sourceId: source.id,
      basis: item.basis,
      qualification: item.qualification
    });
  };

  for (const brand of catalogue.brands) {
    brands.push({ id: brand.slug, name: brand.name });
    const lineup = catalogueSource(brand.lineupSource);
    sourceMap.set(lineup.id, lineup);
    for (const product of brand.products) {
      const offeringId = `${product.slug}-${identifier(product.market)}`;
      families.push({ id: product.slug, brandId: brand.slug, name: product.name, segment: product.segment });
      offerings.push({
        id: offeringId,
        familyId: product.slug,
        market: product.market,
        lifecycleStatus: product.lifecycle.status,
        lifecycleAssessedAt: product.lifecycle.assessedAt,
        qualification: product.note
      });
      variants.push({ id: product.slug, offeringId, name: product.name });
      for (const alias of product.aliases ?? []) aliases.push({ variantId: product.slug, alias });
      for (const item of product.evidence) {
        linkEvidence("family", product.slug, item);
        linkEvidence("offering", offeringId, item);
      }
    }
  }

  return {
    appId: catalogue.id,
    assessedAt: catalogue.assessedAt,
    brands, families, offerings, variants, aliases,
    sources: [...sourceMap.values()], evidence, facts: [], prices: []
  };
}

function phoneFact(variantId: string, key: string, fact: PhoneFact, value = fact.value, valueNumber?: number): RelationalFact {
  return {
    id: `${variantId}-${identifier(key)}`,
    variantId,
    key,
    value,
    valueNumber,
    displayValue: typeof value === "string" ? value : value === null ? undefined : JSON.stringify(value),
    qualification: fact.qualification,
    sourceIds: fact.sourceIds
  };
}

export function projectPhoneCatalogue(input: {
  readonly appId: string;
  readonly phones: readonly PhoneInput[];
  readonly sources: Readonly<Record<string, PhoneSource>>;
}): RelationalCatalogue {
  const brands = new Map<string, RelationalBrand>();
  const families: RelationalFamily[] = [];
  const offerings: RelationalOffering[] = [];
  const variants: RelationalVariant[] = [];
  const evidence: RelationalEvidence[] = [];
  const facts: RelationalFact[] = [];
  const prices: RelationalPrice[] = [];
  const sourceRows = Object.values(input.sources).map((source) => ({ ...source }));
  const sourceById = new Map(sourceRows.map((source) => [source.id, source]));
  const assessedAt = sourceRows.map(({ accessedAt }) => accessedAt).sort().at(-1) ?? "1970-01-01";
  const assessedFrom = (fact: PhoneFact) => fact.sourceIds
    .map((sourceId) => sourceById.get(sourceId)?.accessedAt)
    .filter((value): value is string => value !== undefined)
    .sort()
    .at(-1) ?? "1970-01-01";

  const evidenceFor = (entityType: RelationalEvidence["entityType"], entityId: string, basis: string, fact: PhoneFact) => {
    for (const sourceId of fact.sourceIds) {
      evidence.push({
        id: `evidence-${digest(JSON.stringify([entityType, entityId, sourceId, basis]))}`,
        entityType,
        entityId,
        sourceId,
        basis,
        qualification: fact.qualification ?? `The cited source supports ${basis.replaceAll("-", " ")}.`
      });
    }
  };

  for (const phone of input.phones) {
    const brandId = identifier(phone.maker.value);
    const offeringId = `${phone.slug}-market-unspecified`;
    brands.set(brandId, { id: brandId, name: phone.maker.value });
    families.push({ id: phone.slug, brandId, name: phone.model.value, segment: String(phone.formFactor.value) });
    offerings.push({
      id: offeringId,
      familyId: phone.slug,
      market: "Unspecified",
      lifecycleStatus: phone.generation.value,
      lifecycleAssessedAt: assessedFrom(phone.generation),
      releasedOn: phone.releasedOn.value,
      releaseBasis: phone.releasedOn.basis ?? "availability",
      qualification: [
        "The phone lifecycle sources do not encode a normalized market; launch-price market remains price-only context.",
        phone.releasedOn.qualification
      ].filter(Boolean).join(" ")
    });
    variants.push({ id: phone.slug, offeringId, name: phone.model.value });
    evidenceFor("family", phone.slug, "manufacturer-identity", phone.maker);
    evidenceFor("family", phone.slug, "manufacturer-model", phone.model);
    evidenceFor("offering", offeringId, "lifecycle", phone.generation);
    evidenceFor("offering", offeringId, "release-timing", phone.releasedOn);

    facts.push(phoneFact(phone.slug, "formFactor", phone.formFactor));
    for (const [key, fact] of Object.entries(phone.display)) facts.push(phoneFact(phone.slug, `display.${key}`, fact));
    if (phone.secondaryDisplay) facts.push(phoneFact(phone.slug, "display.secondary", phone.secondaryDisplay));
    facts.push(phoneFact(phone.slug, "weight", phone.weight));
    facts.push(phoneFact(phone.slug, "storage.options", phone.storage, phone.storage.value.options));
    facts.push(phoneFact(phone.slug, "storage.startsAtGb", phone.storage, phone.storage.value.startsAtGb, phone.storage.value.startsAtGb ?? undefined));
    for (const [key, fact] of [
      ["configurations", phone.configurations], ["colors", phone.colors], ["dimensions", phone.dimensions], ["charging", phone.charging],
      ["processor", phone.processor], ["rearCameras", phone.rearCameras], ["batteryClaim", phone.batteryClaim], ["resistance", phone.resistance]
    ] as const) if (fact) facts.push(phoneFact(phone.slug, key, fact));
    prices.push({
      id: `${phone.slug}-original`,
      variantId: phone.slug,
      type: "original",
      ...phone.originalPrice.value,
      qualification: phone.originalPrice.qualification,
      sourceIds: phone.originalPrice.sourceIds
    });
  }

  return {
    appId: input.appId,
    assessedAt,
    brands: [...brands.values()], families, offerings, variants, aliases: [],
    sources: sourceRows, evidence, facts, prices
  };
}

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) (seen.has(value) ? repeated : seen).add(value);
  return [...repeated];
}

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function isPresent(value: string): boolean {
  return value.trim().length > 0;
}

export function validateRelationalCatalogue(catalogue: RelationalCatalogue): readonly string[] {
  const errors: string[] = [];
  if (!isPresent(catalogue.appId)) errors.push("Relational catalogue appId must not be empty.");
  if (!isDate(catalogue.assessedAt)) errors.push("Relational catalogue assessedAt must use a real YYYY-MM-DD date.");
  const collections = [
    ["brand", catalogue.brands.map(({ id }) => id)], ["family", catalogue.families.map(({ id }) => id)],
    ["offering", catalogue.offerings.map(({ id }) => id)], ["variant", catalogue.variants.map(({ id }) => id)],
    ["source", catalogue.sources.map(({ id }) => id)], ["evidence", catalogue.evidence.map(({ id }) => id)],
    ["fact", catalogue.facts.map(({ id }) => id)], ["price", catalogue.prices.map(({ id }) => id)]
  ] as const;
  for (const [name, ids] of collections) for (const id of duplicates(ids)) errors.push(`Duplicate ${name} id: ${id}.`);
  for (const alias of duplicates(catalogue.aliases.map(({ variantId, alias }) => `${variantId}:${alias}`))) errors.push(`Duplicate alias identity: ${alias}.`);
  for (const key of duplicates(catalogue.facts.map(({ variantId, key }) => `${variantId}:${key}`))) errors.push(`Duplicate variant fact key: ${key}.`);
  const brandIds = new Set(catalogue.brands.map(({ id }) => id));
  const familyIds = new Set(catalogue.families.map(({ id }) => id));
  const offeringIds = new Set(catalogue.offerings.map(({ id }) => id));
  const variantIds = new Set(catalogue.variants.map(({ id }) => id));
  const sourceIds = new Set(catalogue.sources.map(({ id }) => id));
  for (const family of catalogue.families) if (!brandIds.has(family.brandId)) errors.push(`${family.id} references unknown brand ${family.brandId}.`);
  const lifecycleStatuses = new Set(["announced", "current", "earlier", "archived", "unknown"]);
  for (const offering of catalogue.offerings) {
    if (!familyIds.has(offering.familyId)) errors.push(`${offering.id} references unknown family ${offering.familyId}.`);
    if (!isPresent(offering.market)) errors.push(`${offering.id} market must not be empty.`);
    if (!lifecycleStatuses.has(offering.lifecycleStatus)) errors.push(`${offering.id} has invalid lifecycle status ${offering.lifecycleStatus}.`);
    if (!isDate(offering.lifecycleAssessedAt)) errors.push(`${offering.id} lifecycleAssessedAt must use a real YYYY-MM-DD date.`);
    if (offering.releasedOn != null && !isDate(offering.releasedOn)) errors.push(`${offering.id} releasedOn must use a real YYYY-MM-DD date.`);
    if (offering.releaseBasis && !new Set(["availability", "announcement"]).has(offering.releaseBasis)) errors.push(`${offering.id} has invalid release basis ${offering.releaseBasis}.`);
  }
  for (const variant of catalogue.variants) if (!offeringIds.has(variant.offeringId)) errors.push(`${variant.id} references unknown offering ${variant.offeringId}.`);
  for (const alias of catalogue.aliases) if (!variantIds.has(alias.variantId)) errors.push(`${alias.alias} references unknown variant ${alias.variantId}.`);
  for (const item of catalogue.evidence) {
    if (!sourceIds.has(item.sourceId)) errors.push(`${item.id} references unknown source ${item.sourceId}.`);
    const entities = item.entityType === "family" ? familyIds : item.entityType === "offering" ? offeringIds : variantIds;
    if (!entities.has(item.entityId)) errors.push(`${item.id} references unknown ${item.entityType} ${item.entityId}.`);
  }
  const offeringEvidence = catalogue.evidence.filter(({ entityType }) => entityType === "offering");
  for (const offering of catalogue.offerings) {
    const evidenceForOffering = offeringEvidence.filter(({ entityId }) => entityId === offering.id);
    const supportsLifecycle = offering.lifecycleStatus === "current"
      ? evidenceForOffering.some(({ basis }) => basis === "official-current-lineup" || basis === "lifecycle")
      : offering.lifecycleStatus === "announced"
        ? evidenceForOffering.some(({ basis }) => basis === "official-announcement" || basis === "lifecycle")
        : evidenceForOffering.length > 0;
    if (!supportsLifecycle) errors.push(`${offering.id} must cite appropriate offering-level lifecycle and market evidence.`);
  }
  for (const source of catalogue.sources) {
    if (![source.id, source.publisher, source.title, source.url, source.kind].every(isPresent)) errors.push(`${source.id || "Source"} contains an empty required field.`);
    if (!source.url.startsWith("https://")) errors.push(`${source.id} source URL must use HTTPS.`);
    if (!isDate(source.accessedAt)) errors.push(`${source.id} accessedAt must use a real YYYY-MM-DD date.`);
    if (source.publishedAt && !isDate(source.publishedAt)) errors.push(`${source.id} publishedAt must use a real YYYY-MM-DD date.`);
  }
  for (const fact of catalogue.facts) {
    if (!variantIds.has(fact.variantId)) errors.push(`${fact.id} references unknown variant ${fact.variantId}.`);
    if (!isPresent(fact.key)) errors.push(`${fact.id} key must not be empty.`);
    if (fact.sourceIds.length === 0) errors.push(`${fact.id} must cite at least one source.`);
    if (fact.valueNumber !== undefined && (!Number.isFinite(fact.valueNumber) || typeof fact.value !== "number")) errors.push(`${fact.id} valueNumber must be finite and accompany a numeric value.`);
    if (fact.unit !== undefined && (!isPresent(fact.unit) || fact.valueNumber === undefined)) errors.push(`${fact.id} unit requires a finite valueNumber.`);
    for (const sourceId of fact.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`${fact.id} references unknown source ${sourceId}.`);
  }
  for (const price of catalogue.prices) {
    if (!variantIds.has(price.variantId)) errors.push(`${price.id} references unknown variant ${price.variantId}.`);
    if (!new Set(["original", "current"]).has(price.type)) errors.push(`${price.id} has invalid price type ${price.type}.`);
    if (price.amount !== null && (!Number.isFinite(price.amount) || price.amount < 0)) errors.push(`${price.id} amount must be null or a non-negative finite number.`);
    if (price.amount !== null && !/^[A-Z]{3}$/.test(price.currency ?? "")) errors.push(`${price.id} priced amount requires an ISO-style three-letter currency.`);
    if (!isPresent(price.market)) errors.push(`${price.id} market must not be empty.`);
    if (!isPresent(price.configuration)) errors.push(`${price.id} configuration must not be empty.`);
    if (price.sourceIds.length === 0) errors.push(`${price.id} must cite at least one source.`);
    for (const sourceId of price.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`${price.id} references unknown source ${sourceId}.`);
  }
  if (catalogue.variants.length === 0) errors.push("Relational catalogue must contain at least one variant.");
  return errors;
}

function sqlValue(value: unknown): string {
  if (value === undefined || value === null) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function valueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function sorted<T>(rows: readonly T[], id: (row: T) => string): readonly T[] {
  return [...rows].sort((left, right) => id(left).localeCompare(id(right)));
}

function appendInsertBatches(statements: string[], table: string, columns: readonly string[], rows: readonly (readonly unknown[])[], batchSize = 25): void {
  for (let index = 0; index < rows.length; index += batchSize) {
    const values = rows.slice(index, index + batchSize).map((row) => `(${row.map(sqlValue).join(", ")})`).join(",\n  ");
    statements.push(`INSERT INTO ${table} (${columns.join(", ")}) VALUES\n  ${values}\nON CONFLICT DO NOTHING;`);
  }
}

export function relationalCatalogueSql(catalogue: RelationalCatalogue, sourceCommit: string, projectionRevision = CURRENT_RELATIONAL_PROJECTION_REVISION): { readonly version: string; readonly sql: string } {
  const errors = validateRelationalCatalogue(catalogue);
  if (errors.length) throw new Error(errors.join("\n"));
  if (!Number.isSafeInteger(projectionRevision) || projectionRevision < 1) throw new Error("Projection revision must be a positive integer.");
  const canonical = JSON.stringify({ projectionRevision, catalogue });
  const version = `${catalogue.appId}-${createHash("sha256").update(canonical).digest("hex").slice(0, 24)}`;
  const statements: string[] = [
    "PRAGMA foreign_keys = ON;",
    `DELETE FROM catalog_releases WHERE version = ${sqlValue(version)} AND version NOT IN (SELECT active_version FROM catalog_state);`,
    `INSERT INTO catalog_releases(version, app_id, assessed_at, source_commit, projection_revision, record_count) VALUES (${sqlValue(version)}, ${sqlValue(catalogue.appId)}, ${sqlValue(catalogue.assessedAt)}, ${sqlValue(sourceCommit)}, ${projectionRevision}, ${catalogue.variants.length}) ON CONFLICT(version) DO UPDATE SET source_commit = excluded.source_commit, record_count = excluded.record_count;`
  ];
  appendInsertBatches(statements, "brands", ["release_version", "brand_id", "name"], sorted(catalogue.brands, ({ id }) => id).map((row) => [version, row.id, row.name]));
  appendInsertBatches(statements, "product_families", ["release_version", "family_id", "brand_id", "name", "segment"], sorted(catalogue.families, ({ id }) => id).map((row) => [version, row.id, row.brandId, row.name, row.segment]));
  appendInsertBatches(statements, "market_offerings", ["release_version", "offering_id", "family_id", "market", "lifecycle_status", "lifecycle_assessed_at", "released_on", "release_basis", "qualification"], sorted(catalogue.offerings, ({ id }) => id).map((row) => [version, row.id, row.familyId, row.market, row.lifecycleStatus, row.lifecycleAssessedAt, row.releasedOn, row.releaseBasis, row.qualification]));
  appendInsertBatches(statements, "variants", ["release_version", "variant_id", "offering_id", "name"], sorted(catalogue.variants, ({ id }) => id).map((row) => [version, row.id, row.offeringId, row.name]));
  appendInsertBatches(statements, "aliases", ["release_version", "variant_id", "alias"], sorted(catalogue.aliases, ({ variantId, alias }) => `${variantId}:${alias}`).map((row) => [version, row.variantId, row.alias]));
  appendInsertBatches(statements, "sources", ["release_version", "source_id", "publisher", "title", "url", "kind", "published_at", "accessed_at", "market"], sorted(catalogue.sources, ({ id }) => id).map((row) => [version, row.id, row.publisher, row.title, row.url, row.kind, row.publishedAt, row.accessedAt, row.market]));
  appendInsertBatches(statements, "evidence_links", ["release_version", "evidence_id", "entity_type", "entity_id", "source_id", "basis", "qualification"], sorted(catalogue.evidence, ({ id }) => id).map((row) => [version, row.id, row.entityType, row.entityId, row.sourceId, row.basis, row.qualification]));
  appendInsertBatches(statements, "specification_facts", ["release_version", "fact_id", "variant_id", "spec_key", "value_json", "value_type", "value_number", "unit", "display_value", "qualification"], sorted(catalogue.facts, ({ id }) => id).map((row) => [version, row.id, row.variantId, row.key, JSON.stringify(row.value), valueType(row.value), row.valueNumber, row.unit, row.displayValue, row.qualification]), 10);
  appendInsertBatches(statements, "fact_sources", ["release_version", "fact_id", "source_id"], sorted(catalogue.facts.flatMap((row) => row.sourceIds.map((sourceId) => ({ factId: row.id, sourceId }))), ({ factId, sourceId }) => `${factId}:${sourceId}`).map((row) => [version, row.factId, row.sourceId]), 100);
  appendInsertBatches(statements, "prices", ["release_version", "price_id", "variant_id", "price_type", "amount", "currency", "market", "configuration", "qualification"], sorted(catalogue.prices, ({ id }) => id).map((row) => [version, row.id, row.variantId, row.type, row.amount, row.currency, row.market, row.configuration, row.qualification]));
  appendInsertBatches(statements, "price_sources", ["release_version", "price_id", "source_id"], sorted(catalogue.prices.flatMap((row) => row.sourceIds.map((sourceId) => ({ priceId: row.id, sourceId }))), ({ priceId, sourceId }) => `${priceId}:${sourceId}`).map((row) => [version, row.priceId, row.sourceId]), 100);
  statements.push(
    `INSERT INTO catalog_state(app_id, active_version) VALUES (${sqlValue(catalogue.appId)}, ${sqlValue(version)}) ON CONFLICT(app_id) DO UPDATE SET active_version = excluded.active_version;`,
    `DELETE FROM catalog_releases WHERE app_id = ${sqlValue(catalogue.appId)} AND version <> ${sqlValue(version)};`
  );
  return { version, sql: `${statements.join("\n")}\n` };
}
