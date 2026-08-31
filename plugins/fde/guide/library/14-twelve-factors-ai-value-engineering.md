# The 12 Factors of AI Value Engineering

> **12 factors. 4 hard gates. One outcome: accepted value.**

## Turn AI activity into accepted outcomes

AI has an accounting problem.

Teams measure tokens, model calls, generated code, agents deployed, and hours reportedly saved. These measures describe the production and consumption of intelligence. They do not establish that anything valuable happened.

Organizations ultimately pay for changed outcomes: an invoice exception is resolved and confirmed in the ledger; a shipment case reaches the right coordinator before service is affected; a release reaches production, passes its checks, and remains healthy.

An **accepted outcome** is a completed unit of work that an independent verifier, authoritative system, or accountable reviewer accepts as correct. AI value engineering connects that outcome to eligible demand, adoption, attribution, full cost, and risk.

```text
expected net value =
  eligible volume
  × expected adoption
  × expected incremental accepted-outcome rate
  × value per accepted outcome
  − expected lifecycle cost
  − expected residual loss not already netted from avoided loss or unit value
```

```text
realized net value =
  attributable incremental accepted outcomes
  × realized value per accepted outcome
  − actual lifecycle cost
  − realized loss not already netted from avoided loss or unit value
```

Keep units, periods, currencies, populations, and attribution explicit. Avoided loss is a measured reduction from the baseline; residual loss is deducted separately only when it represents harm not already netted from avoided loss or unit value. For one loss class, use either gross exposure minus residual loss or net avoided loss—never both. Lifecycle cost includes delivery, change, models, tools, infrastructure, security and assurance, human review, support, recovery, and ongoing maintenance.

If residual loss is unmeasured, keep it unknown, lower confidence, and do not present the net-value result as complete. Zero is evidence, not a default.

The objective is not to maximize intelligence, tokens, automation, or autonomy. It is to improve an owned outcome within accepted cost and risk ceilings.

## 1. Observe the real work

Do not automate the process described in a slide deck. Observe how the work actually happens.

Map actors, decisions, systems, exceptions, workarounds, hidden queues, and informal judgment. Valuable context often exists in what experienced operators do when the documented process breaks. Classify each observed behavior as preserve, repair, remove, or escalate; a workaround is not automatically domain expertise.

Without observation, a team automates an imaginary workflow and pushes difficult work somewhere less visible.

**Evidence:** [Field-observation log](../templates/field-observation-log.md), workflow map, exception inventory, source-of-truth rules. `FDE-002`.

## 2. Own the outcome

Define the operational result before selecting the technology.

Name the outcome, accountable owner, target population, authoritative source, and conditions under which the work is complete. “Generate a response” is an output. “Resolve the exception and confirm the corrected balance in the ledger” is an outcome.

If nobody owns the result, the system does not have a business objective. It has a capability looking for one.

**Evidence:** [Workflow charter](../templates/workflow-charter.json), outcome owner, target, acceptance definition. `FDE-001`, `VAL-001`.

## 3. Bound the eligible work

State exactly which work qualifies for the system and which work does not.

Eligibility may depend on customer, transaction type, risk, data availability, jurisdiction, workflow state, or exception class. Declare the denominator before calculating adoption or success.

A system that handles most easy cases may create less value than one that handles a smaller set of expensive cases. Aggregated averages hide this distinction.

**Evidence:** Eligibility rules, exclusions, segments, estimated eligible volume, and denominator event in the [workflow charter](../templates/workflow-charter.json). `VAL-001`.

## 4. Establish the counterfactual

Measure the current workflow before claiming improvement.

Record baseline quality, cost, latency, capacity, rework, abandonment, loss, and failure rates. Define how the changed workflow will be compared with what would have happened without it.

A before-and-after chart is not automatically causal evidence. Process, demand, staffing, selection, and policy changes may explain part of the result. State the known confounders and the limits of the attribution method.

**Evidence:** Baseline dataset, comparison method, known confounders, measurement window, and [value case](../templates/value-case.md). `VAL-001`, `VAL-002`.

## 5. Name the verifier

The system producing the work should not be the sole judge of whether it succeeded.

