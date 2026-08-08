# 0001: Application and data foundation

## Status

Accepted — 2026-08-08

## Decision

Build the initial product as a server-rendered TypeScript and React application using Vinext and Vite, with Cloudflare Worker-compatible output. Keep the first catalogue in version-controlled TypeScript and model every displayed product fact as a value plus one or more source references and an optional qualification.

The first vertical slice compares two phones without a database, user accounts, background jobs, or a data-acquisition pipeline.

## Why

- Server-rendered HTML provides a fast, accessible comparison without requiring client JavaScript for the core experience.
- The Worker-compatible build leaves a low-operations hosting path while keeping local development straightforward.
- A typed, version-controlled dataset is sufficient for two records and makes provenance rules visible and testable before persistence complexity is justified.
- Datum-level source references preserve traceability when one product uses multiple official documents or when a claim needs qualification.

## Alternatives considered

- A static HTML/CSS site would use fewer dependencies, but it would make later catalogue-driven routes and reusable comparison rendering more costly.
- Adding a database now would support future catalogue growth, but no current workflow needs runtime writes and it would add migrations, bindings, and operating state prematurely.
- Storing one source per phone would be simpler, but would obscure which document supports price, availability, or individual specifications.

## Tradeoffs and revisit conditions

Vinext is a young compatibility layer, so framework upgrades may require attention. Reconsider it if build reliability or required routing features become a recurring problem.

Move catalogue data to a persistent store when record volume, editorial workflow, automated ingestion, or correction history makes version-controlled TypeScript cumbersome. Preserve the same datum-level provenance and qualification semantics in any replacement schema.
