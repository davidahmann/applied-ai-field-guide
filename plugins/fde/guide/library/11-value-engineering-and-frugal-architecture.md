# Value Engineering and Frugal Architecture

The [12 Factors of AI Value Engineering](14-twelve-factors-ai-value-engineering.md) state the compact value framework. This page turns those principles into a delivery and operating method.

The point of an FDE engagement is not to install an agent. It is to improve a customer outcome through a system that can be operated responsibly.

Use this loop as the design spine:

```text
outcome -> workflow -> decision -> system -> controlled action
        -> accepted result -> measured value -> next decision
```

An agent is only one possible component in that system. The useful unit of analysis is an **accepted outcome**: work that an independent verifier, source-of-truth readback, or accountable reviewer accepts as correct.

Controls: `FDE-001`, `VAL-001`, `VAL-002`, `CST-001`, `CST-002`, `ARC-004`, `ARC-005`.

## Start with the value hypothesis

Write the hypothesis before selecting a model, framework, or vendor:

```text
For [eligible population], improve [owned outcome metric] from [baseline]
to [target] by changing [specific operational decision or action], while
remaining within [quality, risk, adoption, service, and cost guardrails].
```

The [workflow charter](../templates/workflow-charter.json) is the authority for the outcome, owner, segment, baseline, target, verifier, and risk ceiling. The [value case](../templates/value-case.md) makes the economic assumptions inspectable.

## Measure value, not activity

Do not use prompt count, token volume, model calls, lines of generated code, or automation rate as the success metric. Those are inputs or activity signals. They can be useful diagnostics, but they do not prove value.

| Measure | Why it matters | Common mistake |
| --- | --- | --- |
| Eligible population | Defines who could validly benefit | Dividing by all users, including those who could not use the workflow |
| Accepted-outcome rate | Connects system behavior to independently checked work | Counting model completions or tool calls as success |
| Cycle time and capacity | Captures throughput and delay | Improving average time while moving complex cases into a hidden queue |
| Quality, loss, and risk | Captures harmful errors and avoided loss | Claiming savings while moving risk to reviewers or customers |
| Adoption, override, and abandonment | Shows whether the changed work is usable | Treating provisioned seats as adoption |
| Full cost per accepted outcome | Tests whether the system is economically viable | Counting only model spend and ignoring tools, people, retries, and recovery |

Use a counterfactual that fits the workflow: a comparison population, before/after analysis with known confounders, time-series intervention, reconciliation, or an owner-approved proxy. State what the method cannot establish. A pilot result is evidence for the pilot segment, not automatically annual realized value.

## Make cost a design constraint

Use **AI unit economics**, not “tokenomics.” The relevant cost is the full cost of producing an accepted outcome:

```text
cost_per_accepted_outcome =
  (model + retrieval + tool + compute + storage + wait + retry
   + human_review + recovery + allocated service cost)
  / independently_accepted_outcomes
```

Set a cost ceiling, an escalation rule, and a named owner before launch. A run can be technically correct but economically unacceptable. Cost is therefore a non-functional requirement alongside reliability, security, latency, and maintainability. This follows the Frugal Architecture emphasis on value-aligned trade-offs, observability, and continual re-evaluation—not indiscriminate cost cutting. [R26-63] [R26-64]

### Explain agent-work cost without losing the outcome denominator

For model-mediated work, decompose the spend beneath the full service metric:

```text
users × sessions/user × turns/session × requests/turn × tokens/request × price/token
```

This sequence separates adoption, engagement, orchestration, payload, and price effects. It is a diagnostic identity, not the value equation: tool, compute, storage, wait, retry, human-review, recovery, and allocated-service cost still belong in `cost_per_accepted_outcome`. State which factor moved and preserve the remaining residual rather than attributing a mixed change to one optimization.

When claiming a saving, compare the same representative workload against the current route. Hold the model and enforced resource budget constant when isolating a context, batching, caching, or tool-loading change; separately test a model change on accepted-outcome quality, reliability, latency, and full cost. Re-run the Pareto comparison after material model, prompt, context, tool, topology, workload, or verifier changes. [R26-77](../research/2026-08-28--uber-production-ai-operating-lessons.md#r26-77)

### Frugal system choices

Apply these in order when they preserve the accepted outcome and risk ceiling:

1. Remove unnecessary work, duplicate retrieval, and avoidable review before optimizing a model call.
2. Use deterministic rules, calculations, queries, or validation for known logic.
3. Use the smallest adequate model or algorithm for the decision slice; route difficult cases upward rather than using the most expensive model everywhere.
4. Retrieve only fresh, authorized evidence needed for the decision; cache stable, non-sensitive context with invalidation rules.
5. Batch asynchronous work where the user does not need an immediate result; bound fan-out, retries, tool calls, time, and concurrency.
6. Escalate ambiguous, low-confidence, high-risk, or over-budget work to a person or a safer workflow.
7. Review cost, quality, latency, adoption, and recovery together; a local saving that increases review load or loss is not frugal.
8. Inspect zero-value work: repeated searching, avoidable turns, oversized tool results, model-visible polling, unused schemas, and an unnecessarily expensive route.

The [production service review](../templates/production-service-review.md) and [SLO scorecard](../operations/slo-scorecard.md) are the recurring decision points for this work.

## Value engineering is a delivery discipline

| FDE moment | Question to answer | Evidence to retain |
| --- | --- | --- |
| Discover | Is the decision important, repeated, owned, and observable? | Observation log, workflow map, exception set |
| Charter | Is the expected outcome measurable and worth pursuing? | Baseline, target, owner, verifier, value case |
| Design | Which system component should make each decision? | Architecture and intelligence-selection records |
| Prove | Does the system produce safe, accepted results under representative conditions? | Replay, user review, shadow, and evaluation evidence |
| Launch | Can the customer support and reverse it within the risk and cost ceiling? | Release decision, service owner, runbooks, rollback |
| Operate | Is value still real after adoption, drift, and change? | Outcome, quality, cost, review-load, and incident trends |

If the work has no credible baseline, verifier, owner, adoption path, or positive value case, the correct FDE outcome is often **defer**, **redesign**, or **do not build**. That is value engineering, not failure.

## Anti-patterns

- An ROI claim based on activity, tokens, or model quality without accepted outcomes.
- Savings that omit the cost of integration, change management, human review, recovery, support, or compliance.
- A universal “frontier model” route with no difficulty or risk-based escalation policy.
- Cost reduction that weakens authorization, verification, resiliency, or operator capability.
- Treating a successful pilot as proof that the customer can own the service.

[R26-63]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-63
[R26-64]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-64
