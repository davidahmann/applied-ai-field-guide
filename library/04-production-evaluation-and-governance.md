# Production, Evaluation, and Governance

## Define success before selecting the model

The production framework in the supplied material begins with numerical business success criteria and a living evaluation set, before implementation or model choice. [S10]

Use a balanced scorecard:

| Dimension | Example measures |
| --- | --- |
| Outcome | Accepted cases, resolved incidents, completed analyses, revenue or cost impact |
| Quality | Correctness, groundedness, reconciliation rate, defect escape, policy compliance |
| Human load | Review minutes, intervention rate, escalation rate, rework |
| Speed | End-to-end cycle time, time to first useful artifact, time waiting for approval |
| Reliability | Task success, tool failure, retry exhaustion, recovery success |
| Economics | Cost per accepted outcome, tokens, model calls, compute, storage |
| Risk | Unauthorized actions, PII exposure, audit gaps, severity-weighted errors |

Activity measures such as tokens consumed, agent runs, or lines changed can diagnose the system but are not the final value measure. Replit's reported code-output gains are more meaningful only when paired with review latency, reversions, incidents, and project completion. Those figures remain first-party claims. [S17]

## The Verifier's Rule

The practical ceiling on autonomy is often verification, not generation. [S05]

| Verification | Consequence | Default operating mode |
| --- | --- | --- |
| Cheap, deterministic, high coverage | Low or reversible | Eligible for bounded automated execution after authority, expected-loss, recovery, and release gates pass |
| Reliable but semantic or sampled | Moderate | Agent executes; reviewer or grader checks |
| Subjective, incomplete, or expensive | High | Copilot, recommendation, or staged approval |
| No agreed definition of good | Severe or irreversible | Human-owned until standards exist |

Decompose a difficult task into pieces with clearer proof. A legal strategy may remain human-owned while definition checks, citation retrieval, issue extraction, and formatting are automated.

## Build a living evaluation stack

### Layer 1: deterministic checks

- Schema and type validation
- Required fields and formats
- Compilation, tests, and static analysis
- Reconciliation and invariant checks
- Citation resolution and source existence
- Permission and policy checks
- Idempotency and duplicate detection
- External postcondition checks against the system of record
- Ontology or rule-engine checks for domain invariants

Verification must inspect the world, not the agent's narration. In Tejas Kumar's browser demo, the agent reported a successful upvote after encountering a login page; reviewing the tool trace and resulting page state showed that no upvote occurred. Treat “action requested,” “tool returned,” and “business outcome changed” as three different events. [S19]

Type validation is also not business validation. Pydantic can reject a malformed payout request at the input boundary, while an ontology or deterministic rule layer rejects a well-formed request whose relationships violate domain logic. Frank Coyle describes this as validation at the “door” followed by consistency checking at the “ledger.” [S20]

### Layer 2: semantic evaluation

- Rubric-based correctness and completeness
- Groundedness against supplied evidence
- Pairwise comparison against a baseline
- Domain-expert or LLM-assisted review
- Independent reviewer context where possible

LLM judges are useful but non-deterministic and can share the producer's blind spots. Calibrate them against expert labels, measure agreement, and avoid using one unvalidated judge as the only release gate.

Expert labels are evidence, not anonymous truth. Each expected result or human-authored reference label needs an evidence basis, source and revision, accountable owner, label author, independent approver, approval time, adjudication and disagreement process, data classification, and review date. A stale, disputed, self-approved, or untraceable “golden” answer cannot remain a release gate. Use the versioned [evaluation-case contract](../schemas/evaluation-case.schema.json). `EVA-007`.

Data-agent evaluation needs special care. A query can execute successfully and still answer the wrong business question because the agent chose the wrong grain, source-of-truth table, join, time window, population, or interpretation. Evaluation should inspect assumptions and query structure as well as the final number or chart. [S02]

### Layer 3: behavioral and trace evaluation

- Correct tool selected
- Valid and appropriately scoped parameters
- Required retrieval performed
- No prohibited tools or data touched
- Reasonable number of retries and steps
- Correct escalation and approval behavior
- Budget and latency respected

### Layer 4: longitudinal and production evaluation

Hex's “Metric City” concept simulates roughly 90 days of evolving work to test whether a data agent learns and behaves coherently over time rather than only solving one-shot puzzles. [S02]

Production evaluation should also track cohort and time effects, policy changes, data freshness, and drift. The banking case in the five-pillar presentation illustrates why: a satisfaction drop reportedly traced to stale vector data after a policy change. [S10]

Every production failure should be triaged into:

1. A replayable example
2. The owning layer: data, context, tool, model, loop, graph, policy, or UX
3. A proposed change
4. A regression test
5. A measured rollout or A/B test

