import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildCoverageReport,
  discoverySources,
  parseCandidateInventory,
  validateCandidate,
  validateDiscoverySourceRegistry,
  type CandidatePhone
} from "../inventory/candidate-inventory.ts";

test("the committed candidate inventory and discovery-source registry are valid", async () => {
  const contents = await readFile(new URL("../inventory/candidates.ndjson", import.meta.url), "utf8");
  assert.deepEqual(validateDiscoverySourceRegistry(), []);
  assert.deepEqual(parseCandidateInventory(contents).errors, []);
});

test("bulk discovery is limited to sources with clear collection and persistence permission", () => {
  for (const source of discoverySources) {
    if (source.useDecision !== "bulk-candidate-import") continue;
    assert.equal(source.automatedCollection, "bulk-allowed");
    assert.equal(source.repositoryPersistence, "allowed");
  }

  assert.equal(discoverySources.find(({ id }) => id === "wikidata")?.useDecision, "bulk-candidate-import");
  assert.equal(discoverySources.find(({ id }) => id === "google-play-supported-devices")?.useDecision, "bounded-manual-signal");
  assert.equal(discoverySources.find(({ id }) => id === "gsmarena-index")?.useDecision, "not-used");
});

test("candidate records cannot silently become a second specification catalogue", () => {
  const errors = validateCandidate({
    candidateId: "example-phone",
    manufacturer: "Example OEM",
    brand: "Example",
    model: "Phone",
    discoverySources: [{ sourceId: "wikidata", sourceRecordId: "Q1" }],
    verificationState: "unreviewed",
    battery: "5000 mAh"
  });
  assert.ok(errors.some((error) => error.includes("unknown candidate field battery")));
});

test("candidate provenance cannot persist excluded or unselected discovery sources", () => {
  const errors = validateCandidate({
    candidateId: "example-phone",
    manufacturer: "Example OEM",
    brand: "Example",
    model: "Phone",
    discoverySources: [{ sourceId: "google-play-supported-devices", sourceRecordId: "Example Phone" }],
    verificationState: "unreviewed"
  });
  assert.ok(errors.some((error) => error.includes("not approved as persisted candidate provenance")));
});

test("state-specific identity and disposition fields are enforced", () => {
  const base = {
    candidateId: "example-phone",
    manufacturer: "Example OEM",
    brand: "Example",
    model: "Phone",
    discoverySources: [{ sourceId: "wikidata", sourceRecordId: "Q1" }]
  };
  assert.ok(validateCandidate({ ...base, verificationState: "published" }).some((error) => error.includes("publishedSlug")));
  assert.ok(validateCandidate({ ...base, verificationState: "duplicate-alias" }).some((error) => error.includes("duplicateOfCandidateId")));
  assert.ok(validateCandidate({ ...base, verificationState: "non-phone" }).some((error) => error.includes("dispositionReason")));
});

test("coverage is derived from candidate state and the independently published catalogue", () => {
  const candidates: CandidatePhone[] = [
    {
      candidateId: "acme-one",
      manufacturer: "Acme",
      brand: "Acme",
      model: "One",
      discoverySources: [{ sourceId: "wikidata", sourceRecordId: "Q1" }],
      verificationState: "published",
      publishedSlug: "acme-one"
    },
    {
      candidateId: "acme-two",
      manufacturer: "Acme",
      brand: "Acme",
      model: "Two",
      discoverySources: [{ sourceId: "wikidata", sourceRecordId: "Q2" }],
      verificationState: "unreviewed"
    },
    {
      candidateId: "other-tablet",
      manufacturer: "Other",
      brand: "Other",
      model: "Tablet",
      deviceTypeHint: "tablet",
      discoverySources: [{ sourceId: "wikidata", sourceRecordId: "Q3" }],
      verificationState: "non-phone",
      dispositionReason: "Official identity is a tablet, not a mobile phone."
    }
  ];
  const report = buildCoverageReport(candidates, [
    { slug: "acme-one", brand: "Acme", generation: "current" },
    { slug: "legacy-one", brand: "Legacy", generation: "earlier" }
  ]);

  assert.equal(report.inventoryCandidates, 3);
  assert.equal(report.catalogue.matchedByInventory, 1);
  assert.equal(report.catalogue.notYetInInventory, 1);
  assert.equal(report.verificationStates.unreviewed, 1);
  assert.equal(report.publishedCoverageByBrand.find(({ brand }) => brand === "Acme")?.publishedMatches, 1);
  assert.deepEqual(report.largestRemainingQueues, [{ manufacturer: "Acme", count: 1 }]);
});

test("NDJSON parsing rejects duplicate identities, dangling aliases, and unstable ordering", () => {
  const line = (candidateId: string, verificationState = "unreviewed", extra = {}) =>
    JSON.stringify({
      candidateId,
      manufacturer: "Acme",
      brand: "Acme",
      model: candidateId,
      discoverySources: [{ sourceId: "wikidata", sourceRecordId: candidateId }],
      verificationState,
      ...extra
    });
  const { errors } = parseCandidateInventory(
    [line("z-phone"), line("a-phone"), line("a-phone"), line("alias", "duplicate-alias", { duplicateOfCandidateId: "missing" })].join("\n")
  );
  assert.ok(errors.some((error) => error.includes("duplicate candidateId")));
  assert.ok(errors.some((error) => error.includes("does not exist")));
  assert.ok(errors.some((error) => error.includes("sorted by candidateId")));
});