Verification may come from deterministic checks, reconciliation with a system of record, independent evaluation, downstream confirmation, or an accountable human reviewer. The verifier must be able to reject the result.

Acceptance means more than an agent reaching the end of its workflow.

**Evidence:** Acceptance rules, verifier identity, representative [evaluation cases](../templates/evaluation-case.json), rejection, and escalation paths. `FDE-001`, `EVA-001`, `REL-003`.

## 6. Engineer the workflow and adoption

A technically successful system creates no value if people cannot or will not use it.

Design how work enters the system, when people review it, how exceptions return to operators, who supports it, and how the changed process fits existing incentives and responsibilities.

If users must reconstruct every result before trusting it, the work was not automated. If the system moves difficult cases into a hidden queue, it has not improved the workflow.

**Evidence:** [Delivery and adoption plan](../templates/delivery-and-adoption-plan.md), persistent work surface, human handoffs, training, support ownership, override, wait, and abandonment measures. `FDE-003`, `ADP-001`, `ADP-002`.

## 7. Use the smallest sufficient intelligence

Do not begin by deciding that the problem requires an agent.

Decompose the workflow into decisions. For each decision, compare deterministic software, queries, optimization, classical ML, retrieval, foundation-model calls, bounded agents, and human judgment.

Use the smallest mechanism that meets the outcome, quality, cost, and risk requirements. Escalate difficult cases instead of routing every decision through the most capable model. More AI can mean the workflow was never properly decomposed.

**Evidence:** [Intelligence-selection record](../templates/intelligence-selection-record.md), alternatives, evaluation, fallback, cost, monitor, and retirement rationale. `ARC-004`, `ARC-005`.

## 8. Bound authority and loss

Capability does not grant authority.

Specify what the system may read, write, execute, publish, approve, or change. Bind permissions to the workflow, actor, tenant, purpose, task, target, duration, and consequence.

Define where human approval is required, how duplicate effects are prevented, what happens when the result is uncertain, and how the system is stopped, reconciled, or reversed. Individually permitted actions can still compose into an unacceptable outcome; review the full action path.

**Evidence:** Authority matrix, [tool contracts](../templates/tool-contract.json), [threat model](../templates/threat-model.json), approval policy, expected-loss ceiling, and recovery tests. `IAM-003`, `SEC-004`, `REL-001`, `REL-003`, `REL-005`.

## 9. Price the whole service

Tokens are only one cost.

Include delivery, integration, change, models, retrieval, infrastructure, tools, storage, wait, retries, human review, rework, security and assurance, support, incidents, recovery, and ongoing maintenance.

```text
cost per accepted outcome =
  total operating and allocated lifecycle cost
  ÷ independently accepted outcomes
```

A cheaper model can make the surrounding workflow more expensive. A technically correct result can still be economically unacceptable.

**Evidence:** [Full-cost model](../templates/value-case.md), cost ceiling, run budget, budget owner, and escalation rule. `CST-001`, `CST-002`.

## 10. Prove it on representative work

A successful demonstration proves that a path can work. It does not prove that the system is ready for real operations.

Evaluate representative cases, difficult slices, known exceptions, adversarial conditions, dependency failures, recovery, and human-review capacity. Move through controlled stages such as offline evaluation, shadow operation, canary release, and bounded production.

Every expansion needs explicit promotion and rollback criteria.

For a pilot, predeclare its maximum duration, evidence cutoff, decision owner, and separate technical, operator, adoption, value, economics, and production-readiness graduation gates. A successful demonstration or composite score cannot average away a failed gate.

**Evidence:** Evaluation suite, slice-level results, failure tests, applicable release decision, and rollback plan. For a model/agent release, use the [evaluation report](../templates/evaluation-report.json) and [solution-release decision](../templates/solution-release.json); deterministic, optimization, or classical-ML-only systems retain equivalent target software evaluation and release evidence. `EVA-001`, `EVA-003`, `DEL-001`.

## 11. Measure attributable realized value

Track the complete path from eligibility to economic effect:

```text
eligible work
  -> reached workflow
  -> completed workflow
  -> accepted outcome
  -> measured business effect
  -> sustained net value
```