### Treat the evaluation corpus as a controlled product

A release suite needs its own contracts and quality gates: stable case IDs; representative workflow, risk, and failure slices; versioned fixtures and source revisions; an expected artifact or external effect; a verifier; accountable reference-answer provenance; and a review date. CI should catch missing metadata, self-approved or stale labels, duplicate or shortcut-prone cases, broken assertions, and loss of required high-risk coverage. The agent must not be able to change the fixtures, tests, judge, telemetry, or signal that certifies success.

When a case fails, use a deliberate **diagnose → explain → target → independent retest** loop. The review packet should show the proposed action, evidence, governing constraint, rejected alternative, observed effect, and available approval or escalation action. This makes human review informed and turns production feedback into a usable regression case rather than a pass/fail anecdote. See [Evaluation Corpus and Review Loops](09-evaluation-corpus-and-review-loops.md) for the case contract, slice matrix, corpus linting rules, and release checklist. [S21]

## Observability is the agent's operational record

Trace every consequential decision and transition:

- User or event trigger
- Prompt, policy, tool, model, and connector versions
- Context sources and permission decisions
- Model requests and structured outputs
- Tool inputs, outputs, latency, and errors
- State transitions and checkpoints
- Retry and stop reasons
- Human questions, approvals, edits, and rejections
- Cost, token, and compute usage
- Final artifact and downstream outcome

Observability supports debugging, compliance, cost control, and evaluation. It should make it possible to answer: what happened, why was it allowed, which evidence was used, what changed from the previous version, and how did the run end?

An event log is not automatically an appropriate permanent archive. Sensitive content may require redaction, encryption, field-level retention, or a content-minimized audit record.

## Governance must operate at action time

Enterprise tool access creates risk beyond the model call. Uber's production MCP design emphasizes centralized authorization, PII redaction, usage visibility, and scanning of tool metadata. [S06] Replit describes access policies, token proxies, audit logs, and ZeroTrust networking around broad company integrations. [S17]

Minimum controls include:

- User, tenant, project, matter, and data-source scoping
- Least-privilege tool and parameter authorization
- Secrets kept out of model-visible context
- PII and sensitive-data detection before and after tool calls
- Allowlists for models, providers, regions, and actions
- Human approval for material external writes or irreversible actions
- Rate, token, compute, and spend limits
- Sandboxed code execution and network egress rules
- Versioned prompts, policies, models, schemas, and tools
- Tamper-evident audit events and incident response
- Rollback and kill switches

Prompts should be treated as code because they change behavior. The same applies to tool descriptions, model-routing policies, retrieval weights, evaluator rubrics, and approval thresholds.

## Zero retention versus durable state

Harvey's legal-agent requirements expose a core architecture tension. [S18]

- Long-running agents benefit from persisted working memory, intermediate files, tool results, and checkpoints.
- Zero data retention means customer data is not written into durable third-party application storage by default; deleting it after the run is not equivalent.

A defensible design must answer separately for workflow state, content, and audit metadata:

| State class | Possible treatment |
| --- | --- |
| Working files and model context | Ephemeral sandbox disk bound to session teardown |
| Recovery checkpoint | Customer-controlled or in-boundary encrypted state with explicit TTL |
| Business artifact | Stored in the authorized system of record |
| Audit event | Content-minimized metadata, hashes, identities, decisions, timestamps |
| Cache and telemetry | Disabled, redacted, scoped, or covered by verified retention policy |

The source does not fully explain how Harvey reconciles crash recovery and inspectable records with ZDR. Any concrete implementation needs deletion verification, backup and log treatment, residency rules, and a threat model.

## Cost is an architectural constraint

One agent task can create hundreds of model and tool calls over a large corpus. The sustainable objective is the cheapest, fastest configuration that clears a declared quality and policy threshold.

### Main optimization levers

- Route by task, quality, policy, latency, and price
- Use smaller or open models where evaluations support them
- Cache stable prompt and policy prefixes
- Compact conversation and error history
- Batch independent tool calls in a programmatic sandbox
- Prefetch only highly likely context
- Parallelize independent work with bounded fan-out
- Size sandbox compute to workload
- Avoid reloading unchanged files and re-embedding unchanged data
- Stop loops on evidence and enforce retry budgets

Harvey reports 3–5x cost reductions against a frontier-only approach, and the Build Hour notes report a Ploy migration with 2.2x faster builds and 27% lower cost. These are source-reported results without enough detail here for independent comparison. [S11] [S18]

Runtime ownership can enable deeper optimization and meet regulatory requirements, but it adds security review, orchestration, capacity planning, provider adaptation, and on-call burden. Build versus buy should be revisited as managed runtimes improve.

## Safe self-improvement

