# Discovery, Value Engineering, and Frugal Architecture

The first deliverable is a shared, evidence-backed definition of the work, the decision that matters, the value at stake, and the smallest intervention worth testing. An internal mandate to “use AI” needs this just as much as a customer brief does.

Use the [12 Factors of AI Value Engineering](../library/14-twelve-factors-ai-value-engineering.md) as the compact principles layer and this playbook as the evidence and decision sequence. The factors do not replace hard gates, target-specific economics, or accountable owners.

Palantir's use-case guidance starts with a time-bounded operational outcome rather than a source integration, dashboard, or model technique. OpenAI describes FDE ownership across discovery, design, rollout, adoption, and measurable workflow impact. The portable synthesis is an outcome-backward engagement with continuous operator contact. [R26-37] [R26-41]

## Joint delivery team

One person may hold several ownership or delivery roles during a small pilot, but each decision right remains explicit. Approval roles required by a selected release gate use independent principals; one person cannot approve the same change in multiple required roles.

| Role | Accountable for | Cannot delegate away |
| --- | --- | --- |
| Executive sponsor | Strategic priority, organizational blockers, funding | Whether the outcome still matters |
| Operational owner | Workflow result, process policy, service acceptance | Definition of accepted work |
| Domain expert/operator | Real cases, exceptions, review quality, usability | Validation of observed work |
| Delivery lead or FDE | Discovery, solution coherence, execution, evidence | Connecting field facts to design decisions |
| Product or applied-AI owner | Reusable product surface, platform boundary, and productization choices | What is generic versus workflow-specific, and whether a field learning becomes a product change |
| Technical owner | Architecture, integration, release, maintainability | Production engineering acceptance |
| Data/tool owner | Source quality, interfaces, permissions, change notices | Source and capability contracts |
| Risk/security owner | Threats, policy, prohibited effects, release constraints | Risk acceptance |
| Service owner | SLOs, support, incident response, maintenance | Production health after launch |

Controls: `FDE-001`, `FDE-002`, `ADP-002`.

## Use strategic and operating apertures

Start broad enough to understand why the work matters, then get close enough to see how it actually happens. The strategic aperture captures owned goals, material blockers, decision deadlines, economic exposure, and who can fund, reshape, or stop the work. The operating aperture inspects representative cases with the operational owner, process knower, operators, source owners, and technical owners.

Return to the people who stated the strategic intent with the observed workflow, contradictions, and missing evidence. A disagreement between the two apertures is a discovery result to resolve, not a reason to average the accounts or write a cleaner roadmap. Seniority does not make a workflow claim true, and an operator observation does not grant funding, policy, or disposition authority.

This is a loop, not a mandatory interview order. Start with the person who has the widest relevant aperture and available authority; follow referrals toward the people, cases, systems, and evidence needed for the current decision. Surveys and transcripts may stage hypotheses, but they do not replace representative observation or direct technical evidence.

## 1. Qualify before discovery

Apply hard gates before a weighted score. A candidate does not proceed when any of these conditions is true:

- No accountable operational owner or affected user population
- No decision, action, or work product that can be bounded
- No measurable outcome or credible plan to establish a baseline
- No affordable verifier or accountable reviewer
- Necessary context cannot be accessed lawfully or kept current
- The first useful release requires an irreversible high-stakes effect
- No plausible path for operators to adopt the changed workflow
- No team can own support, incident response, and change after the pilot

Candidates that pass can be ranked by business impact, eligible volume, time saved, avoided loss, verification coverage, context and integration readiness, adoption probability, risk, implementation effort, and time to evidence. Impact-versus-effort is a useful prioritization view, but it does not cancel a missing owner, verifier, or safety boundary. [R26-39]

For each candidate, name its primary value surface: a customer-visible interaction, internal enablement, cost or capacity, or risk and control. When a customer waits, complains, abandons, disputes, or cannot accept the result, test whether one bounded interaction can improve within the evidence window and how the customer or accountable proxy will verify that change. Customer visibility is a useful candidate-generation lens, not a universal priority rule; an internal control, safety, or operating workflow may be more consequential.

Control: `VAL-003`.

## 2. Frame the operational requirement

Use this minimum sentence:

```text
[user or role] uses [working surface] to make [decision]
from [decision inputs], then performs [permitted action]
so that [accepted outcome] changes [owned metric].
```

Record the trigger, frequency, eligible segment, current cycle, downstream dependencies, source systems, current owner, and evidence of completion. The sentence must describe the actual work even if no agent is built. [R26-41]

Bad scopes:

- Add an agent to finance
- Connect the CRM to an LLM
- Build an executive dashboard
- Automate the support organization

Useful scope:

- A named reviewer resolves policy-covered invoice exceptions from a persistent review queue, using current invoice and approval-policy evidence, and stages a resolution that is accepted only after ledger readback.

Control: `FDE-001`.

## 3. Observe the work

Interview descriptions are hypotheses. Observe representative normal cases, hard cases, recent failures, policy exceptions, and handoffs. Use screen recordings, event history, example inputs and outputs, audit trails, queue data, and paired walkthroughs when permitted. Minimize and redact captured evidence.

