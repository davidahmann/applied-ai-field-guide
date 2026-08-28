# Agent System Architecture

## Separate environment, feedback, and flow

The cleanest architecture vocabulary in the source set is:

| Layer | Question it answers | Typical contents |
| --- | --- | --- |
| **Harness** | Can the model operate safely and effectively? | Context, tools, workspace, state, permissions, sandbox, budgets, traces |
| **Loop** | How does work get checked and improved? | Goal, evidence, feedback, retries, stop rule, escalation |
| **Graph** | What is allowed to happen next? | Nodes, routes, branches, joins, concurrency, approvals, recovery |

Mnemonic: **environment -> feedback -> flow**. [S16]

### Diagnose the owning layer

- Missing capability, stale state, unsafe permissions, or invisible execution: fix the **harness**.
- A nearly correct result with inconsistent quality or uncontrolled retries: fix the **loop**.
- Complex specialists, branches, parallel paths, approvals, or recovery: fix the **graph**.

A stronger model may temporarily hide a weak system, but it does not repair the architecture.

## Harness engineering

A production harness normally owns six concerns:

1. **Context:** instructions, policy, retrieval, history, memory, task state.
2. **Actions:** APIs, MCP tools, browser, shell, code, databases, human contact.
3. **Persistence:** files, event history, checkpoints, progress, version control.
4. **Execution control:** timeouts, retries, budgets, model routing, subagents, approvals.
5. **Safety:** least privilege, isolation, allowlists, secret handling, audit.
6. **Observability:** traces, tool I/O, transitions, latency, cost, evaluation results.

Keep the harness precise. A large undifferentiated tool bag increases selection mistakes, prompt noise, latency, and attack surface. Scoped bundles and derived tools are usually more reliable. [S06] [S16]

Make the environment legible to agents as well as people. Machine-readable Markdown, concise service descriptions, examples, stable schemas, and explicit error contracts are part of the action surface. Datadog's recommendation to publish agent-oriented documentation such as `llms.txt` and Markdown reflects this agent-first design principle. [S08]

Skills and task context solve different problems. Put reusable procedures, guardrails, and judgment patterns in a Skill; inject the variable facts of the current customer, study, or case as contextual instructions and evidence. Listen's preference for contextual prompt engineering is a useful counterweight to turning every nuance into a rigid global recipe, while Legora emphasizes Skills for repeatable human judgment. [S03] [S05]

### Domain-native tools plus an escape hatch

A low-floor/high-ceiling harness provides safe specialized actions for the common path and a sandboxed general tool for edge cases. Examples:

- Spreadsheet range reads/writes and formulas, with Python as an escape hatch [S01]
- Semantic search and structured query, with sandboxed shell access for unusual retrieval [S04]
- Qualitative-research extraction tools, with Python for statistics and presentation generation [S03]

The general tool needs stronger isolation, budgets, file and network boundaries, and output inspection.

Tejas Kumar's GPT-3.5 Turbo browser-agent demonstration gives a compact harness recipe: a controlled tool registry, history compaction, a maximum-step guardrail, and a separate verification step. The unharnessed agent reached a login page while attempting an upvote and then claimed success. A postcondition verifier exposed the mismatch. A later authentication handler detected the login state and completed authentication programmatically; in production, credentials should remain outside model-visible context and be injected only by an authorized handler. The lesson is architectural: stable control surfaces can improve reliability without relying on repeated prompt adjustments. [S19]

When a browser, desktop client, or terminal emulator is the only viable path to a target system, use the [computer-use action-boundary blueprint](../blueprints/computer-use-action-boundary.md). Treat visual content as hostile data, bind the session and operation, separate observation from effects, stop on interface drift, and verify completion through an independent target-system path. Computer use is a compatibility fallback, not a substitute for a typed API or service-side control.

## Loop engineering

A loop is more than “try again.” It needs:

```text
trigger -> measurable goal -> carried state -> allowed actions
        -> external evidence -> compact feedback -> stop or retry
```

The governing rule is **loop on evidence, not confidence**. [S16]

Good evidence includes:

- Tests pass
- A schema validates
- The external system shows the intended postcondition
- Totals reconcile
- Citations resolve and support the claim
- A policy check is clean
- A reviewer approves
- A business metric reaches a predeclared threshold

Every loop should have a retry limit, time or cost budget, irrecoverable-failure path, and accountable escalation target. A model grading its own work can help, but it shares correlated blind spots; prefer deterministic checks, isolated reviewer context, independent evaluators, or human approval as stakes rise.

Ramp's internal `Inspect` agent and Replit's continual-learning system illustrate a higher-order loop: observe production feedback, propose a change, and validate it through tests, benchmarks, or A/B experiments before adoption. These are promising patterns only when proposed changes remain reviewable and rollbackable. [S01] [S17]

## Neurosymbolic guardrails

Probabilistic interpretation and deterministic domain logic can be composed instead of asking natural-language instructions to carry both jobs. Frank Coyle's pattern is **schema at the door, ontology at the ledger**: [S20]

