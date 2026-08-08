# 0002: Unattended autonomy runtime

## Status

Accepted — 2026-08-09

## Decision

Use GitHub Actions and GitHub events as the durable execution and event backbone for unattended repository work. Keep the repository's product goal, governance, resource policy, agent instructions, tests, data, and pull-request workflow as the provider-neutral contract.

Pilot [GitHub Agentic Workflows](https://github.github.com/gh-aw/) (`gh-aw`) as a pinned orchestration layer on that backbone, but do not make repository autonomy depend on it. The pilot must use an exact reviewed `gh-aw` release and exact engine release, commit both the Markdown source and compiled lock workflow, run in staged mode before enabling writes, and preserve a direct GitHub Actions engine-job fallback. `gh-aw` remains a technical preview with a fast pre-1.0 release cadence, so upgrades are supply-chain-sensitive changes rather than automatic tooling refreshes.

Use OpenAI Codex as the initial primary coding engine because it has a documented non-interactive mode and GitHub Action, works with the repository's existing `AGENTS.md` contract, and can run in an isolated GitHub-hosted environment without the owner's computer or interactive session. Use `gpt-5.6-terra` for routine bounded work and reserve `gpt-5.6-sol` for difficult architecture, security, or ambiguous failure analysis. Model and engine selection belong only in replaceable workflow configuration; neither is part of project governance or the verification contract.

Do not activate an unattended writer in this decision-record unit. The first runtime unit must be a staged, manually dispatchable, read-only discovery run. After its security and output behavior are verified, the same bounded workflow may receive a low-frequency schedule and a single `create-pull-request` safe output. Event-driven writers follow only after that scheduled path operates safely.

## Identity and authority

Create a dedicated GitHub App named for this repository and install it on `BBoyRomano/phone-compare` only. Its repository permissions are:

- Metadata: read (implicit);
- Contents: read and write;
- Pull requests: read and write;
- Issues: read;
- Checks: read;
- Actions: read.

Do not grant Administration, Workflows, Secrets, Environments, Deployments, Actions write, Checks write, security-setting write, organization access, ruleset bypass, or access to any other repository. Add Issues write later only if a reviewed workflow has a concrete need to comment, label, or open an issue. Do not add Workflows permission: unattended code work must be unable to modify Actions workflows with its machine credential.

Mint repository- and permission-scoped installation tokens at job runtime. Do not store an installation token. Store the App private key as an Actions secret available only to the safe-output/mutation job. The model job receives a read-only `GITHUB_TOKEN`, no App private key, and no repository write token. Repository rules, required checks, CODEOWNERS, and the squash-only integration path remain external to the agent and are never bypassed.

Create a dedicated OpenAI API project and a project service account for this repository. Give the service account only model-request permission, configure a low project-level hard monthly spend limit and rate limits outside the repository, and store its API key as a GitHub Actions secret. The key is a bootstrap compromise: OpenAI documents GitHub Actions workload identity federation for short-lived model tokens, but the current Codex Action and `gh-aw` Codex engine document API-key inputs rather than native workload-identity use. Replace the key with GitHub OIDC-to-OpenAI workload identity federation after that path is validated end to end with the selected Codex runner. Never use ChatGPT-managed user authentication for this public repository's unattended jobs.

Provider credentials and GitHub mutation credentials must never share a trust context. The agent/model job produces a bounded structured output or patch artifact. A separate threat-detection and validation boundary decides whether a narrowly scoped mutation job may apply it.

## Activation and bounded work

Activation is event-driven or scheduled, never continuous. Initial activation order is:

1. owner-dispatched staged discovery with no writes;
2. weekly scheduled discovery on the trusted default-branch state;
3. trusted repository events such as failed required checks, Dependabot or code-scanning signals, and workflow failures;
4. external issues, pull requests, comments, corrections, and web/source changes only through a separate untrusted-input triage stage;
5. authoritative product-source monitoring only when a bounded incremental mechanism exists.

Every activation independently evaluates whether work is justified under the product goal and governance. `no justified work -> stop` is a successful outcome. Discovery does not create speculative tasks merely to keep the system active.

Use one primary writer for each bounded unit. It may delegate independent read-heavy research, verification, or review, but concurrent writers must not share a branch or worktree. Later concurrency may run multiple independent units with one branch/worktree and one resource budget per unit, a repository-wide writer cap of two, and a per-unit concurrency key that serializes duplicate events. Do not introduce durable specialist-agent roles without repeated evidence that a stable role is useful.

Derive an idempotency key from the trigger kind, repository item or source, and immutable revision. Use that key in the branch name and persisted run metadata. If the same unit already has an open branch or pull request, continue that unit or stop; do not open a duplicate. An agent-authored pull request or push must not retrigger its own writer. Trigger filters must ignore the automation App, automation branch prefix, and already-recorded idempotency key.

Each run must have an explicit task, allowed outputs, wall-clock timeout, turn/model budget, and maximum patch size. Retry transient provider or platform failures at most twice with changed evidence or backoff. Do not retry policy failures, failed verification, prompt-injection findings, exhausted budgets, or a repeated semantically identical model attempt. Persist an auditable terminal result: no work, proposed change, completed change, safely blocked, or failed closed.

## Untrusted input and secret safety

Treat issue bodies, pull-request text and diffs, comments, commit messages, source pages, dependency metadata, filenames, repository instruction files from an untrusted ref, images, and tool output as data rather than instructions.

The first stage that can read arbitrary community content may classify and summarize it but cannot write code, access model or GitHub mutation credentials outside its own narrow need, or expand permissions. A writer must re-evaluate a structured candidate against trusted default-branch governance, verify cited evidence independently, and receive only the minimum relevant untrusted content.

For every agent run:

- check out trusted workflow and instruction definitions from the default branch;
- never interpolate untrusted GitHub expressions directly into shell commands;
- allowlist tools and network destinations;
- run without `sudo`, with a workspace sandbox and bounded network access;
- keep provider credentials behind a proxy or equivalent isolation boundary;
- expose no repository write credential to the model process;
- sanitize event content and structured outputs;
- scan proposed patches for secrets and malicious or policy-protected changes;
- fail closed when threat detection, provenance validation, or required tooling fails.

The initial writer safe output is at most one pull request with a conservative patch limit. Foundational files, workflows, dependency manifests, lockfiles, `CODEOWNERS`, agent instructions, and other security-sensitive paths retain `gh-aw` protected-file handling and repository CODEOWNERS enforcement. The automation does not approve its own change or weaken the controls that constrain it.

## Verification and integration

The mutation boundary creates a short-lived branch and pull request; it never pushes to `main`. The pull request must pass the repository's final-state verification, strict up-to-date requirement, CodeQL/ruleset gates, and any applicable Code Owner review. The App may enable squash auto-merge only when the change is eligible and no owner-controlled approval is required.

Auto-merge is not the only recovery mechanism. PR #9 demonstrated that an enabled squash auto-merge request can remain open after GitHub reports the head as mergeable and clean and all required checks have passed. GitHub's documented behavior says such a pull request should merge automatically, so the observed state is treated as a platform/API anomaly rather than a reason to weaken protections.

A bounded integration monitor must:

1. inspect the current head SHA, base SHA, mergeability, merge state, required checks, reviews, review threads, CODEOWNERS applicability, and active auto-merge request;
2. stop and report the specific requirement when the pull request is genuinely blocked;
3. after a short grace period, attempt one normal squash merge using the expected head SHA when all requirements are satisfied;
4. refresh state and retry once only for a transient platform response;
5. persist an operational alert and stop if an eligible pull request still cannot merge.

The recovery merge must use the normal GitHub merge API and remain subject to all rules. It must never use administrator bypass, modify the ruleset, dismiss required reviews, or mark its own foundational change approved. Closed or merged branches are deleted and never reused.

## Why this architecture

GitHub Actions is repository-native, durable when the owner's computer is off, event-driven, auditable, and already enforces the project's verification workflow. GitHub App installation tokens give the unattended system a dedicated identity with repository scope, one-hour credentials, and permissions independent of the owner's personal account.

`gh-aw` offers a useful provider-neutral workflow description and, more importantly, a tested separation between read-only agent execution, threat detection, and declared safe outputs. It supports Codex, Copilot, Claude, Gemini, and experimental additional engines. Its technical-preview maturity and operational churn make an exact-version staged pilot appropriate, not unconditional adoption. Because it compiles to ordinary Actions workflows, removing it later does not require changing project policy, tests, GitHub Flow, or repository protections.

The repository contract remains usable by another engine. A migration changes the engine block, provider credential, and any engine-specific sandbox configuration. It does not rewrite the product goal, governance, resource policy, `AGENTS.md`, tests, data provenance rules, bounded-unit workflow, or integration gates.

## Alternatives considered

- **Direct `openai/codex-action` as the whole control plane:** supported and the fallback, but safely separating untrusted model execution from mutation, sanitizing outputs, and implementing protected-file and threat-detection behavior would recreate a small custom orchestration framework.
- **Codex cloud/background tasks:** useful for parallel supervised work, but current setup begins with an interactive ChatGPT account and connected GitHub account and emphasizes human review. It is not the durable machine-identity event backbone.
- **GitHub Copilot cloud agent and Copilot automations:** credible repository-scoped managed options with firewalls and tool controls, but they add Copilot plan/AI-credit coupling and a more GitHub-specific execution contract. Re-evaluate them if managed automation becomes materially safer or cheaper than the pinned `gh-aw` pilot.
- **Copilot or another engine through `gh-aw`:** supported and preserves the migration path, but changing the primary engine before the first pilot would add uncertainty without solving a current limitation.
- **A custom provider-neutral agent framework:** rejected until the project has repeated requirements that existing orchestration cannot meet.
- **Permanent specialist agents:** rejected; temporary subagents are a per-unit implementation choice, not an organizational architecture.
- **Continuous autonomous reasoning:** rejected in favor of bounded event and scheduled activation.

## Owner bootstrap actions

The one-time external actions, in order, are:

1. Create the repository-scoped GitHub App with exactly the permissions above, install it only on `BBoyRomano/phone-compare`, create one private key, and add its App/client identifier and private key as repository Actions secrets. Do not grant bypass or Workflows permission.
2. Create the dedicated OpenAI project and service account, restrict it to model requests, set a low project hard monthly spend limit plus rate limits, create one project service-account API key, and add it as a repository Actions secret. Do not use a personal ChatGPT/Codex session token.
3. Review and approve the future owner-controlled workflow pull request that pins `gh-aw` and Codex, begins in staged manual-dispatch mode, and requests no broader GitHub permissions.
4. After reviewing one successful staged run and its artifacts, authorize the separately proposed schedule/write transition. This is a bounded follow-up change, not part of the bootstrap decision.

No hosting, deployment, release, billing destination, repository-rule, or branch-protection change is part of this architecture bootstrap.

## Revisit conditions

Reconsider `gh-aw` after material preview/security regressions, incompatible protected-file behavior, unreliable compilation or debugging, unacceptable cost, or a stable direct/managed alternative with equal safety and better operations. Reconsider the primary model based on repository-specific task-quality and cost evidence. Replace the service-account API key when the selected runner has verified workload-identity support. Increase concurrency, triggers, permissions, or safe outputs only through a separate bounded decision supported by operational evidence.
