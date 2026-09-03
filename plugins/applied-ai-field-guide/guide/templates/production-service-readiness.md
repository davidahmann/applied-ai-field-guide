# Production Service Readiness

Use this record for one declared workflow slice and release before shadow, canary, bounded execution, or customer handoff. It assembles target-specific evidence against the Guide's existing controls; it is not a certification, a generic infrastructure checklist, or a substitute for the exact release record and approval path.

Do not calculate a readiness score. One unresolved high-consequence boundary can hold a release even when every other row is strong.

## Assessment identity

| Field | Value |
| --- | --- |
| Workflow, segment, and environment | — |
| Release ID, version, and digest | — |
| Requested release gate or rollout | Design / sandbox / shadow / canary / bounded segment / full segment / handoff |
| Actor mode and maximum effect | — |
| Assessment owner and date | — |
| Technical, operational, risk, and receiving-service reviewers | — |
| Evidence cutoff and review due | — |

## Status contract

Use only the following statuses. Status describes the maturity of evidence for the declared slice; it does not authorize release.

| Status | Meaning |
| --- | --- |
| `required` | The dimension applies, but its evidence has not yet been assessed. |
| `not applicable` | The dimension does not apply to this slice; record the owner-approved rationale and the trigger that would make it apply. |
| `unresolved` | The dimension applies and required evidence, ownership, or a design decision is missing, stale, or conflicting. |
| `designed` | A bounded design and owner exist, but target-specific behavior has not been exercised. |
| `tested` | Current target-specific evidence exercises the declared design under representative and negative cases; production operation is not implied. |
| `operational` | Current production evidence shows the declared control is owned, monitored, and recoverable for the named segment and review window. |

Architecture prose, intended configuration, generated output, and model judgment cannot by themselves advance a row beyond `designed`. `tested` requires executable target-system evidence. `operational` additionally requires current production telemetry, exercised ownership, and recovery evidence.

## Readiness matrix

Start every row as `required`. Change a row to `not applicable` only with a named owner, target-specific rationale, and an applicability trigger. Keep customer or target-system evidence separate from Guide control references.

| Dimension | Status | Accountable owner | Target-system evidence and revision | Gap and next proof | Guide controls |
| --- | --- | --- | --- | --- | --- |
| Identity and authorization | required | — | — | — | `IAM-001`, `IAM-002`, `IAM-003`, `SEC-005` |
| Source integration, reconciliation, and environment constraints | required | — | — | — | `CTX-001`, `CTX-005`, `CTX-006`, `CTX-008`, `CTX-009`, `DEL-002`, `SEC-006`, `SEC-007` |
| Durable state and data recovery | required | — | — | — | `STA-001`, `STA-002`, `STA-003`, `OPS-005` |
| Async work, concurrency, retries, and idempotency | required | — | — | — | `REL-001`, `REL-002`, `REL-004`, `OPS-005` |
| Rate, cost, and capacity limits | required | — | — | — | `REL-002`, `TOL-005`, `CST-001`, `CST-002` |
| Telemetry, alerts, and service objectives | required | — | — | — | `OPS-001`, `OPS-004`, `OPS-006` |
| Failure, degraded operation, and rollback | required | — | — | — | `DEL-002`, `OPS-002`, `OPS-003`, `CTX-009` |
| Evaluation and human-AI deployment qualification | required | — | — | — | `EVA-001`, `EVA-002`, `EVA-003`, `EVA-005`, `EVA-006`, `HUM-003` |
| Operator workflow, adoption, and review capacity | required | — | — | — | `ADP-001`, `FDE-003`, `VAL-002`, `OPS-006` |
| Scaling assumptions and limits | required | — | — | — | `REL-004`, `SEC-005`, `CST-002` |
| Service ownership and evidence lifecycle | required | — | — | — | `ADP-002`, `DEL-001`, `OPS-007` |

## Dimension prompts

### Identity and authorization

- Name interactive and unattended identities, tenant binding, current scopes, policy revision, and the action-boundary recheck.
- Record denial, stale-policy, deprovisioning, and cross-tenant tests where applicable.

### Source integration, reconciliation, and environment constraints

- Name each source owner, interface, extraction cursor, schema and semantic revision, freshness objective, deletion and late-arrival behavior, transformation build, quarantine, and independent reconciliation.
- Exercise incomplete extracts, unmatched keys, corrected history, backfills, schema drift, restricted-network promotion, artifact provenance, credential rotation, and rollback where applicable.
- A completed request, file load, or batch proves transport only. Advance the row to `tested` only when target-system evidence reconciles the declared business population and failure cases.
- Use [Enterprise Integration and Scale Reality](../library/17-enterprise-integration-and-scale-reality.md) to map local or teaching components to target responsibilities without mandating one infrastructure stack.

