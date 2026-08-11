export type CatalogueLifecycle = "announced" | "current" | "archived" | "unknown";
export type CatalogueSourceRole = "announcement" | "lineup" | "product" | "support";
export type CatalogueEvidenceBasis = "official-announcement" | "official-current-lineup" | "official-product-page" | "official-support-page";

export interface CatalogueSource {
  readonly title: string;
  readonly url: string;
  readonly publisher: string;
  readonly accessedAt: string;
  readonly market: string;
  readonly role: CatalogueSourceRole;
}

export interface CatalogueEvidence {
  readonly source: CatalogueSource;
  readonly basis: CatalogueEvidenceBasis;
  readonly qualification: string;
}

export interface CatalogueProduct {
  readonly slug: string;
  readonly name: string;
  /** An editorial navigation label, not a manufacturer specification. */
  readonly segment: string;
  readonly aliases?: readonly string[];
  readonly market: string;
  readonly lifecycle: {
    readonly status: CatalogueLifecycle;
    readonly assessedAt: string;
  };
  readonly evidence: readonly CatalogueEvidence[];
  readonly note?: string;
}

export interface CatalogueBrand {
  readonly slug: string;
  readonly name: string;
  readonly officialHosts: readonly string[];
  readonly lineupSource: CatalogueSource;
  readonly products: readonly CatalogueProduct[];
}

export interface ProductCatalogue {
  readonly id: string;
  readonly title: string;
  readonly singular: string;
  readonly plural: string;
  readonly description: string;
  readonly market: string;
  readonly assessedAt: string;
  readonly coverageNote: string;
  readonly coverageRule: string;
  readonly taxonomyNote: string;
  readonly accent: string;
  readonly defaults: readonly [string, string];
  readonly brands: readonly CatalogueBrand[];
}

export interface ResolvedProduct extends CatalogueProduct {
  readonly brand: CatalogueBrand;
  readonly primaryEvidence: CatalogueEvidence;
  readonly effectiveSourceUrl: string;
}

function preferredEvidence(product: CatalogueProduct): CatalogueEvidence | undefined {
  return product.evidence.find(({ source }) => source.role === "product") ?? product.evidence[0];
}

export function productsFor(catalogue: ProductCatalogue): readonly ResolvedProduct[] {
  return catalogue.brands.flatMap((brand) => brand.products.map((product) => {
    const primaryEvidence = preferredEvidence(product);
    if (!primaryEvidence) throw new Error(`${brand.name} ${product.name} has no identity evidence.`);
    return { ...product, brand, primaryEvidence, effectiveSourceUrl: primaryEvidence.source.url };
  }));
}

export function productFor(catalogue: ProductCatalogue, slug: string | undefined): ResolvedProduct | undefined {
  return productsFor(catalogue).find((product) => product.slug === slug);
}

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function officialHost(url: string, allowedHosts: readonly string[]): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export function validateCatalogue(catalogue: ProductCatalogue): readonly string[] {
  const errors: string[] = [];
  const brandSlugs = new Set<string>();
  const productSlugs = new Set<string>();

  if (catalogue.brands.length === 0) errors.push("Catalogue must contain at least one brand.");
  if (!isDate(catalogue.assessedAt)) errors.push("Catalogue assessedAt must use a real YYYY-MM-DD date.");
  if (!catalogue.coverageRule.trim()) errors.push("Catalogue must declare a reproducible coverage rule.");
  if (!catalogue.taxonomyNote.trim()) errors.push("Catalogue must explain its editorial segment taxonomy.");

  for (const brand of catalogue.brands) {
    if (brandSlugs.has(brand.slug)) errors.push(`Duplicate brand slug: ${brand.slug}.`);
    brandSlugs.add(brand.slug);
    if (brand.products.length === 0) errors.push(`${brand.name} must contain at least one product.`);
    if (brand.officialHosts.length === 0) errors.push(`${brand.name} must declare at least one official host.`);
    if (!officialHost(brand.lineupSource.url, brand.officialHosts)) errors.push(`${brand.name} lineup source must use a declared official host.`);
    if (brand.lineupSource.publisher !== brand.name) errors.push(`${brand.name} lineup source publisher must match the brand.`);
    if (!isDate(brand.lineupSource.accessedAt)) errors.push(`${brand.name} lineup source accessedAt must use a real YYYY-MM-DD date.`);
    if (brand.lineupSource.role !== "lineup") errors.push(`${brand.name} lineup source must have the lineup role.`);

    for (const product of brand.products) {
      if (productSlugs.has(product.slug)) errors.push(`Duplicate product slug: ${product.slug}.`);
      productSlugs.add(product.slug);
      if (!product.name.trim()) errors.push(`${product.slug} must have a name.`);
      if (!product.segment.trim()) errors.push(`${product.slug} must have an editorial segment.`);
      if (!product.market.trim()) errors.push(`${product.slug} must have a market.`);
      if (!isDate(product.lifecycle.assessedAt)) errors.push(`${product.slug} lifecycle assessedAt must use a real YYYY-MM-DD date.`);
      if (product.evidence.length === 0) errors.push(`${product.slug} must have product-level identity evidence.`);
      if (product.lifecycle.status === "current" && product.evidence.length > 0 && !product.evidence.some(({ basis }) => basis === "official-current-lineup")) {
        errors.push(`${product.slug} current lifecycle must cite an official current lineup.`);
      }
      for (const evidence of product.evidence) {
        if (!evidence.qualification.trim()) errors.push(`${product.slug} evidence must explain its qualification.`);
        if (!evidence.source.url.startsWith("https://")) errors.push(`${product.slug} source must use HTTPS.`);
        if (!officialHost(evidence.source.url, brand.officialHosts)) errors.push(`${product.slug} source must use a declared ${brand.name} host.`);
        if (evidence.source.publisher !== brand.name) errors.push(`${product.slug} source publisher must match the brand.`);
        if (!isDate(evidence.source.accessedAt)) errors.push(`${product.slug} source accessedAt must use a real YYYY-MM-DD date.`);
        if (evidence.source.market !== product.market) errors.push(`${product.slug} evidence market must match the product market.`);
        const roleForBasis: Record<CatalogueEvidenceBasis, CatalogueSourceRole> = {
          "official-announcement": "announcement",
          "official-current-lineup": "lineup",
          "official-product-page": "product",
          "official-support-page": "support"
        };
        if (evidence.source.role !== roleForBasis[evidence.basis]) errors.push(`${product.slug} evidence role must match its basis.`);
      }
    }
  }

  for (const slug of catalogue.defaults) {
    if (!productSlugs.has(slug)) errors.push(`Default product is not present: ${slug}.`);
  }
  if (catalogue.defaults[0] === catalogue.defaults[1]) errors.push("Default comparison products must differ.");
  return errors;
}
