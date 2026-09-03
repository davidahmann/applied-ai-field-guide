# FDE Discovery Pack

## Inherited story and accountable field roles

Preserve the brief as received before improving or reconciling it. Treat it as an evidence-bearing hypothesis, not current truth.

| Inherited claim | Exact source and revision | Sold, stated, or assumed | Commercial status | Limitation or unknown |
| --- | --- | --- | --- | --- |
| | | | | |

| Role | Named person or explicit unknown | Evidence or authority basis | Scope | Verified by |
| --- | --- | --- | --- | --- |
| Sponsor | | | | |
| Process knower | | | | |
| Operator | | | | |
| Disposition authority | | | | |
| Independent verifier | | | | |

Do not infer the process knower, operator, disposition authority, or verifier from the sponsor. One person may hold multiple roles only when each role has a separate, recorded basis.

## Engagement charter

| Field | Value |
| --- | --- |
| Engagement ID and customer/tenant boundary | |
| Approved evidence store, retention, and deletion rule | |
| Workflow ID | |
| Executive sponsor | |
| Independent sponsor or business-owner backup | |
| Operational owner | |
| Technical owner | |
| Risk owner | |
| Intended users/operators | |
| Receiving service owner | |
| Trigger | |
| Current work product or decision | |
| Initial segment and exclusions | |
| Accepted outcome | |
| Baseline status and evidence | Measured / estimated / unmeasured |
| Target | |
| Measurement window | |
| Verifier | |
| Maximum acceptable failure | |
| Pilot stop conditions | |
| Pilot maximum duration / evidence cutoff / graduation decision date | |
| Continuation mechanism and decision owner | External deployment or renewal / internal funding or sponsorship / other |

Use the machine-readable [workflow-charter template](workflow-charter.json) for the governed decision after discovery.

## Strategic and operating apertures

Use this as a reconciliation pass, not a fixed interview script. Begin with the widest relevant view that is available, inspect the work and its technical seams, then return unresolved differences to the people who hold the relevant decision rights.

| Aperture | Goal, blocker, workflow claim, or interaction | Exact source and owner | Evidence to inspect next | Conflict, limitation, or accountable next move |
| --- | --- | --- | --- | --- |
| Strategic intent | | | | |
| Operating reality | | | | |
| Customer-visible effect, if any | | | | |

| Candidate value surface | Current experience or exposure | Proposed observable change | Acceptance evidence and verifier | Why this candidate now |
| --- | --- | --- | --- | --- |
| Customer-visible interaction / internal enablement / cost or capacity / risk and control | | | | |

Do not require a customer-visible effect when an internal safety, control, or operating decision is more consequential. Do not treat executive sponsorship, interview volume, a survey, or a roadmap as proof of the workflow or permission to proceed.

## Field evidence register

| Evidence ID | Method | Case/segment | Date | Source owner | Redaction/classification | Observation supported | Limitation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | Interview / shadow / recording / event log / artifact / metric | | | | | | |

## Field claim comparison and accountable reframe

| Claim ID | Class | Statement | Exact source and owner | Scope and limitation | Contradiction or missing evidence | Currentness |
| --- | --- | --- | --- | --- | --- | --- |
| | sold / stated / observed / system-enforced / policy-authorized | | | | | current / contested / superseded |

No claim class universally outranks another or grants authority. Observation proves occurrence in scope; system testing proves exact-build behavior; policy remains normative within its revision and scope; a stakeholder assertion proves only that it was stated.

| Material conflict | Affected boundary or outcome | Safe fallback while unresolved | Proposed reframe | Required disposition and authority | Next field move |
| --- | --- | --- | --- | --- | --- |
| | | | | continue discovery / bounded kickoff / defer / stop | find owner / observe case / resolve cited conflict |

When field evidence materially changes the brief, use the machine-readable [engagement-reframe record](engagement-reframe.json) to preserve the competing claims, scoped decision, selective downstream impact, and chronology.

## Interaction receipts and current readout

Keep source material separate from proposed conclusions. For each meeting, observation, incident review, or artifact handoff, record the interaction ID, engagement boundary, source revisions, proposed additions, named review disposition, appended record IDs, and timestamp in the [field-observation log](field-observation-log.md). Preview the changes before append; rejected and deferred proposals remain visible.

The sponsor readout is a projection of these dated receipts and the current governed records. It states the evidence cutoff, current boundary, measured outcome, unresolved consequential decision, next move, and source links. Do not maintain it as an independent status artifact or let it silently override the engagement reframe, value case, release evidence, or service review.

## Workflow event log

| Sequence | Actor | Event | Input | System | Decision | Evidence | Effect | Exception |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | | | |

## Source-of-truth map

| Source ID | Objects | Owner | Read/write | Classification | Freshness SLO | Identity | API maturity | Failure mode |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |

## Technical reality check

Use direct evidence to test the stated workflow before assigning readiness or proposing architecture. A questionnaire, interview, diagram, or maturity score organizes hypotheses; it does not prove the target environment is ready.

| Surface inspected | Exact target / revision / environment | Owner | Evidence observed | Claim supported or contradicted | Gap, consequence, and next test |
| --- | --- | --- | --- | --- | --- |
| Code or configuration | | | | | |
| Data pipeline, source seam, or reconciliation | | | | | |
| Identity, permission, tenant, credential, or network boundary | | | | | |
| Representative execution, telemetry, failure, or recovery path | | | | | |
| Release, rollback, support, or dependency constraint | | | | | |