For each step, record:

- Actor, trigger, input, system, decision, output, and next owner
- Evidence inspected and how freshness or authority is judged
- Rule, professional judgment, and accountability boundary
- Workaround, duplicate entry, hidden spreadsheet, side channel, or waiting state
- Failure, exception, escalation, and recovery path
- Definition of done and how another person verifies it
- Frequency, duration, queue time, rework, and consequence

Do not automate every observed behavior. Classify each as preserve, repair, remove, or escalate. A workaround caused by poor data or broken authorization is not automatically domain expertise.

Treat operational knowledge as a validation problem, not a transcription exercise. For every candidate fact, rule, exception, or instruction, record its source, owner, scope, classification, freshness, and disposition:

- A fact becomes governed evidence only when its source-of-truth and validity boundary are known.
- A rule becomes deterministic policy only when the accountable owner confirms it.
- A judgment becomes a candidate AI or human-review route only after its evidence, authority ceiling, fallback, and verifier are defined.
- A workaround becomes a repair, removal, escalation, or explicitly retained local procedure—not an implicit prompt instruction.

Keep customer-specific policies and data with their owner. Promote only an abstracted method, interface shape, failure class, or evaluation pattern after recurrence and portability are validated in the [field-learning register](../templates/field-learning-register.md). `CTX-001`, `CTX-002`, `FDE-004`.

Control: `FDE-002`.

### Check the technical reality directly

Before assigning a readiness score or proposing an architecture, inspect enough of the target environment to test the workflow story. The relevant evidence depends on the boundary, but it commonly includes:

- Current code or configuration that implements the decision path
- Data pipelines, source seams, transformations, and reconciliation behavior
- Identity, permission, tenant, credential, and network boundaries
- Telemetry from representative executions, failures, retries, and recovery
- Release, rollback, support, and dependency constraints in the target environment

Record what was inspected, its revision and environment, who owns it, which claim it supports or contradicts, and what remains inaccessible. A questionnaire, interview, architecture diagram, or maturity score can organize hypotheses; none proves workflow, data, integration, security, or production readiness. If direct evidence is unavailable, keep the claim `unknown` and make the missing access or test a readiness dependency rather than filling the gap with confidence.

Controls: `FDE-002`, `CTX-001`, `IAM-003`, `OPS-006`.

## 4. Establish the baseline

Separate four kinds of evidence:

| Evidence | Example | Decision it supports |
| --- | --- | --- |
| Current-state baseline | Eligible volume, cycle time, error or rework rate, review effort | Is the problem material? |
| Technical evidence | Contract, task, trajectory, and effect results | Can the system perform safely? |
| Adoption evidence | Eligible use, completion, override, abandonment, and reviewer load | Does the workflow work for people? |
| Business evidence | Accepted-outcome change, avoided loss, throughput, revenue, risk | Is value being realized? |

An unmeasured baseline stays labeled `unmeasured`; an estimate stays labeled `estimated`. `illustrative_fixture` is reserved for the repository's canonical structural example and is not an engagement evidence status. Before the baseline governs a proof decision, its metric owner and verifier acknowledge the exact source revision, as-of date, exclusions, disputed assumptions, and rebaseline triggers. Preserve disagreement rather than retrofitting the baseline after seeing the result. A pilot result must not be relabeled as annual realized value.

Control: `VAL-001`.

## 5. Build a falsifiable value case

Use the [value-case template](../templates/value-case.md). A transparent planning model is:

```text
annual_realized_value =
  eligible_volume
  × measured_adoption_rate
  × accepted_outcome_uplift
  × value_per_accepted_outcome
  + measured_avoided_loss
  - residual_loss_adjustment
  - annual_variable_cost
  - annual_fixed_operating_cost

annual_variable_cost =
  eligible_runs
  × (model + tool + compute + storage + retry + wait + human_review + recovery cost)

residual_loss_adjustment =
  0 when the exposure is already netted from unit value or avoided loss
  otherwise separately attributed residual or incremental harm
```

Use ranges when inputs are uncertain. Avoided loss is a measured reduction from the baseline; subtract residual loss separately only when it represents harm not already netted from avoided loss or unit value. For one loss class, use either gross exposure minus residual loss or net avoided loss—never both. If residual loss is unmeasured, keep it `null`, lower confidence, and do not claim a complete net-value result. Declare the attribution method: comparison group, before/after with controls, time-series intervention, reconciliation, or owner-approved proxy. Report confidence and sensitivity rather than hiding them inside a single ROI number.

Control: `VAL-002`.

## 6. Make the cost and architecture decision explicit

Record the full cost per accepted outcome before selecting an expensive model route or adding autonomy. Include model, retrieval, tools, compute, storage, waiting, retries, human review, recovery, support, and allocated delivery cost. Cost is a non-functional requirement, not a post-launch optimization. [R26-63] [R26-64]

For each consequential decision, compare deterministic logic, optimization, classical ML, retrieval, foundation-model interpretation, bounded agency, and human review when relevant. Select the smallest sufficient mechanism and name its fallback. Use the [intelligence-selection record](../templates/intelligence-selection-record.md).

