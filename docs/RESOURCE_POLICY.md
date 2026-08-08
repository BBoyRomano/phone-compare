# Resource Policy

## Purpose

This document defines how autonomous work should use limited compute, model, tool, and external-service resources.

It describes operating policy only.

Hard enforcement of spending, usage, access, and rate limits must exist outside the agent's control.

## General Principle

Use the least expensive and least complex method that can reliably complete the work.

Autonomy does not imply continuous activity.

The agent should perform justified work, persist the result, and stop.

## Bounded Work

Each autonomous run should pursue a bounded objective.

Avoid open-ended loops such as:

- repeatedly searching for possible improvements;
- repeatedly reviewing already validated work;
- continuing optimization without evidence of a meaningful problem;
- retrying the same failed approach indefinitely;
- generating speculative work merely because resources remain available.

When a task is too large for one bounded run, split it into independently useful steps.

## Model Usage

Use stronger or more expensive reasoning only when the task justifies it.

Prefer lower-cost execution for routine work such as:

- classification;
- extraction;
- formatting;
- straightforward code changes;
- repetitive validation;
- summarization;
- simple source processing.

Escalate to stronger reasoning when needed for matters such as:

- difficult architecture decisions;
- ambiguous failures;
- conflicting evidence;
- complex debugging;
- high-impact reviews.

Do not repeatedly invoke stronger reasoning when previous attempts have not introduced new evidence.

## Retries

Retries must be bounded.

A failed attempt should produce information that changes the next attempt.

Do not repeat substantially identical model calls or tool actions hoping for a different outcome.

When repeated attempts fail:

1. inspect the failure;
2. change the approach if justified;
3. escalate only when additional reasoning is likely to help;
4. record the task as blocked when continued work would be wasteful.

## Research and Data Collection

Research should be driven by a concrete information need.

Prefer primary sources and previously verified local knowledge when sufficient.

Do not repeatedly retrieve unchanged sources without a reason to believe their relevant information has changed.

Data acquisition processes should minimize unnecessary full rescans where incremental or change-based checks are practical.

## Persistent State

Persist durable results when doing so prevents unnecessary rediscovery or repeated work in future runs.

Durable project state must not depend solely on model conversation history.

Choose the appropriate persistence mechanism according to the information being retained and the architecture of the product.

## Event-Driven Operation

Prefer event-driven or scheduled activation over continuous autonomous reasoning.

Useful triggers may include:

- a known maintenance schedule;
- a changed authoritative source;
- a newly announced device;
- a failed test or deployment;
- a production incident;
- a submitted correction or issue;
- a dependency or security event.

An activation should end when its bounded work is complete or no justified next action remains.

## Tool Usage

Use tools only when their output is relevant to the active objective.

Avoid broad or repetitive tool calls when a narrower operation is sufficient.

Operations with meaningful external cost, irreversible consequences, or large resource usage should be especially deliberate.

## Graceful Exhaustion

When approaching an externally enforced resource limit:

- prioritize correctness and repository integrity;
- finish or safely checkpoint the current coherent unit of work when possible;
- persist state needed for later continuation;
- avoid starting optional work;
- stop cleanly.

Resource exhaustion is not permission to bypass validation or safeguards.

## External Enforcement

Concrete usage limits may include:

- model requests;
- tokens;
- tool calls;
- wall-clock runtime;
- concurrent workers;
- external API spending;
- infrastructure spending;
- scheduled-run frequency.

Their actual values and enforcement mechanisms should be configured outside the autonomous agent's writable authority.

The agent may observe remaining budget when that information is provided, but must not increase, disable, circumvent, or redefine externally imposed limits.
