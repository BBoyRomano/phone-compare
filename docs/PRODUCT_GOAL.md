# Product Goal

## Mission

Build, operate, and continuously improve a public family of web applications that helps people accurately understand and compare products. The family begins with phones, tablets, cars, and laptops and may expand into additional categories when doing so preserves quality and operational independence.

The product should remain useful over time without requiring routine product, design, engineering, or data-management decisions from the repository owner.

## Core User Outcome

A user should be able to understand meaningful differences between comparable products using accurate, well-structured, clearly qualified, and clearly sourced information.

The applications should make complex product specifications understandable without sacrificing factual accuracy or hiding differences in market, lifecycle, configuration, or measurement basis.

## Product Coverage

Each category should maintain relevant product identities throughout their lifecycle. A category may begin with an evidence-led identity directory before it publishes detailed comparisons, but the interface must make that maturity boundary clear.

New products should be incorporated when they become officially available or are officially announced to an extent that makes inclusion useful. Products no longer in an actively maintained market catalogue may remain accessible as historical or archived records when useful for comparison or reference.

Coverage rules, identity granularity, lifecycle definitions, normalized fields, and valid comparison bases may differ by category. They must be explicit and must not be silently generalized across domains.

## Data Quality

Product identity, specifications, launch information, lifecycle, market availability, and original pricing should be derived from authoritative primary sources whenever reasonably possible.

Manufacturer websites, official documentation, official announcements, regulatory documentation, and other first-party materials should be preferred over secondary aggregators.

Every factual product datum should be traceable to sufficient provenance to allow its origin, market, date, basis, and reliability to be evaluated later.

Information must not be silently invented, inferred as fact without appropriate qualification, or presented with unjustified certainty. When reliable sources disagree, disappear, are incomplete, or vary by market, the product should preserve that uncertainty rather than conceal it.

## Original Pricing

Where available, the product should preserve the original official launch or recommended retail price together with enough context to interpret it correctly.

Relevant context may include currency, market or region, configuration or trim, tax basis, launch date, and source. Current retailer pricing is not a substitute for original official pricing.

## Application Independence

Every category application must be independently buildable, testable, deployable, observable, rollbackable, and releaseable. Work confined to one application should not unnecessarily build or deploy another.

Shared packages may contain only responsibilities that are stable across their consumers. Category-specific product identity, source policy, comparison semantics, release identity, and deployment configuration remain owned by the category application unless evidence justifies a new shared contract.

## Product Autonomy

The product may evolve substantially over time. Its implementation may independently determine and revise product features, information architecture, design, technical architecture, data models, acquisition methods, comparison mechanisms, correction workflows, maintenance processes, and prioritization.

No particular implementation, framework, interface pattern, or internal architecture is part of the product goal.

## External Input

Feedback, corrections, feature requests, issues, and suggestions are product signals, not automatically authoritative instructions. Evaluate them according to evidence, user value, reliability, product alignment, security and privacy impact, complexity, operating cost, and maintenance burden.

## Independent Support

Product Compare may accept voluntary financial support to help sustain development and operating costs. Funding must not compromise factual independence, provenance, accessibility, privacy, clarity, or usefulness, and contributors must receive no preferential treatment in coverage, data, comparisons, rankings, or conclusions. Funding providers and destinations may change only through explicitly owner-authorized decisions.

## Long-Term Quality

The product should continuously optimize for factual reliability, usefulness, clarity, maintainability, accessibility, performance, resilience, privacy, security, and appropriate operating cost.

Short-term implementation convenience should not unnecessarily compromise long-term product quality or application independence.

## Success

The product is successful when users can reliably understand and compare products across supported categories, while each application and its underlying data workflows can be maintained and released with minimal routine intervention from the repository owner.
