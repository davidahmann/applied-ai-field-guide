# Healthcare Access-Coordination Solution Profile

**Maturity:** worked vertical design profile

This profile covers administrative coordination for referrals, service requests, authorization status, missing documentation, scheduling readiness, and handoffs. It deliberately excludes diagnosis, treatment selection, medical necessity, benefit determination, emergency triage, and autonomous patient communication.

CMS's current prior-authorization rule and HL7 FHIR workflow resources illustrate why healthcare access work spans multiple parties, request state, administrative tasks, supporting information, and measurable process outcomes. They are implementation anchors only; local payer, provider, jurisdiction, privacy, clinical, and contractual requirements remain controlling. [VS26-05], [VS26-06]

## Vertical outcome

One eligible access request moves to the next administratively valid state with current, minimum-necessary evidence, a named owner, and an attributable reason. The accepted outcome is verified in the authoritative scheduling, referral, or authorization system—not inferred from a generated summary or API response.

Candidate value measures include avoidable administrative delay, first-pass completeness, coordinator handling time, preventable resubmission, patient-contact burden, and full cost per accepted progression. Guardrails include inappropriate disclosure, incorrect patient or coverage binding, missed time-sensitive work, unsafe automation, excessive coordinator load, and unresolved-age thresholds. `VAL-001`, `VAL-002`, `CST-001`.

## Operational context

```mermaid
flowchart LR
    R["Referral or service request"] --> I["Patient, requester, and consent context"]
    I --> E["Minimum-necessary administrative evidence"]
    E --> P["Current workflow and payer policy"]
    P --> C["Coordination state and next permitted step"]
    C --> Q["Persistent coordinator work item"]
    Q --> H["Authorized human decision"]
    H --> S["Scheduling, referral, or authorization system"]
    S --> V["Source-of-truth status and outcome"]
```

The system assists an administrative process; it does not collapse clinical intent, payer determination, and fulfillment task into one generated status. HL7 distinguishes a service request from an administrative task that tracks work toward fulfillment, which is a useful modeling boundary even when the target deployment uses different standards. [VS26-06]

## Reusable flow composition

| Layer | Applied pattern | Healthcare specialization |
| --- | --- | --- |
| Intake | [Request to activation](../business-flows/request-to-activation.md) | Bind patient, requester, organization, consent or treatment relationship, service request, and accountable owner. |
| Exception work | [Exception to resolution](../business-flows/exception-to-resolution.md) | Represent missing documentation, mismatch, unsupported route, unavailable endpoint, or stale status as explicit states. |
| Evidence | [Secure AI workload](../secure-ai-workload.md) | Retrieve only currently authorized, minimum-necessary evidence with provenance and freshness. |
| Integration | [Integration runtime](../integration-runtime.md) | Treat acknowledgments, retries, callbacks, duplicates, and external identifiers as durable protocol state. |
| Operation | [Deployment and operations](../deployment-and-operations.md) | Monitor administrative delay, access failures, case age, support, incidents, and outcome acceptance. |

## Domain and action model

| Object | Stable identity and source | Example states | Permitted administrative actions |
| --- | --- | --- | --- |
| Person context | Target patient identity service | matched, ambiguous, restricted | verify match, escalate ambiguity |
| Service request | Authoritative clinical or referral system | draft, active, revoked, completed | read intent and current status; no clinical mutation by this workflow |
| Access case | Coordination workflow store | received, needs-information, ready-for-review, awaiting-external, closed | assign, request evidence, stage next step, escalate |
| Coverage or authorization reference | Payer or designated source | unknown, pending, approved, denied, expired | read current administrative status; authorized users handle determination |
| Evidence item | Authoritative source plus revision | current, stale, superseded, unavailable | disclose under policy, attach provenance, request refresh |
| Task or work item | Coordination system | requested, accepted, in-progress, failed, completed | assign, update administrative status, record outcome |
| Communication | Approved communication system | drafted, approved, sent, failed | prepare administrative draft; authorized user or service sends |

Object identity MUST prevent cross-person, cross-tenant, or cross-organization evidence mixing. The target system MUST define source precedence, correction, retention, consent or treatment-relationship checks, purpose, and break-glass behavior. `CTX-001`, `IAM-002`, `SEC-005`, `TOL-005`.

## Mechanism allocation

| Decision step | Smallest sufficient mechanism | Explicit exclusion |
| --- | --- | --- |
| Patient, request, organization, and external-reference matching | Deterministic identifiers plus governed exception review | Model-only entity resolution for consequential binding |
| Required administrative fields | Versioned rules and schema validation | Prompt-only completeness policy |
| Current status and evidence | Typed API or governed query with freshness | Free-form search across unrestricted records |
| Routing by status, deadline, owner, or supported path | Deterministic workflow policy | Clinical prioritization inferred from narrative |
| Evidence summarization | Template or bounded model call over permitted evidence | New clinical claim, coverage determination, or hidden source |
| Administrative communication draft | Constrained template or model draft | Autonomous patient-specific advice or send authority |
| Coverage, clinical, or care decision | Authorized human and source system | Agent or model disposition |