Several sources describe systems that monitor themselves, generate proposed fixes, or learn from feedback. [S01] [S08] [S17] [S28]

A safe improvement loop is:

```text
production signal
  -> reproducible failure or opportunity
  -> proposed prompt/tool/code/policy change
  -> offline regression suite
  -> security and policy review
  -> shadow or canary run
  -> A/B test where appropriate
  -> human-reviewed promotion
  -> monitored rollback window
```

Do not let the same agent silently redefine its goal, evaluation, permissions, and implementation. Separate proposal, evaluation, authorization, and deployment. Preserve the baseline and attribute the observed improvement to a specific versioned change.

The baseline is the complete effective release, not a model name or one configuration file. Bind the workflow topology, behavior bundle, prompts, admitted skills and capabilities, tools and MCP servers, context and guardrail policy, evaluator, runtime, permissions, budgets, environment, and applicable data and policy revisions. The Guide's agent-system, behavior-bundle, capability-manifest, evaluation-report, and solution-release records already form this graph; a vendor factory manifest may project it but must not become a second source of truth. [R26-81](../research/2026-08-28--warp-self-improving-software-factories.md#r26-81)

Treat a scorer as an evaluator. Declare its claim, eligible population, sampling policy, inputs, rubric, version, label authority, uncertainty, cost, calibration, disagreement path, and failure behavior. Traces and human interactions can identify candidates, but neither becomes ground truth or promotion evidence automatically. Compare the current and candidate configurations on identical representative tasks, world and policy revisions, resource budgets, scorer versions, trial rules, and acceptance criteria; retain per-case results and a protected holdout.

## Launch gates

Canonical enforcement artifacts:

| Scope | Artifact |
| --- | --- |
| Mandatory requirements | [Production control catalog](../controls/control-catalog.json) |
| Design through autonomy gates | [Production release gates](../operations/release-gates.md) |
| Evaluation case contract | [Evaluation-case Schema](../schemas/evaluation-case.schema.json) |
| Threat contract | [Threat-model Schema](../schemas/threat-model.schema.json) |
| Incident recovery | [Agent incident runbook](../operations/incident-runbook.md) |

## Operational dashboard

At minimum, monitor:

- Accepted task success rate
- Severity-weighted error rate
- Human intervention and escalation rate
- Retry exhaustion and circuit-breaker trips
- Tool selection and parameter validity
- Retrieval recall or groundedness on audited samples
- End-to-end latency and queue time
- Cost per accepted outcome
- Unauthorized or policy-blocked actions
- Data freshness and connector lag
- Version-level regression and rollback rate

## 2026 update: trajectory integrity and agent-native operations

### Evaluate trajectories, artifacts, and the evaluator

Final-answer quality cannot establish that an agent chose permitted tools, preserved authorization, handled state correctly, or produced the desired external effect. Evaluate contracts, components, full trajectories, completed artifacts, safety boundaries, and operational budgets. Use replayable world snapshots rather than live reruns whenever state changes beneath the agent. [R26-01](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-01) [R26-07](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-07) [R26-24](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-24)

The evaluator itself needs a trust boundary. Benchmark-integrity research in 2026 showed that an agent could achieve perfect scores while completing no real work by exploiting hooks in the evaluation setup. Agents must not be able to modify tests, judges, or success-reporting infrastructure. [R26-25](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-25)

### Diagnose, segment, and improve

Scores show that a problem exists; trace-level diagnosis identifies the failing component, span, or causal chain. In production, cluster behavior by workflow and tool trajectory, then compare success, cost, latency, and escalation per cluster. Turn new or degraded clusters into replay cases. [R26-17](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-17) [R26-20](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-20)

### Store only state that cleared its gate

Memory, cache, artifacts, and shared conclusions are state transitions with blast radius. Apply output guardrails, validation, and approval before persistence; retain provenance and trust labels so state can be invalidated when evidence changes. [R26-06](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-06) [R26-28](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-28)

### Security and economics belong in the same operating view

Security events, policy denials, egress attempts, and unsafe action proposals are operational metrics, not merely compliance events. Cost should include models, tools, retries, wait, compute, and human review, then be measured per **accepted** outcome. [R26-21](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-21) [R26-22](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-22) [R26-30](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-30)

[S01]: 05-source-index.md#s01
[S02]: 05-source-index.md#s02
[S05]: 05-source-index.md#s05
[S06]: 05-source-index.md#s06
[S08]: 05-source-index.md#s08
[S10]: 05-source-index.md#s10
[S11]: 05-source-index.md#s11
[S17]: 05-source-index.md#s17
[S18]: 05-source-index.md#s18
[S19]: 05-source-index.md#s19
[S20]: 05-source-index.md#s20
[S21]: 05-source-index.md#s21
