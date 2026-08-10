export type ManufacturerSourceRole = "catalogue" | "specifications" | "store" | "newsroom" | "support-archive";

export type ManufacturerSourceScope =
  | { readonly kind: "global" }
  | { readonly kind: "region"; readonly region: string }
  | { readonly kind: "country"; readonly countryCode: string };

export interface ManufacturerSourceEndpoint {
  readonly role: ManufacturerSourceRole;
  readonly url: string;
  readonly scope: ManufacturerSourceScope;
  readonly urlPattern?: string;
  readonly limitation?: string;
}

export interface ManufacturerDiscoveryPolicy {
  readonly lastAssessedAt: string;
  readonly exhaustive: boolean;
  readonly inclusionCriteria: readonly string[];
  readonly maintenanceNote: string;
  readonly deferredCandidates: readonly {
    readonly manufacturer: string;
    readonly reason: string;
  }[];
}

export const manufacturerDiscoveryPolicy: ManufacturerDiscoveryPolicy = {
  lastAssessedAt: "2026-08-10",
  exhaustive: false,
  inclusionCriteria: [
    "The manufacturer or consumer brand currently publishes smartphones through a first-party catalogue.",
    "Stable first-party product pages or support documents expose specifications suitable for later fact-level review.",
    "A first-party announcement, store, or support/archive root helps establish discovery or lifecycle context.",
    "The source stack has multi-market relevance or adds a materially distinct phone category useful for comparison."
  ],
  maintenanceNote:
    "This is a maintained discovery foundation, not a claim that every smartphone manufacturer worldwide has been enumerated. Reassess candidates and source scopes as official catalogues change.",
  deferredCandidates: []
};

export interface ManufacturerSourceProfile {
  readonly id: string;
  readonly manufacturer: string;
  readonly officialDomains: readonly string[];
  readonly sources: readonly ManufacturerSourceEndpoint[];
  readonly marketCaveat?: string;
}

