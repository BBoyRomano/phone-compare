# Product Compare

Product Compare is an evidence-led family of independently deployed web apps for understanding products through traceable first-party information. The platform currently contains phones, tablets, cars, and laptops and is designed to add categories without coupling their releases.

| App | Package | Production Worker |
| --- | --- | --- |
| Phones | `@product-compare/phones` | [product-compare-phones.bboyromano.workers.dev](https://product-compare-phones.bboyromano.workers.dev) |
| Tablets | `@product-compare/tablets` | [product-compare-tablets.bboyromano.workers.dev](https://product-compare-tablets.bboyromano.workers.dev) |
| Cars | `@product-compare/cars` | [product-compare-cars.bboyromano.workers.dev](https://product-compare-cars.bboyromano.workers.dev) |
| Laptops | `@product-compare/laptops` | [product-compare-laptops.bboyromano.workers.dev](https://product-compare-laptops.bboyromano.workers.dev) |

The phone app has domain-specific, fact-level comparisons. The other apps begin as product-identity and lifecycle directories: they expose their evidence boundary rather than inventing specifications before domain review is complete.

## Development

Requirements: Node.js 22.13 or newer and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev:phones
pnpm dev:tablets
pnpm dev:cars
pnpm dev:laptops
```

Each app is independently verifiable:

```sh
pnpm check:phones
pnpm check:tablets
pnpm check:cars
pnpm check:laptops
```

Run the workspace policy checks and the complete suite with:

```sh
pnpm check
```

Phone discovery remains separate from published truth in `apps/phones/inventory/candidates.ndjson`. Use `pnpm inventory:check`, `pnpm inventory:coverage`, or `pnpm inventory:import:wikidata` for that bounded workflow.

## Architecture and delivery

- `apps/*` owns category data, domain behavior, Worker identity, tests, and release metadata.
- `packages/catalog` owns the generic identity/provenance contract, relational schema/projection, catalogue API, and deterministic validation.
- `packages/web` owns the shared identity-directory presentation and depends only on the catalogue contract.
- `packages/build` owns build-time Sites packaging and safe non-secret Worker defaults.
- `tooling` owns workspace-boundary and changed-dependency validation.

CI calculates the dependency closure of the changed files. An app-only change checks only that app; a shared-package change checks its package and affected consumers. Production deployment uses the same planner, one Cloudflare Worker, D1 database, and GitHub environment per app, and app-specific concurrency. Git remains the catalogue source of truth; releases publish content-addressed relational projections to D1.

See [Architecture](docs/ARCHITECTURE.md), [Operations](docs/OPERATIONS.md), [ADR 0006](docs/decisions/0006-multi-app-monorepo.md), and [ADR 0007](docs/decisions/0007-relational-catalogue-storage.md) for the durable design.

## Project governance

Autonomous work begins with [AGENTS.md](AGENTS.md). The canonical controls are [Product Goal](docs/PRODUCT_GOAL.md), [Governance](docs/GOVERNANCE.md), and [Resource Policy](docs/RESOURCE_POLICY.md).

## Support

Voluntary support through [GitHub Sponsors](https://github.com/sponsors/BBoyRomano) or [Ko-fi](https://ko-fi.com/bboyromano) helps sustain development and operating costs but never influences product data, coverage, or comparisons.
