import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
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
