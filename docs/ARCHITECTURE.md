# Architecture

## System shape

Product Compare is a pnpm workspace with independently executable category applications and a small, directed shared-package graph.

```text
apps/* -> packages/catalog -> app-owned D1
identity-directory apps -> packages/web -> packages/catalog
apps/* -> packages/build (development/build-time only)
```

Packages must never import an app. Category-specific comparison semantics remain app-owned even when every app uses the shared catalogue structure and API.

## Ownership boundaries

| Surface | Stable responsibility | Must not own |
| --- | --- | --- |
| `apps/<id>` | Category data, relational projection, domain rules, routes, tests, Worker/D1 identity, production URL, smoke identity | Another app's data, database, or release |
| `packages/catalog` | Generic identity, market, lifecycle, evidence, relational schema/projection, and catalogue API primitives | Category-specific comparison semantics |
| `packages/web` | Accessible presentation for identity-level directories | Phone comparison logic or app deployment metadata |
| `packages/build` | Build-only Sites artifact packaging and non-secret Worker defaults | Product data, secrets, or app identity |
| `tooling` | Workspace validation, relational artifact validation, and changed-dependency calculation | Runtime application behavior |

All internal package dependencies use the `workspace:` protocol. `tooling/validate-workspaces.mjs` enforces package direction, required app scripts, app metadata consistency, and independent package identity.

## Application contract

Every `apps/<id>` directory has:

- a private `@product-compare/<id>` package;
- `dev`, `build`, `typecheck`, `lint`, `test:data`, `test:render`, `catalog:sql`, `test:database`, and `check` scripts;
- app-owned `app.config.json` release metadata;
- a unique Worker name, D1 database name, and production URL;
- a Worker-compatible build that does not consume another app's output;
- category data, a deterministic D1 projection, and acceptance tests local to the app.

The app may depend on shared packages but must be verifiable from a clean checkout through `pnpm --filter @product-compare/<id> check`. A production release verifies the app and all transitive internal dependencies through the pnpm dependency selector.

## Catalogue storage

Reviewed category records in Git are canonical. `packages/catalog/migrations` defines the shared relational core, while each app maps its own domain records to that contract. Builds create `dist/catalog/catalog.sql` and a content-addressed release manifest. The release identity includes both catalogue content and an explicit projection-format revision, so semantic generator changes cannot silently reuse stale rows. Generated SQL is never committed.

Every app has a separate D1 database. A release applies forward-only schema migrations, imports a complete inactive catalogue version, activates it only after every row exists, and removes superseded versions. If an import fails before activation, the prior active version remains queryable. The Worker exposes `/api/catalog/status` and `/api/catalog/products` from D1; existing rendered experiences may continue using build-time data while category-specific query and comparison surfaces migrate deliberately.

## Change isolation

`tooling/affected-workspaces.mjs` reads actual workspace manifests and calculates reverse dependency closure.

- `apps/phones/**` affects phones only.
- `apps/cars/**` affects cars only, and likewise for every app.
- `packages/catalog/**` affects all current apps.
- `packages/web/**` affects its identity-directory consumers.
- `packages/build/**` and root toolchain files affect all apps.
- documentation-only changes do not build an app.
- unknown production paths fail safe and affect all apps.

The same planner drives CI and production delivery so build and deployment impact cannot silently diverge.

## Adding a category

1. Create `apps/<id>` with the application contract above.
2. Give it a unique package name, Worker name, D1 database name, production URL, and smoke marker in `app.config.json`.
3. Keep domain data and comparison semantics local. Depend on shared packages only when their existing contract fits without category exceptions.
4. Add deterministic data, relational projection, database, render, and route tests.
5. Create a least-privilege `production-<id>` GitHub environment with the Worker/D1 token and account/database ID variables. Use a separate Cloudflare account when true per-app credential isolation is required; otherwise record the shared-account token blast radius.
6. Run the workspace policy test, the new app check, the affected-workspace tests, and a Wrangler dry run.

The CI and deployment matrices discover the new app from workspace and app metadata; they do not require a new per-app workflow.
