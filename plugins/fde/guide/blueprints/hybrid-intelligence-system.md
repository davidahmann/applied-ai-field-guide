# Hybrid Intelligence System

Use this blueprint when one operational workflow needs a deliberate mix of deterministic software, optimization, classical ML, retrieval, foundation models, and human review. It is not a reason to add every component. The default is the smallest serial path that meets the accepted-outcome, risk, and cost requirements.

Controls: `ARC-001`, `ARC-002`, `ARC-004`, `ARC-005`, `VAL-002`, `CST-001`, `CST-002`, `DEL-001`, `REL-003`.

## Components

| Component | Responsibility | Authority boundary |
| --- | --- | --- |
| Professional work surface | Receives the authenticated initiating actor, applicable scope, and trigger; shows evidence, uncertainty, alternatives, and permitted actions; returns the result to its durable destination | Users inspect, correct, pause, and approve through this surface |
| Workflow orchestrator | Owns bounded orchestration and state, budgets, retries, stop conditions, and routing | Cannot bypass policy or source-of-truth verification |
| Deterministic policy and validation | Applies rules, constraints, and business invariants | Runs outside model generation; rejects invalid state/action |
| Optimizer or classical ML model | Produces a bounded score, ranking, forecast, or plan | Versioned input/output contract, threshold, and fallback |
| Aggregation, feature, or calibration component when justified | Produces bounded model inputs or corrects systematic error | Versioned data, slice, freshness, compatibility, and rollback contract; cannot invent missing evidence |
| Retrieval and foundation-model component | Interprets governed context or produces a typed proposal | Cannot authorize or commit an action |
| Tool and effect gateway | Reads or changes an external system under current policy | Enforces identity, scope, tenant, idempotency, approval, and readback |
| Human reviewer | Provides evaluation, abstention, and escalation where automated evidence is insufficient, and resolves ambiguity, exceptions, or high-stakes decisions | Accountable for decisions reserved to people |
| Evidence and operations plane | Retains trace, versions, evaluation, outcomes, and cost | Separate from model-controlled context and evaluators |

## Decision routing

```text
validated input
  -> fixed rule or calculation when sufficient
  -> optimization or ML when objective/label is defined
  -> retrieval and foundation-model interpretation when evidence is unstructured
  -> human review when the result is uncertain, out of policy, high risk, or over budget
  -> policy-gated action and source-of-truth verification
```

Record every consequential routing choice in the [intelligence-selection record](../templates/intelligence-selection-record.md). The selection must name the rejected simpler alternative, the measured reason it was insufficient, the evaluation evidence, the operating budget, and the fallback. `ARC-004`, `ARC-005`.

## Direct and downstream contracts

For every prediction, classification, ranking, retrieval result, or model proposal, declare:

- The direct component input, output, metric, threshold, eligible population, latency, freshness, and failure contract
- The downstream model, optimizer, policy, workflow, or human decision that consumes it
- The downstream product metric and guardrail that the customer or operator actually experiences
- Any aggregation, feature, calibration, or post-processing version between the two
- The representative downstream replay, bounded experiment when justified, drift monitor, rollback, and accountable owners

An improved local loss, accuracy, or judge score is not sufficient when the downstream decision degrades. Separate information gain from systematic calibration error when the distinction is useful, and measure both by consequential slice. Calibration MAY correct systematic error; it cannot recover missing information, valid labels, policy, or a wrongly scoped outcome. Production constraints such as latency, throughput, source availability, sparse segments, recovery, and operator capacity SHOULD shape the mechanism choice before a theoretically richer architecture is selected. [R26-78](../research/2026-08-28--uber-production-ai-operating-lessons.md#r26-78)

## State transitions

```text
received -> validated -> evidence_assembled -> proposed
  -> rule_or_human_review -> approved_or_rejected
  -> action_staged -> action_committed -> readback_verified
  -> accepted | repaired | escalated | stopped
```

The domain model owns these states and any permitted transitions. A model may suggest a transition; it cannot cause one. An externally visible completion state requires the corresponding source-of-truth postcondition. `ARC-002`, `REL-003`.

## Trust boundaries

- Treat retrieval, user content, model output, and ML predictions as inputs with provenance—not as policy or authority.
- Hold identities, credentials, permissions, approvals, and effect execution in trusted services below the intelligence components.
- Bind each read and effect to tenant, resource, purpose, current policy, and an explicit release version.
- Run code execution and data transformations in a bounded environment with explicit network and data controls.
- Keep evaluation data, graders, and release approvers outside the system being measured.

## Failure behavior

| Condition | Required behavior |
| --- | --- |
| Missing, stale, conflicting, or insufficient evidence | Ask for bounded additional evidence or escalate; do not invent a conclusion |
| Rule, optimizer, ML, or model confidence outside policy | Route to human review or a safer deterministic path |
| Tool, policy, or identity denial | Stop without effect and surface the reason in the work artifact |
| Timeout, budget exhaustion, or partial external effect | Persist state, reconcile with the system of record, then repair, compensate, or escalate |
| Drift in outcome, quality, data, model behavior, adoption, or cost | Constrain/rollback the affected route and create a replayable regression case |
| Upstream metric improves while downstream contract regresses | Hold promotion, inspect compatibility and calibration, replay the full path, then correct, constrain, or revert |

## Telemetry and operating measures

Measure per decision route: eligible volume, route selection, evidence sufficiency, policy denials, human review, accepted outcome, quality/guardrails, latency, resource use, and full cost per accepted outcome. Segment results by route so a cheap deterministic path cannot hide expensive or unsafe model behavior. `VAL-001`, `VAL-002`, `CST-001`.

## Release tests

- Contract tests for every component interface and source revision.
- Deterministic-policy and state-transition tests.
- ML/optimization error, calibration, constraint, and fallback tests where applicable.
- Direct-component and downstream-product contract replay for every consequential upstream dependency.
- Aggregation, feature, calibration, and post-processing compatibility, freshness, drift, and rollback tests when those components exist.
- Foundation-model output, tool-trajectory, retrieval-provenance, and adversarial tests where applicable.
- End-to-end outcome and source-of-truth readback tests.
- Route-specific budget, failure, rollback, and human-escalation tests.
- Release evidence that binds the exact component versions, data/world revision, decision policy, user surface, and operations bundle.

Do not promote a route because aggregate metrics look good. Promote the named decision, segment, effect class, and component versions with their own evidence.

For a compact, illustrative application of this blueprint, follow the [shipment-risk triage walkthrough](../examples/shipment-risk-triage/README.md). It keeps ML prediction, deterministic policy, explanation, review, and outcome measurement separate without introducing an agent loop.