### Durable state and data recovery

- Classify workflow and business state; record source of truth, retention, deletion, recovery point, replay, and migration behavior.
- A database is required only when the workflow needs durable or queryable state. Record `not applicable` for genuinely stateless work with an owner-approved rationale.

### Async work, concurrency, retries, and idempotency

- Record timeout, cancellation, retry, duplicate-delivery, partial-failure, and conflict semantics for the selected route.
- A queue or durable workflow engine is required only when work outlives a request, must survive interruption, or needs controlled fan-out. Synchronous bounded work may be `not applicable` with evidence.

### Rate, cost, and capacity limits

- Bind per-run and service-level limits for requests, steps, retries, parallelism, result size, latency, spend, and human review.
- Record terminal behavior, backpressure, escalation, and the named capacity owner.

### Telemetry, alerts, and service objectives

- Bind trace identity, context, policy, state, tools, effects, readback, outcome, cost, and stop reason to the exact release.
- Define service objectives and exercise alert routes; dashboards or intended alerts alone remain `designed`.

### Failure, degraded operation, and rollback

- For every severe failure, record detection, containment, safe fallback, readback, recovery, owner, regression, and rollback trigger.
- Show that new work, writes, identities, egress, and affected capabilities can be stopped without hiding pending effects.

### Evaluation and human-AI deployment qualification

- Bind the tested workflow claim, eligible population, cases, environment, components, resource budgets, trial semantics, uncertainty, contamination controls, and independent decision to the exact release.
- When the claim depends on human review or routing, bind the frozen oversight policy, disjoint development and qualification evidence, sampling unit and dependence, reliability lower bound, autonomous coverage, review burden, reviewer-effectiveness basis, latency, capacity, total cost, risk constraints, and requalification triggers.
- Use saved terminal trajectories only when intervention cannot alter subsequent execution. Otherwise require a representative policy-in-loop rerun or faithful simulation.
- A benchmark, point estimate, assumed reviewer, or unexercised queue cannot advance this row to `tested`.

### Operator workflow, adoption, and review capacity

- Exercise the complete operating path: initiating actor, applicable scope and trigger, bounded orchestration and state, governed context, selected mechanisms, evaluation, abstention and escalation, controlled effect, source-of-truth readback, and durable result destination.
- Exercise the final persistent surface with representative operators: find the work, inspect evidence and uncertainty, correct, reject, escalate, interrupt, and resume without losing state or audit history.
- Reconcile eligible, exposed, completed, independently accepted, and business-effect events to the frozen adoption contract. Sample non-use and abandonment by reason rather than treating logins or runs as adoption.
- Name access, training, support, domain-review, and escalation owners. Exercise expected reviewer/support load, queue and wait limits, overflow, degraded operation, and the manual fallback for the proposed cohort.
- Advance this row to `tested` only when target users and the receiving team have exercised the path. Documentation, a demo, or delivery-team-led usage remains `designed`.

### Scaling assumptions and limits

- State the expected workload, burst, tenant count, payload size, dependency ceilings, hot keys, contention points, and reviewer capacity.
- Caching and horizontal scaling are required only when measured load, latency, availability, or isolation demands them. When used, bind cache keys and invalidation to tenant and source revisions, and test scale-out state and duplicate safety.

### Service ownership and evidence lifecycle

- Name the receiving service owner, on-call and escalation path, change approvers, support route, evidence retention, re-review cadence, and retirement owner.
- Link the exact release, evaluation, rollout, rollback, handoff, and training evidence; documents alone cannot prove exercised operating capability.

## Decision and handoff

| Field | Value |
| --- | --- |
| Decision | Hold / reject / approve declared rollout / accept handoff with dated conditions |
| Blocking dimensions and why | — |
| Time-bounded remediation and owners | — |
| Accepted residual risks, approving principals, and expiry | — |
| Rollout scope and stop triggers | — |
| Verified rollback or restoration evidence | — |
| Evidence required for the next gate | — |

Bind the decision to the declared release version and digest. A changed behavioral, data, policy, runtime, capability, evaluator, or operating dependency requires impact review and may invalidate prior evidence. Use the [release gates](../operations/release-gates.md), [change management](../operations/change-management.md), and the applicable target-software or model/agent [release record](solution-release.json) for promotion.
