# Data Preparation and Context Pipeline

## Use when

Use this blueprint when a consequential workflow depends on operational records, documents, labels, retrieved context, derived features, or generated output data. It applies to deterministic, optimization, classical-ML, model-call, and agent systems.

## Components

1. **Source adapters** read exact tenant, population, revision, and field scopes.
2. **Immutable evidence store** retains permitted raw references and source metadata.
3. **Profiler** measures decision-critical quality by segment and time window.
4. **Preparation jobs** perform versioned parsing, normalization, reconciliation, redaction, chunking, indexing, feature engineering, and aggregation.
5. **Lineage recorder** binds source revisions, job versions, output digests, and run times.
6. **Context broker** enforces purpose, identity, permission, freshness, and evidence-sufficiency policy.
7. **Context packet compiler** produces a decision-scoped, versioned projection of permitted model-visible facts and binds its workflow and segment, source and policy revisions, preparation versions, freshness, sensitivity, provenance, digest, and compatible model routes.
8. **Evaluation boundary** isolates cases, labels, reference answers, and contamination-sensitive data.
9. **Output registrar** assigns ownership, provenance, correction, retention, deletion, and downstream-use policy to generated data.
10. **Quality and drift monitor** detects source, schema, permission, coverage, transformation, label, and population changes.
11. **Reconciliation queue** routes unknown, stale, conflicting, corrected, or late data to an accountable owner.

## Trust boundaries

- Source adapters authenticate at the source and never expand caller, tenant, or field scope.
- Retrieved and user-supplied content remains untrusted data.
- Derived indexes, features, embeddings, and graphs carry provenance but do not become authorization or source-of-truth policy.
- A compiled context packet is a runtime projection of the admitted data-context manifest and behavior bundle. It contains only fields permitted for the selected route and cannot grant authority, repair missing evidence, or expose protected evaluation answers.
- Evaluation answers and hidden fixtures are not accessible to runtime routes.
- Telemetry and corrections do not become labels or training data without an approved label and use contract.
- Model output cannot change source authority, quality status, retention, or release admission.

## State

`scoped -> inventoried -> profiled -> prepared -> reconciled -> evaluated -> admitted -> monitored`

Failure states are first-class: `missing`, `stale`, `conflicting`, `permission_denied`, `schema_changed`, `coverage_failed`, `label_disputed`, `lineage_unknown`, `drifted`, `rebaseline_required`.

## Failure behavior

- Missing or stale critical data stops or falls back before the consequential decision.
- Conflicting sources follow declared precedence and owner adjudication.
- A corrected source invalidates affected derived context and queues bounded replay.
- Schema, permission, or preparation-version changes invalidate admission until compatibility and regression checks pass.
- Unknown packet lineage, failed privacy validation, expired freshness, revoked field permission, or an incompatible provider route stops before model invocation and follows the declared fallback.
- Coverage or representativeness failure constrains the eligible segment rather than being hidden in an aggregate.
- Unknown output ownership blocks durable downstream use.

## Telemetry

Record source and schema revisions, profile snapshot, preparation versions and digests, lineage run, context-packet ID and digest, policy and route revisions, privacy-validation result, sufficiency result, missing/stale/conflict status, segment, output record, correction, drift alert, fallback, cost, and linked accepted outcome. Do not emit raw sensitive fields or retain the packet merely to make monitoring convenient.

## Release tests

- Exact source, schema, preparation, context, evaluation, and release bindings validate.
- Missing, stale, conflicting, corrected, and late-arriving inputs exercise their declared behavior.
- Cross-tenant, over-field, expired-purpose, and permission-revocation reads fail before return.
- Segment coverage and representativeness thresholds are enforced.
- Label disagreement and answer-key access fail closed.
- Transformation and index changes invalidate stale evidence.
- Source, policy, preparation, enrichment, redaction, or route changes invalidate affected context packets and queue bounded replay.
- Inspect the final serialized outbound request for primary, retry, fallback, and provider-failover paths; forbidden sensitive fields must remain absent from requests, error payloads, logs, traces, and caches.
- Output correction, supersession, retention, and deletion are exercised.
- Production drift triggers constrain, replay, rollback, or rebaseline as declared.

Controls: `CTX-001`, `CTX-002`, `CTX-003`, `CTX-006`, `CTX-007`, `CTX-008`, `CTX-009`, `IAM-002`, `IAM-003`, `EVA-001`, `EVA-006`, `OPS-001`, `OPS-002`, `OPS-005`.

Evidence: [R26-82](../research/2026-08-18--healthcare-claims-context-and-evaluation.md#r26-82) is a qualified practitioner field report. It supports testing the pattern, not its healthcare claims, topology, variable count, or performance result.
