import assert from "node:assert/strict";
import test from "node:test";
import { manufacturerDiscoveryPolicy, manufacturerSources } from "../data/manufacturer-sources.ts";

test("manufacturer discovery profiles are unique and machine-readable", () => {
  assert.equal(new Set(manufacturerSources.map(({ id }) => id)).size, manufacturerSources.length);
  assert.equal(new Set(manufacturerSources.map(({ manufacturer }) => manufacturer)).size, manufacturerSources.length);

  for (const profile of manufacturerSources) {
    assert.match(profile.id, /^[a-z0-9-]+$/);
    assert.ok(profile.officialDomains.length > 0);
    assert.ok(profile.sources.some(({ role }) => role === "catalogue"));
    assert.ok(profile.sources.some(({ role }) => role === "specifications"));

    for (const source of profile.sources) {
      const hostname = new URL(source.url).hostname;
      assert.ok(
        profile.officialDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)),
        `${profile.id} source is outside its official domains: ${source.url}`
      );

      if (source.scope.kind === "country") assert.match(source.scope.countryCode, /^[A-Z]{2}$/);
      if (source.scope.kind === "region") assert.ok(source.scope.region.length > 0);
    }
  }
});

test("the maintained assessment covers required and similarly relevant candidates without claiming exhaustiveness", () => {
  const manufacturerIds = new Set<string>(manufacturerSources.map(({ id }) => id));
  for (const id of [
    "honor",
    "vivo",
    "asus",
    "hmd",
    "realme",
    "huawei",
    "sony",
    "fairphone",
    "tcl",
    "zte",
    "tecno",
    "meizu",
    "doro",
    "infinix",
    "sharp",
    "kyocera",
    "unihertz",
    "itel"
  ]) {
    assert.ok(manufacturerIds.has(id), `missing assessed manufacturer: ${id}`);
  }

  assert.equal(manufacturerDiscoveryPolicy.exhaustive, false);
  assert.equal(manufacturerDiscoveryPolicy.inclusionCriteria.length, 4);
  assert.match(manufacturerDiscoveryPolicy.maintenanceNote, /maintained discovery foundation/i);
  for (const candidate of manufacturerDiscoveryPolicy.deferredCandidates) assert.ok(candidate.reason.length > 40);
});

test("the registry stores discovery configuration rather than a second phone inventory", () => {
  for (const profile of manufacturerSources) {
    assert.ok(!("models" in profile));
    assert.ok(!("prices" in profile));
    assert.ok(!("specifications" in profile));
    assert.ok(!("lifecycle" in profile));
    for (const source of profile.sources) assert.ok(!("market" in source));
  }
});
