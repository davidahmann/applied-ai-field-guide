# Multimodal Operations and Computer-Use Boundaries

**Review date:** 2026-08-11

**Scope:** long-running multimodal workflows, browser or desktop fallback, reference-label authority, and insurance as a possible future vertical profile

**Decision:** admit two portable implementation gaps; keep performance, moat, organization-design, and insurance-generalization claims non-normative

## Input reviewed

The supplied Adithya Sanjay post describes Pace's applied-AI delivery model, insurance-specific harness, browser-based interaction with systems that lack APIs, durable shared state, model routing, oversight, and customer-SME-approved evaluation sets. The supplied post did not include a stable permalink or publication date, so it is recorded as a research lead rather than a canonical source.

The implementation claims were checked against Pace's dated first-party architecture and product reports at [R26-73](2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-73). Browser risk was independently checked against Anthropic's security research at [R26-74](2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-74) and its broader containment guidance at [R26-49](2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-49).

## Portable findings

### 1. A reference answer needs authority and maintenance

A “golden” case is not trustworthy merely because an expert once supplied the expected answer. The reusable contract is the provenance of that answer:

- evidence basis and authoritative source;
- source, policy, or fixture revision;
- accountable owner and label author;
- independent approver and approval time;
- adjudication and disagreement process;
- data classification and review date.

The implementation belongs in the [evaluation-case contract](../schemas/evaluation-case.schema.json), not in an insurance-specific rubric. Stale, disputed, anonymous, or self-approved labels cannot be release evidence. `EVA-007`.

### 2. Computer use is a separate action boundary

Browser and desktop control are sometimes necessary when an authoritative system exposes no adequate API. The reusable unit is not a generic browsing skill. It is a bounded capability that preserves:

- API-first admission and an explicit browser-fallback rationale;
- actor or workload identity, tenant, account, resource, and session scope;
- tainted-page treatment and prompt-injection defense;
- exact destination, navigation, upload, download, and credential policy;
- separated observe, prepare, stage, commit, and readback operations;
- stable business-operation identity and duplicate safety;
- independent target-state verification;
- classified, minimized, time-bounded screenshots and recordings;
- interface-drift detection, canary, rollback, and API migration trigger.

The implementation belongs in the [computer-use action-boundary blueprint](../blueprints/computer-use-action-boundary.md), supported by existing tool, identity, security, reliability, state, evaluation, and operations controls.

### 3. Multimodal paths keep separate constraints

Voice, document extraction, deterministic calculations, model judgment, computer use, and human review have different latency, evidence, authority, and failure characteristics. A shared durable workflow may coordinate them, but each route remains separately versioned, budgeted, evaluated, observable, and replaceable. This reinforces existing `ARC-005`, `STA-001`, `CTX-005`, and `OPS-007`; it does not justify a new orchestration standard or vendor-specific procedure vocabulary.

## Deferred vertical decision

Insurance operations are a plausible future solution profile because submissions, servicing, claims, policy administration, documents, calls, portals, human judgment, and regulatory evidence compose several existing business-flow patterns. One vendor's reports are insufficient to standardize that profile.

Before adding it, require independent insurer, broker, claims, or policy-administration evidence covering at least:

- one bounded operational decision and accepted outcome;
- customer-specific policy and authority boundaries;
- representative normal, exception, dispute, and recovery cases;
- system-of-record and computer-use constraints;
- evaluation ownership and label adjudication;
- production operation, human workload, and realized value.

Disposition: `investigate`, not `productize`.

## Excluded claims

The repository does not adopt:

- vendor accuracy, volume, deployment-speed, or SLA figures as thresholds;
- “the harness is the product” or a data/tacit-knowledge moat as a universal business conclusion;
- one applied-AI organization structure as an operating standard;
- self-improvement claims without evaluator, release, approval, and rollback separation;
- screenshots, recordings, citations, graders, or expert sign-off as substitutes for service-side authorization and readback.

## Repository impact

| Artifact | Change |
| --- | --- |
| [Evaluation-case schema](../schemas/evaluation-case.schema.json) | Add versioned reference-answer authority and maintenance fields |
| [Control catalog](../controls/control-catalog.json) | Add `EVA-007` for expected-result and reference-label provenance |
| [Computer-use action boundary](../blueprints/computer-use-action-boundary.md) | Add API-first admission, session containment, effect protocol, readback, drift, evidence retention, and negative cases |
| [Pattern catalog](../patterns/pattern-catalog.json) | Add bounded computer-use fallback and visual-success anti-pattern entries |
| [Security and integration guidance](../library/15-production-ai-security-and-action-boundaries.md) | Route computer-use systems through the new blueprint |

The productization decision follows the repository's field-learning rule: promote portable contract and failure shapes, retain target policy and evidence with the owner, and defer vertical standardization until recurrence is independently demonstrated.