1. The model proposes a typed intent or tool call.
2. A schema validator such as Pydantic checks shape, types, and required fields.
3. Authorization checks whether this principal may attempt the action.
4. A constraint validator or deterministic rule engine checks domain relationships and invariants expressed against the ontology.
5. Deterministic code executes the accepted action.
6. A postcondition verifier checks the resulting external state.

RDFS and OWL provide vocabulary and inference; rejection semantics require a validation or rule layer such as SHACL shapes or deterministic code. That constraint layer can reject a structurally valid but disallowed action, such as issuing a second refund or sending a customer payout to a support representative. It does not prove that retrieved facts are current or that the model selected the correct intent, so retrieval quality, authorization, and post-action verification remain separate controls. [R26-61](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-61)

## Graph engineering

Graphs are valuable when workflow topology itself carries policy:

- Branching on evidence or risk
- Parallel specialist work
- Joins and reconciliations
- Human approvals
- Recovery routes
- Deterministic checkpoints
- Different permissions by stage

Do not formalize a large graph before observing real traces. Start with a capable harness and bounded loops, identify stable branches and failure paths, then encode only the control points that deserve determinism. Premature graphs make evolving work brittle. [S16]

### Common orchestration patterns

| Pattern | Best fit | Main risk |
| --- | --- | --- |
| Orchestrator-worker | Central policy, clear decomposition, controlled parallelism | Coordinator bottleneck or context loss |
| Choreography | Independent event-driven specialists | Emergent behavior and harder debugging |
| Human-in-the-loop graph | High-stakes approvals or ambiguous judgment | Latency and reviewer overload |
| Single agent with tools | Short bounded work with few branches | Uncontrolled long horizon if scope grows |

Multi-agent design is not automatically more capable. It is useful when tasks are truly independent, specialists need different context or tools, or parallel work reduces elapsed time. Hex's effort to unify notebook and thread agents around a common harness, tool bundles, and context harvesting suggests that shared infrastructure matters more than agent count. [S02]

