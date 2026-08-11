PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS catalog_releases (
  version TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  assessed_at TEXT NOT NULL,
  source_commit TEXT NOT NULL,
  projection_revision INTEGER NOT NULL CHECK (projection_revision > 0),
  record_count INTEGER NOT NULL CHECK (record_count >= 0)
);

CREATE TABLE IF NOT EXISTS catalog_state (
  app_id TEXT PRIMARY KEY,
  active_version TEXT NOT NULL REFERENCES catalog_releases(version)
);

CREATE TABLE IF NOT EXISTS brands (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  brand_id TEXT NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY (release_version, brand_id)
);

CREATE TABLE IF NOT EXISTS product_families (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  family_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  name TEXT NOT NULL,
  segment TEXT,
  PRIMARY KEY (release_version, family_id),
  FOREIGN KEY (release_version, brand_id) REFERENCES brands(release_version, brand_id)
);

CREATE TABLE IF NOT EXISTS market_offerings (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  offering_id TEXT NOT NULL,
  family_id TEXT NOT NULL,
  market TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('announced', 'current', 'earlier', 'archived', 'unknown')),
  lifecycle_assessed_at TEXT NOT NULL,
  released_on TEXT,
  release_basis TEXT CHECK (release_basis IS NULL OR release_basis IN ('availability', 'announcement')),
  qualification TEXT,
  PRIMARY KEY (release_version, offering_id),
  FOREIGN KEY (release_version, family_id) REFERENCES product_families(release_version, family_id)
);

CREATE TABLE IF NOT EXISTS variants (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  offering_id TEXT NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY (release_version, variant_id),
  FOREIGN KEY (release_version, offering_id) REFERENCES market_offerings(release_version, offering_id)
);

CREATE TABLE IF NOT EXISTS aliases (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  PRIMARY KEY (release_version, variant_id, alias),
  FOREIGN KEY (release_version, variant_id) REFERENCES variants(release_version, variant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sources (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  source_id TEXT NOT NULL,
  publisher TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  kind TEXT NOT NULL,
  published_at TEXT,
  accessed_at TEXT NOT NULL,
  market TEXT,
  PRIMARY KEY (release_version, source_id)
);

CREATE TABLE IF NOT EXISTS evidence_links (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  evidence_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('family', 'offering', 'variant')),
  entity_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  basis TEXT NOT NULL,
  qualification TEXT NOT NULL,
  PRIMARY KEY (release_version, evidence_id),
  FOREIGN KEY (release_version, source_id) REFERENCES sources(release_version, source_id)
);

CREATE TABLE IF NOT EXISTS specification_facts (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  fact_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  spec_key TEXT NOT NULL,
  value_json TEXT NOT NULL,
  value_type TEXT NOT NULL,
  value_number REAL,
  unit TEXT,
  display_value TEXT,
  qualification TEXT,
  PRIMARY KEY (release_version, fact_id),
  UNIQUE (release_version, variant_id, spec_key),
  FOREIGN KEY (release_version, variant_id) REFERENCES variants(release_version, variant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fact_sources (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  fact_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  PRIMARY KEY (release_version, fact_id, source_id),
  FOREIGN KEY (release_version, fact_id) REFERENCES specification_facts(release_version, fact_id) ON DELETE CASCADE,
  FOREIGN KEY (release_version, source_id) REFERENCES sources(release_version, source_id)
);

CREATE TABLE IF NOT EXISTS prices (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  price_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('original', 'current')),
  amount REAL CHECK (amount IS NULL OR amount >= 0),
  currency TEXT,
  market TEXT NOT NULL,
  configuration TEXT NOT NULL,
  qualification TEXT,
  PRIMARY KEY (release_version, price_id),
  FOREIGN KEY (release_version, variant_id) REFERENCES variants(release_version, variant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_sources (
  release_version TEXT NOT NULL REFERENCES catalog_releases(version) ON DELETE CASCADE,
  price_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  PRIMARY KEY (release_version, price_id, source_id),
  FOREIGN KEY (release_version, price_id) REFERENCES prices(release_version, price_id) ON DELETE CASCADE,
  FOREIGN KEY (release_version, source_id) REFERENCES sources(release_version, source_id)
);

CREATE INDEX IF NOT EXISTS product_families_brand_idx ON product_families(release_version, brand_id);
CREATE INDEX IF NOT EXISTS market_offerings_market_idx ON market_offerings(release_version, market, lifecycle_status);
CREATE INDEX IF NOT EXISTS variants_offering_idx ON variants(release_version, offering_id);
CREATE INDEX IF NOT EXISTS specification_facts_lookup_idx ON specification_facts(release_version, spec_key, value_number);
CREATE INDEX IF NOT EXISTS evidence_links_entity_idx ON evidence_links(release_version, entity_type, entity_id);
