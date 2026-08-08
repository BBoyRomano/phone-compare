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
  assert.match(html, /iPhone 16 vs Pixel 9/);
  assert.match(html, /Same documented U\.S\. starting price/);
  assert.match(html, /Manufacturer battery claims use different measures/);
  assert.match(html, /Not stated on the cited Apple specification page/);
  assert.match(html, /https:\/\/support\.apple\.com\/en-asia\/121029/);
  assert.match(html, /https:\/\/store\.google\.com\/us\/product\/pixel_9_specs/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("server-renders a URL-selected comparison without client JavaScript", async () => {
  const response = await render("/?left=samsung-galaxy-s24&right=apple-iphone-16");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Galaxy S24 vs iPhone 16/);
  assert.match(html, /Samsung Galaxy S24 and Apple iPhone 16/);
  assert.match(html, /name="left"/);
  assert.match(html, /value="samsung-galaxy-s24" selected/);
  assert.match(html, /U\.S\. mmWave configuration/);
  assert.match(html, /Not stated specifically for Galaxy S24/);
  assert.match(html, /https:\/\/news\.samsung\.com\/us\/enter-new-era-of-mobile-ai-samsung-galaxy-s24-series/);
});

test("unknown URL selections fall back to the default comparison", async () => {
  const response = await render("/?left=unknown&right=also-unknown");
  const html = await response.text();
  assert.match(html, /iPhone 16 vs Pixel 9/);
});