Mark an uninspected decision-bearing surface `unknown`. Do not infer readiness from document completeness or replace missing target access with a higher confidence score.

## Decision decomposition

| Decision | Deterministic rule | Agent judgment | Human accountability | Required evidence | Postcondition |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

## Context extraction and operational redesign

Interview notes, recordings, documents, and demonstrations are discovery evidence. They do not become prompts, policy, memory, or production authority until the owning role validates them.

| Candidate knowledge | Observed source and owner | Classification / scope | Type | Validate with | Keep, repair, remove, escalate, or abstract | Production destination / invalidation trigger |
| --- | --- | --- | --- | --- | --- |
| | | Public / internal / confidential / restricted | Fact / rule / judgment / workaround / exception / instruction | | | |

Use this table to distinguish current evidence from rules, professional judgment, and historical scar tissue. Keep customer-specific context with the workflow owner. A reusable product or pattern candidate must be sanitized, recurrence-tested, and routed through the [field-learning register](field-learning-register.md); never copy customer data or local policy into a shared artifact.

## Exception taxonomy

| Exception ID | Frequency | Severity | Detection | Current handling | Target handling | Escalation owner | Eval slice |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

## Operational ontology candidates

| Kind | ID | Source | Identity key | States/relations | Policy | Action | Invariant |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Entity | | | | | | | |

## Value-verifiability matrix

| Candidate | Annual volume | Minutes/case | Loaded labor/hour | Error rate | Error cost/event | Annualized integration + operating cost | Verifier coverage (0–1) | Adoption probability (0–1) | Residual risk probability (0–1) | Priority ratio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| | | | | | | | | | | |

```text
gross_annual_value = annual_volume × (
  minutes_per_case / 60 × loaded_labor_cost_per_hour
  + error_rate × error_cost_per_event
)

risk_adjusted_verified_value =
  gross_annual_value
  × verifier_coverage
  × adoption_probability
  × (1 - residual_risk_probability)

priority_ratio = risk_adjusted_verified_value
                 / max(1 currency unit, annualized_integration_and_operating_cost)
```

Use one declared currency and annual period. Bound every probability or coverage input to `0..1`, preserve low/expected/high scenarios, and do not compare ratios built from different units or periods. This ratio ranks qualified candidates; it does not override a hard owner, verifier, authority, safety, or adoption gate. Keep estimated, measured, and realized value separate. Complete the [value-case template](value-case.md) before a pilot decision.

## Assumption and decision log

| ID | Assumption or decision | Evidence | Owner | Test or review date | If false | Status |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | Open / validated / rejected / superseded |

## Readiness gates

| Charter dimension | Required evidence | Owner | Score (0–4) | Status |
| --- | --- | --- | ---: | --- |
| Workflow clarity | User, interface, decision, inputs, permitted action, accepted outcome, boundary | Operational | | |
| Context | Owners, source-of-truth rules, revisions, freshness, classification | Data | | |
| Verifier | Independent completion evidence, representative cases, safety slices, isolated graders | Evaluation | | |
| Integration | Typed tool contracts, identity, authorization, duplicate safety, dependency ownership | Platform | | |
| Adoption | User surface, training, review capacity, support, workflow integration | Operational | | |
| Operations | SLOs, alerts, runbooks, rollback, capacity | Operations | | |
| Risk | Threat model, secrets, egress, tenant isolation, prohibited effects, recovery | Security/risk | | |

Copy these seven dimensions and their evidence into `workflow-charter.readiness`. Authenticated authority, accountable ownership, and a lawful data path remain independent hard gates even when the scored dimensions are otherwise strong.

## Adoption and ownership plan

| Capability | Current owner | Receiving owner | Evidence of readiness | Exercise | Exit condition |
| --- | --- | --- | --- | --- | --- |
| Workflow and policy | | | | | |
| Data and tools | | | | | |
| Evaluation and release | | | | | |
| Support and incident response | | | | | |
| Cost and value review | | | | | |
| Retirement | | | | | |

## Stakeholder value and change contract

| Audience | Current work and consequence | Expected benefit | New responsibility or control | Evidence of acceptance | Owner |
| --- | --- | --- | --- | --- | --- |
| Executive or operational sponsor | | Outcome, risk, or economics | Fund, unblock, and decide scope | Baseline, guardrails, and value review | |
| Operator or domain expert | | Better evidence, reduced rework, or faster exception handling | Review, correct, escalate, or pause | Shadow comparison, training, feedback, and workload measures | |
| Product or applied-AI team | | Reusable capability or reduced delivery friction | Preserve the customer-specific boundary and own shared changes | Sanitized recurrence evidence and release decision | |

Controls: `FDE-001`, `FDE-002`, `FDE-003`, `FDE-004`, `FDE-005`, `ADP-001`, `CTX-001`, `CTX-002`.

## Cutover plan

| Stage | Traffic | Write capability | Entry gate | Exit gate | Rollback trigger |
| --- | ---: | --- | --- | --- | --- |
| Offline | 0% | None | Replay fixtures ready | Thresholds pass | Any prohibited effect |
| Shadow | Mirrored | None | Observability complete | Stable slice metrics | Data or policy drift |
| Canary | 1–5% | Staged/reversible | Human review, support, and rollback ready | SLO, adoption, and review thresholds | Error-budget burn |
| Bounded production | Named segment | Policy-gated | Customer owners and runbooks exercised | Outcome, adoption, and continuous controls | Kill-switch or value threshold |
