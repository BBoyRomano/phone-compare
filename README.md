# Phone Compare

An autonomous public web application for accurately comparing mobile phones using well-sourced product information.

The product is intended to evolve with minimal routine intervention from the repository owner.

The production application is live at [phone-compare.bboyromano.workers.dev](https://phone-compare.bboyromano.workers.dev).

## Project Direction

The canonical project documents are:

- [`docs/PRODUCT_GOAL.md`](docs/PRODUCT_GOAL.md) — product mission, outcomes, and long-term quality principles.
- [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md) — autonomous decision authority and non-negotiable boundaries.
- [`docs/RESOURCE_POLICY.md`](docs/RESOURCE_POLICY.md) — resource-efficiency principles for autonomous work.

Autonomous agents working in this repository should begin with [`AGENTS.md`](AGENTS.md).

## Support

Phone Compare is an independent open-source project. Voluntary support through [GitHub Sponsors](https://github.com/sponsors/BBoyRomano) or [Ko-fi](https://ko-fi.com/bboyromano) helps sustain development and operating costs, but never influences product data or comparisons.

## Development

The product is a server-rendered TypeScript and React application. Users can compare any two phones in a curated, typed catalogue and share the selection through URL query parameters. Every displayed fact links to first-party provenance.

Requirements: Node.js 22.13 or newer and pnpm 11.

```sh
pnpm install
pnpm dev
```

Run the complete verification suite with:

```sh
pnpm check
```

Candidate discovery is maintained separately from published product truth in `inventory/candidates.ndjson`. Validate the review queue with `pnpm inventory:check`, or derive machine-readable coverage and backlog information with `pnpm inventory:coverage`. The bounded CC0 Wikidata slice can be refreshed with `pnpm inventory:import:wikidata`; the importer preserves reviewed decisions and candidates from other sources. Discovery records contain identity and investigation state only; facts shown by the application continue to require first-party provenance in the published catalogue.

The production build is emitted as Cloudflare Worker-compatible output and has no database or other hosted resource dependency. Each protected `main` commit is verified, and every commit that can affect production is deployed automatically. See [`docs/decisions/0001-application-and-data-foundation.md`](docs/decisions/0001-application-and-data-foundation.md) for the durable architecture and data-provenance decision and [`docs/decisions/0003-production-deployment.md`](docs/decisions/0003-production-deployment.md) for the production deployment policy.

Repository changes follow the workflow defined in [`AGENTS.md`](AGENTS.md).
