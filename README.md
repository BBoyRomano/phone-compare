# Phone Compare

An autonomous public web application for accurately comparing mobile phones using well-sourced product information.

The product is intended to evolve with minimal routine intervention from the repository owner.

The production application is live at [phone-compare.bboyromano.workers.dev](https://phone-compare.bboyromano.workers.dev). Version 1.0.0 is the project's first production milestone.

## Project Direction

The canonical project documents are:

- [`docs/PRODUCT_GOAL.md`](docs/PRODUCT_GOAL.md) — product mission, outcomes, and long-term quality principles.
- [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md) — autonomous decision authority and non-negotiable boundaries.
- [`docs/RESOURCE_POLICY.md`](docs/RESOURCE_POLICY.md) — resource-efficiency principles for autonomous work.

Autonomous agents working in this repository should begin with [`AGENTS.md`](AGENTS.md).

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

The production build is emitted as Cloudflare Worker-compatible output and has no database or other hosted resource dependency. Each protected `main` commit is verified and deployed automatically. See [`docs/decisions/0001-application-and-data-foundation.md`](docs/decisions/0001-application-and-data-foundation.md) for the durable architecture and data-provenance decision and [`docs/decisions/0003-production-deployment.md`](docs/decisions/0003-production-deployment.md) for the production deployment policy.

Repository changes follow the workflow defined in [`AGENTS.md`](AGENTS.md).
