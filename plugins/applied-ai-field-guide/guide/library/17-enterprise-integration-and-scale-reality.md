# Enterprise Integration and Scale Reality

Production AI work rarely starts with a clean API, stable identity model, or empty database. A bounded workflow may depend on old transactional systems, scheduled extracts, disputed field meanings, manual reconciliation, restricted networks, and operating teams that own different parts of the truth.

This chapter connects the Guide's clean contracts to that deployment reality. It does not prescribe a universal enterprise stack. It shows what a delivery team must observe, preserve, and prove before a teaching implementation or narrow slice can support a target-system claim, whether it works internally or across a customer boundary.

## Start with the enterprise seam

Do not treat “connect the data” as one technical task. Separate at least these concerns:

| Seam | Field question | Required result |
| --- | --- | --- |
| Source authority | Which system and owner decide each field, state, and correction? | A source contract with owner, revision, freshness, and conflict behavior. |
| Extraction | How do changes leave the source: API, event, database log, file, report, or manual export? | A bounded extraction path with cursor, completeness, replay, and failure semantics. |
| Preparation | How are keys joined, codes interpreted, duplicates handled, and historical corrections applied? | Versioned transformations, reconciliation totals, quarantine, and backfill lineage. |
| Identity and policy | Which human and workload identities may see each row or field and perform each action? | Current service-layer authorization with tenant, resource, purpose, and policy revision; row- and column-level controls only as defense in depth. |
| Execution | Which work must survive interruption, contention, or duplicate delivery? | Explicit state, ordering, idempotency, backpressure, and effect-verification behavior. |
| Environment and operation | How do builds, configuration, evidence, and fixes move through restricted environments? | Reproducible promotion, rollback, recovery, audit, support, and retirement evidence. |

An architecture diagram can hide all six seams behind one box labeled “ERP” or “enterprise data.” Field work must open the box. Record what was directly observed, what an owner stated, what a system enforces, and what remains inferred. `FDE-001`, `CTX-001`, `CTX-005`.

## Observe the path, not only the schema

Before selecting a mechanism, follow one representative case from creation through correction, failure, and handoff. Ask:

1. Where is the business object first created, and where can it later be corrected?
2. Which identifiers survive across systems, exports, mergers, regions, and retries?
3. Which timestamps mean event time, processing time, posting time, or last edit?
4. Which fields are authoritative, copied, calculated, delayed, or manually overridden?
5. What disappears from extracts because of filters, soft deletion, late posting, or access policy?
6. How does an operator detect a missing, duplicated, stale, or misjoined record today?
7. Which totals, source queries, or control reports establish completeness?
8. Who may approve a mapping, backfill, exception, policy change, or production replay?
9. What network, residency, change-window, or air-gap constraint changes the delivery path?
10. Who owns the pipeline after the embedded delivery team leaves?

The result is not a generic data inventory. It is a decision-bound contract for the selected workflow. Use the [field-observation log](../templates/field-observation-log.md), [data-readiness assessment](../templates/data-readiness-assessment.md), and [data-context manifest](../templates/data-context-manifest.json). When complexity or change frequency justifies it, add the [system-map manifest](../templates/system-map-manifest.json); the map remains derived evidence, not authority.

## Specify operating properties before deployment location

Unattended or shared execution needs durable state, schedulable availability, current identity, controlled team access, observable runs, cancellation, recovery, and owned operation. Those are requirements; “cloud” is not. Public cloud, private cloud, VPC, on-premises, hybrid, restricted-network, and local development paths may satisfy different parts of the target contract. Select the environment from data classification, residency, network, dependency, availability, support, cost, recovery, and customer-ownership evidence.

