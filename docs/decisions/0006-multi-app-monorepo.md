# 0006: Multi-app monorepo and isolated delivery

## Status

Accepted — 2026-08-11

Supersedes the single-application delivery scope in [0003](0003-production-deployment.md). The initial application and fact-provenance decisions in [0001](0001-application-and-data-foundation.md) remain valid for phones.

## Decision

Operate Product Compare as one pnpm monorepo containing independently executable category applications. Begin with phones, tablets, cars, and laptops. Each app owns its category data, domain semantics, tests, Worker identity, release metadata, and production boundary.

Allow shared packages only for stable responsibilities with a directed dependency graph: generic catalogue identity/provenance contracts, generic identity-directory presentation, and build-time integration. Do not force phone fact comparison or future category semantics into a shared abstraction.

Use the workspace dependency graph to calculate affected apps for both CI and deployment. App-only changes verify and release one app. Shared changes verify their package and transitive app consumers. Root build/toolchain changes fail safe to all apps. Documentation-only changes do not build an app.

Deploy every app to a separate Cloudflare Worker through one matrix workflow. Give every app a separate GitHub production environment, environment-scoped credentials, concurrency group, smoke identity, deployment record, and rollback surface. Production releases re-run the app and transitive internal dependency checks for the exact commit rather than relying only on external branch-protection settings.

For tablets, cars, and laptops, publish identity/lifecycle directories before detailed comparisons. Every identity must have explicit first-party evidence, market, lifecycle state and assessment date, evidence basis, and qualification. Editorial segments must be labelled as navigation taxonomy rather than sourced specifications. Domain-specific facts may be added only with domain-specific comparability rules and fact-level provenance.

## Why

- Independent applications keep a routine category change from consuming the build and release capacity of the whole family.
- A single repository still permits atomic shared-contract changes and one lockfile/toolchain policy.
- Dependency-derived impact scales to future apps without duplicating brittle path lists.
- App-scoped credentials and rollback histories reduce blast radius.
- Honest identity directories provide useful, sourced breadth without pretending that cars, tablets, and laptops share phone comparison semantics.

## Alternatives considered

- Separate repositories maximize isolation but multiply dependency, governance, and shared-contract maintenance before the team needs that boundary.
- One universal application would simplify hosting but couple every build, release, failure, and domain model.
- A universal product specification schema was rejected because configuration identity, lifecycle, markets, units, and valid comparisons differ materially by category.
- Static path filters in four deployment workflows were rejected because CI and deploy impact could drift, shared-package verification was implicit, and adding an app required another workflow.
- Shared production credentials were rejected because they unnecessarily widen the blast radius of a compromised or misconfigured release.

## Tradeoffs and revisit conditions

Shared-package changes intentionally fan out to every consumer, and the deployment workflow repeats transitive verification for release assurance. This costs more than relying on CI alone but preserves exact-commit safety without depending on unobservable repository settings.

The repository remains appropriate while apps share tooling and a meaningful set of stable contracts. Reconsider repository separation when access control, team ownership, legal boundaries, dependency cadence, or release scale makes a shared lockfile a larger liability than benefit.

Reconsider a shared domain package only when at least two apps have the same proven semantics without category conditionals. The later decision to add Git-canonical, app-isolated relational projections is recorded in [0007](0007-relational-catalogue-storage.md).
