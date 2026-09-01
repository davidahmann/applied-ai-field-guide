# FDE, Applied AI Engineering, and Production-System Synthesis

This page connects customer-facing FDE work with the internal applied-AI engineering, product, platform, and operations work that makes delivery repeatable. It separates portable lessons from Palantir, OpenAI, Anthropic, and the AI Engineer practitioner corpus; it does not claim that any organization follows one universal method.

The field transition is a distinct FDE responsibility, not a preliminary architecture interview. An FDE preserves the inherited brief, finds the person who actually knows the process, observes representative work, reconciles sold, stated, observed, system-enforced, and policy-authorized claims, and obtains a scoped human disposition when evidence changes the boundary. Use the [field-engagement playbook](../playbooks/00-field-engagement-and-reframing.md) and [engagement-reframe record](../templates/engagement-reframe.json) before silently converting a field contradiction into requirements or architecture.

The product is a measurable workflow improvement. A rule, optimizer, ML model, foundation-model call, agent, or human-review step is a mechanism selected for one decision—not the product itself.

## Two linked practices, one delivery system

| Practice | Primary responsibility | Durable output |
| --- | --- | --- |
| FDE or delivery | Discover the real work, align stakeholders, prove a narrow outcome, and transfer operating capability | A business-owned workflow with measured value, adoption, and service ownership |
| Applied AI / product engineering | Turn validated delivery needs into usable product surfaces, reusable architecture, and safe engineering defaults | Versioned product, platform, evaluation, release, and operating capabilities |
| Platform, data, and security engineering | Provide dependable source, identity, capability, observability, and release boundaries | Governed services that make safe delivery faster without broadening authority |
| Operations and domain ownership | Define accepted work, supply judgment, adopt the workflow, and own it after delivery | Reliable business operation, feedback, and accountable change decisions |

These roles can sit in one internal team or across a provider and customer boundary. The work stays the same: establish an outcome, redesign the workflow, select the smallest sufficient mechanism, prove it, and operate it. OpenAI's FDE role description spans leaders, operators, domain experts, and engineering teams from discovery through adoption and workflow impact; Palantir's lifecycle begins with the user's operational decision rather than a model or integration. [R26-37] [R26-41]

## Comparative view

| Source | Strongest contribution | Portable implementation |
| --- | --- | --- |
| Palantir | Outcome-led use cases, decision-centric operational model, action/writeback, compatible solution changes, operating ownership and enablement | Model the user's decision through data, logic, action, and security; deliver one operational loop; transfer capability to the customer |
| OpenAI | Specific-job scoping, end-to-end FDE ownership, production adoption and workflow impact, incremental agent architecture, eval feedback into product/model | One team owns discovery through rollout; measure accepted work and adoption; start with the simplest sufficient execution model |
| Anthropic | Eval validity, high-signal context, typed handoffs, separable session/harness/sandbox, containment, per-model behavioral rollout | Treat the harness and environment as part of the system; keep interfaces stable; test claims, trials, contamination, and route-specific change |
| AI Engineer talks | Detailed field reports on native artifacts, tool catalogs, durable state, full-trajectory evals, human interruption, and signal-to-PR improvement | Use talks as leads, preserve attribution, corroborate mechanisms, and validate locally before making a normative control |

## Redesign the work before selecting intelligence

An AI initiative begins by making work legible—not by attaching a model to an existing interface. Observe the path from trigger through decision, evidence, exception, handoff, action, and outcome. Then classify what was observed before encoding it:

| Observed item | Treat it as | Required disposition |
| --- | --- | --- |
| Current fact, record, or metric | Governed evidence | Record source, owner, scope, revision, freshness, and access path |
| Explicit policy or repeatable calculation | Deterministic rule | Validate it with its policy owner and enforce it below the model |
| Professional interpretation under incomplete context | Candidate judgment mechanism | Define evidence, authority ceiling, reviewer, fallback, and evaluation before selecting ML, model, or agent support |
| Workaround, duplicate entry, or side channel | Possible defect or local adaptation | Preserve, repair, remove, or escalate; do not encode it merely because it is common |
| Customer-specific configuration or process detail | Tenant-bound operating context | Keep it with the owning organization; do not promote it to a shared pattern without abstraction and approval |

This is context extraction as verification rather than transcription. Interviews and recordings generate hypotheses; accountable operators and source owners validate what becomes a rule, policy, evaluation case, or reusable pattern. A captured narrative never becomes model instruction or production authority on its own. [R26-39] [R26-41] [R26-56]