A developer laptop is a valid development surface, not evidence of an unattended service. If a workflow must continue without its creator logged in, prove restart-safe state, scheduled or event-driven admission, workload identity, team-owned configuration, support, recovery, and retirement in the target environment. Do not call a system mature because it is “headless,” multi-agent, or highly automated; maturity comes from accepted outcomes and exercised operating evidence. [R26-83](../research/2026-08-26--agentic-operating-maturity-field-report.md#r26-83)

A typed API is often the right automation surface, but API-first is not an authority model. The same trusted software boundary should support appropriate API, CLI, MCP, event, and user-interface projections while enforcing identity, tenancy, purpose, authorization, idempotency, limits, audit, cancellation, and source-of-truth readback. Do not move a workload to the cloud or add an API merely to qualify it as a software factory. [R26-81](../research/2026-08-28--warp-self-improving-software-factories.md#r26-81)

## Treat legacy integration as product behavior

An extraction or connector is part of the service's behavior. It can change eligibility, evidence, timing, cost, and authority even when the model and prompt do not change.

For every decision-bearing path, declare:

- source object, owner, interface, revision, and freshness objective;
- extraction cursor, overlap window, ordering, deletion, and late-arrival behavior;
- schema and semantic version, including code-list and timezone interpretation;
- stable operation and business-object identities;
- transformation build, inputs, outputs, quarantine, and replay lineage;
- reconciliation method, expected totals, tolerances, and accountable reviewer;
- credential, tenant, purpose, network, egress, and residency boundaries;
- backfill, migration, rollback, and retirement procedure;
- cost, throughput, dependency, and human-review ceilings.

A successful request or completed batch is not evidence that the business population is complete. Reconcile the accepted target population against an independently obtained source total or control report. Preserve differences, corrections, and inconclusive runs rather than quietly rewriting them. `CTX-006`, `CTX-008`, `CTX-009`, `REL-003`.

## Hostile worked scenario: the missing order hold

This fictional scenario is a practice case, not a benchmark or customer claim.

An applied-AI team is asked to recommend which enterprise orders can be released from a manual credit hold. The sold brief says that an overnight warehouse table combines the order platform, billing system, customer master, and credit policy. A local prototype performs well on exported rows.

Field observation finds five contradictions:

1. The warehouse omits same-day order amendments, while operators make release decisions throughout the day.
2. The order and billing systems use different customer identifiers after a regional migration; a default join silently drops some active accounts.
3. A “current balance” column is overwritten after dispute adjustments, so the extract cannot reconstruct what the approver saw.
4. Directory-group membership grants application access but does not establish authority to release a hold; authority depends on region, amount, and an independently managed delegation table.
5. Production is in a restricted network. Build artifacts enter through a signed promotion process, and support staff cannot query raw customer fields from the normal observability environment.

The safe response is not to make the agent more capable. Reframe the slice:

- keep the system recommendation-only;
- use the order system as the current-order source and the billing system as the balance source;
- introduce an owned cross-reference table with unmatched records quarantined;
- retain the source revisions and decision-time values used for every recommendation;
- require the existing release service to recheck current authority and business state;
- reconcile daily eligible, excluded, unmatched, recommended, approved, and released populations;
- promote the exact build, policy, mapping, and evaluation bundle through the restricted release path;
- stop or route to manual review on stale extracts, unmatched identities, policy drift, or missing readback.

Only after these conditions pass should the team compare deterministic policy, a statistical model, or another mechanism for the recommendation step. The integration and authority defects are not model problems. `ARC-004`, `IAM-002`, `SEC-005`, `REL-001`.

## Map teaching components to production responsibilities

The Guide's executable examples use small in-memory fixtures so readers can inspect contracts and failure behavior. Replace each teaching convenience with target-appropriate evidence; do not translate the code line for line.

| Teaching component | Target-system responsibility | Evidence before a production claim |
| --- | --- | --- |
| In-memory objects or maps | Durable business and workflow state with ownership, migration, retention, and recovery | Restart, restore, replay, migration, corruption, and recovery-point tests. |
| Direct function calls | Synchronous request or durable asynchronous execution chosen from workload needs | Timeout, cancellation, ordering, contention, duplicate-delivery, and backpressure tests. |
| Process-local retry flags | Stable business-operation identity and service-enforced idempotency | Concurrent retry and ambiguous-effect cases produce one verified business effect. |
| Hard-coded policy or role | Current policy decision using authenticated human or workload identity | Allow, deny, stale-policy, deprovisioning, delegated-authority, and cross-tenant tests. |
| Tenant field in a fixture | Tenant-bound authorization across service, storage, cache, jobs, encryption, tools, and telemetry | Cross-tenant negative tests plus row- and column-filter bypass attempts. |
| Arrays or console logs | Structured, access-controlled, retention-bound forensic evidence | Completeness, redaction, append-only or tamper-evident retention, and incident reconstruction tests. |
| Fixture reset | Owned migration, rollback, reconciliation, and disaster recovery | Exercised RPO/RTO, pending-effect reconciliation, and restoration verification. |
| Local test pass | Exact target release evidence for representative load, dependencies, identities, and failure modes | Reproducible release bundle, evaluation report, canary, rollback, and operating ownership. |

Queues, caches, distributed workers, row-level security, column-level security, and immutable audit storage are not mandatory by category. They become required when the declared workflow, risk, regulation, workload, or operating objective demands them. The design record must explain the applicability decision and the evidence that supports it.

## Evidence required at the target boundary

Use the [production service readiness record](../templates/production-service-readiness.md) rather than a generic “enterprise ready” label. For applicable dimensions, require visible target-system evidence for:

- source completeness, semantic correctness, schema drift, late arrival, deletion, backfill, and reconciliation;
- authenticated identity, deprovisioning, delegation, tenant isolation, row and field access, and approval freshness;
- restart, replay, recovery, migration, duplicate delivery, concurrent updates, hot keys, and effect-unknown resolution;
- representative steady load, burst load, dependency throttling, backpressure, reviewer capacity, and cost ceilings;
- network segmentation, egress denial, credential rotation, artifact provenance, restricted-environment promotion, and rollback;
- trace completeness, sensitive-data minimization, audit integrity, incident reconstruction, retention, deletion, and legal hold where applicable;
- receiving-team operation, support, change, recovery, and retirement exercises.

Evidence from a development fixture may justify the next engineering step. It cannot be relabeled as evidence from the target identity provider, database, network, source system, workload, or operating team. `DEL-001`, `DEL-002`, `EVA-001`, `OPS-007`.

## Decide what remains local and what should compound

Keep customer-specific schemas, identifiers, credentials, access rules, network details, reconciliations, and operating decisions in the authorized target environment. Productize only sanitized contract shapes, failure classes, test methods, connector primitives, policy boundaries, and runbook patterns after recurrence is evidenced across independent contexts and the receiving product owner accepts the maintenance obligation. `FDE-004`.

The default disposition for this chapter is **configure and validate existing foundations**, not create a new universal platform. Use the [integration-runtime accelerator](../solutions/integration-runtime.md) for durable connector behavior, the [enterprise-foundation accelerator](../solutions/enterprise-foundation.md) for identity and tenant lifecycle, and [deployment and operations](../solutions/deployment-and-operations.md) for promotion and service ownership.

## What this does not prove

This chapter does not establish that enterprise plumbing consumes a fixed share of delivery time, that every deployment needs the same infrastructure, or that a local example will scale after substituting a database and queue. It does not prove compatibility with any ERP, identity provider, network, data platform, regulation, workload, or customer environment.

Production claims require current evidence from the declared target system, population, release, identities, dependencies, workload, and operating team. Keep examples small enough to understand; make the target evidence strong enough to trust.
