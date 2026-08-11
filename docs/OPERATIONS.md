# Operations

## Production delivery

Protected `main` is the production source of truth. `.github/workflows/deploy-production.yml` calculates the dependency-aware release set for each exact commit, then verifies and deploys each affected app independently.

Each app uses:

- its own Cloudflare Worker;
- its own `production-<app>` GitHub environment;
- its own non-cancelling `production-<app>` concurrency group;
- an environment-scoped `CLOUDFLARE_API_TOKEN` secret plus `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_D1_DATABASE_ID` variables;
- app-specific smoke identity, production URL, and release history.

Tokens require only account-scoped Workers Scripts Edit and D1 Edit permissions and must be restricted to the smallest Cloudflare account boundary available. Both permissions are account-scoped, so separate accounts are required for cryptographic per-app credential isolation; when apps share an account, that cross-app token blast radius is an explicit residual risk. Do not use `secrets: inherit`, store credentials or database IDs in repository files, or place secrets in Worker `vars`.

Before deploy, the workflow runs the app check plus every internal dependency check, validates the generated Wrangler configuration, and proves the configured D1 UUID belongs to the app's declared database name. It then applies the app's forward-only D1 schema migrations, publishes the deterministic catalogue projection, deploys the exact checked-out commit, and verifies the active D1 catalogue version. The live smoke check requires an app-specific marker, catalogue status, HTML response, and correct 404 routing.

Create these D1 databases once and store each returned UUID as the matching environment's `CLOUDFLARE_D1_DATABASE_ID` variable:

- `product-compare-phones-production`
- `product-compare-tablets-production`
- `product-compare-cars-production`
- `product-compare-laptops-production`

Database creation is intentionally outside deployment: routine releases may migrate and publish data but must not silently create or replace production infrastructure.

An authenticated administrator can create them with Wrangler:

```sh
pnpm exec wrangler d1 create product-compare-phones-production
pnpm exec wrangler d1 create product-compare-tablets-production
pnpm exec wrangler d1 create product-compare-cars-production
pnpm exec wrangler d1 create product-compare-laptops-production
```

For each command, copy only the returned `database_id` into the corresponding GitHub environment variable. Do not paste the generated binding into source: the app-owned build configuration already declares `CATALOG_DB`. The first deployment applies `packages/catalog/migrations` and imports the verified app projection.

Manual dispatch accepts one app id or `all`. This is an operational fallback, not a second release branch.

## Worker configuration

Vite's Cloudflare plugin generates the deployable Wrangler configuration. `packages/build/cloudflare-worker.ts` centralizes only safe stateless defaults: the current compatibility date, `nodejs_compat`, and bounded logs/traces sampling. Worker names and future routes or bindings remain app-owned.

Sampling defaults are 10% for application logs and 1% for traces. Automatic invocation logs are disabled because comparison selections live in request URLs. Revisit sampling using observed traffic, incident needs, privacy impact, retention, and cost; do not increase it silently. Application code must not log request URLs, selections, or other unnecessary user-controlled data.

## Failure and rollback

A failed verification or dry run blocks that app's deploy without stopping unrelated app matrix entries. Catalogue imports activate a content-addressed version last, so a failed partial import leaves the prior version active. A failed live smoke check is a visible production incident because database publication and deployment may already have succeeded.

Rollback only the affected Worker using Cloudflare's retained Worker versions, then record and fix the cause on the same bounded branch or an incident branch. Rolling back one app must not redeploy another app.

## Routine verification

- `pnpm check` validates workspace policy and all apps.
- `pnpm check:<app>` validates one app.
- `pnpm --filter @product-compare/<app> catalog:sql` generates its deterministic relational projection.
- `node tooling/affected-workspaces.mjs --files-json '["apps/cars/data/catalog.ts"]'` previews change impact.
- `pnpm exec wrangler deploy --dry-run --config apps/<app>/dist/server/wrangler.json` validates a built Worker artifact without publishing.

Update the compatibility date deliberately after checks and dry runs. Reassess pinned actions and dependencies through normal dependency updates rather than floating production versions.
