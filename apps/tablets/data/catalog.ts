import type { CatalogueBrand, CatalogueProduct, ProductCatalogue } from "@product-compare/catalog";

const assessedAt = "2026-08-11";
const officialHosts: Readonly<Record<string, readonly string[]>> = {
  apple: ["apple.com"], samsung: ["samsung.com"], lenovo: ["lenovo.com"], microsoft: ["microsoft.com"], amazon: ["amazon.com"],
  oneplus: ["oneplus.com"], xiaomi: ["mi.com"], huawei: ["huawei.com"], google: ["google.com"], motorola: ["motorola.com"]
};
const slugify = (value: string) => value.toLowerCase().replace(/\+/g, " plus ").normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const source = (publisher: string, title: string, url: string, market = "United States") => ({ publisher, title, url, accessedAt: assessedAt, market, role: "lineup" as const });
const products = (brandSlug: string, officialSource: ReturnType<typeof source>, entries: readonly (readonly [string, string])[]): readonly CatalogueProduct[] => entries.map(([name, segment]) => ({
  slug: `${brandSlug}-${slugify(name)}`,
  name,
  segment,
  market: officialSource.market,
  lifecycle: { status: "current", assessedAt },
  evidence: [{ source: officialSource, basis: "official-current-lineup", qualification: `Listed in the cited ${officialSource.market} manufacturer lineup on ${assessedAt}; storage, connectivity, and colour configurations are not separate identities.` }]
}));
const brand = (slug: string, name: string, officialSource: ReturnType<typeof source>, entries: readonly (readonly [string, string])[]): CatalogueBrand => ({
  slug,
  name,
  officialHosts: officialHosts[slug] ?? [],
  lineupSource: officialSource,
  products: products(slug, officialSource, entries)
});

export const tabletCatalogue: ProductCatalogue = {
  id: "tablets",
  title: "Tablet Compare",
  singular: "tablet",
  plural: "tablets",
  description: "Look up current tablet families from major manufacturers, compare their documented catalogue identity, and continue to the official source.",
  market: "United States-led, with named global catalogues",
  assessedAt,
  accent: "#6554c0",
  coverageNote: "Coverage is a maintained family-level snapshot of major consumer tablet brands in the named source markets as assessed on 2026-08-11. Storage, connectivity, colour, and business variants are configurations unless an official catalogue presents them as distinct product families.",
  coverageRule: "Include consumer tablet families explicitly present on the cited official lineup for each maintained brand; exclude phones, accessories, and configurations that the manufacturer does not present as a distinct family.",
  taxonomyNote: "Segments are editorial navigation labels, not manufacturer specifications.",
  defaults: ["apple-ipad-air-11-inch-m4", "samsung-galaxy-tab-s11"],
  brands: [
    brand("apple", "Apple", source("Apple", "Compare iPad models", "https://www.apple.com/ipad/compare/"), [
      ["iPad Pro 13-inch (M5)", "Pro tablet"], ["iPad Pro 11-inch (M5)", "Pro tablet"], ["iPad Air 13-inch (M4)", "Performance tablet"], ["iPad Air 11-inch (M4)", "Performance tablet"], ["iPad (A16)", "Everyday tablet"], ["iPad mini (A17 Pro)", "Compact tablet"]
    ]),
    brand("samsung", "Samsung", source("Samsung", "Galaxy tablets", "https://www.samsung.com/us/tablets/"), [
      ["Galaxy Tab S11 Ultra", "Premium tablet"], ["Galaxy Tab S11", "Premium tablet"], ["Galaxy Tab S10 FE+", "Performance tablet"], ["Galaxy Tab S10 FE", "Performance tablet"], ["Galaxy Tab S10 Lite", "Everyday tablet"], ["Galaxy Tab A11+", "Everyday tablet"], ["Galaxy Tab Active5 Pro", "Rugged tablet"]
    ]),
    brand("lenovo", "Lenovo", source("Lenovo", "Lenovo tablets", "https://www.lenovo.com/us/en/tablets-b/"), [
      ["Yoga Tab", "Creative tablet"], ["Idea Tab Pro", "Performance tablet"], ["Idea Tab", "Everyday tablet"], ["Lenovo Tab", "Everyday tablet"], ["Legion Tab", "Gaming tablet"]
    ]),
    brand("microsoft", "Microsoft", source("Microsoft", "Shop Microsoft Surface", "https://www.microsoft.com/en-us/store/b/shop-all-microsoft-surface"), [
      ["Surface Pro 13-inch (12th Edition)", "2-in-1 tablet"], ["Surface Pro 12-inch", "2-in-1 tablet"], ["Surface Pro 13-inch (11th Edition)", "2-in-1 tablet"]
    ]),
    brand("amazon", "Amazon", source("Amazon", "Fire tablets", "https://www.amazon.com/Fire-Tablets/b?node=6669703011"), [
      ["Fire Max 11", "Performance tablet"], ["Fire HD 10", "Everyday tablet"], ["Fire HD 8", "Compact tablet"], ["Fire 7", "Compact tablet"], ["Fire HD 10 Kids Pro", "Kids tablet"], ["Fire HD 8 Kids", "Kids tablet"]
    ]),
    brand("oneplus", "OnePlus", source("OnePlus", "OnePlus tablets", "https://www.oneplus.com/us/store/tablet"), [
      ["OnePlus Pad 3", "Performance tablet"], ["OnePlus Pad 2", "Performance tablet"], ["OnePlus Pad Lite", "Everyday tablet"]
    ]),
    brand("xiaomi", "Xiaomi", source("Xiaomi", "Xiaomi tablets", "https://www.mi.com/global/tablet/" , "Global"), [
      ["Xiaomi Pad 7 Pro", "Performance tablet"], ["Xiaomi Pad 7", "Performance tablet"], ["REDMI Pad Pro", "Everyday tablet"], ["REDMI Pad 2", "Everyday tablet"], ["REDMI Pad SE 8.7", "Compact tablet"]
    ]),
    brand("huawei", "HUAWEI", source("HUAWEI", "HUAWEI tablets", "https://consumer.huawei.com/en/tablets/", "Global"), [
      ["MatePad Pro 13.2", "Pro tablet"], ["MatePad Pro 12.2", "Pro tablet"], ["MatePad 12 X", "Creative tablet"], ["MatePad 11.5", "Everyday tablet"], ["MatePad SE 11", "Everyday tablet"]
    ]),
    brand("google", "Google", source("Google", "Pixel Tablet", "https://store.google.com/us/product/pixel_tablet?hl=en-US"), [
      ["Pixel Tablet", "Home tablet"]
    ]),
    brand("motorola", "Motorola", source("Motorola", "Motorola tablets", "https://www.motorola.com/us/en/tablets"), [
      ["moto pad - 2026", "Everyday tablet"]
    ])
  ]
};
