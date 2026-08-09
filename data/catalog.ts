export const sources = {
  "apple-iphone-17-specs": {
    id: "apple-iphone-17-specs",
    publisher: "Apple",
    title: "iPhone 17 — Technical Specifications",
    url: "https://support.apple.com/en-us/125089",
    kind: "manufacturer-specification",
    accessedAt: "2026-08-09"
  },
  "apple-iphone-17-announcement": {
    id: "apple-iphone-17-announcement",
    publisher: "Apple",
    title: "Apple debuts iPhone 17",
    url: "https://www.apple.com/newsroom/2025/09/apple-debuts-iphone-17/",
    kind: "manufacturer-announcement",
    publishedAt: "2025-09-09",
    accessedAt: "2026-08-09"
  },
  "apple-iphone-16-specs": {
    id: "apple-iphone-16-specs",
    publisher: "Apple",
    title: "iPhone 16 — Technical Specifications",
    url: "https://support.apple.com/en-asia/121029",
    kind: "manufacturer-specification",
    accessedAt: "2026-08-08"
  },
  "apple-iphone-16-announcement": {
    id: "apple-iphone-16-announcement",
    publisher: "Apple",
    title: "Apple introduces iPhone 16 and iPhone 16 Plus",
    url: "https://www.apple.com/newsroom/2024/09/apple-introduces-iphone-16-and-iphone-16-plus/",
    kind: "manufacturer-announcement",
    publishedAt: "2024-09-09",
    accessedAt: "2026-08-08"
  },
  "apple-iphone-17e-specs": {
    id: "apple-iphone-17e-specs",
    publisher: "Apple",
    title: "iPhone 17e — Technical Specifications",
    url: "https://support.apple.com/en-us/126470",
    kind: "manufacturer-specification",
    accessedAt: "2026-08-08"
  },
  "apple-iphone-17e-announcement": {
    id: "apple-iphone-17e-announcement",
    publisher: "Apple",
    title: "Apple introduces iPhone 17e",
    url: "https://www.apple.com/newsroom/2026/03/apple-introduces-iphone-17e/",
    kind: "manufacturer-announcement",
    publishedAt: "2026-03-02",
    accessedAt: "2026-08-08"
  },
  "google-pixel-9-specs": {
    id: "google-pixel-9-specs",
    publisher: "Google",
    title: "Pixel 9 Technical Specifications",
    url: "https://store.google.com/us/product/pixel_9_specs?hl=en-US",
    kind: "manufacturer-specification",
    accessedAt: "2026-08-08"
  },
  "google-pixel-9-announcement": {
    id: "google-pixel-9-announcement",
    publisher: "Google",
    title: "The new Pixel 9 phones bring you the best of Google AI",
    url: "https://blog.google/products-and-platforms/devices/pixel/google-pixel-9-pro-xl/",
    kind: "manufacturer-announcement",
    publishedAt: "2024-08-13",
    accessedAt: "2026-08-08"
  },
  "google-pixel-10-specs": {
    id: "google-pixel-10-specs",
    publisher: "Google",
    title: "Pixel 10 Technical Specifications",
    url: "https://store.google.com/us/product/pixel_10_specs?hl=en-US",
    kind: "manufacturer-specification",
    accessedAt: "2026-08-09"
  },
  "google-pixel-10-announcement": {
    id: "google-pixel-10-announcement",
    publisher: "Google",
    title: "Powerful and proactive: Pixel 10 phones are here",
    url: "https://blog.google/products-and-platforms/devices/pixel/google-pixel-10-pro-xl/",
    kind: "manufacturer-announcement",
    publishedAt: "2025-08-20",
    accessedAt: "2026-08-09"
  },
  "samsung-galaxy-s24-announcement": {
    id: "samsung-galaxy-s24-announcement",
    publisher: "Samsung",
    title: "Enter the New Era of Mobile AI with Samsung Galaxy S24 Series",
    url: "https://news.samsung.com/us/enter-new-era-of-mobile-ai-samsung-galaxy-s24-series/",
    kind: "manufacturer-announcement",
    publishedAt: "2024-01-17",
    accessedAt: "2026-08-08"
  },
  "samsung-galaxy-s26-announcement": {
    id: "samsung-galaxy-s26-announcement",
    publisher: "Samsung",
    title: "Samsung Unveils Galaxy S26 Series: The Most Intuitive Galaxy AI Phone Yet",
    url: "https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet/",
    kind: "manufacturer-announcement",
    publishedAt: "2026-02-25",
    accessedAt: "2026-08-09"
  }
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;

export interface Source {
  readonly id: string;
  readonly publisher: string;
  readonly title: string;
  readonly url: string;
  readonly kind: "manufacturer-specification" | "manufacturer-announcement";
  readonly publishedAt?: string;
  readonly accessedAt: string;
}
export interface SourcedValue<T> {
  readonly value: T;
  readonly sourceIds: readonly SourceId[];
  readonly qualification?: string;
}

export interface PhoneRecord {
  readonly slug: string;
  readonly maker: SourcedValue<string>;
  readonly model: SourcedValue<string>;
  readonly releasedOn: SourcedValue<string>;
  readonly originalPrice: SourcedValue<{
    readonly amount: number;
    readonly currency: "USD";
    readonly market: "United States";
    readonly configuration: string;
  }>;
  readonly display: {
    readonly size: SourcedValue<string>;
    readonly panel: SourcedValue<string>;
    readonly resolution: SourcedValue<string>;
    readonly refreshRate: SourcedValue<string | null>;
    readonly peakBrightness: SourcedValue<string | null>;
  };
  readonly weight: SourcedValue<string>;
  readonly storage: SourcedValue<string>;
  readonly processor: SourcedValue<string>;
  readonly rearCameras: SourcedValue<string>;
  readonly batteryClaim: SourcedValue<string>;
  readonly resistance: SourcedValue<string>;
}

const appleSpecs = ["apple-iphone-16-specs"] as const;
const appleLaunch = ["apple-iphone-16-announcement"] as const;
const apple17Specs = ["apple-iphone-17-specs"] as const;
const apple17Launch = ["apple-iphone-17-announcement"] as const;
const apple17Refresh = ["apple-iphone-17-specs", "apple-iphone-17-announcement"] as const;
const apple17eSpecs = ["apple-iphone-17e-specs"] as const;
const apple17eLaunch = ["apple-iphone-17e-announcement"] as const;
const googleSpecs = ["google-pixel-9-specs"] as const;
const googleLaunch = ["google-pixel-9-announcement"] as const;
const google10Specs = ["google-pixel-10-specs"] as const;
const google10Launch = ["google-pixel-10-announcement"] as const;
const samsungLaunch = ["samsung-galaxy-s24-announcement"] as const;
const samsung26Launch = ["samsung-galaxy-s26-announcement"] as const;

export const phones = [
  {
    slug: "apple-iphone-17",
    maker: { value: "Apple", sourceIds: apple17Specs },
    model: { value: "iPhone 17", sourceIds: apple17Specs },
    releasedOn: {
      value: "2025-09-19",
      sourceIds: apple17Launch,
      qualification: "Official U.S. availability date"
    },
    originalPrice: {
      value: {
        amount: 799,
        currency: "USD",
        market: "United States",
        configuration: "256 GB; advertised price includes a $30 connectivity discount requiring carrier activation"
      },
      sourceIds: apple17Launch,
      qualification: "Official U.S. starting price at announcement"
    },
    display: {
      size: {
        value: "6.3 inches",
        sourceIds: apple17Specs,
        qualification: "6.27 inches when measured as a standard rectangle; actual viewable area is smaller"
      },
      panel: { value: "OLED (Super Retina XDR)", sourceIds: apple17Specs },
      resolution: { value: "2622 × 1206 at 460 ppi", sourceIds: apple17Specs },
      refreshRate: {
        value: "Up to 120 Hz",
        sourceIds: apple17Refresh,
        qualification: "ProMotion adaptive refresh rate; Apple says the Always-On display can adjust down to 1 Hz when not in use"
      },
      peakBrightness: {
        value: "3,000 nits outdoors",
        sourceIds: apple17Specs,
        qualification: "Apple also states 1,600 nits peak for HDR"
      }
    },
    weight: { value: "177 g", sourceIds: apple17Specs },
    storage: { value: "256 GB or 512 GB", sourceIds: apple17Specs },
    processor: { value: "Apple A19", sourceIds: apple17Specs },
    rearCameras: {
      value: "48 MP Fusion main + 48 MP Fusion ultrawide",
      sourceIds: apple17Specs,
      qualification: "The main camera also enables a 12 MP optical-quality 2× telephoto crop"
    },
    batteryClaim: {
      value: "Up to 30 hours of video playback",
      sourceIds: apple17Specs,
      qualification: "Manufacturer claim; actual results vary"
    },
    resistance: {
      value: "IP68; up to 6 m for 30 minutes",
      sourceIds: apple17Specs,
      qualification: "Controlled laboratory conditions; resistance can decrease with wear"
    }
  },
  {
    slug: "apple-iphone-17e",
    maker: { value: "Apple", sourceIds: apple17eSpecs },
    model: { value: "iPhone 17e", sourceIds: apple17eSpecs },
    releasedOn: {
      value: "2026-03-11",
      sourceIds: apple17eLaunch,
      qualification: "Official U.S. availability date"
    },
    originalPrice: {
      value: {
        amount: 599,
        currency: "USD",
        market: "United States",
        configuration: "256 GB"
      },
      sourceIds: apple17eLaunch,
      qualification: "Official U.S. starting price at announcement"
    },
    display: {
      size: {
        value: "6.1 inches",
        sourceIds: apple17eSpecs,
        qualification: "6.06 inches when measured as a standard rectangle"
      },
      panel: { value: "OLED (Super Retina XDR)", sourceIds: apple17eSpecs },
      resolution: { value: "2532 × 1170 at 460 ppi", sourceIds: apple17eSpecs },
      refreshRate: {
        value: null,
        sourceIds: apple17eSpecs,
        qualification: "Not stated on the cited Apple specification page"
      },
      peakBrightness: {
        value: "1,200 nits peak HDR",
        sourceIds: apple17eSpecs,
        qualification: "Apple also states 800 nits maximum typical brightness"
      }
    },
    weight: { value: "169 g", sourceIds: apple17eSpecs },
    storage: { value: "256 GB or 512 GB", sourceIds: apple17eSpecs },
    processor: { value: "Apple A19", sourceIds: apple17eSpecs },
    rearCameras: {
      value: "48 MP Fusion main",
      sourceIds: apple17eSpecs,
      qualification: "The main camera also enables a 12 MP 2× telephoto crop"
    },
    batteryClaim: {
      value: "Up to 26 hours of video playback",
      sourceIds: apple17eSpecs,
      qualification: "Manufacturer claim; actual results vary"
    },
    resistance: {
      value: "IP68; up to 6 m for 30 minutes",
      sourceIds: apple17eSpecs,
      qualification: "Controlled laboratory conditions; resistance can decrease with wear"
    }
  },
  {
    slug: "apple-iphone-16",
    maker: { value: "Apple", sourceIds: appleSpecs },
    model: { value: "iPhone 16", sourceIds: appleSpecs },
    releasedOn: { value: "2024-09-20", sourceIds: appleLaunch },
    originalPrice: {
      value: {
        amount: 799,
        currency: "USD",
        market: "United States",
        configuration: "Starting configuration; capacity is not tied to the price statement"
      },
      sourceIds: appleLaunch,
      qualification: "Official U.S. starting price at announcement"
    },
    display: {
      size: { value: "6.1 inches", sourceIds: appleSpecs },
      panel: { value: "OLED (Super Retina XDR)", sourceIds: appleSpecs },
      resolution: { value: "2556 × 1179 at 460 ppi", sourceIds: appleSpecs },
      refreshRate: {
        value: null,
        sourceIds: appleSpecs,
        qualification: "Not stated on the cited Apple specification page"
      },
      peakBrightness: {
        value: "2,000 nits outdoors",
        sourceIds: appleSpecs,
        qualification: "Apple also states 1,600 nits peak for HDR"
      }
    },
    weight: { value: "170 g", sourceIds: appleSpecs },
    storage: { value: "128 GB, 256 GB, or 512 GB", sourceIds: appleSpecs },
    processor: { value: "Apple A18", sourceIds: appleSpecs },
    rearCameras: {
      value: "48 MP Fusion main + 12 MP ultrawide",
      sourceIds: appleSpecs,
      qualification: "The main camera also enables a 12 MP 2× telephoto crop"
    },
    batteryClaim: {
      value: "Up to 22 hours of video playback",
      sourceIds: appleSpecs,
      qualification: "Manufacturer claim; actual results vary"
    },
    resistance: {
      value: "IP68; up to 6 m for 30 minutes",
      sourceIds: appleSpecs,
      qualification: "Controlled laboratory conditions; resistance can decrease with wear"
    }
  },
  {
    slug: "google-pixel-10",
    maker: { value: "Google", sourceIds: google10Specs },
    model: { value: "Pixel 10", sourceIds: google10Specs },
    releasedOn: {
      value: "2025-08-28",
      sourceIds: google10Launch,
      qualification: "Official U.S. retail availability date"
    },
    originalPrice: {
      value: {
        amount: 799,
        currency: "USD",
        market: "United States",
        configuration: "Starting configuration; the announcement does not tie the price to a capacity"
      },
      sourceIds: google10Launch,
      qualification: "Official U.S. starting price at announcement"
    },
    display: {
      size: { value: "6.3 inches", sourceIds: google10Specs },
      panel: { value: "OLED (Actua)", sourceIds: google10Specs },
      resolution: { value: "1080 × 2424 at 422 ppi", sourceIds: google10Specs },
      refreshRate: { value: "60–120 Hz", sourceIds: google10Specs },
      peakBrightness: {
        value: "3,000 nits peak",
        sourceIds: google10Specs,
        qualification: "Google also states up to 2,000 nits for HDR"
      }
    },
    weight: {
      value: "7.2 oz",
      sourceIds: google10Specs,
      qualification: "Unit stated on the cited U.S. specification page; not silently converted"
    },
    storage: { value: "128 GB or 256 GB", sourceIds: google10Specs },
    processor: { value: "Google Tensor G5", sourceIds: google10Specs },
    rearCameras: {
      value: "48 MP wide + 13 MP ultrawide + 10.8 MP 5× telephoto",
      sourceIds: google10Specs
    },
    batteryClaim: {
      value: "24+ hours; typical capacity 4,970 mAh",
      sourceIds: google10Specs,
      qualification: "Manufacturer claim; usage and testing conditions apply"
    },
    resistance: {
      value: "IP68 dust and water resistance",
      sourceIds: google10Specs,
      qualification: "The cited specification page does not state a depth or duration in its main claim"
    }
  },
  {
    slug: "google-pixel-9",
    maker: { value: "Google", sourceIds: googleSpecs },
    model: { value: "Pixel 9", sourceIds: googleSpecs },
    releasedOn: { value: "2024-08-22", sourceIds: googleLaunch },
    originalPrice: {
      value: {
        amount: 799,
        currency: "USD",
        market: "United States",
        configuration: "Starting configuration; capacity is not tied to the price statement"
      },
      sourceIds: googleLaunch,
      qualification: "Official U.S. starting price at announcement"
    },
    display: {
      size: { value: "6.3 inches", sourceIds: googleSpecs },
      panel: { value: "OLED (Actua)", sourceIds: googleSpecs },
      resolution: { value: "1080 × 2424 at 422 ppi", sourceIds: googleSpecs },
      refreshRate: { value: "60–120 Hz", sourceIds: googleSpecs },
      peakBrightness: {
        value: "2,700 nits peak",
        sourceIds: googleSpecs,
        qualification: "Google also states up to 1,800 nits for HDR"
      }
    },
    weight: { value: "198 g", sourceIds: googleSpecs },
    storage: { value: "128 GB or 256 GB", sourceIds: googleSpecs },
    processor: { value: "Google Tensor G4", sourceIds: googleSpecs },
    rearCameras: {
      value: "50 MP wide + 48 MP ultrawide",
      sourceIds: googleSpecs
    },
    batteryClaim: {
      value: "24+ hours; typical capacity 4,700 mAh",
      sourceIds: googleSpecs,
      qualification: "Manufacturer claim; usage and testing conditions apply"
    },
    resistance: {
      value: "IP68 dust and water resistance",
      sourceIds: googleSpecs,
      qualification: "The cited specification page does not state a depth or duration in its main claim"
    }
  },
  {
    slug: "samsung-galaxy-s26",
    maker: { value: "Samsung", sourceIds: samsung26Launch },
    model: { value: "Galaxy S26", sourceIds: samsung26Launch },
    releasedOn: {
      value: "2026-03-11",
      sourceIds: samsung26Launch,
      qualification: "Official U.S. general availability date announced at launch"
    },
    originalPrice: {
      value: {
        amount: 899.99,
        currency: "USD",
        market: "United States",
        configuration: "Starting configuration; the announcement lists 256 GB and 512 GB but does not tie the price to a capacity"
      },
      sourceIds: samsung26Launch,
      qualification: "Official U.S. starting price at announcement"
    },
    display: {
      size: {
        value: "6.3 inches",
        sourceIds: samsung26Launch,
        qualification: "6.1 inches when accounting for rounded corners"
      },
      panel: { value: "Dynamic AMOLED 2X", sourceIds: samsung26Launch },
      resolution: {
        value: "FHD+",
        sourceIds: samsung26Launch,
        qualification: "Pixel dimensions are not stated in the cited announcement"
      },
      refreshRate: { value: "1–120 Hz", sourceIds: samsung26Launch },
      peakBrightness: { value: "2,600 nits peak", sourceIds: samsung26Launch }
    },
    weight: {
      value: "167 g",
      sourceIds: samsung26Launch,
      qualification: "Sub-6 configuration; weight may vary by country or region"
    },
    storage: {
      value: "256 GB or 512 GB",
      sourceIds: samsung26Launch,
      qualification: "Availability can vary by carrier, country, or region"
    },
    processor: {
      value: "Snapdragon 8 Elite Gen 5 for Galaxy",
      sourceIds: samsung26Launch,
      qualification: "Processor stated for Galaxy S26 in the cited U.S. announcement"
    },
    rearCameras: {
      value: "50 MP wide + 12 MP ultrawide + 10 MP 3× telephoto",
      sourceIds: samsung26Launch
    },
    batteryClaim: {
      value: "4,300 mAh typical capacity",
      sourceIds: samsung26Launch,
      qualification: "Manufacturer-rated typical capacity; actual battery life varies"
    },
    resistance: {
      value: "IP68; up to 1.5 m of freshwater for 30 minutes",
      sourceIds: samsung26Launch,
      qualification: "Laboratory conditions; resistance is not permanent and can diminish with wear"
    }
  },
  {
    slug: "samsung-galaxy-s24",
    maker: { value: "Samsung", sourceIds: samsungLaunch },
    model: { value: "Galaxy S24", sourceIds: samsungLaunch },
    releasedOn: {
      value: "2024-01-31",
      sourceIds: samsungLaunch,
      qualification: "Official U.S. availability date"
    },
    originalPrice: {
      value: {
        amount: 799.99,
        currency: "USD",
        market: "United States",
        configuration: "Starting configuration; the announcement lists 128 GB and 256 GB but does not tie the price to a capacity"
      },
      sourceIds: samsungLaunch,
      qualification: "Official U.S. starting price at announcement"
    },
    display: {
      size: {
        value: "6.2 inches",
        sourceIds: samsungLaunch,
        qualification: "6.0 inches when accounting for rounded corners"
      },
      panel: { value: "Dynamic AMOLED 2X", sourceIds: samsungLaunch },
      resolution: {
        value: "FHD+",
        sourceIds: samsungLaunch,
        qualification: "Pixel dimensions are not stated in the cited announcement"
      },
      refreshRate: { value: "1–120 Hz", sourceIds: samsungLaunch },
      peakBrightness: {
        value: null,
        sourceIds: samsungLaunch,
        qualification: "Not stated specifically for Galaxy S24 in the cited announcement"
      }
    },
    weight: {
      value: "5.93 oz",
      sourceIds: samsungLaunch,
      qualification: "U.S. mmWave configuration"
    },
    storage: {
      value: "128 GB or 256 GB",
      sourceIds: samsungLaunch,
      qualification: "U.S. options at announcement; availability can vary by carrier, country, or region"
    },
    processor: { value: "Snapdragon 8 Gen 3 Mobile Platform", sourceIds: samsungLaunch },
    rearCameras: {
      value: "50 MP wide + 12 MP ultrawide + 10 MP 3× telephoto",
      sourceIds: samsungLaunch
    },
    batteryClaim: {
      value: "4,000 mAh typical capacity",
      sourceIds: samsungLaunch,
      qualification: "Manufacturer-rated typical capacity; actual battery life varies"
    },
    resistance: {
      value: "IP68; up to 1.5 m of freshwater for 30 minutes",
      sourceIds: samsungLaunch,
      qualification: "Laboratory conditions; not advised for beach or pool use, and resistance can diminish with wear"
    }
  }
] as const satisfies readonly PhoneRecord[];

export type CatalogFact = SourcedValue<unknown>;

export function factsFor(phone: PhoneRecord): readonly CatalogFact[] {
  return [
    phone.maker,
    phone.model,
    phone.releasedOn,
    phone.originalPrice,
    phone.display.size,
    phone.display.panel,
    phone.display.resolution,
    phone.display.refreshRate,
    phone.display.peakBrightness,
    phone.weight,
    phone.storage,
    phone.processor,
    phone.rearCameras,
    phone.batteryClaim,
    phone.resistance
  ];
}

export function validateCatalog(): string[] {
  const errors: string[] = [];
  const sourceIds = new Set(Object.keys(sources));
  const slugs = new Set<string>();

  for (const source of Object.values(sources)) {
    const sourceId = source.id;
    if (!source.url.startsWith("https://")) errors.push(`${sourceId}: source URL must use HTTPS`);
    if (!source.accessedAt) errors.push(`${sourceId}: access date is required`);
  }

  for (const phone of phones) {
    if (slugs.has(phone.slug)) errors.push(`${phone.slug}: duplicate phone slug`);
    slugs.add(phone.slug);

    for (const fact of factsFor(phone)) {
      if (fact.sourceIds.length === 0) errors.push(`${phone.slug}: fact has no provenance`);
      for (const sourceId of fact.sourceIds) {
        if (!sourceIds.has(sourceId)) errors.push(`${phone.slug}: unknown source ${sourceId}`);
      }
    }

    const price = phone.originalPrice.value;
    if (price.amount <= 0 || !price.market || !price.configuration) {
      errors.push(`${phone.slug}: original price lacks interpretive context`);
    }
  }

  return errors;
}