Modernize the work around systems of record before requiring a replacement platform. Connect to existing authoritative systems when their data, identity, and change boundaries are sound; treat broken data ownership, permissions, or auditability as readiness blockers rather than features to automate around. This preserves a practical path to value without pretending that brittle foundations are safe to build upon. `FDE-002`, `CTX-001`, `IAM-003`.

Test that story against the target environment. Inspect the decision-bearing code or configuration, data pipelines and reconciliation seams, identity and permission boundaries, representative executions and failures, and release or support constraints that actually exist. Questionnaires and maturity scores can locate questions; they do not establish technical readiness. Missing direct evidence remains an explicit unknown or blocker. `FDE-002`, `CTX-001`, `OPS-006`.

Interview assistants, voice capture, transcript extraction, prototype generation, and automated feedback summaries can reduce discovery friction. Treat them as experimental aids that stage claims for review. They do not replace observation, operator validation, conflict resolution, source authority, or the scoped human disposition required when evidence changes the brief.

## Build the applied product in three connected layers

| Layer | What it contains | Design question |
| --- | --- | --- |
| Workflow and experience | Actors, decisions, evidence, exceptions, systems of record, review surfaces, and outcome feedback | Does this make the operator's real work safer, clearer, and faster? |
| Intelligence | Rules, optimization, ML, retrieval, foundation-model calls, bounded agents, and human review | Which smallest mechanism improves this decision inside its quality, risk, latency, and cost ceiling? |
| Control and evolution | Identity, tool boundaries, state, evaluation, release, telemetry, support, learning, and retirement | Can the team prove, contain, change, and eventually stop this workflow? |

The workflow-native surface is part of the product. A chat answer, score, or dashboard is insufficient when people need a case file, spreadsheet, document, ticket, review table, or operational application that shows evidence, uncertainty, alternatives, current state, and permitted actions. Internal engineering owns the reusable surface and control primitives; operations owns the meaning and use of the decision. `ADP-001`, `ARC-002`.

## The combined FDE method

```text
important customer or internal decision
  -> observed current work and exceptions
  -> measurable accepted outcome and verifier
  -> operational domain: data + logic + action + security
  -> smallest sufficient rules, optimization, ML, model, agent, and human architecture
  -> persistent professional surface
  -> representative replay, shadow, and canary evidence
  -> business-owned service and operating cadence
  -> production signal becomes regression, product learning, or retirement
```

## Separate customer-specific context from reusable practice

For an internal deployment, “customer” below means the business unit or operating team. The boundary is the same.

| Stays with the workflow owner | May compound into product, platform, or this guide |
| --- | --- |
| Business outcome, process policy, data, permissions, user decisions, risk acceptance, service ownership, and confidential operating context | Schemas, control patterns, delivery gates, generic tool interfaces, evaluation methods, incident methods, reusable UX patterns, and sanitized failure classes |
| Workflow-specific domain entities, thresholds, integrations, value assumptions, evaluations, and support procedures | Abstracted decision archetypes, discovery questions, reusable contract shapes, generic evaluation slices, and product gaps validated across independent contexts |

The boundary matters. Field learning should improve the product without extracting customer data or turning one customer's accidental workaround into a universal feature. A candidate pattern becomes reusable only after it is sanitized, recurrence is evidenced without cross-customer data transfer, an owner accepts it, and the normal design, evaluation, release, and rollback gates are satisfied. Use the [field-learning register](../templates/field-learning-register.md) to make that decision explicit. `FDE-004`.

Before standardizing a repeated workflow, classify its material variants as policy-required, segment-specific, role-specific, system-constrained, or accidental dysfunction. Cluster only workflows with comparable decisions, outcomes, policy boundaries, source semantics, effect classes, and operating conditions. Preserve the first four differences where they remain necessary; repair the last rather than encoding it. Shared capability can reduce repeated work, but every target retains its own data, security, evaluation, release, adoption, support, and ownership gates.

## Give every field contribution an owned destination

Classify a proposed field change before implementation. The label does not authorize the work; it determines which owner, repository, runtime, review, release, support, and exit path must govern it.

| Contribution path | Appropriate use | Required ownership and evidence |
| --- | --- | --- |
| Customer or business-unit configuration | Existing governed capability meets the need through tenant-bound configuration | Target owner, configuration lineage, local policy validation, rollback, and support path |
| Target-owned extension | The need is specific to one target but requires code or integration | Target repository and engineering standards, named service owner, release and on-call path, maintenance and retirement plan |
| Shared product or platform capability | Comparable recurrence and product strategy justify reusable behavior | Product/platform owner, normal architecture and security review, governed product repository, evaluation, compatible release, telemetry, support, and lifecycle ownership |
| Time-bounded experiment | A narrow learning objective requires temporary implementation | Non-production or explicitly bounded scope, owner, expiry, data disposition, and migration or destruction evidence |
| Prohibited or deferred | Authority, value, evidence, rights, support, or product fit is absent | Recorded rationale, owner, and reconsideration trigger; no hidden implementation |

