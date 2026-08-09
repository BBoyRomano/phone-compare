import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} }
  );
}

test("server-renders the comparison and its provenance", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /iPhone 17 vs Pixel 10/);
  assert.match(html, /6(?:<!-- -->)? cited sources/);
  assert.match(html, /7(?:<!-- -->)? current generation/);
  assert.match(html, /<optgroup label="Current generation">/);
  assert.match(html, /<optgroup label="Earlier generation">/);
  assert.match(html, /The newest numbered family with enough official U\.S\. data to compare/);
  assert.match(html, /Official U\.S\. catalogue/);
  assert.match(html, /Same documented U\.S\. starting price/);
  assert.match(html, /What the sources establish/);
  assert.match(html, /iPhone 17 was released later/);
  assert.doesNotMatch(html, /larger listed display|g lighter in the cited specifications/);
  assert.match(html, /official launch prices, not current retail prices|Configuration context remains attached/);
  assert.match(html, /Manufacturer battery claims use different measures/);
  assert.match(html, /connectivity discount requiring carrier activation/);
  assert.match(html, /Unit stated on the cited U\.S\. specification page; not silently converted/);
  assert.match(html, /https:\/\/support\.apple\.com\/en-us\/125089/);
  assert.match(html, /https:\/\/store\.google\.com\/us\/product\/pixel_10_specs/);
  assert.doesNotMatch(html, /apple-introduces-iphone-17e/);
  assert.doesNotMatch(html, /enter-new-era-of-mobile-ai-samsung-galaxy-s24-series/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("server-renders a URL-selected comparison without client JavaScript", async () => {
  const response = await render("/?left=samsung-galaxy-s24&right=apple-iphone-16");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Galaxy S24 vs iPhone 16/);
  assert.match(html, /5(?:<!-- -->)? cited sources/);
  assert.match(html, /An earlier numbered family retained for comparison; Apple still lists iPhone 16/);
  assert.match(html, /Samsung Galaxy S24 and Apple iPhone 16/);
  assert.match(html, /name="left"/);
  assert.match(html, /value="samsung-galaxy-s24" selected/);
  assert.match(html, /U\.S\. mmWave configuration/);
  assert.match(html, /Not stated specifically for Galaxy S24/);
  assert.match(html, /Nearly the same documented U\.S\. starting price/);
  assert.doesNotMatch(html, /g lighter in the cited specifications/);
  assert.match(html, /https:\/\/news\.samsung\.com\/us\/enter-new-era-of-mobile-ai-samsung-galaxy-s24-series/);
  assert.doesNotMatch(html, /store\.google\.com\/us\/product\/pixel_9_specs/);
  assert.doesNotMatch(html, /apple-introduces-iphone-17e/);
});

test("server-renders the current-generation iPhone 17e with launch context", async () => {
  const response = await render("/?left=apple-iphone-17e&right=google-pixel-9");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /iPhone 17e vs Pixel 9/);
  assert.match(html, /\$599/);
  assert.match(html, /256 GB/);
  assert.match(html, /Mar 11, 2026/);
  assert.match(html, /Not stated on the cited Apple specification page/);
  assert.match(html, /https:\/\/support\.apple\.com\/en-us\/126470/);
  assert.match(html, /https:\/\/www\.apple\.com\/newsroom\/2026\/03\/apple-introduces-iphone-17e/);
  assert.doesNotMatch(html, /support\.apple\.com\/en-asia\/121029/);
  assert.doesNotMatch(html, /enter-new-era-of-mobile-ai-samsung-galaxy-s24-series/);
});

test("unknown URL selections fall back to the default comparison", async () => {
  const response = await render("/?left=unknown&right=also-unknown");
  const html = await response.text();
  assert.match(html, /iPhone 17 vs Pixel 10/);
});

test("server-renders the current Galaxy S26 with U.S. launch and market qualifications", async () => {
  const response = await render("/?left=samsung-galaxy-s26&right=apple-iphone-17");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Galaxy S26 vs iPhone 17/);
  assert.match(html, /\$899\.99/);
  assert.match(html, /Mar 11, 2026/);
  assert.match(html, /Processor stated for Galaxy S26 in the cited U\.S\. announcement/);
  assert.match(html, /Galaxy S26 is 10 g lighter in the cited specifications/);
  assert.match(html, /https:\/\/news\.samsung\.com\/us\/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet/);
  assert.doesNotMatch(html, /google-pixel-10-specs/);
});

test("server-renders Apple and Google premium flagships without converting source-local weight", async () => {
  const response = await render("/?left=apple-iphone-17-pro&right=google-pixel-10-pro");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /iPhone 17 Pro vs Pixel 10 Pro/);
  assert.match(html, /6(?:<!-- -->)? cited sources/);
  assert.match(html, /Pixel 10 Pro launched \$100 lower/);
  assert.match(html, /206 g/);
  assert.match(html, /7\.3 oz/);
  assert.doesNotMatch(html, /g lighter in the cited specifications/);
  assert.match(html, /https:\/\/support\.apple\.com\/en-us\/125090/);
  assert.match(html, /https:\/\/store\.google\.com\/us\/product\/pixel_10_pro_specs/);
});

test("server-renders the Galaxy S26 Ultra with conservative launch and specification context", async () => {
  const response = await render("/?left=samsung-galaxy-s26-ultra&right=apple-iphone-17-pro");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Galaxy S26 Ultra vs iPhone 17 Pro/);
  assert.match(html, /\$1,299\.99/);
  assert.match(html, /announcement lists 256 GB, 512 GB, and 1 TB but does not tie the price to a capacity/);
  assert.match(html, /Pixel dimensions are not stated in the cited announcement/);
  assert.match(html, /Galaxy S26 Ultra has a 0\.6-inch larger listed display/);
  assert.match(html, /iPhone 17 Pro is 8 g lighter in the cited specifications/);
  assert.match(html, /samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet/);
});

test("same-phone selections invite a meaningful comparison without invented differences", async () => {
  const response = await render("/?left=apple-iphone-16&right=apple-iphone-16");
  const html = await response.text();

  assert.match(html, /Same phone selected/);
  assert.match(html, /Choose two different models to see their key differences/);
  assert.doesNotMatch(html, /was released later|larger listed display|g lighter in the cited specifications/);
});
