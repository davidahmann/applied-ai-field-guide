# ADR: Route Shipment Risk to Human Review, Not Autonomous Intervention

| Field | Value |
| --- | --- |
| ADR ID | `adr-shipment-risk-triage-001` |
| Status | illustrative pilot design |
| Date | 2026-08-08 |
| Owners | dispatch operations, logistics analytics, logistics platform, transportation risk |
| Related artifacts | [workflow charter](workflow-charter.json), [selection record](intelligence-selection.md), [ontology](ontology.json) |

## Decision

Use a bounded ML delay-risk score only to inform a deterministic routing policy. When current evidence, score, and shipment value meet policy, create a non-binding coordinator review case. A constrained foundation-model explanation may summarize the supplied evidence. It cannot select the route, invoke external operations, or change the review case. A dispatch coordinator decides any intervention in the source system.

## Architecture views

| View | Design |
| --- | --- |
| System context | Dispatch coordinators use a persistent review queue; shipment and carrier systems provide evidence; the existing shipment platform remains the only intervention surface |
| Components | Context read boundary, ML score boundary, deterministic routing policy, explanation component, review-case service, coordinator surface, outcome/operations store |
| State | `received -> validated -> scored -> no_action | review_ready | escalated`; only `review_ready` creates a staged queue record |
| Trust boundary | Tenant-bound reads and review-case write occur through typed gateways; ML and explanation outputs are untrusted inputs; identity, policy, state, and outcome evidence remain trusted services |

## Options considered

| Option | Decision | Why |
| --- | --- | --- |
| Manual queue only | Baseline and fallback | Required when evidence or score is unavailable; provides the counterfactual |
| Deterministic threshold only | Insufficient for risk ranking | Does not use multiple predictive carrier signals; measure against ML before retaining model cost |
| ML score plus deterministic policy | Selected | Bounded prediction can prioritize review while policy preserves explainable, review-only authority |
| LLM/agent performs intervention | Rejected | Intervention is material, verification is delayed, and an open-ended workflow adds authority without a demonstrated benefit |
| Optimizer chooses intervention | Deferred | Needs objective, constraints, and safe action boundary not established in the pilot |

## Failure and recovery

| Failure | Response |
| --- | --- |
| Missing/stale shipment or carrier evidence | Escalate to manual triage; do not score or create a review case |
| Invalid, unavailable, or drifting model | Escalate or use the measured manual baseline; emit route-level alert |
| Explanation failure or unsafe output | Keep the policy route and use a deterministic evidence summary |
| Review-case service failure | Retry only with an idempotency key; otherwise escalate with no shipment intervention |
| Cost/review-load ceiling exceeded | Stop explanation route first, then narrow or pause the ML segment |

## Release and rollback

The pilot release is a shadow queue for one named segment. Promotion requires measured calibration, coordinator acceptance, current evidence coverage, support readiness, and full cost per accepted coordinator decision inside the charter ceiling. Rollback removes the review route and returns work to the existing manual queue; it does not require compensating a shipment action because the system never performs one.