Controls: `ARC-004`, `ARC-005`, `CTX-002`, `IAM-003`, `HUM-001`.

## Smallest useful slice

Implement one non-emergency service category, one requesting organization, one receiving team, and one external administrative route:

1. Accept a stable service-request reference and authenticated actor.
2. Verify patient and organization scope before returning evidence.
3. Validate a bounded administrative completeness checklist.
4. Route to `ready_for_coordinator`, `needs_information`, `awaiting_external`, or `manual_exception`.
5. Create one duplicate-safe coordination work item with evidence references, missing fields, reason, owner, and deadline.
6. Allow an authorized coordinator to edit, reject, request information, or advance the case in the existing system.
7. Read back the authoritative administrative status and emit an accepted-outcome event.

Keep the initial slice in shadow or review-only mode. It MUST NOT deny coverage, select care, infer emergency priority, modify a clinical order, or send autonomous patient instructions.

## Operator surface

The coordinator needs a persistent case view containing:

- patient and request identifiers appropriate for the authorized surface;
- source system, revision, timestamp, and freshness for each evidence item;
- current administrative state and the reason it was selected;
- missing, conflicting, restricted, and unavailable evidence;
- any generated summary clearly separated from source facts;
- permitted next actions, owner, deadline, and escalation path;
- communication draft, approval state, and send record where applicable;
- outcome, correction, and reopen history.

Chat may explain the case. It is not the record of work. `ADP-001`, `HUM-001`, `HUM-002`.

## Acceptance and operating evidence

| Case | Required evidence |
| --- | --- |
| Wrong person, organization, or purpose | Denial occurs before data disclosure or work-item creation. |
| Revoked or changed request | Stale work stops and the current source state is visible. |
| Missing administrative evidence | The system requests or escalates; it does not invent a completion. |
| Conflicting status | Both authoritative references and timestamps are shown to the coordinator. |
| Duplicate callback or submission | One stable case and work item are retained. |
| Generated clinical or coverage claim | Output is rejected and a safety event is recorded. |
| External timeout after submission | State becomes effect-unknown until callback or source readback reconciles it. |
| Coordinator advances the case | Current authority and policy are rechecked and source readback verifies the new administrative state. |

Operate on eligible-case progression, first-pass completeness, administrative cycle time, coordinator acceptance and correction, reopen and resubmission, evidence freshness, inappropriate-disclosure attempts, unresolved age, external dependency health, support effort, and full cost per accepted progression. Never use throughput alone as proof of improved access or care. `SEC-004`, `REL-001`, `REL-003`, `OPS-003`, `OPS-004`, `OPS-006`.

## Customer-specific decisions

The delivery team must resolve:

- jurisdiction, organization type, covered workflow, service category, and emergency exclusions;
- authoritative patient, request, coverage, scheduling, consent, and communication systems;
- applicable interoperability profiles, identifiers, terminology, and protocol versions;
- minimum-necessary data, purpose, retention, access-review, and audit rules;
- clinical, coverage, administrative, privacy, security, and service ownership;
- required turnaround, escalation, downtime, manual fallback, correction, and patient-support procedures;
- evaluation segments, protected groups, language needs, accessibility, and outcome delay;
- prohibited model uses and kill switches.

## Starter packet

Begin with the [field-observation log](../../templates/field-observation-log.md), [workflow charter](../../templates/workflow-charter.json), [value case](../../templates/value-case.md), [intelligence-selection record](../../templates/intelligence-selection-record.md), [ontology](../../templates/operational-ontology.json), [threat model](../../templates/threat-model.json), [evaluation cases](../../templates/evaluation-case.json), [delivery and adoption plan](../../templates/delivery-and-adoption-plan.md), and [solution release](../../templates/solution-release.json). Add exact tool contracts and capability manifests only for the selected target interfaces.

## What this does not prove

This profile does not establish clinical safety, medical necessity, coverage correctness, legal compliance, standards conformance, interoperability, improved patient outcomes, or production readiness. It is an administrative solution-design starting point. Authorized healthcare, privacy, security, legal, payer, provider, patient-access, and operations owners must define and accept the target workflow.

**Controls:** `VAL-001`, `VAL-002`, `FDE-001`, `ARC-004`, `ARC-005`, `CTX-001`, `CTX-002`, `IAM-002`, `IAM-003`, `SEC-004`, `SEC-005`, `TOL-005`, `REL-001`, `REL-003`, `HUM-001`, `HUM-002`, `ADP-001`, `OPS-003`, `OPS-004`, `OPS-006`, `CST-001`.

[VS26-05]: ../../research/2026-08-09--business-flow-and-vertical-solutions.md#vs26-05
[VS26-06]: ../../research/2026-08-09--business-flow-and-vertical-solutions.md#vs26-06
