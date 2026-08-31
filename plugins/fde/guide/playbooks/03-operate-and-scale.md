# Operate and Scale

Production is a continuing product and service commitment. The operating team must prove that the workflow remains valuable, reliable, safe, adopted, supportable, and economical as users, data, policies, tools, models, and organizational priorities change.

## 1. Establish the service contract

Before launch, name:

- Operational owner, technical owner, risk owner, service owner, and on-call route
- Supported segments, autonomy levels, tool bundles, and excluded work
- Accepted outcome, primary value metric, guardrails, and SLOs
- Data, policy, tool, model, and vendor dependencies with owners and change notices
- Support hours, escalation paths, severity, response, and recovery expectations
- Release authority, rollback authority, and kill-switch operators
- Training owner, user guide, access process, and support intake
- Retention, audit, privacy, and retirement requirements

Control: `ADP-002`.

## 2. Run a layered operating cadence

| Cadence | Review | Required decisions |
| --- | --- | --- |
| Continuous | Prohibited effects, authorization denials, data freshness, kill switches, queue and dependency health | Contain, degrade, or continue |
| Daily | Incidents, failed or effect-unknown runs, reviewer backlog, SLO burn | Assign owner, reconcile, pause segment |
| Weekly | Behavior clusters, evaluation failures, overrides, abandonment, support themes, candidate regressions | Fix, add replay, redesign, or accept debt |
| Monthly | Accepted outcomes, adoption, value realization, full cost, evaluator calibration, sponsor continuity, continuation timing, model/tool/policy changes | Expand, constrain, reprioritize, or retire |
| Quarterly | Portfolio value, stage flow, full delivery economics, target-specific effort, reuse, operating maturity, dependency lifecycle, receiving-team capability, and delivery capacity | Invest, standardize, productize, transfer, or exit |

Use the [production service review](../templates/production-service-review.md) for one workflow and the [FDE and applied-AI portfolio review](../templates/fde-portfolio-review.md) across multiple workflows. Governance is a recurring set of decision rights and feedback loops, not a launch checklist. [R26-45]

### Review the delivery portfolio without hiding weak services

A portfolio review is an investment and capacity view over service-level evidence. It must not turn weak workflows into a healthy average or authorize expansion that failed its own value, safety, release, adoption, or ownership gate.

| Portfolio question | External provider signal | Internal applied-AI signal | Evidence discipline |
| --- | --- | --- | --- |
| Is work moving to durable operation? | Paid deployment or renewal path | Continued sponsorship, funding, or roadmap commitment | Keep organizational continuation separate from accepted outcomes and realized value |
| How quickly is value first evidenced? | Time from approved pilot start to first accepted value | Same | Distinguish first accepted outcome from first measured attributable business effect |
| Is delivery becoming more repeatable? | Customer-specific effort ratio and full delivery cost | Business-unit-specific effort ratio and full delivery cost | Compare only like cohorts; preserve local policy and validation |
| Is field learning becoming product capability? | Reusable component or platform path | Shared platform, control, or pattern path | Require sanitized recurrence, target validation, owner, and compatible release |
| Can the organization support the load? | Delivery, support, travel, review, and on-call capacity | Platform, domain, review, support, and on-call capacity | Capacity gains cannot depend on hidden customer or operator work |

Use five core measures before adding more:

1. **Time to first accepted outcome:** approved pilot start to the first independently accepted outcome.
2. **Time to first accepted value:** approved pilot start to an accepted outcome with a measured attributable business effect.
3. **Pilot-to-bounded-production flow:** an explicit cohort count with admission, graduation, stop, and exclusion reasons—not a universal conversion target.
4. **Full delivery and operating cost:** the declared discovery, implementation, change, assurance, support, incident, recovery, and maintenance allocation.
5. **Customer-specific effort ratio:** target-specific delivery and support effort divided by total comparable effort, interpreted beside outcome, adoption, safety, and supportability.

Optional external contribution or renewal measures belong in the portfolio review only with a declared accounting definition. For internal teams, use the equivalent funding, sponsorship, capacity, and value-to-full-cost decision. Contract value, budget, sponsor activity, reuse, or throughput alone is not realized value.

Before choosing `standardize`, inventory material workflow variants and classify them as policy-required, segment-specific, role-specific, system-constrained, or accidental dysfunction. Cluster only genuinely comparable workflows. Retain necessary local branches and repair accidental dysfunction before extracting a shared pattern; do not standardize a workaround merely because several teams use it.

Direct resources to the first unresolved hard gate or binding constraint for each workflow. A readiness or maturity score may order investigation, but a portfolio average cannot compensate for missing authority, verifier, lawful data, safety, adoption, or service ownership. Any reused capability still crosses the target workflow's policy, data, security, evaluation, release, adoption, support, and ownership gates.

Controls: `FDE-003`, `FDE-004`, `VAL-002`, `VAL-003`, `ADP-002`, `OPS-004`, `CST-001`.

## 3. Monitor the full decision system

Minimum coverage:

