# Production Implementation Playbook

This playbook turns the library into an execution sequence. Do not advance a phase because the demo looks good; advance when its exit criteria are met.

For the customer-facing work before, around, and after these technical phases, use the [FDE playbooks](../playbooks/README.md). Field evidence and a candidate [workflow charter](../templates/workflow-charter.json) are inputs to Phase 0; an approved charter is required before Phase 1. Customer enablement and recurring service review are final outputs.

Apply only the artifacts justified by the selected mechanisms. Agent-system, behavior-bundle, evaluation-report, and solution-release artifacts are the current machine-readable route for model/agent releases. A deterministic, optimization, or classical-ML-only system follows the same gates with equivalent target software design, evaluation, release, rollback, and retirement evidence rather than placeholder agent artifacts.

## Phase 0 — Charter the workflow

**Goal:** prove that the candidate work is worth automating and has a bounded accountability model.

| Define | Minimum artifact |
| --- | --- |
| Business outcome | Baseline, target, metric owner, measurement window |
| Operational requirement | User, working surface, decision, inputs, action, and accepted outcome |
| Workflow boundary | Trigger, inputs, sources of truth, output artifact, downstream actions |
| Work allocation | Which steps are deterministic, optimization/ML, retrieval, foundation-model/agent, and human-owned |
| Verifier | Postcondition, reconciliation, policy test, or review rubric |
| Risk | Consequence of a bad recommendation, bad write, data leak, or delay |

Use the [field-observation log](../templates/field-observation-log.md), [FDE discovery pack](../templates/fde-discovery-pack.md), [workflow charter](../templates/workflow-charter.json), and [value case](../templates/value-case.md).

Use the [intelligence-selection record](../templates/intelligence-selection-record.md) before adding a model or agent. The selected component must be the smallest sufficient mechanism for the decision, with a cost budget, fallback, monitor, and retirement trigger. `ARC-004`, `ARC-005`.

**Exit gate:** one observed, narrow workflow has a measurable accepted outcome, verifier, owner, adoption path, and service-ownership hypothesis. If the team cannot explain how it will know the result is correct, deploy it as a research or copilot surface—not autonomous execution.

## Phase 1 — Make the environment execution-ready

**Goal:** ensure the systems around the selected mechanism can safely serve as capabilities and contextual resources.

Before integrating them, complete the [data-readiness assessment](../templates/data-readiness-assessment.md) and bind the accepted source, quality, preparation, label, output, and operating assumptions in a [data-context manifest](../templates/data-context-manifest.json). A dependency may be reachable and still be unfit for the decision. `CTX-006` through `CTX-009`.