A field-owned parallel service outside normal architecture, security, release, telemetry, support, and lifecycle ownership is a **shadow product**. Temporary infrastructure may be necessary, but it must have an explicit production ceiling, owner, deadline, and migration or retirement path. Repeated demand is a signal for a product or platform decision—not permission to scale the workaround. [R26-70] [R26-71]

Before promoting field work into shared capability, record customer funding and ownership, contract and intellectual-property terms, license constraints, confidentiality and attribution requirements, sanitization, and reuse approval. Recurrence across customers does not create transfer rights. Use the [delivery and adoption plan](../templates/delivery-and-adoption-plan.md) for the initial contribution boundary and the [field-learning register](../templates/field-learning-register.md) for reuse disposition. `FDE-004`, `DEL-001`, `ADP-002`.

## Make adoption valuable on both sides

Every production workflow has at least two value propositions:

- The executive or operational sponsor needs a measurable outcome, bounded risk, and accountable ownership.
- The operator needs a better work surface: less avoidable search and rework, clearer evidence, control over exceptions, and support when the system is wrong.

Neither is a proxy for the other. Adoption can fail when an executive value case ignores the changed workday; a pleasant interface can fail when it does not improve the owned outcome. Measure both through the separate operator, adoption, business, economics, and production gates below. `FDE-003`, `ADP-001`, `VAL-002`.

## Distinct proof gates

| Gate | Question |
| --- | --- |
| Technical | Can the system perform the task under representative conditions? |
| Operator | Can users inspect, correct, and complete work in the new surface? |
| Adoption | Do eligible users choose and finish the workflow without harmful workarounds? |
| Business | Does the accepted outcome improve the owned metric under a credible attribution method? |
| Economics | Does realized value exceed full delivery, run, review, support, and recovery cost? |
| Production | Can the team observe, contain, recover, change, support, and retire it? |

A pilot may pass one gate and fail another. Do not collapse them into a demo-success label.

## Keep engagement, service, and portfolio evidence separate

The same workflow appears in three different decision views. Do not merge them into one health score.

| View | Decision | Primary evidence |
| --- | --- | --- |
| Pilot or engagement | Did this bounded workflow pass its declared graduation gates by the evidence cutoff? | [Delivery and adoption plan](../templates/delivery-and-adoption-plan.md), separate technical, operator, adoption, value, economics, and production-readiness gates |
| Production service | Should this workflow continue, improve, expand, constrain, pause, or retire? | [Production service review](../templates/production-service-review.md), accepted outcomes, attributable value, adoption, SLOs, cost, ownership, and recovery |
| Workflow portfolio | Where should the organization invest, transfer, productize, build capacity, or exit? | [FDE and applied-AI workflow portfolio review](../templates/fde-portfolio-review.md), decision rights, proof gates, cohort stage flow, time to accepted value, full delivery economics, target-specific effort, reuse, continuation, and capacity |

For an external FDE organization, continuation may be a paid deployment, renewal, or expansion decision. For an internal applied-AI team, it may be continued sponsorship, funding, or roadmap commitment. These signals matter operationally, but they do not prove accepted outcomes or realized value. A portfolio decision does not override a failing workflow gate. `FDE-003`, `VAL-002`, `VAL-003`, `OPS-004`.

## Professional practice boundaries

FDEs and internal applied-AI engineers receive unusual access to operational context, organizational relationships, data, and decision paths. Preserve five boundaries:

1. **Customer and business-unit context stays owned.** Minimize access, retain provenance and classification, and never move confidential data, policy, or workflow detail into shared product learning without authorization and sanitization.
2. **Report what the evidence says.** Preserve negative, inconclusive, stopped, and retired results. Do not rename launch, usage, contract value, sponsorship, or a correlated metric as realized value.
3. **Do not manufacture dependence.** Transfer operating capability, record an exit path, and avoid opaque customer-specific mechanisms whose primary purpose is continued delivery-team control.
4. **Account for affected people.** Record changed responsibilities, reviewer load, displaced work, training, escalation, and operator acceptance rather than treating people only as cost or approval capacity.
5. **Decline unauthorized or harmful requests.** A customer request, executive sponsor, or commercial opportunity does not override lawful use, policy, identity, authority, confidentiality, safety, or independent review.

