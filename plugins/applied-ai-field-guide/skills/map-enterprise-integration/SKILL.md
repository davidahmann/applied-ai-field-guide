---
name: map-enterprise-integration
description: Map and de-risk the enterprise seams around an approved AI-enabled workflow. Use when legacy sources, extraction, reconciliation, identity, permissions, durable execution, restricted environments, migration, or operating ownership could invalidate a design or pilot.
---

# Map Enterprise Integration

Open the boxes hidden behind labels such as ERP, data platform, identity, workflow tool, and production environment before implementation claims are made.

## Read first

1. Read [Enterprise Integration and Scale Reality](../../guide/library/17-enterprise-integration-and-scale-reality.md), the [integration runtime](../../guide/solutions/integration-runtime.md), and the [production service readiness record](../../guide/templates/production-service-readiness.md).
2. Use the approved workflow charter and [data-context manifest](../../guide/templates/data-context-manifest.json). Add the [system-map manifest](../../guide/templates/system-map-manifest.json) only when complexity or change frequency justifies it.
3. Read only one selected [solution pattern](../../guide/solutions/README.md) when useful; it is a hypothesis, not observed target architecture.
4. Apply `FDE-001`, `CTX-001`, `CTX-005` through `CTX-009`, `IAM-001` through `IAM-003`, `REL-001` through `REL-005`, and `DEL-002`.

## Workflow

1. Follow one representative business object from creation through correction, exception, handoff, and recorded outcome. Distinguish event, processing, posting, and edit time.
2. Map source authority, extraction, preparation, identity and policy, execution, environment, and operations as separate seams.
3. For each seam, record owner, observed interface, identifiers, revision, cursor or ordering, completeness and reconciliation, authorization, tenant and field scope, failure behavior, replay, and support path.
4. Inspect relevant code or configuration, data and control totals, identity and delegation rules, a representative execution or failure, and the actual promotion path. Record inaccessible evidence as an unknown or blocker.
5. Derive the required state, idempotency, backpressure, cancellation, recovery, audit, load, network, residency, and restricted-environment properties before choosing deployment technology.
6. Separate a development convenience from target proof. Replace in-memory, direct-call, local-identity, and unrestricted-network assumptions with target-specific evidence.
7. Identify the smallest integration slice and the conditions that keep it recommendation-only, manual, quarantined, or stopped.
8. Decide `proceed`, `constrain`, `remediate`, or `stop`, with validation, rollback, receiving owner, and exit evidence.

## Output contract

Return:

- an enterprise-seam map grounded in observed sources and owners;
- unresolved source, reconciliation, identity, execution, environment, and ownership risks;
- required operating properties and the smallest target-appropriate slice;
- validation, load, recovery, migration, rollback, and transfer evidence still needed;
- one bounded integration decision.

Do not infer production readiness from a working API, laptop prototype, architecture diagram, cloud deployment, or successful sample batch.
