# 0005: Candidate inventory persistence

## Status

Accepted — 2026-08-10

## Decision

Store candidate phone identity and investigation state as repository-owned NDJSON in `inventory/candidates.ndjson`. Keep its TypeScript schema, source-use registry, validation, and coverage derivation outside the application data modules. The inventory is build- and runtime-inert unless an explicit maintenance command reads it.

Each line represents one possible product identity, not one specification record. It may retain manufacturer and displayed brand, marketing name, model codes, aliases, regional and form-factor hints, discovery provenance, verification state, a canonical published slug, duplicate resolution, and concise investigation conclusions. Unknown top-level fields are rejected so price, specifications, and other published facts cannot drift into this store.

`pnpm inventory:check` validates the complete inventory and its discovery-source registry. `pnpm inventory:coverage` emits machine-readable JSON derived from candidate state and the independently imported published catalogue. Candidate entries remain sorted by stable identifier to keep large diffs reviewable.

Bulk import is permitted only when the discovery-source registry records both supported automated collection and repository persistence. A public access path alone is not treated as a data-reuse licence. Discovery evidence never becomes authority for published facts.

## Why

ADR 0004 assessed a 16-record catalogue and deferred new persistence until a concrete workflow created durable queues, cursors, or scaling pressure. The campaign now expects thousands of candidate identities, aliases, variants, rejections, and match decisions while the published catalogue remains in the low hundreds. That is a real durable review queue, but not a reason to migrate the published catalogue or add hosted state.

NDJSON keeps one independently diffable candidate per line, streams without loading a database, works with ordinary pull-request review, and requires no credentials, migration service, or production dependency. TypeScript alone would add punctuation-heavy multi-thousand-line diffs; a monolithic JSON array would make append and merge changes noisier. A local SQLite index could accelerate future analysis, but it should be generated and untracked until measured inventory operations justify more machinery.

The source-use registry records why Wikidata's CC0 structured data is suitable for bulk candidate discovery while Google Play's public supported-device download is limited to bounded manual signals until repository reuse rights are clearer. GSMArena bulk automation is excluded because supported automated access and reusable database rights were not established and automated access was blocked during assessment. Wikipedia was assessed but deferred because its share-alike/attribution boundary adds no current advantage over Wikidata's structured CC0 data.

## Tradeoffs and revisit conditions

Git review is less convenient than interactive queue software, and NDJSON does not provide transactions or indexes. Revisit the local representation if measured imports, concurrent edits, identity joins, or correction history become cumbersome. Prefer an untracked local SQLite index before a canonical database migration.

Consider a repository-owned SQLite file or normalized schema only when deterministic generation and review remain practical. Consider hosted persistence such as D1 only if an approved workflow genuinely needs remote writes, concurrency, or runtime queries. Any migration must preserve source provenance, uncertainty, identity resolutions, and a clean boundary from the published fact catalogue.
