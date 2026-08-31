---
name: assess-ai-data-readiness
description: Assess whether data and context are fit for one already bounded AI-enabled workflow decision. Use when source authority, quality, preparation, labels, privacy, lineage, economics, or failure behavior must be proven before mechanism selection or release.
---

# Assess AI Data Readiness

Decide whether the information needed for one workflow decision is authoritative, accessible, representative, timely, lawful, economical, and operable.

## Read first

1. Read [Data Readiness and Context Contracts](../../../library/16-data-readiness-and-context-contracts.md), the [data-readiness assessment](../../../templates/data-readiness-assessment.md), and [data quality and drift](../../../operations/data-quality-and-drift.md).
2. Use the approved [workflow charter](../../../templates/workflow-charter.json) and draft [data-context manifest](../../../templates/data-context-manifest.json). Read only the selected [solution context](../../../solutions/README.md) when it exposes a relevant source seam; it is not target evidence.
3. Apply `CTX-001` and `CTX-006` through `CTX-009`, plus `EVA-007`, `SEC-001`, and `VAL-001` from the [control catalog](../../../controls/control-catalog.json).

## Workflow

1. Restate the bounded decision, eligible population, exclusions, grain, keys, time semantics, accepted outcome, verifier, risk ceiling, and value ceiling.
2. Separate operational, knowledge/context, evaluation/training, and telemetry/feedback uses. A source used in several planes needs a distinct purpose, authority, access, retention, and correction rule for each use.
3. Inventory decision-critical sources where they actually live: owner, source-of-truth status, environment, interface, schema, revision, freshness, classification, access, retention, deletion, and correction behavior.
4. Follow one representative case through extraction, preparation, joins, overrides, reconciliation, and output storage. Preserve conflicts between contracts, policy, code, database state, runbooks, and practice.
5. Measure completeness, validity, uniqueness, consistency, timeliness, population coverage, and representativeness where they can change the decision. Bind owned thresholds and failure behavior for missing, stale, conflicting, corrected, or late evidence.
6. Record preparation and label lineage, final model-visible fields, privacy checks on every supported route, output ownership, correction, retention, and training-use boundaries.
7. Compare repair, constrained population, human collection or review, a smaller mechanism, and stopping. Keep one-time and recurring data cost inside the workflow value ceiling.
8. Decide `ready`, `ready_with_constraints`, `remediate`, or `stop`. Name the evidence that would change the result.

## Output contract

Return:

- a completed readiness assessment and draft or updated data-context manifest;
- the source and four-plane inventory with authority and privacy boundaries;
- decision-critical quality results, thresholds, unknowns, fallbacks, and lineage;
- remediation options with cost, delay, coverage, owner, and residual risk;
- one readiness decision and its next proof.

Do not turn a maturity score, clean sample, successful query, vector index, or model response into evidence that the target decision is data-ready.
