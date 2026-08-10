# 0002: Unattended autonomy runtime

## Status

Accepted — 2026-08-09; implementation parked — 2026-08-10

## Decision

Unattended repository work should use a reviewed, repository-native, bounded agentic runtime rather than an ad hoc privileged agent. The repository's product goal, governance, resource policy, agent instructions, tests, data, and pull-request workflow remain the engine-neutral contract.

The `gh-aw` implementation pilot is parked and removed from the active repository surface. Supervised Codex work remains the current owner-triggered development mechanism. No unattended runtime is active.

Any future unattended capability must be adopted through a separate reviewed change. It should start with a manual, read-only assessment and demonstrate reliable inference and fail-closed controls before gaining schedules, event triggers, mutation authority, or production influence.

## Pilot outcome

Activation was attempted through a manually dispatched, staged, read-only `gh-aw` pilot. Local GitHub Copilot CLI inference using the same fine-grained personal access token and Copilot Auto succeeded, but the `gh-aw`/Agent Workflow Firewall GitHub Actions path repeatedly failed before inference with `model_not_supported` (`400 The requested model is not supported`). Authentication, token scope, credential isolation, firewall behavior, networking, and API proxy connectivity were verified.

Model aliases, explicit `copilot/auto` routing, fallback AI-credit pricing, and a newer explicitly pinned Copilot CLI runtime were tested without resolving the incompatibility. Further repository-level runtime experimentation is not justified without a material upstream compatibility change.

The pilot never activated an unattended writer, schedule, event trigger, mutation identity, live safe output, autonomous production path, deployment, or additional billing commitment. Its `COPILOT_GITHUB_TOKEN` was an inference-only credential and never granted repository mutation authority.

## Future identity and authority

Do not create a mutation identity until a reviewed workflow has a concrete need for real writes. Before real writes are enabled, select a dedicated repository-scoped machine identity that can mint short-lived, least-privilege credentials only for a bounded output job. Do not grant administration, workflow, secret, environment, deployment, security-setting, organization, ruleset-bypass, or unrelated-repository access.

Provider inference credentials and GitHub mutation credentials must never share a trust context. The model process should receive no repository write credential. A separate boundary must validate bounded structured output or a patch for threats, secrets, protected-file changes, provenance, and policy before any mutation is allowed.

## Bounded operation

Future unattended runs must have an explicit task, trusted inputs, allowed outputs, wall-clock and model budgets, patch limits, bounded retries, idempotency, and an auditable terminal result. They must stop when no justified work remains and must not recursively trigger themselves.

Treat issue bodies, pull-request text and diffs, comments, commit messages, source pages, dependency metadata, filenames, repository instructions from an untrusted ref, images, and tool output as untrusted data. Trusted workflow and instruction definitions must come from the default branch. Network and tool access must be allowlisted, secrets isolated, proposed changes scanned, and failures closed.

Any future writer must use a short-lived branch and pull request, never push to `main`, and remain subject to final-state verification, repository rules, required checks, Code Owner review, and protected-file controls. It must not approve or merge its own foundational changes, bypass protections, or weaken the safeguards that constrain it.

## Why preserve this direction

A repository-native runtime can remain durable when the owner's computer is off, event-driven, reviewable, and auditable. A bounded architecture also keeps orchestration, inference, and mutation authority separable. These benefits remain valid even though the attempted `gh-aw`/Copilot runtime combination was not operational.

The failed pilot does not justify replacing it with a custom privileged agent or silently maintaining a second security-sensitive runtime. A different implementation is acceptable only when it is clearly superior under the same governance, security, auditability, and resource constraints.

## Revisit conditions

Reconsider unattended autonomy when upstream `gh-aw`/Copilot runtime compatibility materially changes, or when another clearly superior bounded repository-native architecture is justified. Reintroduction requires a new owner-reviewed pull request and fresh evidence for inference reliability, credential isolation, protected-file enforcement, threat handling, bounded resource use, and fail-closed behavior.