| Layer | Signals |
| --- | --- |
| Sources | Freshness, completeness, validity, uniqueness, consistency, schema, permission, lineage, reconciliation |
| Data decision fit | Eligible-population and segment coverage, representativeness, correction latency, preparation health, output ownership, drift |
| Context | Retrieval sufficiency, provenance, trust, cache age, memory invalidation |
| Behavior | Model/prompt/route versions, tool selection, steps, stop reasons, refusal and escalation |
| Capabilities | Contract errors, denials, latency, rate limit, credential and egress policy |
| State | Transition validity, checkpoint age, duplicate delivery, dead letters, cancellation |
| Effects | Authorization, approval, idempotency, receipt, readback, compensation |
| People | Eligible use, adoption, override, abandonment, reviewer wait, unsafe approval sample |
| Outcome | Accepted result, guardrail breach, cycle time, rework, downstream impact |
| Economics | Cost per run and accepted outcome, review and recovery cost, budget exhaustion |
| Service | Availability, queue, capacity, incident, recovery, support, dependency lifecycle |

Model-call traces alone cannot explain a stale source, broken policy, unusable interface, or failed business effect. Palantir's observability guidance similarly spans data, functions, actions, agents, traces, logs, and alerts. [R26-46]

Control: `OPS-006`.

Follow the [data quality and drift operating contract](../operations/data-quality-and-drift.md) for source, preparation, label, output, correction, rebaseline, rollback, and retirement decisions. `CTX-009`.

## 4. Close the production learning loop

```text
production signal
  -> triage and affected-run query
  -> first divergent state or violated invariant
  -> owning layer and root-cause hypothesis
  -> sanitized replay fixture
  -> candidate fix on isolated branch
  -> regression + adjacent slices + independent holdout
  -> human review and gated canary
  -> outcome monitoring and rollback window
  -> reusable pattern, product change, customer configuration, or explicit exception
```

An agent may cluster traces, investigate evidence, or open a candidate change. It must not alter the evaluator to pass, forge CI evidence, approve or merge its own change, or authorize production promotion. AI Engineer field reports show the value of signal-to-PR loops; the safe portable pattern retains independent evaluation and merge authority. [R26-54]

Controls: `EVA-002`, `EVA-004`, `OPS-007`.

## 5. Treat behavioral configuration as software

The following are production changes:

- Model or model version
- System prompt, instruction, skill, tool description, or exemplar
- Routing, fallback, temperature, budget, or stopping rule
- Context selection, retrieval, memory, compaction, or reset policy
- Tool contract, implementation, credential, or network policy
- Authorization, approval, guardrail, or risk threshold
- Domain model, data source, schema, freshness, or business policy
- Evaluator, judge, rubric, fixture, reference solution, or pass threshold
- Runtime, sandbox, dependency, concurrency, or state implementation
- User surface, review packet, escalation, or operating procedure

Each change needs a versioned diff or digest, affected-segment analysis, per-route evaluation, security regression where relevant, soak or canary, rollback trigger, owner, and dependency end-of-life review. Anthropic's 2026 postmortem shows why aggregate testing can miss model-specific regressions caused by behavioral configuration. [R26-51]

Control: `OPS-007`.

## 6. Maintain evaluation validity

Every evaluation report declares:

- Tested claim and eligible population
- Capability, regression, safety, or operational objective
- Model, prompt, harness, tool, context, policy, runtime, and environment versions
- Resource limits, time, tokens, cost, and trial count
- Consistency or best-of metric matched to the product contract
- Slice coverage, negative controls, reference solution, and human calibration
- Fixture isolation, answer-key access, cross-trial state, and contamination checks
- Confidence, uncertainty, saturation, known limitations, and owner

Evaluation infrastructure is a production-adjacent trust domain. Recent OpenAI and Anthropic work shows that broken tasks, infrastructure differences, and answer discovery can dominate a result. [R26-47] [R26-52] [R26-53]

Control: `EVA-006`.

## 7. Review realized value

Do not count runs, prompts, tokens, generated artifacts, or registered users as realized value. Reconcile:

```text
eligible population
-> reached workflow
-> completed workflow
-> independently accepted outcome
-> measured business effect
-> sustained effect after guardrails and full cost
```

Segment results by user group, workflow type, risk, and behavior cluster. Report non-adoption, overrides, downstream rework, reviewer capacity, incidents, and recovery cost. Rebaseline when the process, policy, eligible population, or comparison method changes.

Calculate adoption only from its predeclared eligible denominator, baseline, target, guardrail, measurement window, authoritative source revision, and accountable owner. Preserve the prior definition and effective date when any field changes.

Review the transitions separately: eligible to exposed, exposed to completed, completed to independently accepted, accepted to measured business effect, and effect to sustained net value. Assign the first broken transition to an owner with representative cases and a dated response. Do not prescribe training when access, product flow, behavior quality, policy, or reviewer capacity is the actual constraint.

Control: `VAL-002`.

## 8. Maintain the customer operating capability

Open the [customer enablement handoff](../templates/customer-enablement-handoff.md) at pilot entry. The customer team demonstrates that it can:

