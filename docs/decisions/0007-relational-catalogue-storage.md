# 0007: Git-canonical catalogues with app-isolated D1 projections

## Status

Accepted — 2026-08-11

## Decision

Keep reviewed product data and provenance in Git as canonical source material. Generate a deterministic, content-addressed relational projection during each affected app build and publish that projection to a separate Cloudflare D1 database owned by the app.

Use a shared relational core for brands, families, market offerings, variants, aliases, sources, evidence links, specification facts, fact provenance, and prices. Category applications retain ownership of identity granularity, fact definitions, normalization, and comparison semantics.

Publish new catalogue rows before switching `catalog_state` to the new version. Delete superseded versions only after activation. Apply forward-only schema migrations before importing a release. Keep database UUIDs in app-scoped GitHub environment variables and deployment credentials in app-scoped secrets.

## Why

- Git provides reviewable diffs, provenance history, and reproducible releases.
- Relational constraints and indexes fit comparison, filtering, market, lifecycle, and source queries.
- Content-addressed activation prevents partial imports from replacing the active catalogue.
- One database per app preserves independent release, failure, access, migration, and rollback boundaries.
- A shared structural core does not require category-specific specifications to share meaning.

## Alternatives considered

- A graph database was rejected as the authoritative store because current queries are predictable relational lookups and comparisons. A graph may later be derived for relationship exploration.
- One shared D1 database was rejected because it couples app permissions, migrations, incidents, and releases.
- D1 as the only source of truth was rejected because dashboard or runtime mutation would bypass evidence review and make historical reconstruction harder.
- Committed SQLite files were rejected because binary diffs are not suitable for catalogue review.
- R2 and KV were rejected as primary stores because the catalogue requires relational integrity and indexed joins. R2 remains appropriate for permitted large artifacts.

## Tradeoffs and revisit conditions

Builds temporarily retain category data for server rendering while D1 becomes the stable query interface. Migrate each UI to D1 only when its domain query semantics and performance evidence justify the change; do not force all categories through one release.

Revisit graph projection when compatibility, component, rebadging, corporate, or supply-chain relationships require deep traversal. Revisit the storage platform if dataset size, write volume, geographic consistency, or operational cost exceeds D1's appropriate envelope.