A 2026 controlled evaluation reinforces this selection rule rather than supplying a universal topology. Across 260 matched configurations, multi-agent performance ranged from +80.8% on decomposable financial analysis to −70.0% on sequential planning, while the overall mean change was −0.3%. A single-agent score near 45% was useful as a within-domain selection heuristic, not a release gate. Keep the simpler path as a live control, compare total budgets on representative work, and retire coordination when it no longer earns its cost. [R26-75](../research/2026-08-14--multi-agent-topology-selection.md#r26-75)

## Event-sourced execution

The event-sourced workshop and HumanLayer's stateless-reducer principle converge on a useful runtime shape:

1. Append every user event, model decision, tool request, result, state transition, and stream chunk to an ordered log.
2. Rebuild current state with a synchronous, deterministic reducer.
3. Run external side effects only in an after-append processor.
4. Record the result as another event.
5. Resume after failure by replaying events without repeating completed side effects.

This improves inspection, replay, branching, and recovery. It also enables different processors to subscribe to the same stream. Circuit breakers should pause streams that generate abnormal event volume or fail to make progress. [S07]

The separation is critical: deterministic state derivation may be replayed; model calls and external actions must be idempotent, deduplicated, or recorded so replay does not execute them twice.

Event sourcing creates privacy and storage obligations. A complete log can contain sensitive prompts, files, tool output, and intermediate reasoning artifacts. Retention, redaction, encryption, tenancy, and access must be designed with the state model.

## HumanLayer's 12-Factor Agents: implementation factors

HumanLayer's 12-Factor Agents is an open design essay, not a standard. Its factors compress into a coherent control philosophy: [S09]

1. Translate natural language into typed tool calls.
2. Own and version prompts.
3. Construct the context window explicitly.
4. Treat tools as structured model outputs executed by deterministic code.
5. Unify execution state and business state.
6. Expose simple launch, pause, inspect, and resume APIs.
7. Model human contact and approval as tool calls/events.
8. Own control flow rather than burying it in a framework.
9. Compact errors into useful context and bound retries.
10. Prefer small, focused agents inside larger software systems.
11. Trigger from the surfaces where work begins.
12. Make agent computation a stateless reducer over explicit state.

An appendix suggests prefetching highly likely context to remove a model round trip. Apply this only when the context is authorized, bounded, and cheap enough; indiscriminate prefetching conflicts with cost and data-minimization goals.

## MCP and tool infrastructure at scale

MCP standardizes the client-tool boundary but does not solve lifecycle, authorization, quality, or discovery on its own.

A production control plane can include:

- Registry: owner, purpose, schema, examples, sensitivity, version, SLA
- Gateway: authentication, authorization, routing, quotas, logging, redaction
- Generation: definitions derived from Protobuf, Thrift, OpenAPI, or other IDLs
- Derived tools: scoped method subsets and safe parameter defaults
- Evaluation: call success, parameter validity, latency, task contribution, regressions
- Distribution: no-code builder, code SDK, and coding-agent surfaces

Uber reports this pattern across 10,000+ microservices, 5,000+ engineers, and 60,000+ weekly agent executions. These figures are source-reported and do not by themselves establish tool quality. [S06]

## Sandboxes and durable execution

Tool-using agents should execute untrusted or open-ended code inside an isolated, lifecycle-managed environment. The sources cite Modal, E2B, microVMs, and containerized background workers for spreadsheets, data analysis, coding, and company-wide automation. [S01] [S03] [S17]

The runtime should define:

- Filesystem, process, network, and credential boundaries
- CPU, memory, wall-time, token, and spend budgets
- Input staging and output collection
- Secret injection without prompt exposure
- Idempotency and duplicate-action handling
- Checkpoints and crash recovery
- Teardown and deletion guarantees
- Audit events separate from sensitive content where required

Datadog's recommendation to use durable workflow infrastructure such as Temporal reflects the operational reality: proactive agents must survive restarts and long waits, not merely complete one synchronous chat turn. [S08]

## Model and runtime portability

Harvey argues that legal agents require multi-model routing for client conflicts, quality, cost, capacity, and platform risk. Its abstraction normalizes tool-call formats, stop conditions, streaming behavior, failure modes, and sandboxes so model choice becomes a routing decision. [S18]

Portability is not semantic equivalence. Models behave differently under the same prompt and tools. A portable system still needs:

- Model-by-task evaluations
- Prompt and adapter versions
- Policy-aware allowlists
- Safe fallback rules
- Provider health and capacity signals
- Regression testing when providers change behavior

Prefer the cheapest and fastest **allowed** model that clears the task's quality threshold, not the largest model by default. Keep the abstraction open enough to absorb managed infrastructure later rather than turning runtime ownership into permanent ideology.

## Architecture review checklist

- Is the failure owned by model capability, context, tool design, loop logic, or graph control?
- Are actions expressed as narrow structured intents?
- Can deterministic code enforce authorization before execution?
- Is state explicit, inspectable, and resumable?
- Which side effects are idempotent, and how is replay deduplicated?
- What evidence stops each loop?
- Which branches require deterministic routing or human approval?
- What can safely run in parallel?
- Are tool bundles scoped to the task and user?
- Can the runtime enforce budgets and circuit breakers?
- Can prompts, policies, tools, models, and state schemas be versioned independently?
- Can the system move providers without silently weakening quality or policy?

## 2026 update: state, identity, and concurrency are first-class architecture

### Keep workflow state separate from tool transport

MCP sessions, request IDs, and tool caches are protocol concerns; they are not durable workflow memory, approval history, or business state. Keep those records in an explicit state layer with provenance, freshness, retention, and invalidation rules. Recent MCP SDK releases reinforce this direction through stateless requests, negotiated versions, scoped cache TTLs, typed continuations, and hardened payload/protocol handling. [R26-33](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-33)

### Make actor mode and identity explicit

Unattended agents need a dedicated non-human workload identity. Interactive delegated agents may instead use a short-lived user-bound session only when trusted software enforces server-side authorization, scoped authority, mutation policy or approval, and user-plus-agent attribution. Delegation always inherits the caller's authorization ceiling; it never acquires whatever the downstream runtime happens to permit. Use per-tool scopes and step-up authorization for sensitive operations. [R26-11](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-11) [R26-15](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-15) [R26-32](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-32)

For multi-hop work, keep the initiating principal, hosting workload, logical agent, current recipient, tenant, and target operation distinct. Trusted software rechecks the current authority intersection at every hop and binds each delegated grant to its intended recipient, purpose, scope, expiry, and policy revision. Missing, forged, truncated, replayed, revoked, or widened lineage fails closed. A short-lived token, registry, service mesh, or protocol can implement this contract; none is the contract itself. [R26-80](../research/2026-08-28--uber-production-ai-operating-lessons.md#r26-80)

### Model-visible actions need a smaller trust domain

Treat every LLM-visible tool as a potential execution boundary. The hardened pattern is a model in a constrained environment, a trusted gateway holding credentials, explicitly allowed egress, policy-controlled tool invocation, and staged writes. Keep secrets out of model and sandbox context rather than relying on the agent to avoid them. [R26-03](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-03) [R26-08](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-08) [R26-12](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-12)

### Concurrency is not just an optimization

Parallel workers change both behavior and failure modes. Define bounded fan-out, idempotency keys, cancellation propagation, merge semantics, resource quotas, and comparable confirmation runs. SDK and durable-execution releases in 2026 repeatedly fixed duplicate actions, cancellation leaks, credential races, livelocks, and incompatible workflow updates—evidence that these details belong in the design, not cleanup work. [R26-10](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-10) [R26-28](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-28) [R26-31](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-31)

[S01]: 05-source-index.md#s01
[S02]: 05-source-index.md#s02
[S03]: 05-source-index.md#s03
[S04]: 05-source-index.md#s04
[S05]: 05-source-index.md#s05
[S06]: 05-source-index.md#s06
[S07]: 05-source-index.md#s07
[S08]: 05-source-index.md#s08
[S09]: 05-source-index.md#s09
[S16]: 05-source-index.md#s16
[S17]: 05-source-index.md#s17
[S18]: 05-source-index.md#s18
[S27]: 05-source-index.md#s27
[S19]: 05-source-index.md#s19
[S20]: 05-source-index.md#s20