- Explain the workflow, controls, architecture, and limits
- Manage users, roles, sources, tools, policies, and vendor dependencies
- Review evaluations and build new domain cases
- Version and test harness, prompt, routing, context-policy, tool-bundle, and guardrail changes
- Reproduce adoption numerator, eligible denominator, exclusions, and guardrails from authoritative sources
- Diagnose one adoption-funnel break from representative cases and deliver the owned response
- Promote a change and execute rollback
- Respond to an alert, use kill switches, reconcile effects, and close an incident
- Support and train users, measure adoption, and triage feedback
- Decide when to expand, constrain, pause, or retire the workflow

Embedded FDE or center-of-excellence capacity accelerates delivery but cannot remain the long-term domain owner. Palantir's adoption guidance explicitly ties scale to internal governance, support, training, and ownership. [R26-45]

Control: `ADP-002`.

## 9. Classify field learning

| Class | Meaning | Destination |
| --- | --- | --- |
| Customer configuration | Policy, threshold, terminology, integration, or workflow unique to the deployment | Customer-owned versioned configuration |
| Reusable pattern | Cross-customer method without customer data or confidential detail | Pattern catalog, blueprint, template, or test |
| Platform gap | Recurring missing capability or unsafe workaround | Product/platform roadmap with evidence |
| Model limitation | Reproducible behavior tied to a model or route | Model evaluation and routing backlog |
| Operating problem | Ownership, training, access, support, or process issue | Customer operating plan |
| Non-viable use case | Value, verifier, adoption, risk, or cost no longer supports operation | Constrain or retire |

Never transfer customer data, proprietary policy, or confidential workflow detail into a shared pattern library.

Record each candidate in the [field-learning register](../templates/field-learning-register.md). Preserve recurrence, supporting and counter-evidence, confidentiality, permitted destination, product owner, disposition, and validation. A repeated anecdote is not yet a reusable pattern; a sanitized reproducible case with an owner and acceptance test is a product input.

For comparable delivery cohorts, also preserve target-specific delivery and support effort, actual governed-artifact reuse, productization and maintenance cost, and the expected effect on future delivery time, quality, safety, support load, or full cost. A declining customization ratio is evidence of leverage only while the target workflow continues to pass its own gates.

Control: `FDE-004`.

## 10. Run the improve, expand, or retire sequence

```text
production signal or field observation
  -> create learning record and bind evidence
  -> validate recurrence and affected scope
  -> classify confidentiality and portable abstraction
  -> product owner selects destination and disposition
  -> customer configuration | isolated product change | retirement plan
  -> replay, independent review, and affected-route validation
  -> canary and outcome/guardrail soak | controlled decommission
  -> verify source of truth and customer operating state
  -> close, defer with review date, or reopen on recurrence
```

Improvement is a compatible solution release. It carries an owned learning record, affected segments, artifact lineage, evaluation evidence, rollout, rollback, and post-change outcome check. Do not generalize customer-specific behavior until confidentiality review and cross-case validation establish a portable boundary.

Expansion is a new release decision for one segment and effect class. Require value, adoption, SLO, safety, review capacity, customer ownership, and rollback evidence for that segment. A larger model or improved benchmark does not automatically justify more authority.

Retirement is an owned production change:

1. Freeze expansion and new behavior changes; name the retirement owner and affected users.
2. Stop admission and schedules, revoke workload and delegated authority, and disable tool and egress bundles.
3. Reconcile pending and effect-unknown work against systems of record; preserve required audit evidence.
4. Export or migrate owned business state, then delete or retain runtime state under policy.
5. Remove alerts, support routes, dependencies, and user entry points only after shutdown verification.
6. Notify users and downstream owners; record the replacement or manual path.
7. Verify zero new work, disabled capabilities, retained evidence, and closed ownership before marking retired.

Enter retirement when realized value stays below the agreed threshold, verification cost overwhelms benefit, users reject the workflow, a safer deterministic system replaces it, dependencies reach end of life, control debt remains open, or no owner can support it.

Controls: `FDE-004`, `ADP-002`, `DEL-001`, `OPS-002`, `OPS-007`.

## Operating anti-patterns

- Handoff-and-disappear delivery
- Global averages hiding a failing workflow segment
- Production failure closed without a replayable regression
- Field anecdote promoted to a shared product pattern without recurrence, confidentiality review, or validation
- Customer-specific data or policy copied into a reusable artifact
- Prompt, model, or tool change shipped globally without per-route evidence
- Agent-generated fix allowed to control evaluation or merge authority
- Approval volume mistaken for thoughtful oversight
- Token cost optimized while reviewer, recovery, or failure cost rises
- Use-case count treated as operating maturity
- Permanent customer dependence on the FDE
- Portfolio averages hiding a failed workflow or exhausted delivery team
- Standardization flattening policy-required, segment-specific, role-specific, or system-constrained variation
- Maturity scores substituting for direct target evidence or the first unresolved hard gate
- Renewal, funding, sponsor activity, or reuse presented as realized value
- Falling custom effort achieved by skipping target-specific policy, evaluation, or handoff work
- Zombie agent with no value owner, service owner, or retirement trigger

[R26-45]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-45
[R26-46]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-46
[R26-47]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-47
[R26-51]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-51
[R26-52]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-52
[R26-53]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-53
[R26-54]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-54
