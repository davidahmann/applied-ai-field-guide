# Intelligence Selection Record

Use one record for each consequential decision step. This record does not require every mechanism to be used. It makes the smallest sufficient choice reviewable.

Controls: `ARC-004`, `ARC-005`, `VAL-001`, `VAL-002`, `CST-001`, `CST-002`.

## Decision context

| Field | Value |
| --- | --- |
| Record ID and date | — |
| Workflow-charter URI and version | — |
| Operational decision | — |
| Eligible population and segment | — |
| Accepted outcome and verifier | — |
| Decision owner and service owner | — |
| Risk, latency, quality, and cost ceilings | — |
| Source-of-truth inputs and freshness rules | — |

## Candidate mechanisms

| Mechanism | Candidate? | Evidence it is sufficient or insufficient | Quality/risk trade-off | Full cost impact | Fallback or escalation |
| --- | --- | --- | --- | --- | --- |
| Deterministic rule, query, calculation, or workflow | yes / no | — | — | — | — |
| Optimization or constraint solver | yes / no | — | — | — | — |
| Classical ML or statistical model | yes / no | — | — | — | — |
| Retrieval/search | yes / no | — | — | — | — |
| Foundation-model call | yes / no | — | — | — | — |
| Bounded agent workflow | yes / no | — | — | — | — |
| Human decision or review | yes / no | — | — | — | — |

## Selected design

| Field | Value |
| --- | --- |
| Selected mechanism and version | — |
| Why the simpler alternative was insufficient | — |
| Typed input and output contract | — |
| Direct component metric and acceptance threshold | — |
| Downstream product decision, metric, and acceptance threshold | — |
| Production constraints that shaped the mechanism | Latency / throughput / data availability / failure behavior / other |
| Calibration or systematic-error strategy when applicable | Monitor, slice, cadence, owner, correction version, rollback |
| Deterministic validations and policy owner | — |
| Authority ceiling and permitted effect | — |
| Evaluation and representative evidence | — |
| Route monitor and drift signal | — |
| Full cost allocation and run budget | — |
| Human-review trigger and fallback | — |
| Rollback, retirement, or replacement trigger | — |

When the selected mechanism feeds another model, optimizer, policy, or workflow, test the direct and downstream contracts separately. A local score improvement does not establish a better customer-visible decision. Version any material aggregation, feature, calibration, or post-processing component and include it in downstream replay and rollback evidence. [R26-78](../research/2026-08-28--uber-production-ai-operating-lessons.md#r26-78)

## Decision

Record the selected mechanism, approver, date, limitations, and next review. Link an [architecture decision record](architecture-decision-record.md) when the choice changes the system boundary, data contract, security posture, or release unit.
