export const sources = {
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
    readonly peakBrightness: SourcedValue<string>;
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
const googleSpecs = ["google-pixel-9-specs"] as const;
const googleLaunch = ["google-pixel-9-announcement"] as const;

export const phones = [
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
    if (!source.url.startsWith("https://")) errors.push(`${source.id}: source URL must use HTTPS`);
    if (!source.accessedAt) errors.push(`${source.id}: access date is required`);
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
