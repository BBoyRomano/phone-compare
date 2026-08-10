import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(html, /28(?:<!-- -->)? current generation/);
  assert.match(html, /32(?:<!-- -->)? phones/);
  assert.match(html, /16(?:<!-- -->)? comparison points/);
  for (const manufacturer of ["Apple", "Google", "Samsung", "Motorola", "OnePlus", "Nothing", "TCL", "Unihertz"]) {
    assert.match(html, new RegExp(`<optgroup label="${manufacturer}">`));
  }
  assert.match(html, /latest comparison-ready lineup, based on official U\.S\. catalogue and launch data/);
  assert.match(html, /Official U\.S\. catalogue/);
  assert.match(html, /Same documented U\.S\. starting price/);
  assert.match(html, /What the sources establish/);
  assert.match(html, /iPhone 17 was released later/);
  assert.doesNotMatch(html, /larger listed main display|g lighter in the cited specifications/);
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

test("server-renders only the owner-approved external support destinations", async () => {
  const response = await render();
  const html = await response.text();
  const support = html.match(/<aside class="support"[\s\S]*?<\/aside>/)?.[0];

  assert.ok(support, "Expected the support section to render");
  assert.match(support, /Phone Compare is independent and open source/);
  assert.match(support, /never influences which phones are included, the product data, or the comparisons/);
  assert.match(support, /Support opens on external websites/);

  const destinations = [...support.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(destinations, [
    "https://github.com/sponsors/BBoyRomano",
    "https://ko-fi.com/bboyromano"
  ]);
  assert.equal((support.match(/target="_blank"/g) ?? []).length, 2);
  assert.equal((support.match(/rel="noreferrer"/g) ?? []).length, 2);
});

test("GitHub funding configuration contains only the approved accounts", async () => {
  const funding = await readFile(new URL("../.github/FUNDING.yml", import.meta.url), "utf8");
  assert.equal(funding, "github: BBoyRomano\nko_fi: bboyromano\n");
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

test("unknown URL selections fall back visibly to the default comparison", async () => {
  const response = await render("/?left=unknown&right=also-unknown");
  const html = await response.text();
  assert.match(html, /iPhone 17 vs Pixel 10/);
  assert.match(html, /Shared selection adjusted/);
  assert.match(html, /unavailable phones for both selections, so current defaults were used/);
  assert.match(html, /Review the selectors before comparing/);
});

test("unknown routes render a recoverable, non-indexable 404", async () => {
  const response = await render("/not-a-real-page");
  assert.equal(response.status, 404);

  const html = await response.text();
  assert.match(html, /Page not found/);
  assert.match(html, /Return to the catalogue to choose two sourced phones/);
  assert.match(html, /href="\/"[^>]*>Compare phones/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
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
  assert.match(html, /Galaxy S26 Ultra has a 0\.6-inch larger listed main display/);
  assert.match(html, /iPhone 17 Pro is 8 g lighter in the cited specifications/);
  assert.match(html, /samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet/);
});

test("same-phone selections invite a meaningful comparison without invented differences", async () => {
  const response = await render("/?left=apple-iphone-16&right=apple-iphone-16");
  const html = await response.text();

  assert.match(html, /Same phone selected/);
  assert.match(html, /Choose two different models to see their key differences/);
  assert.doesNotMatch(html, /was released later|larger listed main display|g lighter in the cited specifications/);
});

test("server-renders book-fold competitors with explicit main and cover displays", async () => {
  const response = await render("/?left=google-pixel-10-pro-fold&right=samsung-galaxy-z-fold8");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Pixel 10 Pro Fold vs Galaxy Z Fold8/);
  assert.match(html, /Book fold/);
  assert.match(html, /8 inches/);
  assert.match(html, /7\.6 inches/);
  assert.match(html, /6\.4-inch Actua OLED/);
  assert.match(html, /5\.5-inch Dynamic AMOLED 2X/);
  assert.match(html, /Google's official launch article does not state a price/);
  assert.match(html, /current store price is not substituted for original pricing/);
  assert.match(html, /Current specification states 24\+ hours; Google's launch article described 30\+ hours/);
  assert.doesNotMatch(html, /Pixel 10 Pro Fold launched .* lower|Galaxy Z Fold8 launched .* lower/);
});

test("server-renders affordable current phones without filling manufacturer gaps", async () => {
  const response = await render("/?left=google-pixel-10a&right=samsung-galaxy-a57-5g");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Pixel 10a vs Galaxy A57 5G/);
  assert.match(html, /\$499/);
  assert.match(html, /\$549\.99/);
  assert.match(html, /Pixel 10a launched \$50\.99 lower/);
  assert.match(html, /Not stated in the cited U\.S\. announcement/);
  assert.match(html, /https:\/\/store\.google\.com\/us\/product\/pixel_10a_specs/);
  assert.match(html, /samsung-unveils-galaxy-a57-5g-galaxy-a37-5g/);
});

test("server-renders the sourced thin-slab iPhone Air", async () => {
  const response = await render("/?left=apple-iphone-air&right=google-pixel-10a");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /iPhone Air vs Pixel 10a/);
  assert.match(html, /Thin slab/);
  assert.match(html, /iPhone Air is a thin slab; Pixel 10a is a slab/);
  assert.match(html, /diagonal size does not describe equivalent display shape or use/);
  assert.match(html, /iPhone Air's listed storage starts 128 GB higher/);
  assert.match(html, /5\.64 mm thin/);
  assert.match(html, /Up to 27 hours of video playback/);
  assert.match(html, /https:\/\/www\.apple\.com\/iphone-air\/specs/);
});

test("server-renders the expanded manufacturers with optional facts and timing qualifications", async () => {
  const response = await render("/?left=motorola-razr-plus-2026&right=oneplus-13");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /razr\+ - 2026 vs OnePlus 13/);
  assert.match(html, /20(?:<!-- -->)? comparison points/);
  assert.match(html, /Configurations/);
  assert.match(html, /12 GB RAM \+ 256 GB storage/);
  assert.match(html, /PANTONE Mountain View/);
  assert.match(html, /Open: 171\.42 × 73\.99 × 7\.09 mm/);
  assert.match(html, /45 W wired, 15 W wireless, 5 W reverse/);
  assert.match(html, /Announced/);
  assert.match(html, /does not state a first-sale date/);
  assert.doesNotMatch(html, /OnePlus 13 was released later|OnePlus 13 was announced later/);
  assert.match(html, /https:\/\/www\.motorola\.com\/us\/en\/p\/phones\/razr\/razr-plus-2026/);
  assert.match(html, /https:\/\/www\.oneplus\.com\/us\/13\/specs/);
});

test("server-renders the breadth expansion without inventing missing launch prices or ratings", async () => {
  const response = await render("/?left=unihertz-titan-2&right=tcl-60-xe-nxtpaper-5g");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Titan 2 vs 60 XE NXTPAPER 5G/);
  assert.match(html, /physical QWERTY keyboard and a 2-inch rear secondary display/);
  assert.match(html, /IPS LCD with NXTPAPER/);
  assert.match(html, /Not stated/);
  assert.match(html, /current direct-store pricing is not substituted/);
  assert.match(html, /current store pricing is not substituted/);
  assert.doesNotMatch(html, /launched \$.*lower/);
  assert.match(html, /https:\/\/www\.unihertz\.com\/products\/titan-2/);
  assert.match(html, /https:\/\/www\.tcl\.com\/us\/en\/products\/mobile\/60-series\/60-xe-nxtpaper-5g/);
});