These are professional-practice boundaries over the guide's existing value, security, human-review, adoption, and field-learning controls—not a separate compliance standard. The [secondary FDE practice review](../research/2026-08-09--fde-commercial-and-professional-practice.md) supplied research leads; the normative requirements remain grounded in the guide's primary evidence and controls.

## Architectural non-negotiables

- The model proposes; deterministic controls authorize and commit.
- The operational domain includes state, decisions, actions, security, feedback, and reconciliation—not only retrieved content.
- Codified methods, expert logic, metric definitions, and tool interfaces are engineering inputs only when their owner, version, provenance, scope, authority, evaluation, and correction path are explicit. [R26-76]
- Interactive delegated and unattended agents use explicit, different actor-identity patterns.
- Read-only tools are assessed for disclosure and open-world capability, not only side effects.
- Egress is bound to operation and credential provenance, not host name alone.
- Workflow state and cross-context handoffs are typed and durable.
- Evaluation reports name the claim, full version/environment manifest, trials, uncertainty, and contamination controls.
- Expected results and expert labels retain source revision, accountable ownership, independent approval, adjudication, classification, and review dates.
- Computer-use fallbacks isolate and bind sessions, treat visual content as untrusted, stop on interface drift, and verify effects through an independent target path.
- Behavioral configuration changes use per-model/route evaluation, canary, and rollback.
- Closed-loop improvement binds the complete release graph, treats scorers and human corrections as governed evidence, and keeps proposal, evaluation, approval, deployment, and rollback authority separate. [R26-81]
- Production monitoring covers data, workflow, policies, effects, people, outcomes, and cost.
- Each consequential decision uses the smallest sufficient mechanism—deterministic code, optimization, ML, retrieval, a foundation model, an agent, or human review—and retains the evidence, fallback, and cost rationale.
- Cost is a non-functional requirement; the economic unit is an accepted outcome, not token or tool volume. [R26-63] [R26-64]
- When complexity warrants a system map, it is derived navigation and impact evidence with provenance and freshness—not a replacement for source policy, release evidence, or source-of-truth verification. [R26-65] [R26-66] [R26-67]
- Customer operation and retirement are designed from the beginning.
- Field-built work has an owned destination, normal release and support path, and explicit reuse rights before it becomes shared capability.

## What not to infer

- Palantir's product architecture is not the only way to implement a decision-centric domain model.
- An OpenAI or Anthropic product workflow is not a provider-neutral contract unless its mechanism is separated from the product.
- A conference speaker's scale, quality, or speed metric is not a production threshold.
- Self-review, monitoring, guardrails, and human approval do not replace authorization or source-of-truth verification.
- A successful bootcamp, benchmark, or pilot is not production readiness or realized value.
- A practitioner's claimed ROI, efficiency gain, or organizational forecast is not a portfolio target or release criterion without local measurement.
- A questionnaire, maturity score, or portfolio average is not direct technical evidence and cannot override the first unresolved hard gate in a target workflow.
- A vendor-reported accuracy, SLA, or deployment volume is not a reusable threshold, and one vertical field report does not establish a new industry profile.
- Renewal, funding, sponsor activity, delivery throughput, or reuse is not accepted-outcome or realized-value evidence.
- “AI-native” is not a reason to replace systems of record, remove accountable human judgment, or weaken ordinary software-engineering disciplines.
- “Software factory” is not a reason to prescribe cloud deployment, API-only operation, multiple models, multiple agents, or automation percentage as a success measure by category. [R26-81]

[R26-63]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-63
[R26-64]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-64
[R26-65]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-65
[R26-66]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-66
[R26-67]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-67
[R26-70]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-70
[R26-71]: ../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-71
[R26-76]: ../research/2026-08-27--bridgewater-pocket-analyst-tool.md#r26-76
[R26-81]: ../research/2026-08-28--warp-self-improving-software-factories.md#r26-81

Evidence: [R26-37 through R26-46](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#fde-delivery-and-operating-model-evidence), [R26-47 through R26-56](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-47), [R26-62 through R26-64](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-62), [R26-70 through R26-74](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-70), the [AI Engineer video index](../research/2026-08-07--ai-engineer-production-agent-video-index.md), the [operational-redesign note](../research/2026-08-08--operational-redesign-and-applied-ai-practice.md), the [FDE product-boundaries note](../research/2026-08-10--fde-product-boundaries-and-capability-transfer.md), the [multimodal and computer-use note](../research/2026-08-11--multimodal-operations-and-computer-use.md), the bounded [Bridgewater PAT field report](../research/2026-08-27--bridgewater-pocket-analyst-tool.md#r26-76), and the bounded [Warp software-factory review](../research/2026-08-28--warp-self-improving-software-factories.md#r26-81).
