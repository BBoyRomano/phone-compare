export type ManufacturerSourceRole = "catalogue" | "specifications" | "store" | "newsroom" | "support-archive";

export interface ManufacturerSourceEndpoint {
  readonly role: ManufacturerSourceRole;
  readonly url: string;
  readonly market: "Global" | "United States";
  readonly urlPattern?: string;
  readonly limitation?: string;
}

export interface ManufacturerSourceProfile {
  readonly id: string;
  readonly manufacturer: string;
  readonly officialDomains: readonly string[];
  readonly sources: readonly ManufacturerSourceEndpoint[];
  readonly marketCaveat?: string;
}

/**
 * Stable first-party discovery entry points, not catalogue records.
 *
 * This registry intentionally excludes model inventories, specifications, prices,
 * colours, configurations, and lifecycle classifications. Those facts belong in
 * the reviewed catalogue with datum-level provenance.
 */
export const manufacturerSources = [
  {
    id: "apple",
    manufacturer: "Apple",
    officialDomains: ["apple.com", "support.apple.com"],
    sources: [
      { role: "catalogue", url: "https://www.apple.com/iphone/", market: "United States" },
      { role: "store", url: "https://www.apple.com/shop/buy-iphone", market: "United States" },
      {
        role: "specifications",
        url: "https://support.apple.com/iphone",
        market: "United States",
        urlPattern: "https://support.apple.com/{locale}/{article-id}",
        limitation: "Technical-specification articles use opaque article IDs; discover them from Apple search or product links."
      },
      { role: "newsroom", url: "https://www.apple.com/newsroom/topics/iphone/", market: "Global" }
    ],
    marketCaveat: "Store availability, configurations, connectivity discounts, and launch prices are market-specific."
  },
  {
    id: "google",
    manufacturer: "Google",
    officialDomains: ["store.google.com", "support.google.com", "blog.google"],
    sources: [
      { role: "catalogue", url: "https://store.google.com/us/category/phones?hl=en-US", market: "United States" },
      { role: "store", url: "https://store.google.com/us/category/phones?hl=en-US", market: "United States" },
      {
        role: "specifications",
        url: "https://support.google.com/pixelphone/answer/7158570?hl=en",
        market: "Global",
        urlPattern: "https://store.google.com/{market}/product/{product-slug}_specs?hl={locale}",
        limitation: "The support summary and regional Store specification pages may cover different generations or configurations."
      },
      { role: "newsroom", url: "https://blog.google/products-and-platforms/devices/pixel/", market: "Global" },
      { role: "support-archive", url: "https://support.google.com/pixelphone/?hl=en", market: "Global" }
    ],
    marketCaveat: "Google Store catalogues, colours, storage options, prices, and availability vary by country."
  },
  {
    id: "samsung",
    manufacturer: "Samsung",
    officialDomains: ["samsung.com", "news.samsung.com"],
    sources: [
      { role: "catalogue", url: "https://www.samsung.com/us/smartphones/", market: "United States" },
      { role: "store", url: "https://www.samsung.com/us/smartphones/", market: "United States" },
      {
        role: "specifications",
        url: "https://www.samsung.com/us/smartphones/",
        market: "United States",
        limitation: "Specifications are attached to regional product pages; family landing pages can mix current and earlier products."
      },
      {
        role: "newsroom",
        url: "https://news.samsung.com/us/category/product/product-mobile/product-mobile-smartphones/",
        market: "United States"
      },
      { role: "support-archive", url: "https://www.samsung.com/us/support/mobile/phones/", market: "United States" }
    ],
    marketCaveat: "Model numbers, radio variants, colours, memory configurations, pricing, and release timing differ by market and carrier."
  },
  {
    id: "motorola",
    manufacturer: "Motorola",
    officialDomains: ["motorola.com", "motorolanews.com", "support.motorola.com"],
    sources: [
      { role: "catalogue", url: "https://www.motorola.com/us/en/compare/", market: "United States" },
      { role: "store", url: "https://www.motorola.com/us/en/homepage", market: "United States" },
      {
        role: "specifications",
        url: "https://www.motorola.com/us/en/compare/",
        market: "United States",
        limitation: "The comparison selector is useful for discovery, but authoritative configuration detail must be checked on the linked product page."
      },
      { role: "newsroom", url: "https://motorolanews.com/news/", market: "Global" },
      { role: "support-archive", url: "https://en-us.support.motorola.com/", market: "United States" }
    ],
    marketCaveat: "Motorola reuses family names across regions; exact model number and sales market must be captured for every catalogue record."
  },
  {
    id: "oneplus",
    manufacturer: "OnePlus",
    officialDomains: ["oneplus.com", "service.oneplus.com"],
    sources: [
      { role: "catalogue", url: "https://www.oneplus.com/us/product", market: "United States" },
      { role: "store", url: "https://www.oneplus.com/us/store/phone", market: "United States" },
      {
        role: "specifications",
        url: "https://www.oneplus.com/us/phone/compare",
        market: "United States",
        urlPattern: "https://www.oneplus.com/{market}/{product-slug}/specs",
        limitation: "The comparison page includes historical products and does not by itself establish current availability."
      },
      { role: "newsroom", url: "https://www.oneplus.com/us/press", market: "United States" },
      { role: "support-archive", url: "https://service.oneplus.com/us", market: "United States" }
    ],
    marketCaveat: "The U.S. range is smaller than OnePlus ranges in some other regions; global announcements do not prove U.S. sale or pricing."
  },
  {
    id: "nothing",
    manufacturer: "Nothing",
    officialDomains: ["nothing.tech", "us.nothing.tech", "nothing.community"],
    sources: [
      { role: "catalogue", url: "https://us.nothing.tech/collections/phones", market: "United States" },
      { role: "store", url: "https://us.nothing.tech/collections/phones", market: "United States" },
      {
        role: "specifications",
        url: "https://nothing.tech/collections/shop-all",
        market: "Global",
        urlPattern: "https://nothing.tech/products/{product-slug}",
        limitation: "Product pages combine marketing and a specifications section; use the locale-specific page for configurations and price."
      },
      {
        role: "newsroom",
        url: "https://nothing.community/t/newsroom",
        market: "Global",
        limitation: "This official community category mixes product announcements with company and software updates."
      }
    ],
    marketCaveat: "Nothing uses separate regional storefronts, and CMF is a related sub-brand that should retain its displayed manufacturer identity."
  },
  {
    id: "xiaomi",
    manufacturer: "Xiaomi",
    officialDomains: ["mi.com"],
    sources: [
      { role: "catalogue", url: "https://www.mi.com/global/product-list/phone/", market: "Global" },
      {
        role: "specifications",
        url: "https://www.mi.com/global/product-list/phone/",
        market: "Global",
        urlPattern: "https://www.mi.com/global/product/{product-slug}/specs/"
      },
      { role: "newsroom", url: "https://www.mi.com/global/discover/news", market: "Global" },
      { role: "support-archive", url: "https://www.mi.com/global/support/", market: "Global" }
    ],
    marketCaveat: "The global list includes Xiaomi, Redmi, and POCO products and is not a sales catalogue for one market; local availability and launch price require a regional source."
  },
  {
    id: "oppo",
    manufacturer: "OPPO",
    officialDomains: ["oppo.com", "support.oppo.com"],
    sources: [
      { role: "catalogue", url: "https://www.oppo.com/en/smartphones/", market: "Global" },
      {
        role: "specifications",
        url: "https://www.oppo.com/en/smartphones/",
        market: "Global",
        limitation: "Product pages expose specifications, but the global catalogue includes historical and out-of-stock entries."
      },
      { role: "newsroom", url: "https://www.oppo.com/en/newsroom/", market: "Global" },
      { role: "support-archive", url: "https://support.oppo.com/en/", market: "Global" }
    ],
    marketCaveat: "Global announcements commonly defer exact price, configuration, and availability to local markets; do not infer U.S. availability."
  }
] as const satisfies readonly ManufacturerSourceProfile[];
