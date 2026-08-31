# Production AI System SLO Scorecard

| SLI | Example objective | Error budget policy |
| --- | --- | --- |
| Accepted outcome rate | `>= 98.5% / 28d` | Pause promotion below objective |
| Eligible workflow completion | `>= target / 28d` | Investigate adoption and workflow friction |
| Override or abandonment rate | `<= segment threshold / 28d` | Review evidence quality, UX, and workflow fit |
| Unauthorized effect rate | `= 0` | Immediate kill switch |
| Cross-tenant effect rate | `= 0` | SEV-0 |
| Duplicate effect rate | `= 0` | Disable affected write tool |
| Postcondition failure rate | `<= 0.1% / 28d` | Freeze writes at fast burn |
| P95 cycle time | `<= 90 s` | Degrade or reduce concurrency |
| P95 cost/accepted outcome | `<= $0.40` | Route/stop policy review |
| Context freshness breach | `<= 0.5%` | Disable affected source segment |
| Human approval P95 wait | `<= 4 h` | Capacity/escalation routing |
| Recovery success rate | `>= 99.9%` | Block autonomy expansion |
| Trace completeness | `= 100%` for writes | Block write path |

The numbers above are examples, not universal targets. Bind each objective to a named segment, owner, measurement method, and release or rollback decision. Track the business outcome and realized value separately in the [production service review](../templates/production-service-review.md); operational reliability alone does not prove that the workflow is useful.

## Burn-rate actions

Configure burn-rate alerts per SLO and derive thresholds from that objective's period, error budget, and allowed budget consumption. Require both the long and short window to exceed the same threshold, plus a minimum eligible-event or traffic condition, before alerting. Single-window spikes are diagnostic signals, not sufficient evidence for an automatic production action. The [Google SRE multiwindow pattern](https://sre.google/workbook/alerting-on-slos/) is a useful starting point; tune it against local traffic and consequence.

| Alert class | Long window | Confirming window | Action |
| --- | --- | --- | --- |
| Fast burn | 1 h | 5 min | Page on-call; freeze promotion; invoke only preauthorized containment for the affected segment |
| Sustained burn | 6 h | 30 min | Page on-call; constrain the affected route after diagnosis |
| Slow burn | 3 d | 6 h | Open owned corrective work and review the objective or dependency |

Automatic kill switches remain appropriate for declared zero-tolerance invariants such as unauthorized or cross-tenant effects. Reliability, latency, adoption, and cost SLOs use the predeclared response for that service; they do not inherit a generic kill policy.

## Capacity constraints

```text
runs_per_window = min(
  workflow_start_budget_per_window,
  tool_calls_budget_per_window / p95_tool_calls_per_run,
  provider_tokens_budget_per_window / p95_tokens_per_run,
  reviewer_approvals_per_window / p95_approvals_per_run,
  cost_budget_per_window / p95_cost_per_run
)

effective_concurrency = min(
  workflow_worker_slots,
  dependency_in_flight_limit,
  ceil(runs_per_window * p95_active_run_seconds / window_seconds)
)

queue_wait_p95 + run_time_p95 + approval_wait_p95 <= cycle_time_slo
```

All terms in `runs_per_window` use the same measurement window. Set effective concurrency to `0` when planned runs are `0`; otherwise the ceiling keeps positive low-volume demand from rounding down to zero. If a workflow does not require approval, omit the reviewer term rather than dividing by zero. Validate the estimate with observed queue, service-time, burst, and dependency-saturation data before changing concurrency.

## Recovery objectives

| State class | RPO | RTO | Restore verification |
| --- | --- | --- | --- |
| Ephemeral context | Not applicable; context is not durable | New run | Start a new run and rebuild from source revisions |
| Durable workflow checkpoint | Last verified transition | 15 min | Deterministic replay |
| Staged proposal | Last committed stage | 30 min | Digest and policy recheck |
| External effect receipt | `0` loss | 15 min | Source-of-truth reconciliation |
| Audit record | Policy-defined | 4 h | Hash chain / storage integrity |

Use [behavior monitoring](behavior-monitoring.md) to interpret intent, action, effect, and outcome signals together, and [change management](change-management.md) to bind every behavioral change to canary and rollback evidence.