Control: `ARC-005`.

## 7. Design the change, not only the system

An executive sponsor and an operator judge a pilot differently. Capture both contracts before implementation:

| Audience | Must improve | Evidence before expansion |
| --- | --- | --- |
| Executive or operational sponsor | Owned outcome, risk posture, and full economics | Baseline, attribution method, guardrails, service owner, and stop conditions |
| Operator or domain expert | Work surface, evidence access, exception handling, review load, and support | Shadow comparison, correction/override evidence, training completion, abandonment and wait-time guardrails |
| Product or applied-AI team | Reusable capability without unsafe generalization | Explicit customer-specific boundary, validated recurrence, destination, and normal release evidence |

Before recommending `pilot`, freeze a time-bounded graduation contract in the [delivery and adoption plan](../templates/delivery-and-adoption-plan.md). Technical performance, operator acceptance, adoption, business-value evidence, full economics, and production readiness are separate gates. Name the evidence cutoff, decision date, owner, and stop, redesign, transfer, or promotion path; a composite score cannot average away a failed gate. Also confirm the sponsor, workflow owner, operators, data/policy authority, metric owner/verifier, and receiving owner can provide the evidence and decisions the proof requires, with delegates or a stop path when they cannot.

Treat the pilot as a decision instrument, not a miniature transformation. Material proof work should leave an inspectable decision, tested assumption, working increment, or sanitized reusable learning. This is a diagnostic against activity without decision value—not a fixed duration, staffing plan, or excuse to bypass necessary integration, security, adoption, or operating work. `FDE-003`, `VAL-001`, `VAL-002`, `ADP-002`.

The pilot should improve the work around current systems of record before forcing a platform migration. If data ownership, identity, access, or auditability is inadequate, make that remediation a readiness dependency rather than hiding it behind an AI layer. `FDE-003`, `ADP-001`, `ADP-002`.

Use the [data-readiness assessment](../templates/data-readiness-assessment.md) to separate operational, knowledge/context, evaluation/training, and telemetry/feedback uses. Inventory where decision-bearing sources live, their owners and authority, population and time semantics, quality thresholds, preparation and correction paths, generated-output obligations, remediation economics, and production monitors. Start the [data-context manifest](../templates/data-context-manifest.json) now; refine it after mechanism selection and bind it to release evidence.

Unknown quality on a decision-critical field is a condition to remediate, constrain, or stop. A general data-platform score, clean demo dataset, or vector index does not prove readiness for this decision. `CTX-006`, `CTX-007`, `CTX-008`.

## 8. Assess readiness

Score each dimension from `0` to `4`, and attach evidence:

| Score | Meaning |
| ---: | --- |
| 0 | Unknown or absent |
| 1 | Hypothesis with an owner |
| 2 | Partially observed or prototyped |
| 3 | Representative evidence exists |
| 4 | Measured in the target operating environment |

Assess workflow clarity, context ownership/freshness, verifier quality, integration contracts, user adoption, risk controls, and production operations. A total score is not a release gate. A zero in verifier quality is blocking; missing authenticated authority, accountable operational/service ownership, or a lawful data path is a hard-gate failure outside the score.

## 9. Charter or stop

Complete the machine-readable [workflow charter](../templates/workflow-charter.json). The charter records:

- Problem and users
- Scope, initial segment, maximum effect, and autonomy ceiling
- Accepted event, verifier, metric baseline, target, and guardrails
- Value assumptions and attribution method
- Readiness evidence and blocking constraints
- Decision, rationale, approvers, and open assumptions

Permitted decisions are discover, pilot, defer, do not build, promote, pause, or retire. “Build an impressive demo” is not a disposition.

## Discovery exit gate

- [ ] Representative work and exceptions were observed.
- [ ] Decision-bearing code, configuration, data seams, identity boundaries, and representative execution evidence were inspected where applicable, or the missing access is recorded as a blocker.
- [ ] Operator and operational owner validated the current-state map.
- [ ] The workflow requirement names user, interface, decision, inputs, action, and outcome.
- [ ] The baseline is measured or explicitly unmeasured with a measurement plan.
- [ ] The verifier and maximum acceptable failure are named.
- [ ] Context, integration, adoption, security, and operations readiness are evidenced.
- [ ] Value assumptions are falsifiable and have owners.
- [ ] Pilot segment, duration, evidence cutoff, separate graduation gates, stop conditions, decision date, and post-pilot owner are explicit.
- [ ] The workflow charter is approved for the next stage.

## Discovery anti-patterns

- Executive-only requirements with no operator observation
- Questionnaire or maturity score treated as direct technical evidence
- Technology, data source, or interface named as the business problem
- Demo success treated as adoption, value, or production readiness
- Average handling time used without eligible volume, quality, or downstream impact
- Automation of a workaround that should be removed
- Weighted opportunity score used to override a missing gate
- FDE retained as the implicit operational owner

[R26-37]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-37
[R26-39]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-39
[R26-41]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-41
[R26-63]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-63
[R26-64]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-64
