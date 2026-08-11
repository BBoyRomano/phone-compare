# Operations

## Production delivery

Protected `main` is the production source of truth. `.github/workflows/deploy-production.yml` calculates the dependency-aware release set for each exact commit, then verifies and deploys each affected app independently.

Each app uses:

- its own Cloudflare Worker;
- its own `production-<app>` GitHub environment;
- its own non-cancelling `production-<app>` concurrency group;
- an environment-scoped `CLOUDFLARE_API_TOKEN` secret and `CLOUDFLARE_ACCOUNT_ID` variable;
- app-specific smoke identity, production URL, and release history.

Tokens must be environment-scoped and restricted to the smallest Cloudflare account boundary available. Cloudflare Workers Scripts edit permission is account-scoped, so separate accounts are required for cryptographic per-Worker credential isolation; when apps share an account, that cross-Worker token blast radius is an explicit residual risk. Do not use `secrets: inherit`, store credentials in repository files, or place secrets in Worker `vars`.

Before deploy, the workflow runs the app check plus every internal dependency check, validates the generated Wrangler configuration with a dry run, and deploys the exact checked-out commit. The live smoke check requires an app-specific marker, HTML response, and correct 404 routing.

Manual dispatch accepts one app id or `all`. This is an operational fallback, not a second release branch.

## Worker configuration

Vite's Cloudflare plugin generates the deployable Wrangler configuration. `packages/build/cloudflare-worker.ts` centralizes only safe stateless defaults: the current compatibility date, `nodejs_compat`, and bounded logs/traces sampling. Worker names and future routes or bindings remain app-owned.

Sampling defaults are 10% for application logs and 1% for traces. Automatic invocation logs are disabled because comparison selections live in request URLs. Revisit sampling using observed traffic, incident needs, privacy impact, retention, and cost; do not increase it silently. Application code must not log request URLs, selections, or other unnecessary user-controlled data.

## Failure and rollback

A failed verification or dry run blocks that app's deploy without stopping unrelated app matrix entries. A failed live smoke check is a visible production incident because deployment may already have succeeded.

Rollback only the affected Worker using Cloudflare's retained Worker versions, then record and fix the cause on the same bounded branch or an incident branch. Rolling back one app must not redeploy another app.

## Routine verification

- `pnpm check` validates workspace policy and all apps.
- `pnpm check:<app>` validates one app.
- `node tooling/affected-workspaces.mjs --files-json '["apps/cars/data/catalog.ts"]'` previews change impact.
- `pnpm exec wrangler deploy --dry-run --config apps/<app>/dist/server/wrangler.json` validates a built Worker artifact without publishing.

Update the compatibility date deliberately after checks and dry runs. Reassess pinned actions and dependencies through normal dependency updates rather than floating production versions.