/**
 * Maintained first-party discovery entry points, not an exhaustive manufacturer
 * universe and not catalogue records.
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
      { role: "catalogue", url: "https://www.apple.com/iphone/", scope: { kind: "country", countryCode: "US" } },
      { role: "store", url: "https://www.apple.com/shop/buy-iphone", scope: { kind: "country", countryCode: "US" } },
      {
        role: "specifications",
        url: "https://support.apple.com/iphone",
        scope: { kind: "country", countryCode: "US" },
        urlPattern: "https://support.apple.com/{locale}/{article-id}",
        limitation: "Technical-specification articles use opaque article IDs; discover them from Apple search or product links."
      },
      { role: "newsroom", url: "https://www.apple.com/newsroom/topics/iphone/", scope: { kind: "global" } }
    ],
    marketCaveat: "Store availability, configurations, connectivity discounts, and launch prices are market-specific."
  },
  {
    id: "google",
    manufacturer: "Google",
    officialDomains: ["store.google.com", "support.google.com", "blog.google"],
    sources: [
      { role: "catalogue", url: "https://store.google.com/us/category/phones?hl=en-US", scope: { kind: "country", countryCode: "US" } },
      { role: "store", url: "https://store.google.com/us/category/phones?hl=en-US", scope: { kind: "country", countryCode: "US" } },
      {
        role: "specifications",
        url: "https://support.google.com/pixelphone/answer/7158570?hl=en",
        scope: { kind: "global" },
        urlPattern: "https://store.google.com/{market}/product/{product-slug}_specs?hl={locale}",
        limitation: "The support summary and regional Store specification pages may cover different generations or configurations."
      },
      { role: "newsroom", url: "https://blog.google/products-and-platforms/devices/pixel/", scope: { kind: "global" } },
      { role: "support-archive", url: "https://support.google.com/pixelphone/?hl=en", scope: { kind: "global" } }
    ],
    marketCaveat: "Google Store catalogues, colours, storage options, prices, and availability vary by country."
  },
  {
    id: "samsung",
    manufacturer: "Samsung",
    officialDomains: ["samsung.com", "news.samsung.com"],
    sources: [
      { role: "catalogue", url: "https://www.samsung.com/us/smartphones/", scope: { kind: "country", countryCode: "US" } },
      { role: "store", url: "https://www.samsung.com/us/smartphones/", scope: { kind: "country", countryCode: "US" } },
      {
        role: "specifications",
        url: "https://www.samsung.com/us/smartphones/",
        scope: { kind: "country", countryCode: "US" },
        limitation: "Specifications are attached to regional product pages; family landing pages can mix current and earlier products."
      },
      {
        role: "newsroom",
        url: "https://news.samsung.com/us/category/product/product-mobile/product-mobile-smartphones/",
        scope: { kind: "country", countryCode: "US" }
      },
      { role: "support-archive", url: "https://www.samsung.com/us/support/mobile/phones/", scope: { kind: "country", countryCode: "US" } }
    ],
    marketCaveat: "Model numbers, radio variants, colours, memory configurations, pricing, and release timing differ by market and carrier."
  },
  {
    id: "motorola",
    manufacturer: "Motorola",
    officialDomains: ["motorola.com", "motorolanews.com", "support.motorola.com"],
    sources: [
      { role: "catalogue", url: "https://www.motorola.com/us/en/compare/", scope: { kind: "country", countryCode: "US" } },
      { role: "store", url: "https://www.motorola.com/us/en/homepage", scope: { kind: "country", countryCode: "US" } },
      {
        role: "specifications",
        url: "https://www.motorola.com/us/en/compare/",
        scope: { kind: "country", countryCode: "US" },
        limitation: "The comparison selector is useful for discovery, but authoritative configuration detail must be checked on the linked product page."
      },
      { role: "newsroom", url: "https://motorolanews.com/news/", scope: { kind: "global" } },
      { role: "support-archive", url: "https://en-us.support.motorola.com/", scope: { kind: "country", countryCode: "US" } }
    ],
    marketCaveat: "Motorola reuses family names across regions; exact model number and sales market must be captured for every catalogue record."
  },
  {
    id: "oneplus",
    manufacturer: "OnePlus",
    officialDomains: ["oneplus.com", "service.oneplus.com"],
    sources: [
      { role: "catalogue", url: "https://www.oneplus.com/us/product", scope: { kind: "country", countryCode: "US" } },
      { role: "store", url: "https://www.oneplus.com/us/store/phone", scope: { kind: "country", countryCode: "US" } },
      {
        role: "specifications",
        url: "https://www.oneplus.com/us/phone/compare",
        scope: { kind: "country", countryCode: "US" },
        urlPattern: "https://www.oneplus.com/{market}/{product-slug}/specs",
        limitation: "The comparison page includes historical products and does not by itself establish current availability."
      },
      { role: "newsroom", url: "https://www.oneplus.com/us/press", scope: { kind: "country", countryCode: "US" } },
      { role: "support-archive", url: "https://service.oneplus.com/us", scope: { kind: "country", countryCode: "US" } }
    ],
    marketCaveat: "The U.S. range is smaller than OnePlus ranges in some other regions; global announcements do not prove U.S. sale or pricing."
  },
  {
    id: "nothing",
    manufacturer: "Nothing",
    officialDomains: ["nothing.tech", "us.nothing.tech", "nothing.community"],
    sources: [
      { role: "catalogue", url: "https://us.nothing.tech/collections/phones", scope: { kind: "country", countryCode: "US" } },
      { role: "store", url: "https://us.nothing.tech/collections/phones", scope: { kind: "country", countryCode: "US" } },
      {
        role: "specifications",
        url: "https://nothing.tech/collections/shop-all",
        scope: { kind: "global" },
        urlPattern: "https://nothing.tech/products/{product-slug}",
        limitation: "Product pages combine marketing and a specifications section; use the locale-specific page for configurations and price."
      },
      {
        role: "newsroom",
        url: "https://nothing.community/t/newsroom",
        scope: { kind: "global" },
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
      { role: "catalogue", url: "https://www.mi.com/uk/product-list/phone/", scope: { kind: "country", countryCode: "GB" } },
      {
        role: "specifications",
        url: "https://www.mi.com/uk/product-list/phone/",
        scope: { kind: "country", countryCode: "GB" },
        urlPattern: "https://www.mi.com/uk/product/{product-slug}/specs/",
        limitation: "The product grid is client-rendered and may fail to hydrate; the primary Mobile navigation provides a smaller stable featured-phone boundary."
      },
      { role: "newsroom", url: "https://www.mi.com/uk/discover/news", scope: { kind: "country", countryCode: "GB" } },
      { role: "support-archive", url: "https://www.mi.com/uk/support/", scope: { kind: "country", countryCode: "GB" } }
    ],
    marketCaveat: "The UK site groups Xiaomi, REDMI, and POCO phones under one Mobile navigation; preserve those displayed brand identities, and do not infer original launch prices from current or promotional store prices."
  },
  {
    id: "oppo",
    manufacturer: "OPPO",
    officialDomains: ["oppo.com", "support.oppo.com"],
    sources: [
      { role: "catalogue", url: "https://www.oppo.com/uk/smartphones/", scope: { kind: "country", countryCode: "GB" } },
      {
        role: "specifications",
        url: "https://www.oppo.com/uk/smartphones/",
        scope: { kind: "country", countryCode: "GB" },
        urlPattern: "https://www.oppo.com/uk/smartphones/{series-path}/{product-slug}/specs/",
        limitation: "The all-smartphones grid retains historical entries and currently labels every model out of stock; the stable smartphone navigation provides a smaller maintained catalogue boundary."
      },
      { role: "newsroom", url: "https://www.oppo.com/uk/newsroom/", scope: { kind: "country", countryCode: "GB" } },
      { role: "support-archive", url: "https://support.oppo.com/uk/", scope: { kind: "country", countryCode: "GB" } }
    ],
    marketCaveat: "Use the stable UK smartphone navigation as a bounded catalogue signal rather than proof of live stock; do not infer original launch prices from current buying state or availability outside the United Kingdom."
  },
  {
    id: "honor",
    manufacturer: "HONOR",
    officialDomains: ["honor.com"],
    sources: [
      { role: "catalogue", url: "https://www.honor.com/uk/shop/", scope: { kind: "country", countryCode: "GB" } },
      { role: "store", url: "https://www.honor.com/uk/shop/", scope: { kind: "country", countryCode: "GB" } },
      {
        role: "specifications",
        url: "https://www.honor.com/uk/phones/",
        scope: { kind: "country", countryCode: "GB" },
        urlPattern: "https://www.honor.com/uk/phones/{product-slug}/spec/"
      },
      { role: "newsroom", url: "https://www.honor.com/uk/news/", scope: { kind: "country", countryCode: "GB" } },
      { role: "support-archive", url: "https://www.honor.com/uk/support/", scope: { kind: "country", countryCode: "GB" } }
    ],
    marketCaveat: "The UK store's active non-refurbished smartphone grid is the maintained current-lineup boundary; the broader phones catalogue mixes historical and refurbished products, and UK inclusion does not establish availability elsewhere."
  },
  {
    id: "vivo",
    manufacturer: "vivo",
    officialDomains: ["vivo.com"],
    sources: [
      { role: "catalogue", url: "https://www.vivo.com/en/products", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.vivo.com/en/product/productCompare/",
        scope: { kind: "global" },
        urlPattern: "https://www.vivo.com/en/products/{product-slug}"
      },
      { role: "newsroom", url: "https://www.vivo.com/en/about-vivo/news", scope: { kind: "global" } },
      { role: "support-archive", url: "https://www.vivo.com/en/support", scope: { kind: "global" } }
    ],
    marketCaveat: "The global comparison tool retains many generations; regional catalogues must establish current availability and exact variants."
  },
  {
    id: "asus",
    manufacturer: "ASUS",
    officialDomains: ["asus.com"],
    sources: [
      { role: "catalogue", url: "https://www.asus.com/mobile-handhelds/phones/all-series/", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.asus.com/mobile-handhelds/phones/all-series/",
        scope: { kind: "global" },
        urlPattern: "https://www.asus.com/mobile-handhelds/phones/{series}/{product-slug}/techspec/"
      },
      { role: "newsroom", url: "https://press.asus.com/", scope: { kind: "global" } },
      { role: "support-archive", url: "https://www.asus.com/support/", scope: { kind: "global" } }
    ],
    marketCaveat: "Zenfone and ROG Phone ranges and store availability differ substantially by country."
  },
  {
    id: "hmd",
    manufacturer: "HMD",
    officialDomains: ["hmd.com"],
    sources: [
      { role: "catalogue", url: "https://www.hmd.com/en_int/smartphones", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.hmd.com/en_int/smartphones",
        scope: { kind: "global" },
        urlPattern: "https://www.hmd.com/en_int/{product-slug}"
      },
      { role: "newsroom", url: "https://www.hmd.com/en_int/press", scope: { kind: "global" } },
      { role: "support-archive", url: "https://www.hmd.com/en_int/support/user-guides", scope: { kind: "global" } }
    ],
    marketCaveat: "HMD hosts HMD- and Nokia-branded device history; future records must retain the displayed brand and distinguish smartphones from feature phones."
  },
  {
    id: "realme",
    manufacturer: "realme",
    officialDomains: ["realme.com"],
    sources: [
      { role: "catalogue", url: "https://www.realme.com/global/", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.realme.com/global/",
        scope: { kind: "global" },
        urlPattern: "https://www.realme.com/global/{product-slug}/specs"
      },
      { role: "newsroom", url: "https://www.realme.com/global/brand/newsroom", scope: { kind: "global" } },
      { role: "support-archive", url: "https://www.realme.com/global/support", scope: { kind: "global" } }
    ],
    marketCaveat: "The global site explicitly delegates price and availability to regional markets; series and configurations vary widely."
  },
  {
    id: "huawei",
    manufacturer: "HUAWEI",
    officialDomains: ["huawei.com"],
    sources: [
      { role: "catalogue", url: "https://consumer.huawei.com/en/phones/", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://consumer.huawei.com/en/phones/",
        scope: { kind: "global" },
        urlPattern: "https://consumer.huawei.com/en/phones/{series}/{product-slug}/specs/"
      },
      { role: "newsroom", url: "https://consumer.huawei.com/en/press/news/", scope: { kind: "global" } },
      { role: "support-archive", url: "https://consumer.huawei.com/en/support/phones/", scope: { kind: "global" } }
    ],
    marketCaveat: "The global product and launch pages do not establish local sale, services, radio support, price, or configuration."
  },
  {
    id: "sony",
    manufacturer: "Sony",
    officialDomains: ["sony.co.uk"],
    sources: [
      { role: "catalogue", url: "https://www.sony.co.uk/smartphones", scope: { kind: "country", countryCode: "GB" } },
      {
        role: "specifications",
        url: "https://www.sony.co.uk/smartphones",
        scope: { kind: "country", countryCode: "GB" },
        limitation: "Use each linked Xperia product page and its Specifications tab; availability elsewhere requires another regional source."
      },
      { role: "support-archive", url: "https://www.sony.co.uk/electronics/support/mobile-phones-tablets-mobile-phones", scope: { kind: "country", countryCode: "GB" } }
    ],
    marketCaveat: "Xperia catalogue coverage is regional; this United Kingdom entry point must not be treated as global availability."
  },
  {
    id: "fairphone",
    manufacturer: "Fairphone",
    officialDomains: ["fairphone.com", "support.fairphone.com"],
    sources: [
      { role: "catalogue", url: "https://shop.fairphone.com/smartphones", scope: { kind: "region", region: "Europe" } },
      { role: "store", url: "https://shop.fairphone.com/smartphones", scope: { kind: "region", region: "Europe" } },
      {
        role: "specifications",
        url: "https://shop.fairphone.com/smartphones",
        scope: { kind: "region", region: "Europe" },
        limitation: "Product pages combine configurations, specifications, repair information, and regional store data."
      },
      { role: "newsroom", url: "https://www.fairphone.com/en/press/", scope: { kind: "region", region: "Europe" } },
      { role: "support-archive", url: "https://support.fairphone.com/", scope: { kind: "region", region: "Europe" } }
    ],
    marketCaveat: "The official store serves a defined set of European markets; price and shipping availability are country-dependent."
  },
  {
    id: "tcl",
    manufacturer: "TCL",
    officialDomains: ["tcl.com"],
    sources: [
      { role: "catalogue", url: "https://www.tcl.com/global/en/mobile", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.tcl.com/global/en/mobile",
        scope: { kind: "global" },
        urlPattern: "https://www.tcl.com/global/en/mobile/{product-slug}/specifications"
      },
      { role: "support-archive", url: "https://www.tcl.com/global/en/support-mobile", scope: { kind: "global" } }
    ],
    marketCaveat: "The global mobile page mixes current and historical products; local where-to-buy links are required for lifecycle and availability."
  },
  {
    id: "zte",
    manufacturer: "ZTE",
    officialDomains: ["ztedevices.com", "zte.com.cn"],
    sources: [
      { role: "catalogue", url: "https://www.ztedevices.com/en/products/smartphones.html", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.ztedevices.com/en/products/specs.html",
        scope: { kind: "global" },
        limitation: "The global device catalogue includes ZTE and nubia brands and warns that products vary by country or region."
      },
      { role: "newsroom", url: "https://www.zte.com.cn/global/about/news.html", scope: { kind: "global" } }
    ],
    marketCaveat: "ZTE's device catalogue includes nubia families; preserve the displayed consumer brand and establish the sales market separately."
  },
  {
    id: "tecno",
    manufacturer: "TECNO",
    officialDomains: ["tecno-mobile.com"],
    sources: [
      { role: "catalogue", url: "https://www.tecno-mobile.com/phones/", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.tecno-mobile.com/phones/",
        scope: { kind: "global" },
        limitation: "Regional product lists and detail pages must be used to establish variants and actual availability."
      },
      { role: "newsroom", url: "https://www.tecno-mobile.com/news/", scope: { kind: "global" } },
      { role: "support-archive", url: "https://www.tecno-mobile.com/support/", scope: { kind: "global" } }
    ],
    marketCaveat: "TECNO exposes a large country selector spanning Africa, Asia, Latin America, and parts of Europe; global pages are discovery only."
  },
  {
    id: "meizu",
    manufacturer: "MEIZU",
    officialDomains: ["meizu.com"],
    sources: [
      { role: "catalogue", url: "https://m.meizu.com/global/product", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://m.meizu.com/global/product",
        scope: { kind: "global" },
        urlPattern: "https://m.meizu.com/global/product/{product-slug}"
      },
      { role: "newsroom", url: "https://m.meizu.com/global/news", scope: { kind: "global" } },
      { role: "support-archive", url: "https://m.meizu.com/global/support/user-manuals", scope: { kind: "global" } }
    ],
    marketCaveat: "The global mobile site is a product-information source; local sale, configuration, price, and support eligibility need regional evidence."
  },
  {
    id: "doro",
    manufacturer: "Doro",
    officialDomains: ["doro.com"],
    sources: [
      { role: "catalogue", url: "https://www.doro.com/en-ie/products/smartphones/", scope: { kind: "country", countryCode: "IE" } },
      { role: "store", url: "https://www.doro.com/en-ie/products/smartphones/", scope: { kind: "country", countryCode: "IE" } },
      {
        role: "specifications",
        url: "https://www.doro.com/en-ie/products/smartphones/",
        scope: { kind: "country", countryCode: "IE" },
        limitation: "Keep smartphones separate from Doro feature phones and use country-specific product pages for price and availability."
      },
      { role: "newsroom", url: "https://www.doro.com/en-ie/news/", scope: { kind: "country", countryCode: "IE" } },
      { role: "support-archive", url: "https://www.doro.com/en-us/softwareupdates/", scope: { kind: "country", countryCode: "US" } }
    ],
    marketCaveat: "Doro's assisted-use smartphones and operator variants are concentrated in European markets; the Irish catalogue is not interchangeable with other countries."
  },
  {
    id: "infinix",
    manufacturer: "Infinix",
    officialDomains: ["infinixmobiles.in"],
    sources: [
      { role: "catalogue", url: "https://infinixmobiles.in/collections/smartphones", scope: { kind: "country", countryCode: "IN" } },
      { role: "store", url: "https://infinixmobiles.in/collections/smartphones", scope: { kind: "country", countryCode: "IN" } },
      {
        role: "specifications",
        url: "https://infinixmobiles.in/collections/smartphones",
        scope: { kind: "country", countryCode: "IN" },
        limitation: "The official Indian storefront is stable, but its inventory and configurations must not stand in for other Infinix markets."
      },
      { role: "newsroom", url: "https://infinixmobiles.in/blogs/news", scope: { kind: "country", countryCode: "IN" } }
    ],
    marketCaveat: "Infinix uses distinct regional sites; this Indian source stack is retained as a country-scoped entry point, not a global catalogue."
  },
  {
    id: "sharp",
    manufacturer: "Sharp",
    officialDomains: ["sharp.co.jp", "k-tai.sharp.co.jp"],
    sources: [
      { role: "catalogue", url: "https://www.sharp.co.jp/k-tai/lineup/", scope: { kind: "country", countryCode: "JP" } },
      {
        role: "specifications",
        url: "https://www.sharp.co.jp/k-tai/lineup/",
        scope: { kind: "country", countryCode: "JP" },
        limitation: "Specifications are attached to product and carrier-variant pages linked from the Japanese lineup."
      },
      { role: "newsroom", url: "https://www.sharp.co.jp/k-tai/news/", scope: { kind: "country", countryCode: "JP" } },
      { role: "support-archive", url: "https://k-tai.sharp.co.jp/support/", scope: { kind: "country", countryCode: "JP" } }
    ],
    marketCaveat: "The retained AQUOS stack is Japanese and carrier-aware; carrier variants and SIM-free products must not be collapsed or treated as global availability."
  },
  {
    id: "kyocera",
    manufacturer: "Kyocera",
    officialDomains: ["kyocera.co.jp"],
    sources: [
      { role: "catalogue", url: "https://www.kyocera.co.jp/prdct/telecom/consumer/lineup/", scope: { kind: "country", countryCode: "JP" } },
      {
        role: "specifications",
        url: "https://www.kyocera.co.jp/prdct/telecom/consumer/lineup/",
        scope: { kind: "country", countryCode: "JP" },
        limitation: "Product pages mix smartphones, feature phones, and carrier-specific devices; later ingestion must classify them before comparison."
      },
      { role: "newsroom", url: "https://www.kyocera.co.jp/prdct/telecom/consumer/", scope: { kind: "country", countryCode: "JP" } },
      { role: "support-archive", url: "https://www.kyocera.co.jp/prdct/telecom/consumer/support/", scope: { kind: "country", countryCode: "JP" } }
    ],
    marketCaveat: "The consumer catalogue is primarily Japanese and carrier-specific; its rugged and assisted-use phones require exact channel and model identification."
  },
  {
    id: "unihertz",
    manufacturer: "Unihertz",
    officialDomains: ["unihertz.com"],
    sources: [
      { role: "catalogue", url: "https://www.unihertz.com/collections/smartphones", scope: { kind: "global" } },
      { role: "store", url: "https://www.unihertz.com/collections/smartphones", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.unihertz.com/collections/smartphones",
        scope: { kind: "global" },
        urlPattern: "https://www.unihertz.com/products/{product-slug}",
        limitation: "The direct store mixes current and out-of-stock products; product pages expose specifications but sale and network compatibility remain market-specific."
      },
      { role: "newsroom", url: "https://www.unihertz.com/blogs/news", scope: { kind: "global" } },
      { role: "support-archive", url: "https://www.unihertz.com/pages/user-manuals", scope: { kind: "global" } }
    ],
    marketCaveat: "Direct shipping and network compatibility vary by country; compact, QWERTY, and rugged categories should remain explicit rather than inferred from the store collection."
  },
  {
    id: "itel",
    manufacturer: "itel",
    officialDomains: ["itel-life.com"],
    sources: [
      { role: "catalogue", url: "https://www.itel-life.com/", scope: { kind: "global" } },
      {
        role: "specifications",
        url: "https://www.itel-life.com/",
        scope: { kind: "global" },
        limitation: "The global navigation exposes phone families and product pages, but later review must establish which regional catalogue sells each variant."
      },
      { role: "newsroom", url: "https://www.itel-life.com/products/brand/press-room/", scope: { kind: "global" } },
      { role: "support-archive", url: "https://www.itel-life.com/support/download", scope: { kind: "global" } }
    ],
    marketCaveat: "itel focuses on many emerging markets; the global product and press roots do not establish country-level availability, configuration, or lifecycle state."
  }
] as const satisfies readonly ManufacturerSourceProfile[];
