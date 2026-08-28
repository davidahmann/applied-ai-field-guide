# Uber Production AI Operating Lessons

**Review date:** 2026-08-28

**Scope:** agent-work economics, model and system contracts, semantic file analysis, and delegated-agent identity

**Decision:** admit four bounded first-party engineering reports as operating evidence; strengthen existing cost, evaluation, hybrid-system, semantic-analysis, identity, change, and service-review guidance without creating a new module, control family, platform blueprint, or universal infrastructure default

<a id="r26-77"></a>
## R26-77 — Uber: running a software factory efficiently

- **Date:** Published 2026-08-27; reviewed 2026-08-28
- **Type / tier:** First-party operating and engineering report; C
- **Source:** [Running a Software Factory Efficiently at Uber Scale](https://www.uber.com/us/en/blog/efficient-software-factory/)
- **Reported scope:** Uber's internal interactive and managed software-engineering agents, cost instrumentation, model selection, context delivery, and skill improvement

Uber decomposes total AI spend into adoption, engagement, agent work, token volume, and price drivers. It reports workload-specific model benchmarks, progressive tool resolution, code-mediated batching, graph-grounded context, session-level waste diagnostics, and a governed path for improving skills from execution traces.

### Portable findings

1. Keep **cost per accepted outcome** as the decision unit, but decompose its model-mediated operating cost so a service owner can explain why spend moved:

   ```text
   users × sessions/user × turns/session × requests/turn × tokens/request × price/token
   ```

   The factors diagnose adoption, engagement, orchestration, payload, and price effects. They do not replace tool, compute, storage, wait, retry, human-review, recovery, and allocated-service cost.
2. Compare an optimization against the current route on the same representative workload and, when isolating one lever, hold the model and enforced resource budget constant. Otherwise model changes, adoption, and workload mix confound the claim.
3. Route models on a measured Pareto frontier across accepted-outcome quality, reliability, latency, and full cost—not price per token. Re-run the comparison after model, prompt, context, tool, topology, or workload changes.
4. Treat repeated searching, unnecessary turns, oversized tool results, model-visible polling, unused tool schemas, avoidable cache misses, and expensive routing of simple work as observable zero-value-work signals.
5. Load tools progressively and use trusted, bounded code for polling and bulk work when it reduces model turns. Authorization, egress, audit, cancellation, result limits, and source-of-truth verification remain at the software boundary.
6. Convert recurring trace papercuts into candidate skill changes only after sanitization, replay, independent evaluation, review, canary, rollback, and ordinary release approval.

### Claim limits

- Uber's adoption, scale, request volume, cost reductions, cache economics, context limits, tool counts, and token-savings figures are first-party measurements from its own workloads and infrastructure.
- The reported context cap, reasoning default, cache lifetimes, subagent model policy, graph scale, and gateway design are not portable defaults.
- Lower token or request cost does not establish better accepted outcomes, safety, reliability, adoption, or total service economics.
- A trace-derived suggestion is not a safe skill update until it crosses the normal protected evaluation and release path.

<a id="r26-78"></a>
## R26-78 — Uber: DeepETT traffic forecasting

- **Date:** Published 2026-05-19; reviewed 2026-08-28
- **Type / tier:** First-party production-system architecture and outcome report; C
- **Source:** [Scaling Real-Time Traffic Forecasting with a Graph-Aware Transformer](https://www.uber.com/us/en/blog/scaling-real-time-traffic/)
- **Reported scope:** a global traffic-forecasting system upstream of routing and arrival-time estimation

Uber describes a deliberate boundary between a directly served segment-level forecast and downstream trip-level behavior. It reports that improving the local training metric did not guarantee improvement in the product metric, that calibration drift could erase downstream gains, and that fixed-size pre-aggregated views enabled predictable high-throughput inference.

### Portable findings

1. Define both the **direct component contract** and the **downstream product contract** before implementation. Local metric improvement is insufficient when a component feeds another model, optimizer, policy, or workflow.
2. Separate information gain or resolution from systematic calibration error when the distinction is meaningful, and monitor calibration by consequential slice after launch.
3. Treat feature aggregation, calibration, and downstream consumption as versioned production components with freshness, lineage, compatibility, rollback, and replay evidence.
4. Let production latency, throughput, data availability, and failure constraints shape the model architecture. A theoretically richer graph or end-to-end formulation is not automatically the smallest sufficient production mechanism.
5. Require downstream replay and, where justified, a bounded experiment before promotion when an upstream change can alter customer-visible decisions.

### Claim limits

- The reported throughput, quality improvements, revenue impact, data scale, and architecture are Uber-specific first-party claims, not reusable targets.
- Fixed-size aggregation, transformers, Spark, Flink, feature hashing, and real-time calibration are implementation choices, not guide defaults.
- Calibration does not repair missing information, invalid labels, policy errors, unfair segments, or a wrongly scoped business outcome.

<a id="r26-79"></a>
## R26-79 — Uber: File Semantic Analyzer

- **Date:** Published 2026-06-04; reviewed 2026-08-28
- **Type / tier:** First-party security-system architecture and operating report; C
- **Source:** [Building a File Semantic Analyzer: Guarding Outbound Data at Scale with AI](https://www.uber.com/us/en/blog/ubers-file-analyzer/)
- **Reported scope:** semantic classification and analyst review of files leaving Uber's environment

Uber reports a hybrid path that extracts text and images, chunks large files, proposes semantic summaries and classifications with explanations, applies deterministic policy, and routes consequential cases to human analysts. Analyst feedback becomes input to later prompt or model improvement.

### Portable findings

1. Keep file parsing, OCR, normalization, chunking, model interpretation, policy, action, and human review as separately versioned and testable stages.
2. Require source spans or equivalent cited evidence, uncertainty, and typed abstention for consequential semantic claims. An explanation improves reviewability; it is not verification.
3. Measure false positives, false negatives, abstention, reviewer agreement, and calibration by risk, file type, language, size, and source slice. Preserve label provenance, disagreement, adjudication, and review dates.
4. Treat documents, parser output, OCR text, embedded links, and model summaries as untrusted content. Sandboxed parsing, content limits, decompression controls, malware handling, injection tests, and purpose-bound retention remain software responsibilities.
5. Route analyst corrections into a governed feedback record. Do not let production feedback silently rewrite prompts, labels, graders, policies, or release thresholds.

### Claim limits

- Uber's reported file volume, labor savings, false-positive reduction, and implementation details are first-party claims and not portable performance thresholds.
- A language model's explanation can be plausible and wrong; citation entailment and source review remain separate.
- Semantic classification must not become the sole authorization, secret-detection, policy, or completion-verification boundary.

<a id="r26-80"></a>
## R26-80 — Uber: identity and delegation for AI agents

- **Date:** Published 2026-05-21; reviewed 2026-08-28
- **Type / tier:** First-party security architecture and operating report; C
- **Source:** [Solving the Identity Crisis for AI Agents](https://www.uber.com/us/en/blog/solving-the-agent-identity-crisis/)
- **Reported scope:** identity, delegation provenance, authorization, and observability across internal multi-agent and tool-call paths

Uber describes separate workload and logical-agent registration, short-lived next-hop credentials, preservation of the initiating user and intermediary agents, tool-gateway enforcement, and a paved SDK path that makes attribution and token exchange secure by default.

### Portable findings

1. Distinguish the initiating human or service principal, hosting workload, logical agent, current recipient, tenant, and target operation. A generic service identity is insufficient attribution for a delegated effect.
2. Preserve a verifiable delegation path across every hop. Each hop rechecks current authority and binds the delegated grant to the intended next recipient, purpose, scope, expiry, and policy revision.
3. Authorize the intersection of initiating caller, logical agent, workload, tenant, destination, capability, resource, policy, and approval. No intermediary may widen the caller's ceiling.
4. Prefer a secure-by-default client or SDK path that performs identity exchange, propagation, validation, and audit consistently; keep the enforcement in trusted software rather than prompts.
5. Record an end-to-end authorization trace without exposing credentials or unrestricted payloads.

### Required negative cases

- Forged or missing initiating-caller identity
- Wrong recipient or audience
- Replayed, expired, or revoked delegation
- Logical-agent and hosting-workload mismatch
- Truncated or reordered delegation lineage
- Scope, tenant, capability, resource, or effect expansion at an intermediary hop

### Claim limits

- SPIFFE, SPIRE, JWT, OAuth token exchange, A2A, Kubernetes, an agent registry, and an agent mesh are Uber's implementation choices, not required technologies.
- A valid credential proves only the claims and issuer policy it binds; it does not establish business authorization, approval, safe parameters, or successful completion.
- Full lineage may contain sensitive identity and workflow metadata. Retention, access, minimization, redaction, and incident use must be purpose-bound.

## Repository impact

| Artifact | Bounded change |
| --- | --- |
| [AI Value Engineering and Frugal Architecture](../library/11-value-engineering-and-frugal-architecture.md) | Add causal cost-driver decomposition beneath full cost per accepted outcome |
| [Production service review](../templates/production-service-review.md) and [behavior monitoring](../operations/behavior-monitoring.md) | Make cost drivers, zero-value work, downstream drift, and trace-derived improvement reviewable |
| [Change management](../operations/change-management.md) | Require controlled comparisons and direct plus downstream contract evidence |
| [Intelligence selection](../templates/intelligence-selection-record.md) and [hybrid intelligence](../blueprints/hybrid-intelligence-system.md) | Bind component and downstream contracts, architecture constraints, calibration, and replay |
| [Secure AI workload](../solutions/secure-ai-workload.md) | Clarify the staged semantic-classification and human-review boundary |
| [Agent system architecture](../library/03-agent-system-architecture.md), [enterprise agent platform](../blueprints/enterprise-agent-platform.md), and [multi-agent coordinator](../blueprints/multi-agent-coordinator.md) | Preserve verified per-hop caller, workload, agent, recipient, and scope attribution |
| [Control catalog](../controls/control-catalog.json) | Strengthen existing delegated-authority control `IAM-002`; add no control family |

Disposition: `configure`. Use the reports to refine existing operational contracts and tests. Do not create Uber-specific defaults, copy its architecture by category, or treat attributed scale and outcome metrics as target-system evidence. Revisit by 2027-02-28 or sooner after a material public correction, incident report, or independently inspectable technical artifact.
