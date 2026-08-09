# 0002: Unattended autonomy runtime

## Status

Accepted — 2026-08-09; revised — 2026-08-09

## Decision

Use [GitHub Agentic Workflows](https://github.github.com/gh-aw/) (`gh-aw`) as the sole implementation of agentic orchestration for unattended repository work. GitHub Actions and GitHub events are its execution substrate; they are not a separately maintained agent runtime or fallback. Keep the repository's product goal, governance, resource policy, agent instructions, tests, data, and pull-request workflow as the engine-neutral contract.

Use GitHub Copilot as the initial unattended engine. Do not create or use an OpenAI API project, API service account, API key, billing account, or other OpenAI platform identity for unattended work. The owner's ChatGPT Pro/Codex use remains an interactive, supervised product-development path until the first production-ready deployment and is not unattended infrastructure.

Adopt unattended capability incrementally. The first pilot is an owner-dispatched, staged, read-only repository assessment. It has no schedule or automatic event trigger and cannot apply its one permitted `create-pull-request` safe output. Broader maintenance and product-evolution activation belongs around the first production-ready deployment milestone and requires a separate reviewed change.

Pin the pilot compiler to `gh-aw` `v0.85.4`. Reproduce it with `gh extension install github/gh-aw --pin v0.85.4`, then run `gh aw compile autonomy-pilot --strict`. Commit the Markdown source, generated `.lock.yml`, and `.github/aw/actions-lock.json`; regenerate lock files only with that reviewed compiler release. Generated Actions and `gh-aw` runtime components remain SHA-pinned through the compiler cache. Under the current official Copilot mechanism, `gh-aw` deliberately selects the supported Copilot CLI release and ignores `engine.version`, so the repository must not claim an ineffective engine pin. A future compiler mechanism that enforces a Copilot CLI pin should be adopted through a reviewed lock regeneration.

## Identity and authority

The staged pilot uses the workflow's normal `GITHUB_TOKEN` with `contents: read` only. The model process receives no repository write credential. The separate safe-output boundary remains staged and therefore previews output without making GitHub API writes.

Because `BBoyRomano/phone-compare` is owned by a personal account, Copilot inference authenticates with a fine-grained personal access token stored as the `COPILOT_GITHUB_TOKEN` Actions secret. The token must be owned by the repository owner, limited to public repositories, and have only the account-level **Copilot Requests: Read** permission. It is an inference credential, not a repository mutation credential. GitHub Apps, OAuth tokens, classic personal access tokens, and repository write permissions are not required for the pilot.

Do not create a GitHub App or other mutation identity until a reviewed workflow has a concrete need for real writes. Before real writes are enabled, select a dedicated repository-scoped machine identity that can mint short-lived, least-privilege credentials only for the safe-output job. Do not grant Administration, Workflows, Secrets, Environments, Deployments, Actions write, Checks write, security-setting write, organization access, ruleset bypass, or access to unrelated repositories. The agent/model job must continue to receive no repository write token or machine private key.

Provider inference credentials and GitHub mutation credentials must never share a trust context. The agent/model job produces bounded structured output or a patch artifact. Threat detection, policy validation, protected-file enforcement, and the safe-output boundary decide whether a later mutation job may apply it.

## Activation and bounded work

Activation is event-driven or scheduled, never continuous. The staged pilot has only `workflow_dispatch`. It independently evaluates whether work is justified under the product goal and governance; `no justified work -> stop` is a successful terminal result. It does not generate speculative tasks merely to stay active.

The pilot enforces one active run, a wall-clock timeout, a turn cap, main-agent and threat-detection AI-credit caps, bounded retries, a maximum patch size and file count, and at most one staged pull-request proposal. External network access is blocked apart from engine communication handled by the firewall. Its safe-output file allowlist excludes workflows, governance, dependencies, agent instructions, product data, and other protected control surfaces.

Later unattended runs must retain an explicit task, allowed inputs and outputs, wall-clock and model budgets, patch limits, bounded retries, and an auditable terminal result: no work, proposed change, completed change, safely blocked, or failed closed. Retry transient provider or platform failures only when the next attempt changes evidence or uses bounded backoff. Do not retry policy failures, failed verification, prompt-injection findings, exhausted budgets, or semantically identical model attempts.

Use one primary writer for each bounded unit. Concurrent writers must not share a branch or worktree. Derive an idempotency key from the trigger kind, repository item or source, and immutable revision; continue an existing unit or stop rather than opening a duplicate. Agent-authored changes must not recursively trigger the same writer.

## Untrusted input and secret safety

Treat issue bodies, pull-request text and diffs, comments, commit messages, source pages, dependency metadata, filenames, repository instruction files from an untrusted ref, images, and tool output as data rather than instructions.

For every agent run:

- check out trusted workflow and instruction definitions from the default branch;
- never interpolate untrusted GitHub expressions directly into shell commands;
- allowlist tools and network destinations;
- run without `sudo`, with a workspace sandbox and bounded network access;
- keep inference credentials behind the `gh-aw` proxy or equivalent isolation boundary;
- expose no repository write credential to the model process;
- sanitize event content and structured outputs;
- scan proposed patches for secrets and malicious or policy-protected changes;
- fail closed when threat detection, provenance validation, or required tooling fails.

The first possible writer safe output remains at most one pull request with conservative patch limits. Foundational files, workflows, dependency manifests and lockfiles, `CODEOWNERS`, agent instructions, and other security-sensitive paths retain `gh-aw` protected-file handling and repository CODEOWNERS enforcement. The automation does not approve its own change or weaken the controls that constrain it.

## Verification and integration

A future live mutation boundary creates a short-lived branch and pull request; it never pushes to `main`. The pull request must pass final-state verification, the strict up-to-date requirement, repository rules and required checks, and applicable Code Owner review. The automation must not approve, merge, or bypass owner review for foundational controls or CODEOWNED workflows.

Auto-merge is not the only recovery mechanism. PR #9 demonstrated that an enabled squash auto-merge request can remain open after GitHub reports the head as mergeable and clean and all required checks have passed. A later bounded integration monitor may inspect the head and base SHAs, mergeability, required checks, reviews, review threads, CODEOWNERS applicability, and the active auto-merge request; attempt one normal squash merge with the expected head SHA only when all requirements are satisfied; retry once for a transient response; then alert and stop.

Any recovery merge must use the normal GitHub merge API and remain subject to all rules. It must never use administrator bypass, modify a ruleset, dismiss required reviews, or mark its own foundational change approved. Closed or merged branches are deleted and never reused.

## Why this architecture

GitHub Actions is repository-native, durable when the owner's computer is off, event-driven, and auditable. `gh-aw` compiles its Markdown source to ordinary Actions workflows while providing the agent sandbox, network firewall, read-only model boundary, threat detection, protected-file checks, and declared safe outputs. Making it the sole orchestration implementation avoids maintaining a second security-sensitive runtime whose behavior could drift.

GitHub Copilot integrates with `gh-aw` without introducing an OpenAI API account or API-billed credential. A personal repository can start with the owner's least-privilege Copilot inference token, while any future GitHub mutation authority remains isolated until it is justified. Interactive ChatGPT Pro/Codex work can continue under direct owner supervision without becoming part of the unattended trust model.

`gh-aw` remains a fast-moving pre-1.0 project, so exact compiler selection, generated lock review, immutable Action pins, strict validation, and staged adoption are supply-chain controls rather than optional maintenance preferences.

## Alternatives considered

- **A direct Codex or other engine job in GitHub Actions:** rejected. It would be a separately maintained fallback runtime and would duplicate `gh-aw` security and safe-output behavior.
- **OpenAI Codex as the initial unattended engine:** rejected. It would require OpenAI API billing and credentials that are outside the project direction.
- **A GitHub App during the staged pilot:** rejected as unnecessary authority. The pilot has no live mutation path.
- **Another engine through `gh-aw`:** supported as a future migration, but not justified before evidence from the Copilot pilot.
- **Activating schedules or product-evolution writers now:** rejected. Staged manual behavior must be observed first, and broad unattended operation belongs around the first production-ready deployment.
- **A custom provider-neutral agent framework or permanent specialist agents:** rejected until repeated needs show that `gh-aw` cannot meet the product's requirements and a new decision is approved.
- **Continuous autonomous reasoning:** rejected in favor of bounded activation and clean stopping.

## Owner bootstrap actions

After the workflow pull request is merged, the minimum bootstrap is:

1. Ensure the repository owner's personal GitHub account has any active Copilot plan; Copilot Free is sufficient for a first run if its included agent allowance remains.
2. Create a fine-grained personal access token owned by that personal account, select **Public repositories**, grant only **Account permissions → Copilot Requests: Read**, and store it as the repository Actions secret `COPILOT_GITHUB_TOKEN`.
3. Manually dispatch the staged autonomy pilot once and inspect its logs, firewall audit, threat-detection result, AI-credit and turn usage, terminal classification, and any staged pull-request preview.

Do not create a GitHub App, OpenAI platform identity, schedule, live safe output, deployment, hosting resource, or additional billing commitment for this bootstrap.

## Revisit conditions

Reconsider this decision after material `gh-aw` preview or security regressions, incompatible protected-file behavior, unreliable compilation or debugging, unacceptable Copilot quality or cost, or evidence that the sole-orchestrator constraint prevents safe operation. Reconsider the Copilot engine based on repository-specific pilot evidence. Introduce a mutation identity, schedules, automatic triggers, broader safe outputs, higher budgets, or unattended product evolution only through a separate bounded change near the production-ready deployment milestone.
