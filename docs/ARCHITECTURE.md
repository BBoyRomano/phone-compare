# Architecture

## System shape

Product Compare is a pnpm workspace with independently executable category applications and a small, directed shared-package graph.

```text
apps/phones
apps/tablets ─┐
apps/cars ────┼─> packages/web ─> packages/catalog
apps/laptops ─┘

all apps ────────> packages/build (development/build-time only)
```

Packages must never import an app. An app may remain fully category-specific, as phones does, when sharing would weaken domain semantics.

## Ownership boundaries

| Surface | Stable responsibility | Must not own |
| --- | --- | --- |
| `apps/<id>` | Category data, domain rules, routes, acceptance tests, Worker name, production URL, smoke identity | Another app's data or release |
| `packages/catalog` | Generic identity, market, lifecycle, evidence, and validation primitives | Category-specific facts or comparisons |
| `packages/web` | Accessible presentation for identity-level directories | Phone comparison logic or app deployment metadata |
| `packages/build` | Build-only Sites artifact packaging and non-secret Worker defaults | Product data, routes, bindings, secrets, or Worker identity |
| `tooling` | Workspace validation and changed-dependency calculation | Runtime application behavior |

All internal package dependencies use the `workspace:` protocol. `tooling/validate-workspaces.mjs` enforces package direction, required app scripts, app metadata consistency, and independent package identity.

## Application contract

Every `apps/<id>` directory has:

- a private `@product-compare/<id>` package;
- `dev`, `build`, `typecheck`, `lint`, `test:data`, `test:render`, and `check` scripts;
- app-owned `app.config.json` release metadata;
- a unique Worker name and production URL;
- a Worker-compatible build that does not consume another app's output;
- category data and acceptance tests local to the app.

The app may depend on shared packages but must be verifiable from a clean checkout through `pnpm --filter @product-compare/<id> check`. A production release verifies the app and all transitive internal dependencies through the pnpm dependency selector.

## Change isolation

`tooling/affected-workspaces.mjs` reads actual workspace manifests and calculates reverse dependency closure.

- `apps/phones/**` affects phones only.
- `apps/cars/**` affects cars only, and likewise for every app.
- `packages/catalog/**` and `packages/web/**` affect their three current consumers, not phones.
- `packages/build/**` and root toolchain files affect all apps.
- documentation-only changes do not build an app.
- unknown production paths fail safe and affect all apps.

The same planner drives CI and production delivery so build and deployment impact cannot silently diverge.

## Adding a category

1. Create `apps/<id>` with the application contract above.
2. Give it a unique package name, Worker name, production URL, and smoke marker in `app.config.json`.
3. Keep domain data and comparison semantics local. Depend on shared packages only when their existing contract fits without category exceptions.
4. Add deterministic data, render, and route tests.
5. Create a least-privilege `production-<id>` GitHub environment. Use a separate Cloudflare account when true per-Worker credential isolation is required; otherwise record the shared-account token blast radius.
6. Run the workspace policy test, the new app check, the affected-workspace tests, and a Wrangler dry run.

The CI and deployment matrices discover the new app from workspace and app metadata; they do not require a new per-app workflow.
