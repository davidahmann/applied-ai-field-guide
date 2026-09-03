---
name: engineer-ai-value
description: Engineer the measurable value and full-cost case for an already bounded AI-enabled workflow. Use for counterfactuals, outcome economics, cost ceilings, adoption-adjusted value, portfolio comparison, pilot value gates, or live continue, constrain, pause, and retire decisions.
---

# Engineer AI Value

Make value an operating contract rather than a slide-deck estimate. Measure accepted outcomes, not model activity, token volume, or feature usage alone.

## Read first

1. Confirm the bounded workflow is current and has no unresolved material reframe, then read the [12 Factors of AI Value Engineering](../../../library/14-twelve-factors-ai-value-engineering.md), its portable [scorecard](../../../guide/ai-value-engineering-scorecard.md), and [Value Engineering and Frugal Architecture](../../../library/11-value-engineering-and-frugal-architecture.md).
2. Use the machine-readable [scorecard template](../../../templates/ai-value-engineering-scorecard.json), [value-case template](../../../templates/value-case.md), and authoritative [workflow-charter template](../../../templates/workflow-charter.json).
3. If qualification records a business-flow pattern or vertical profile, resolve it through the [solution portfolio](../../../solutions/README.md) and read only the selected artifacts. Use their outcome measures and non-claims as hypotheses; local evidence and owners control.
4. Apply `VAL-001` through `VAL-003`, `CST-001`, `CST-002`, and `FDE-003` from the [control catalog](../../../controls/control-catalog.json).

## Workflow

1. Define the accepted outcome, metric owner, eligible population, measurement window, baseline status, target, attribution method, and guardrails.
2. Estimate value from adopted eligible use and independently accepted outcomes. Include avoided loss or unit value only when its source and owner are explicit, and do not count the same benefit twice.
3. Calculate full delivery and operating cost: implementation, change and training, models, tools, compute, storage, retries, wait time, human review, support, recovery, and ongoing maintenance.
4. Model expected or realized residual loss separately only when it is not already netted from avoided loss or unit value; state the risk owner, period, and attribution method.
5. Set a maximum cost per accepted outcome and run-level resource budgets. Define the escalation or stop response when either is breached.
6. Test sensitivity to adoption, acceptance rate, unit value, residual loss, incident cost, review load, and volume. Distinguish measured values from assumptions and show a downside case.
7. Recommend `pilot`, `defer`, or `do_not_build` only after defining the pilot's maximum duration, evidence cutoff, separate technical, operator, adoption, value, economics, and production-readiness graduation thresholds, decision owners, and stop path. For an already-live workflow, state a separate `continue`, `constrain`, `pause`, or `retire` decision. Preserve the assumptions that would reverse either decision.

## Output contract

Return:

- an updated value case linked to its workflow charter;
- a completed scorecard with no total score and no hard gate averaged away;
- a formula with units, sources, owners, and measured-versus-assumed labels;
- base and downside economics, cost ceiling, and guardrails;
- time-bounded pilot measurement and graduation plan with separate gate thresholds;
- forecast, demonstrated, or realized evidence status, factor-gate blockers, a value decision, and the next evidence needed.

Do not claim realized value from a pilot forecast, technical pass rate, generated output, or gross time saved. If adoption, acceptance, or attribution cannot be measured credibly, narrow the claim or keep it explicitly provisional.