Report non-adoption, overrides, rework, reviewer load, incidents, recovery, and full cost alongside successful outcomes. Keep estimated, demonstrated, and realized value separate. A pilot result applies to its tested population and period until additional evidence supports extrapolation.

**Evidence:** Value ledger, [production service review](../templates/production-service-review.md), attribution method, actual cost, and realized loss. `VAL-002`, `OPS-004`, `OPS-006`, `CST-001`.

## 12. Expand, constrain, or retire from evidence

Autonomy and investment must earn their way forward.

Expand when accepted outcomes, adoption, economics, reliability, ownership, and recovery remain healthy for the relevant segment. Constrain when failures, cost, ambiguity, or reviewer load exceed agreed limits. Retire systems that no longer create sufficient value, have lost their owner, or cannot be operated responsibly.

A stronger benchmark, larger model, or higher usage number does not automatically justify more authority.

When several workflows compete for investment, an [FDE and applied-AI portfolio review](../templates/fde-portfolio-review.md) may compare stage flow, time to accepted outcome and value, full delivery economics, continuation health, capacity, and responsible reuse. Portfolio evidence routes attention; it never overrides an individual workflow's value, safety, release, ownership, or retirement gate.

**Evidence:** [Service review](../templates/production-service-review.md), expansion decision, constraint triggers, [change assessment](../templates/change-impact-assessment.json), rollback evidence, and retirement plan. `VAL-003`, `ADP-002`, `OPS-007`.

## Use the factors as gates, not an average

Four factors are hard gates:

1. An owned, measurable outcome
2. A credible independent verifier
3. Bounded authority and expected loss
4. A plausible positive value case after full cost

If any gate is missing, the correct decision may be `defer`, `redesign`, or `do_not_build`.

Assess the remaining factors as:

- **0 — undefined:** no owner or inspectable definition;
- **1 — declared:** definition and owner exist, but representative evidence does not;
- **2 — demonstrated:** inspectable evidence exists for the named segment and environment.

The score supports a conversation. It is not a certification, and strong factors do not average away a failed gate.

Use the one-page [AI Value Engineering Scorecard](../guide/ai-value-engineering-scorecard.md) for a portable assessment, visual, PDF, and machine-readable decision record. The scorecard is an interface to this framework, not a separate method or production-readiness certification.

## Apply the framework

| Factors | Primary working artifacts |
| --- | --- |
| 1–5: work, outcome, population, counterfactual, verifier | [Discovery and Value](../playbooks/01-discovery-and-value.md), [workflow charter](../templates/workflow-charter.json), [value case](../templates/value-case.md) |
| 6–8: adoption, mechanism, authority | [Delivery plan](../templates/delivery-and-adoption-plan.md), [intelligence selection](../templates/intelligence-selection-record.md), [system design](../playbooks/02-solution-and-delivery.md) |
| 9–10: full cost and representative proof | [Value engineering](11-value-engineering-and-frugal-architecture.md), applicable evaluation and release evidence, model/agent [evaluation report](../templates/evaluation-report.json) where selected, and [release gates](../operations/release-gates.md) |
| 11–12: realized value and lifecycle decision | [Service review](../templates/production-service-review.md), optional multi-workflow [portfolio review](../templates/fde-portfolio-review.md), [operate and scale](../playbooks/03-operate-and-scale.md), [change management](../operations/change-management.md) |

The framework synthesizes this guide's controls and field method. It is informed by outcome-led FDE practice, accepted-outcome economics, Frugal Architecture, and the distinction between AI activity and value recorded in the [source index](05-source-index.md#s11) and [research ledger](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-63). It is project guidance, not an external standard.

## The principle

> **Tokens are an input. Autonomy is a design choice. Accepted outcomes are the product.**

“Valuemaxxing” may be used as informal shorthand for maximizing durable net value, but it is not the framework name, a score, or a requirement to maximize automation. The durable names are **The 12 Factors of AI Value Engineering** and the **AI Value Engineering Scorecard**.

Sometimes that produces a larger agent deployment. Sometimes it produces a smaller model, a deterministic rule, a better interface, or a person with better evidence.

The point is not to use more AI. The point is to make the outcome worth the system required to produce it.
