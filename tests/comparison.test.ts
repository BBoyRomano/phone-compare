import assert from "node:assert/strict";
import test from "node:test";
import { comparisonHighlights } from "../data/comparison.ts";
import { factsFor, phones, type PhoneRecord } from "../data/catalog.ts";

function phone(slug: string): PhoneRecord {
  const match = phones.find((candidate) => candidate.slug === slug);
  assert.ok(match, `Missing test phone: ${slug}`);
  return match;
}

test("summarizes only directly comparable, sourced differences", () => {
  const left = phone("apple-iphone-16");
  const right = phone("google-pixel-9");
  const highlights = comparisonHighlights(left, right);

  assert.deepEqual(highlights.map(({ kind }) => kind), ["price", "release", "display", "weight"]);
  assert.equal(highlights[0].statement, "Same documented U.S. starting price");
  assert.equal(highlights[1].statement, "iPhone 16 was released later");
  assert.equal(highlights[2].statement, "Pixel 9 has a 0.2-inch larger listed display");
  assert.equal(highlights[3].statement, "iPhone 16 is 28 g lighter in the cited specifications");

  const availableSourceIds = new Set([...factsFor(left), ...factsFor(right)].flatMap(({ sourceIds }) => sourceIds));
  for (const highlight of highlights) {
    assert.ok(highlight.sourceIds.length > 0);
    assert.equal(new Set(highlight.sourceIds).size, highlight.sourceIds.length);
    for (const sourceId of highlight.sourceIds) assert.ok(availableSourceIds.has(sourceId));
  }
});

test("does not manufacture conversions or emphasize immaterial weight differences", () => {
  const mixedUnits = comparisonHighlights(phone("samsung-galaxy-s24"), phone("apple-iphone-16"));
  assert.equal(mixedUnits.some(({ kind }) => kind === "weight"), false);
  assert.equal(mixedUnits.find(({ kind }) => kind === "price")?.statement, "Nearly the same documented U.S. starting price");

  const oneGramApart = comparisonHighlights(phone("apple-iphone-17e"), phone("apple-iphone-16"));
  assert.equal(oneGramApart.some(({ kind }) => kind === "weight"), false);
  assert.equal(oneGramApart.some(({ kind }) => kind === "display"), false);
});

test("premium flagship summaries preserve source-local units and comparable dimensions", () => {
  const mixedUnits = comparisonHighlights(phone("apple-iphone-17-pro"), phone("google-pixel-10-pro"));
  assert.deepEqual(mixedUnits.map(({ kind }) => kind), ["price", "release"]);
  assert.equal(mixedUnits[0].statement, "Pixel 10 Pro launched $100 lower");

  const metricUnits = comparisonHighlights(phone("apple-iphone-17-pro"), phone("samsung-galaxy-s26-ultra"));
  assert.deepEqual(metricUnits.map(({ kind }) => kind), ["price", "release", "display", "weight"]);
  assert.equal(metricUnits[2].statement, "Galaxy S26 Ultra has a 0.6-inch larger listed display");
  assert.equal(metricUnits[3].statement, "iPhone 17 Pro is 8 g lighter in the cited specifications");
});

test("same-phone comparisons do not pretend there are differences", () => {
  const selected = phone("apple-iphone-16");
  assert.deepEqual(comparisonHighlights(selected, selected), []);
});
