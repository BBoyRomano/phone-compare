# 0004: Manufacturer discovery and catalogue scaling

## Status

Accepted — 2026-08-10

## Decision

Keep stable first-party manufacturer discovery entry points in the typed registry at `data/manufacturer-sources.ts`. The registry is discovery configuration: it records official domains, source roles, market scope, reusable URL patterns, and known limitations. It must not become a second catalogue of models, prices, configurations, colours, specifications, or lifecycle state.

Continue storing the reviewed phone catalogue as version-controlled TypeScript with datum-level source references. Do not add a database or hosted data dependency yet.

## Why

The initial catalogue has 16 records and 26 source documents across three represented manufacturers. Assessment of Apple, Google, Samsung, Motorola, OnePlus, Nothing, Xiaomi, and OPPO found durable official catalogue, product, newsroom, and support entry points worth preserving independently of any current-model assessment.

The source landscape also makes provenance and region more important than raw record volume:

- global catalogue pages can mix current, historical, and out-of-stock products;
- manufacturers use different regional ranges, configurations, model numbers, and launch prices;
- some technical pages use predictable product slugs while others use opaque article IDs;
- announcement pages may establish a global launch without establishing availability or price in a particular market.

The existing typed catalogue remains appropriate at the current scale. It provides compile-time schema checks, reviewable diffs, simple static deployment, and explicit datum-level provenance without runtime writes, migrations, credentials, or operational state. Tens to low hundreds of curated records can remain practical if catalogue modules are split by manufacturer or product family before the single file becomes difficult to review.

## Growth path and revisit conditions

Before changing persistence, make the smallest static changes that address observed maintenance friction: split catalogue modules, centralize shared types and source documents, and add typed fields for stable identity, region-specific variants, configurations, colours, lifecycle intervals, and richer provenance only when catalogue work needs them.

Treat a persistent-store migration as a separate owner-reviewed architecture decision when one or more concrete problems become material:

- automated discovery or ingestion needs durable cursors, source snapshots, change detection, retries, or review queues;
- concurrent editors or agents routinely create merge conflicts across catalogue modules;
- regional variants, configurations, colours, and lifecycle history create repeated or ambiguous records that cannot be represented clearly in reviewable static data;
- corrections require an audit history beyond Git commits, or publication needs staged and approved states;
- catalogue queries or builds become measurably slow at the actual record count;
- runtime or scheduled processes need writes that cannot be expressed safely through reviewed repository changes.

The smallest plausible migration is not a replacement of the public application architecture. It is a repository-owned relational catalogue schema—likely SQLite locally or D1 only if hosted writes are later required—with normalized manufacturers, products, market variants, configurations, factual values, source documents, fact-source links, and lifecycle events. A deterministic build step can continue emitting the read-only data consumed by the application. Any migration must preserve qualifications, conflicting evidence, and datum-level provenance, and must be delivered as its own bounded, owner-reviewed pull request.

## Alternatives considered

- Keeping discovery only in task reports would avoid a file, but would force future catalogue work and automated monitoring to rediscover the same official entry points and regional caveats.
- Adding the entry points to `data/catalog.ts` would blur discovery configuration with evidence used by published phone facts.
- Moving immediately to a database would add migrations and operational complexity without solving a current correctness or performance problem.
