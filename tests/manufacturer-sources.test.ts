import assert from "node:assert/strict";
import test from "node:test";
import { manufacturerSources } from "../data/manufacturer-sources.ts";

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
    }
  }
});

test("the registry stores discovery configuration rather than a second phone inventory", () => {
  for (const profile of manufacturerSources) {
    assert.ok(!("models" in profile));
    assert.ok(!("prices" in profile));
    assert.ok(!("specifications" in profile));
    assert.ok(!("lifecycle" in profile));
  }
});
