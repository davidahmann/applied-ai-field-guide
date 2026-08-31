# Intelligence Selection: Shipment-Risk Triage

Controls: `ARC-004`, `ARC-005`, `VAL-001`, `VAL-002`, `CST-001`, `CST-002`.

| Field | Decision |
| --- | --- |
| Record | `shipment-risk-triage-selection`, illustrative, 2026-08-08 |
| Operational decision | Which eligible in-transit shipment should enter a coordinator review queue now? |
| Eligible segment | Single-tenant, in-transit shipments with current carrier signals and a promised arrival inside 72 hours |
| Accepted outcome | A coordinator accepts or rejects a correctly routed review case with current evidence |
| Verifier | Dispatch review record plus shipment-system outcome reconciliation |
| Ceiling | `review_required` is a staged work item; only a coordinator may intervene in shipment operations |

| Mechanism | Decision role | Keep or reject | Evidence and guardrail |
| --- | --- | --- | --- |
| Deterministic validation and policy | Freshness, eligibility, score threshold, shipment-value threshold, budget, and route | Keep | Test all route boundaries; fail closed on missing evidence |
| Optimization | Choose a constrained intervention plan | Reject for pilot | The system creates no intervention plan; coordinators use existing operating tools |
| Classical ML | Score late-arrival risk from approved signal features | Keep | Versioned score contract, calibration monitor, drift review, fallback to manual triage |
| Retrieval | Assemble current carrier and shipment evidence | Keep only as typed source reads | Scope to tenant and shipment; freshness and provenance required |
| Foundation model | Explain the already-selected route in coordinator language | Keep as optional aid | Typed output, citations to supplied evidence, no route/action authority, deterministic fallback |
| Agent workflow | Coordinate an open-ended intervention | Reject | Workflow is fixed and a durable agent loop adds no measured value in the pilot |
| Human review | Decide the intervention and correct bad routing | Keep | Persistent review surface, override capture, accountable dispatch owner |

## Selected components

| Component | Version / owner | Evidence and monitor | Full-cost allocation | Fallback / retirement trigger |
| --- | --- | --- | --- | --- |
| Delay-risk model | `delay-risk-model@1.0.0`, logistics analytics | Calibration by eligible segment; feature freshness and score-distribution drift | Model inference and feature preparation per eligible shipment | Route to manual triage if calibration, feature freshness, or availability fails |
| Routing policy | `shipment-routing-policy@1.0.0`, dispatch operations | Contract tests at thresholds and value boundaries | Negligible deterministic compute; review load measured separately | Change-controlled threshold update; retire if simple manual rules perform equally well |
| Explanation template | `review-explanation@1.0.0`, dispatch enablement | Coordinator usefulness and unsupported-claim rate | Model call and correction cost only for review-required route | Render deterministic evidence summary if unavailable or unhelpful |
| Human review | Dispatch coordinator, dispatch operations | Accepted decision, override reason, and downstream outcome | Review time and training cost | Pause route if review burden or adoption guardrail fails |

The model score is a prediction, not a decision. The explanation is a presentation aid, not evidence or authority. The coordinator remains responsible for the operational intervention.
