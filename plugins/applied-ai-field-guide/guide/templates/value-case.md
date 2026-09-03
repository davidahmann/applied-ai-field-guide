# Value Case

## Outcome contract

The referenced `workflow-charter.json` is authoritative for shared workflow, segment, owner, outcome, verifier, baseline, target, attribution, and guardrail fields. Record a charter change there first, then synchronize this planning model and update the timestamp below. `illustrative_fixture` is reserved for the repository's canonical JSON example and must be replaced with `unmeasured`, `estimated`, or `measured` in an engagement artifact.

| Field | Value |
| --- | --- |
| Workflow-charter URI | — |
| Workflow-charter version | — |
| Last synchronized at | — |
| Workflow and eligible segment | — |
| Operational owner | — |
| Accepted outcome | — |
| Independent verifier | — |
| Primary metric and direction | — |
| Baseline status: unmeasured, estimated, or measured | — |
| Baseline value, date, source, and denominator | — |
| Target and measurement window | — |
| Attribution method | — |
| Guardrail metrics | — |

## Assumption model

| Input | Low | Expected | High | Evidence and owner |
| --- | ---: | ---: | ---: | --- |
| Annual eligible volume | — | — | — | — |
| Adoption rate | — | — | — | — |
| Accepted-outcome uplift | — | — | — | — |
| Value per accepted outcome | — | — | — | — |
| Annual avoided loss | — | — | — | — |
| Annual expected residual loss not already netted from unit value or avoided loss | — | — | — | — |
| One-time implementation and change cost | — | — | — | — |
| Annual fixed operating cost | — | — | — | — |
| Variable model, tool, compute, storage, retry, and wait cost per eligible run | — | — | — | — |
| Human review and recovery cost per eligible run | — | — | — | — |

```text
annual_gross_realized_value =
  eligible_volume
  × measured_adoption_rate
  × accepted_outcome_uplift
  × value_per_accepted_outcome
  + measured_avoided_loss

annual_net_value_before_system_cost =
  annual_gross_realized_value
  - residual_loss_adjustment

residual_loss_adjustment =
  0 when the exposure is already netted from unit value or avoided loss
  otherwise separately attributed residual or incremental harm

annual_variable_cost =
  eligible_runs
  × (variable_system_cost_per_eligible_run
     + human_review_and_recovery_cost_per_eligible_run)

steady_state_annual_net_value =
  annual_net_value_before_system_cost
  - annual_variable_cost
  - annual_fixed_operating_cost

year_one_net_value =
  steady_state_annual_net_value
  - one_time_implementation_and_change_cost

payback_months =
  one_time_implementation_and_change_cost
  / positive_steady_state_monthly_net_value
```

Do not calculate payback when steady-state monthly net value is zero or negative. Avoided loss is a measured reduction from the baseline; subtract residual loss separately only when it represents harm not already netted from avoided loss or unit value. For one loss class, use either gross exposure minus residual loss or net avoided loss—never both. If residual loss is unmeasured, keep it `null`, lower confidence, and do not claim a complete net-value result. Keep one-time, fixed, variable-system, and human-review/recovery costs mutually exclusive and state the currency, period, and allocation method.

## Evidence gates

| Gate | Evidence | Threshold | Owner | Status |
| --- | --- | --- | --- | --- |
| Problem materiality | Current-state baseline | — | Operational | — |
| Technical feasibility | Representative replay and effect verification | — | Technical | — |
| Operator acceptance | Reviewed cases and usability evidence | — | Product/operations | — |
| Adoption | Eligible use, completion, override, abandonment | — | Operational | — |
| Business value | Attributed accepted-outcome movement | — | Metric owner | — |
| Economics | Full cost per accepted outcome and payback | — | Sponsor/finance | — |
| Production readiness | Release, support, recovery, ownership | — | Service/risk | — |

## Sensitivity and disconfirming evidence

| Assumption | Result if wrong | Earliest signal | Stop or redesign threshold |
| --- | --- | --- | --- |
| — | — | — | — |

## Decision

Record `discover`, `pilot`, `defer`, `do_not_build`, `promote`, `pause`, or `retire`, with the evidence date, approvers, limitations, and next review.