Assess each dependency as both a **resource** (the system reads it) and a **capability** (the system changes it). The workflow is constrained by its least-ready dependency. [AWS's Agentic Readiness method](https://aws.amazon.com/blogs/migration-and-modernization/agentic-readiness/) provides a useful lens: interface quality, security posture, data handling, resilience, and observability are separate checks.

| Control | Implementation question |
| --- | --- |
| Source contract | Is the schema typed, documented, versioned, and freshness-aware? |
| Identity | Is the acting principal unambiguous—current user plus agent attribution for interactive work, or a narrow workload identity for unattended work? |
| Authorization | Is every tool/action authorized by policy outside the model? |
| Secrets | Can the tool operate without exposing a credential to the model or sandbox? |
| Egress | Which operation, identity, data class, destination, protocol, method, redirect, and credential combinations are allowed? What gateway enforces them? |
| Write path | Is it read-only, staged, approval-gated, or compensable? |
| Resilience | Are timeouts, idempotency, rate limits, and degradation behavior defined? |
| Observability | Can the team trace request, action, outcome, and policy decision? |

**Exit gate:** every dependency is explicitly approved for the selected mechanism's intended role and access scale. Do not treat an existing human-facing API as automatically ready for automated access.

## Phase 2 — Build the smallest useful execution harness

**Goal:** give the selected route precise capabilities and no more.

1. When external capabilities are needed, start with a task-scoped tool bundle, not the organization's whole MCP inventory.
2. Expose typed, narrow verbs; deterministic code executes the privileged operation.
3. When a model selects tools, load tool documentation progressively as the job requires it.
4. Provide a sandboxed general escape hatch only after specialized tools cover the common path.
5. Build context from authorized sources and preserve citations, revisions, and trust labels.
6. Keep workflow state, approvals, and durable artifacts outside transport sessions.

Cloudflare's 2026 Code Mode is a strong implementation example: it replaces a very large always-loaded endpoint catalog with compact discovery and execution primitives, then runs generated code in a constrained isolate. The portable lesson is not “use JavaScript”; it is to make capability discovery incremental and execution containable. [R26-02](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-02)

**Exit gate:** a reviewer can list every accessible capability, its schema, authorization rule, source owner, and maximum blast radius.

## Phase 3 — Define the work loop and its evidence

**Goal:** create an evidence-based process, not an open-ended conversation.

```text
trigger -> scoped context -> plan -> permitted action -> readback/evidence
        -> verifier -> accept | repair (bounded) | escalate | stop
```

Specify for every loop:

- Measurable goal and evidence threshold
- Allowed actions and tool budget
- Maximum steps, time, model/tool cost, and parallel workers
- Error classes: retryable, optional, terminal, and escalation-required
- State updates allowed before and after verification
- Human question/approval event and resumption behavior
- Stop conditions and compensation/rollback path

Use adaptive retrieval only when the task actually needs it. For a multi-hop question, planning, fan-out, and a sufficiency check can improve evidence coverage. For a simple, stable lookup, a deterministic query is usually faster, safer, and cheaper. [R26-16](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-16)

**Exit gate:** the team can simulate success, a retry, a missing-evidence escalation, a downstream timeout, and a blocked write without improvising the system's response.

## Phase 4 — Build evaluation before autonomy

**Goal:** show that the full system works on realistic conditions and fails safely.

| Evaluation layer | Ask | Typical fixture |
| --- | --- | --- |
| Contract | Did the tool accept and produce valid structured data? | Schema, property, and API contract tests |
| Component | Did retrieval, memory, policy, or planning behave correctly? | Seeded input and expected intermediate state |
| Trajectory | Did the selected workflow choose valid capabilities and recover correctly? | Full trace with expected actions and stop reason |
| Artifact/outcome | Is the completed work actually correct? | Source-of-truth readback, diff, reconciliation, or rubric |
| Safety | Did it refuse or contain malicious, unauthorized, and malformed inputs? | Prompt injection, tool poisoning, stale-cache, and credential tests |
| Operations | Does it stay within cost, latency, and intervention limits? | Load, failure, budget, and concurrency scenarios |

Prefer replayable world snapshots to live reruns. Datadog's SRE evaluation approach uses incidents as representative environments because live systems drift underneath the agent; AWS similarly emphasizes agent traces and full-system behaviors rather than final answers alone. [R26-01](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-01) [R26-07](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-07)

Also evaluate the evaluator. The candidate system should not share a mutable trust boundary with the tests or judge that certifies it. Benchmark integrity work in 2026 demonstrated that perfect benchmark scores can coexist with zero useful task completion when test infrastructure is exploitable. [R26-25](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-25)

Every release claim should also record the world and environment revisions, selected-mechanism and harness configuration, evaluator, trial count, aggregation rule, uncertainty, and contamination controls. A single stochastic pass is neither a capability estimate nor a dependable regression gate. [R26-47](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-47) [R26-52](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-52)

For a model/agent route, record the claim, conditions, repetitions, uncertainty, contamination controls, limitations, and release decision in the [evaluation-report template](../templates/evaluation-report.json). Other routes retain equivalent reproducible evaluation evidence in the target software assurance system.

**Exit gate:** the release suite contains realistic accepted, rejected, ambiguous, failure, and adversarial cases. A regression has a known owner and a reproducible trace, and the evaluation claim can be reproduced from its report.

## Phase 5 — Release in named, reversible automation or autonomy modes

The modes below are the model/agent vocabulary used by the current solution-release contract. Other target systems may use different names, but MUST preserve the same segment, effect, authority, attribution, verification, rollback, and approval boundaries. `DEL-001`, `REL-003`.

| Mode | System behavior | Required controls |
| --- | --- | --- |
| `observe` | Collects evidence and drafts an artifact | No external write; trace and review only |
| `recommend` | Proposes a decision or staged action | Evidence packet; human approves every commit |
| `execute_reversible` | Performs reversible writes within one named segment and effect class | Postcondition readback; sampled review; rollback |
| `execute_bounded` | Performs a narrow, preauthorized operation within explicit policy and volume ceilings | Strong deterministic verifier; circuit breakers; continuous audit |
| `coordinate` | Delegates bounded work across agents or services | Caller authorization propagation; typed handoffs; concurrency and merge semantics; per-stage gates |

Promote only one named task segment and effect class at a time. A system can use `execute_bounded` for one reversible operation while remaining `observe` for an external message or financial write. `coordinate` is a topology decision, not permission to exceed the delegated effect ceiling. Pair technical promotion with adoption, reviewer-capacity, support, and customer-ownership evidence from the [delivery and adoption plan](../templates/delivery-and-adoption-plan.md).

**Exit gate:** the promotion is reversible, measurable, and attributable to explicit selected-mechanism, configuration, and capability versions.

For a model/agent route, bind those versions and the rollout decision in the [solution-release manifest](../templates/solution-release.json). For other routes, bind equivalent versions, approvals, and rollout evidence in the target software release record. In every case, merge and deployment remain separate events.

## Phase 6 — Operate and improve the system

### Instrument mechanism-aware telemetry

Capture workflow and selected-mechanism versions, initiating identity, source revisions, capability calls and outcomes, policy decisions, approvals, state transitions, cost, latency, final artifact, and postcondition. Where used, also capture retrieval, model routing, cache behavior, and agent version. The 2026 OpenTelemetry updates reinforce that retrieval and tool execution need first-class spans; do not stop at a single model-call trace. [R26-19](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-19)

Balance observability against privacy and cost. High-cardinality or sensitive fields need deliberate sampling, redaction, access control, and retention rather than blanket capture.

### Turn production into an evaluation flywheel

1. Cluster observed behavior by task and tool trajectory.
2. Monitor success, escalation, latency, and cost per cluster.
3. Select new or degraded clusters for review.
4. Convert diagnosed failures into replayable tests.
5. Change one versioned component at a time where possible.
6. Validate offline, shadow, canary, and then promote.

This is more effective than manually reading random traces or tracking a single global score. [R26-17](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-17)

Treat every model, prompt, tool, retrieval, policy, evaluator, runtime, and professional-work-surface change as a versioned production change. Follow [change management](../operations/change-management.md), monitor the [full behavior path](../operations/behavior-monitoring.md), and use the [production service review](../templates/production-service-review.md) to decide whether to expand, constrain, pause, or retire the workflow.

For a complex system, a versioned software/operational map can lower the cost of orientation and change review. Keep it derived, provenance-aware, and optional to runtime safety; use it to find impact, not to authorize it. See [Evidence Graphs and Change Intelligence](13-evidence-graphs-and-change-intelligence.md), the [system-map manifest](../templates/system-map-manifest.json), and [map freshness and change impact](../operations/map-freshness-and-change-impact.md).

### Runbook for an unsafe or failing run

1. Freeze new writes and pause queued work.
2. Revoke or downscope the workload identity and egress paths if needed.
3. Preserve minimal forensic evidence: trace IDs, versions, policy decisions, source revisions, and affected artifacts.
4. Read back the source of truth; do not trust the candidate runtime's completion message.
5. Compensate or roll back only through a preapproved procedure.
6. Classify the failure: context, tool, authorization, loop, concurrency, evaluator, or UX.
7. Add the case to the release suite before re-enabling automated execution or autonomy.

## Production release contract

Use the model/agent-specific contracts below only when that route is selected. All routes retain the applicable workflow, domain, capability, threat, adoption, operating, and target software release evidence.

- [Production release gates](../operations/release-gates.md)
- [Production control catalog](../controls/control-catalog.json)
- [Workflow-charter Schema](../schemas/workflow-charter.schema.json)
- [Operational-ontology Schema](../schemas/operational-ontology.schema.json)
- [System-map-manifest Schema](../schemas/system-map-manifest.schema.json) where dependency complexity justifies it
- [Change-impact-assessment Schema](../schemas/change-impact-assessment.schema.json) for material or critical changes
- [Agent-system Schema](../schemas/agent-system.schema.json) when a foundation-model or agent workflow is selected
- [Behavior-bundle Schema](../schemas/behavior-bundle.schema.json) when model behavior is selected
- [Tool-contract Schema](../schemas/tool-contract.schema.json)
- [Capability-manifest Schema](../schemas/capability-manifest.schema.json)
- [Handoff-envelope Schema](../schemas/handoff-envelope.schema.json) for worker, agent, or context-reset delegation
- [Evaluation-case Schema](../schemas/evaluation-case.schema.json)
- [Evaluation-report Schema](../schemas/evaluation-report.schema.json) for a model/agent evaluation claim
- [Solution-release Schema](../schemas/solution-release.schema.json) for a model/agent release
- [Threat-model Schema](../schemas/threat-model.schema.json)
- [Delivery and adoption plan](../templates/delivery-and-adoption-plan.md)
- [Customer enablement handoff](../templates/customer-enablement-handoff.md)
- [Production service review](../templates/production-service-review.md)
- [Field-learning register](../templates/field-learning-register.md)
