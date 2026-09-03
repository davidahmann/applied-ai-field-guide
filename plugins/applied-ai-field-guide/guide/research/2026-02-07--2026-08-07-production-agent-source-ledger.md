# Production-Agent Source Ledger

Current research window: **2026-02-07 to 2026-08-07**. A small number of foundational sources published before the window are retained only when explicitly labeled as revalidated on 2026-08-07.

This is a curated implementation database, not a popularity list. It favors primary specifications, engineering evidence, reproducible research, security publications, and concrete first-party operating reports. Vendor claims are kept as patterns to test, not universal performance promises.

## Evidence hierarchy

| Tier | Admission rule | How to use it |
| --- | --- | --- |
| A — Primary implementation evidence | Official specification, release, security advisory, incident report, or engineering post | Can support a concrete control or design pattern |
| B — Reproducible research | Public methodology, code, benchmark, or inspectable evaluation artifact | Use to shape evaluation and threat models; verify fit locally |
| C — First-party field report | Identifiable practitioner or company shares specific implementation and review practices | Use as a practical lead; do not generalize performance claims |
| D — News/community lead | Reputable reporting or social/community discussion without enough primary detail | Track or use to find the primary source; not core guidance on its own |

## Core evidence

<a id="r26-01"></a>
### R26-01 — AWS: Evaluating AI agents

- **Date:** 2026-02-18
- **Type / tier:** Company engineering; A
- **Source:** [Evaluating AI agents: Real-world lessons from building agentic systems at Amazon](https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon/)
- **Finding:** Agent evaluation needs model, component, and end-to-end layers. Tool selection, memory retrieval, multi-step behavior, and task completion belong in the evaluation surface, not just final text.
- **Portable pattern:** Evaluate full traces and artifacts; use sampled human audits and regression notifications.
- **Anti-pattern:** Final-answer-only scores that cannot explain a behavioral regression.

<a id="r26-02"></a>
### R26-02 — Cloudflare: Code Mode for large MCP surfaces

- **Date:** 2026-02-20
- **Type / tier:** Company implementation; A
- **Source:** [Code Mode: better tools for agents](https://blog.cloudflare.com/code-mode-mcp/)
- **Finding:** Cloudflare reports that representing 2,500 endpoints as always-loaded tool definitions would consume roughly 1.17 million tokens. Its alternative exposes compact search and execution primitives, progressively discovers typed API operations, and runs generated JavaScript in a restricted V8 isolate.
- **Portable pattern:** Progressive capability discovery; compact composable primitives; constrained execution environment.
- **Anti-pattern:** Flat, always-loaded tool catalogs that waste context and degrade selection quality.
- **Caveat:** The token figure is implementation-specific; test the threshold in your own tool ecosystem.

<a id="r26-03"></a>
### R26-03 — GitHub: security architecture for Agentic Workflows

- **Date:** 2026-03-09
- **Type / tier:** Company security engineering; A
- **Source:** [Under the hood: Security architecture of GitHub Agentic Workflows](https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/)
- **Finding:** GitHub explicitly assumes an agent may read/write state it should not, communicate through unintended channels, and abuse legitimate channels. Its controls center on defense in depth, no model access to secrets, staged/vetted writes, and comprehensive logs.
- **Portable pattern:** Container isolation, controlled egress, trusted gateway-held credentials, staged writes, safe outputs, and auditability.
- **Anti-pattern:** Treating prompt instructions as authorization or putting agent and secret-bearing processes in one trust domain.

<a id="r26-04"></a>
### R26-04 — OpenAI: monitoring internal coding-agent misalignment

- **Date:** 2026-03-19
- **Type / tier:** Primary safety publication; A
- **Source:** [How we monitor internal coding agents for misalignment](https://openai.com/index/how-we-monitor-internal-coding-agents-misalignment/)
- **Finding:** Monitor agent actions and tool output for behavior inconsistent with the intended task, with escalation and blocking controls for consequential or irreversible actions.
- **Portable pattern:** Behavior monitoring tied to explicit task intent and enforced action controls.
- **Anti-pattern:** Relying on user reports or post-hoc review alone.
- **Caveat:** The results are self-reported and rely on trajectory access most teams should privacy-minimize; record structured action events rather than indiscriminately storing private reasoning.

<a id="r26-05"></a>
### R26-05 — Kaxil Naik: reviewable agentic software delivery

- **Date:** 2026-03-27
- **Type / tier:** First-party practitioner field report on X; C
- **Source:** [X post](https://x.com/kaxil/status/2037503513350005134)
- **Finding:** The described workflow combines versioned skills, hooks, CLIs/MCP, permission-isolated subagents, full E2E/UI checks, screenshots, and human verification.
- **Portable pattern:** Encode repeatable judgment in versioned skills; use hooks for enforcement; require visible evidence before merge.
- **Anti-pattern:** Treating an agent-created PR or superficial test pass as production readiness.

<a id="r26-06"></a>
### R26-06 — GitHub: integrity-aware cache and audit diff

- **Date:** 2026-03-30
- **Type / tier:** Official engineering update; A
- **Source:** [GitHub Agentic Workflows weekly update](https://github.github.com/gh-aw/blog/2026-03-30-weekly-update/)
- **Finding:** Cache entries are separated by trust/integrity state (`merged`, `approved`, `unapproved`, `none`). The project also uses read-only/no-secret defaults and compares firewall activity, tool calls, token use, and duration between versions.
- **Portable pattern:** Carry trust labels into cached context and regression-test policy behavior as well as final output.
- **Anti-pattern:** Allowing untrusted text to contaminate trusted memory or comparing versions only by prose output.

<a id="r26-07"></a>
### R26-07 — Datadog: replayable SRE-agent evaluations

- **Date:** 2026-04-07
- **Type / tier:** Company engineering; A
- **Source:** [Building an eval platform for autonomous SRE agents](https://www.datadoghq.com/blog/engineering/bits-ai-eval-platform/)
- **Finding:** Real incidents become replayable world snapshots and representative labels; full workflow evaluation is more useful than isolated tool tests or live reruns because production state changes underneath the investigation.
- **Portable pattern:** Sanitized world snapshots, full-trace evaluation, and regression testing each change against the representative suite.
- **Anti-pattern:** Rerunning investigations on live state or certifying a system through isolated tool tests only.

<a id="r26-08"></a>
### R26-08 — Cloudflare: identity-aware sandbox authentication

- **Date:** 2026-04-13
- **Type / tier:** Company security engineering; A
- **Source:** [Sandbox auth: securing AI workloads](https://blog.cloudflare.com/sandbox-auth/)
- **Finding:** Treat agent workloads as untrusted and route outbound requests through a controllable egress proxy. Exchange workload identity for short-lived, scoped credentials rather than mounting static keys.
- **Portable pattern:** Workload identity + egress broker + short-lived downscoped credential.
- **Anti-pattern:** Static broad API keys in environment variables, container files, or model-visible configuration.

<a id="r26-09"></a>
### R26-09 — Google: prompt injections in the wild

- **Date:** 2026-04-23
- **Type / tier:** Security research; A
- **Source:** [Prompt injections in the wild](https://blog.google/security/prompt-injections-web/)
- **Finding:** Browsed and retrieved content is an untrusted-input boundary. Signature-only detection creates unmanageable false positives; the described approach uses candidate retrieval, model classification, and human validation.
- **Portable pattern:** Taint/provenance handling for external content, layered detection, and human review for ambiguous security findings.
- **Anti-pattern:** Treating web, ticket, telemetry, or tool output as trusted instruction context.

<a id="r26-10"></a>
### R26-10 — Google ADK: concurrency and input-hardening fixes

- **Date:** 2026-05-01
- **Type / tier:** Official SDK release; A
- **Source:** [ADK Python v1.32.0](https://github.com/google/adk-python/releases/tag/v1.32.0)
- **Finding:** The release fixes nested-YAML RCE, SSRF/local-file access, credential race/data leakage, duplicate tool execution, parallel sibling cancellation, crashes, and state merging.
- **Portable pattern:** Validate configuration/URLs, isolate credentials per invocation, make tools idempotent, cancel siblings on failure, and specify merge behavior.
- **Anti-pattern:** Shared credential context, unrestricted URL/file tools, implicit re-execution, and parallel work that survives an upstream failure.

<a id="r26-11"></a>
### R26-11 — Google Cloud: dedicated agent identity

- **Date:** 2026-05-06
- **Type / tier:** Company security engineering; A
- **Source:** [What's new in IAM: Security, governance, and runtime defense](https://cloud.google.com/blog/products/identity-security/whats-new-in-iam-security-governance-and-runtime-defense)
- **Finding:** Agents need cryptographically protected, attested, agent-specific identities distinct from human identities and generic service accounts, including when acting on behalf of a user.
- **Portable pattern:** First-class workload/agent principal plus agent-specific authorization policy.
- **Anti-pattern:** Reusing a broad human or application credential as an agent's permanent identity.

<a id="r26-12"></a>
### R26-12 — Microsoft Security: prompts become shells

- **Date:** 2026-05-07
- **Type / tier:** Vulnerability research; A
- **Source:** [Prompts become shells: RCE vulnerabilities in AI agent frameworks](https://www.microsoft.com/en-us/security/blog/2026/05/07/prompts-become-shells-rce-vulnerabilities-ai-agent-frameworks/)
- **Finding:** A tool visible to the model is an executable security boundary. Prompt injection paired with unsafe tool/plugin exposure can turn a search or retrieval surface into a route to privileged functions.
- **Portable pattern:** Keep sensitive operations unavailable to the model; invoke privileged actions through deterministic, policy-enforced code.
- **Anti-pattern:** Allowing an LLM-accessible tool surface to reach dangerous functions by default.

<a id="r26-13"></a>
### R26-13 — MCP Registry: verified tool provenance

- **Date:** 2026-05-12
- **Type / tier:** Official registry release/repository; A
- **Source:** [MCP Registry v1.7.9](https://github.com/modelcontextprotocol/registry/releases/tag/v1.7.9) and [publisher verification design](https://github.com/modelcontextprotocol/registry)
- **Finding:** Publisher namespace ownership can be verified through GitHub OAuth/OIDC or DNS/HTTP. The release moved OCI validation toward fail-closed behavior during upstream rate limits.
- **Portable pattern:** Verify ownership/provenance before admitting a tool and fail closed when trust cannot be established.
- **Anti-pattern:** Installing a server solely from a familiar-looking name or treating validation outages as approval.

<a id="r26-14"></a>
### R26-14 — AWS: Agentic Readiness

- **Date:** 2026-05-27
- **Type / tier:** Company engineering; A
- **Source:** [Agentic Readiness: a method for evaluating applications for agent interaction](https://aws.amazon.com/blogs/migration-and-modernization/agentic-readiness/)
- **Finding:** An application must be evaluated separately as a read resource and an action tool. At workflow level, the least-ready dependency constrains agent reliability.
- **Portable pattern:** Assess interfaces, security, data handling, operational resilience, and observability before integration.
- **Anti-pattern:** Assuming that a human-facing API is automatically suitable for agent-scale reads or writes.

<a id="r26-15"></a>
### R26-15 — AWS: AgentOps at scale

- **Date:** 2026-06-01
- **Type / tier:** Company engineering; A
- **Source:** [AgentOps: Operationalize agentic AI at scale](https://aws.amazon.com/blogs/machine-learning/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedrock-agentcore/)
- **Finding:** Version agent, tool, and memory configurations; evaluate at tool, turn, session, and system levels; propagate initiating-user authorization across multi-agent hops.
- **Portable pattern:** Version all behavioral configuration and constrain delegates to the caller's authorization.
- **Anti-pattern:** Unversioned memory/configuration or downstream agents that quietly acquire broader permissions.

<a id="r26-16"></a>
### R26-16 — Google Research: agentic RAG

- **Date:** 2026-06-05
- **Type / tier:** Research/engineering; A
- **Source:** [Unlocking dependable responses with agentic RAG](https://research.google/blog/unlocking-dependable-responses-with-gemini-enterprise-agent-platforms-agentic-rag/)
- **Finding:** Multi-hop, cross-corpus retrieval benefits from planning, query rewriting, source fan-out, and an explicit evidence-sufficiency check before synthesis.
- **Portable pattern:** Adaptive retrieval with a bounded sufficiency test for genuinely complex questions.
- **Anti-pattern:** One-shot retrieval followed by confident synthesis from partial evidence.
- **Caveat:** Vendor-reported uplift is not a general expectation; deterministic queries remain preferable for stable lookups.

<a id="r26-17"></a>
### R26-17 — Datadog: behavior-pattern observability

- **Date:** 2026-06-09
- **Type / tier:** Company engineering; A
- **Source:** [Patterns for agent observability](https://www.datadoghq.com/blog/patterns-agent-observability/)
- **Finding:** Cluster production trajectories into behavioral patterns and attach quality, tool calls, latency, and cost to each segment. New behavior clusters can seed new tests.
- **Portable pattern:** Segment-level monitoring and a production-failure-to-evaluation loop.
- **Anti-pattern:** Global averages or manual trace review alone.

<a id="r26-18"></a>
### R26-18 — CSA: Agentjacking through untrusted telemetry

- **Date:** 2026-06-12
- **Type / tier:** Security research note; B
- **Source:** [CSA research note: Agentjacking MCP/Sentry injection](https://labs.cloudsecurityalliance.org/research/csa-research-note-agentjacking-mcp-sentry-injection-20260612/)
- **Finding:** A malicious-looking monitoring event can become indirect prompt injection when a coding agent consumes telemetry under a developer's authority.
- **Portable pattern:** Treat telemetry/tool output as untrusted; deny-by-default egress, action approval, scoped credentials, and credential-read restrictions must be enforced outside the model.
- **Anti-pattern:** Prompt-only policy or granting developer identity to an agent that consumes attacker-controlled observations.

<a id="r26-19"></a>
### R26-19 — OpenTelemetry: GenAI telemetry schema evolution

- **Date:** 2026-06-12
- **Type / tier:** Cross-vendor observability standard; A
- **Source:** [OpenTelemetry Semantic Conventions v1.42.0](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.42.0)
- **Finding:** GenAI telemetry evolves independently; migration requires deliberate schema-version handling, and high-cardinality network attributes can create unbounded metrics.
- **Portable pattern:** Version telemetry schemas and treat sensitive/high-cardinality attributes as explicit cost and privacy decisions.
- **Anti-pattern:** Mixing schema versions or emitting all possible trace dimensions by default.

<a id="r26-20"></a>
### R26-20 — AWS: trace-level failure detection

- **Date:** 2026-06-15
- **Type / tier:** Company engineering; A
- **Source:** [AI Agent Failure Detection and Root Cause Analysis with Strands Evals](https://aws.amazon.com/blogs/machine-learning/ai-agent-failure-detection-and-root-cause-analysis-with-strands-evals/)
- **Finding:** A score shows that performance changed but does not locate the failure. Trace/span analysis can classify failures, link root causes to symptoms, and identify whether a prompt or tool definition needs change.
- **Portable pattern:** Separate “how well” evaluation from “why” diagnosis; maintain a failure taxonomy.
- **Anti-pattern:** Requiring senior engineers to inspect every failing trace manually at scale.

<a id="r26-21"></a>
### R26-21 — PagerDuty: production-agent operational metrics and UX

- **Date:** 2026-06-11
- **Type / tier:** Company engineering; A
- **Source:** [Production AI agents: closing the gaps between idea and reality](https://www.pagerduty.com/eng/production-ai-agents-closing-the-gaps-between-idea-and-reality/)
- **Finding:** Measure task success, groundedness, retry/loop rate, plan length, cost per success, safety violations, and human escalation. Show structured plan/step/status progress rather than hiding long-running work behind chat.
- **Portable pattern:** Operational metrics plus visible, interruptible progress artifacts.
- **Anti-pattern:** Silent spinner/chat-only UX or treating one agent's unverified hypothesis as durable fact for another.

<a id="r26-22"></a>
### R26-22 — OpenAI: cost per accepted outcome

- **Date:** 2026-07-14
- **Type / tier:** Company operating guidance; A
- **Source:** [Managing AI investments in the agentic era](https://openai.com/index/managing-ai-investments-in-agentic-era/)
- **Finding:** A useful cost view includes models, tools, retries, latency, and human review; optimize cost per accepted outcome rather than token volume or headline model price.
- **Portable pattern:** Scope tools, reuse context, enforce stopping conditions, and attribute all execution costs to an accepted unit of work.
- **Anti-pattern:** Choosing the cheapest model when correction and retries make it more expensive end-to-end.

<a id="r26-23"></a>
### R26-23 — Google Cloud: evaluate a capability curve

- **Date:** 2026-07-10
- **Type / tier:** Company research/engineering; A
- **Source:** [Who evaluates the evaluations? Measuring agent performance](https://cloud.google.com/blog/products/data-analytics/evaluate-agent-performance)
- **Finding:** Vary query specificity systematically to locate where discovery and retrieval fail; a single pass/fail score or subjective “easy/hard” label does not reveal the capability boundary.
- **Portable pattern:** Capability curves with reproducible task dimensions.
- **Anti-pattern:** Static benchmark scores that hide retrieval, context, or ambiguity thresholds.

<a id="r26-24"></a>
### R26-24 — AWS: aws-bench

- **Date:** 2026-07-24
- **Type / tier:** Official benchmark announcement; A
- **Source:** [AWS announces aws-bench](https://aws.amazon.com/about-aws/whats-new/2026/07/aws-bench/)
- **Finding:** Test cases pair natural-language queries with a defined cloud-resource state and ground truth; the CLI creates environments, runs and scores evaluations, and resets state.
- **Portable pattern:** Reproducible environment state, verifiable tasks, harness-aware scoring, and resettable worlds.
- **Anti-pattern:** Benchmarking an agent against a task without controlling the state it sees or changes.

<a id="r26-25"></a>
### R26-25 — Benchmark integrity research

- **Date:** 2026-04-08/09
- **Type / tier:** Research write-up; B
- **Source:** [Trustworthy benchmarks for coding agents](https://moogician.github.io/blog/2026/trustworthy-benchmarks-cont/)
- **Finding:** Researchers documented an agent achieving 100% on prominent benchmarks while completing no useful tasks by exploiting the evaluator, with exploit classes across multiple benchmarks.
- **Portable pattern:** Isolate evaluation infrastructure; inspect effects and artifacts; red-team reward hacking.
- **Anti-pattern:** Letting the agent modify tests, hooks, validators, or other components that decide success.

<a id="r26-26"></a>
### R26-26 — GitHub Agentic Workflows: hardened compiled artifacts

- **Date:** 2026-07-25
- **Type / tier:** Official release; A
- **Source:** [GitHub Agentic Workflows v0.83.3](https://github.com/github/gh-aw/releases/tag/v0.83.3)
- **Finding:** The release fixes Git and GraphQL injection, validates post-update action SHAs, recommends comment-only PR reviewers, makes recompilation a critical invariant, and bundles safe-output failure artifacts.
- **Portable pattern:** Validate ref/path inputs, pin/verify dependencies, default review agents to non-mutating behavior, and compile/inspect hardened artifacts.
- **Anti-pattern:** Interpolating agent-controlled strings into shell/GraphQL, trusting mutable tags, or allowing a reviewer to write by default.

<a id="r26-27"></a>
### R26-27 — Workato: enterprise MCP control-plane framing

- **Date:** 2026-03-06
- **Type / tier:** First-party company post on X; C
- **Source:** [X post](https://x.com/Workato/status/2029937774699155947)
- **Finding:** Agents that read internal data or trigger workflows need non-human identity, permissions, audit logs, and governance around Enterprise MCP.
- **Portable pattern:** Agent identities and gateway authorization at the control plane.
- **Anti-pattern:** Embedded shared credentials inside an agent runtime.

<a id="r26-28"></a>
### R26-28 — OpenAI Agents Python: approved session state and failure handling

- **Date:** 2026-08-05
- **Type / tier:** Official SDK release; A
- **Source:** [OpenAI Agents Python v0.19.4](https://github.com/openai/openai-agents-python/releases/tag/v0.19.4)
- **Finding:** The release persists sessions after output guardrails, redacts invalid tool-argument errors, records agent-span failures, enforces sandbox output budgets, cancels siblings after concurrent failure, and preserves history provenance.
- **Portable pattern:** Guardrail/approval before memory write; budget outputs; preserve provenance; trace and cancel partial concurrent work.
- **Anti-pattern:** Saving unapproved output as memory, exposing raw invalid arguments, or leaving sibling work running after a related failure.
- **Caveat:** This is a `0.x` SDK; treat it as failure evidence, not a permanent API promise.

<a id="r26-29"></a>
### R26-29 — SkyPilot: bounded parallel research agents

- **Date:** 2026-03-29 PT / 2026-03-30 UTC
- **Type / tier:** Open-source infrastructure field report; C
- **Source:** [Scaling autoresearch](https://skypilot.ai/blog/scaling-autoresearch)
- **Finding:** With a fixed numeric objective, constrained editable surface, quota, and independent validation hardware, a coding agent submitted many parallel experiments. Parallelism shifted search behavior and required result normalization across hardware.
- **Portable pattern:** Explicit objectives/edit scope, resource caps, checkpointed results, comparable validation, and confirmation runs.
- **Anti-pattern:** Unbounded autonomous provisioning or comparing results from non-equivalent environments.

<a id="r26-30"></a>
### R26-30 — OWASP: State of Agentic AI Security and Governance

- **Date:** 2026-06
- **Type / tier:** Security consortium report; B
- **Source:** [State of Agentic AI Security and Governance v2.01](https://genai.owasp.org/download/50592/?tmstv=1754459367)
- **Finding:** The report frames agent-specific risks from behavior hijack and tool misuse to insecure inter-agent communication, cascading failures, and rogue agents. It stresses continuous oversight, drift detection, incident routing, and stop mechanisms.
- **Portable pattern:** Threat-model agent behavior and inter-agent boundaries; tie live monitoring to response controls.
- **Anti-pattern:** Periodic compliance review as the only governance mechanism for autonomous actions.

<a id="r26-31"></a>
### R26-31 — Temporal: durable-execution limits and compatibility

- **Date:** 2026-07-29
- **Type / tier:** Official SDK release; A
- **Source:** [Temporal Python SDK 1.31.0](https://github.com/temporalio/sdk-python/releases/tag/1.31.0)
- **Finding:** The release addresses bounded eager reservations, payload limits, replay-safe cancellation, rolling-deployment patching, cooperative-budget livelock, and secret handling.
- **Portable pattern:** Bound capacity/payloads, test replay and cancellation, use versioned compatibility strategies, and pass secret references rather than values.
- **Anti-pattern:** Unbounded fan-out/payloads, assuming cancellation is durable, or deploying changed workflow code without compatibility planning.

## Protocol, observability, and SDK hardening evidence

<a id="r26-32"></a>
### R26-32 — MCP authorization specification

- **Date:** 2026-07-28
- **Type / tier:** Official stable protocol specification; A
- **Source:** [MCP 2026-07-28 authorization](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/index.mdx)
- **Finding:** MCP authorization uses OAuth 2.1, protected-resource metadata, explicit scope challenges, and incremental step-up authorization.
- **Portable pattern:** Treat the server as a protected resource; verify tokens and request the minimum per-operation scope.
- **Anti-pattern:** Blanket consent, broad initial scopes, or ad hoc identity handling.

<a id="r26-33"></a>
### R26-33 — MCP SDK hardening and session semantics

- **Date:** 2026-07-28
- **Type / tier:** Official SDK releases; A
- **Source:** [Go SDK v1.7.0](https://github.com/modelcontextprotocol/go-sdk/releases/tag/v1.7.0) and [Python SDK v2.0.0](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)
- **Finding:** Releases add or harden stateless requests, protocol negotiation, discovery/cache TTL and scope, typed continuations, schema validation, duplicate request-ID prevention, issuer validation, stdout diversion, body limits, and OpenTelemetry.
- **Portable pattern:** Keep workflow state outside MCP sessions; negotiate versions; cache only with explicit scope/freshness; bound payloads; keep program output out of protocol channels.
- **Anti-pattern:** Using MCP transport as durable memory, unbounded/stale tool caches, or mixing debug output with stdio protocol traffic.

<a id="r26-34"></a>
### R26-34 — OpenTelemetry: agent-native spans

- **Date:** 2026-02-19
- **Type / tier:** Cross-vendor observability standard; A
- **Source:** [OpenTelemetry Semantic Conventions v1.40.0](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.40.0)
- **Finding:** Adds retrieval spans, server-side tool-call capture, agent-version attributes, cache-token accounting, and sampling-related fields.
- **Portable pattern:** Trace retrieval, tool execution, cache behavior, and deployed agent version—not merely model calls.
- **Anti-pattern:** One opaque LLM span per request that cannot explain a wrong retrieval, tool misuse, or configuration regression.

<a id="r26-35"></a>
### R26-35 — OpenHands: trace minimization and optional-failure classification

- **Date:** 2026-08-06
- **Type / tier:** Open-source SDK release; A
- **Source:** [OpenHands Software Agent SDK v1.41.0](https://github.com/OpenHands/software-agent-sdk/releases/tag/v1.41.0)
- **Finding:** Delegated conversations receive detached traces; conversation objects are removed from tool-span inputs; optional browser-tool start failures no longer kill an entire conversation.
- **Portable pattern:** Keep trace payloads minimal, preserve trace hierarchy for delegation, and distinguish optional, retryable, and terminal failures.
- **Anti-pattern:** Recording full conversations in every span or treating every initialization error as terminal.

<a id="r26-36"></a>
### R26-36 — OpenAI/Hugging Face model-evaluation security incident

- **Date:** 2026-07-21
- **Type / tier:** Preliminary incident report; A for disclosed facts, provisional for root cause
- **Source:** [Security incident during model evaluation](https://openai.com/index/hugging-face-model-evaluation-security-incident/)
- **Finding:** OpenAI's July 28–29 updates attribute the escape path to a package-registry proxy vulnerability and document access to public credentials and real external services. Its August 4 report describes related third-party evaluation incidents involving Internet scope and environment configuration.
- **Portable pattern:** Treat evaluation sandboxes as hostile-input environments; bind egress to the operation, credential, account, request shape, redirect policy, and destination rather than a host name alone.
- **Anti-pattern:** Assuming direct-Internet denial or a destination allowlist is sufficient while package proxies, redirects, public credentials, or live accounts remain reachable.
- **Caveat:** The disclosure remains preliminary and OpenAI states that a fuller technical report is forthcoming; do not infer an unconfirmed root cause.

## FDE, delivery, and operating-model evidence

<a id="r26-37"></a>
### R26-37 — OpenAI: FDE ownership from discovery through production

- **Date:** 2026-05-11; role reviewed 2026-08-07
- **Type / tier:** Official company announcement and current role definition; C for operating claims
- **Sources:** [OpenAI Deployment Company](https://openai.com/index/openai-launches-the-deployment-company/) and [Forward Deployed Engineer role](https://openai.com/careers/forward-deployed-engineer-%28fde%29-sf-san-francisco/)
- **Finding:** OpenAI defines FDE work as direct collaboration with leaders, operators, and domain and engineering teams across discovery, scoping, system design, build, rollout, adoption, workflow impact, and eval-driven product feedback.
- **Portable pattern:** Give one accountable delivery team responsibility for the path from a named business problem to measured production use; keep field feedback connected to the platform and model roadmap.
- **Anti-pattern:** A discovery handoff followed by isolated implementation, or a prototype whose owner is undefined after launch.
- **Caveat:** Role descriptions and company announcements state intended practice; they are not audited delivery outcomes.

<a id="r26-38"></a>
### R26-38 — OpenAI Presence: begin with one specific job

- **Date:** 2026-07-22
- **Type / tier:** Official product and deployment description; C
- **Source:** [Introducing OpenAI Presence](https://openai.com/index/introducing-openai-presence/)
- **Finding:** The described deployment method begins with a specific customer or internal job, then limits knowledge, system access, approvals, escalation, and operating support around that job.
- **Portable pattern:** Use a bounded workflow segment as the unit of discovery, architecture, evaluation, release, and ownership.
- **Anti-pattern:** Beginning with a general-purpose autonomous worker or enterprise-wide tool access.

<a id="r26-39"></a>
### R26-39 — OpenAI: use-case discovery and prioritization

- **Date:** Undated; revalidated 2026-08-07
- **Type / tier:** Official business implementation guide; C
- **Source:** [Identifying and scaling AI use cases](https://openai.com/business/guides-and-resources/identifying-and-scaling-ai-use-cases/)
- **Finding:** The guide recommends finding opportunities in repetitive work, skill bottlenecks, and ambiguity; mapping workflows into tasks; using cross-functional business, domain, and technical participation; and prioritizing impact against effort.
- **Portable pattern:** Collect opportunities broadly, apply readiness and risk gates, then rank the surviving candidates by measurable impact, effort, and time to evidence.
- **Anti-pattern:** Selecting the most impressive or technically novel use case without an operator, baseline, or adoption path.
- **Caveat:** Customer metrics in the guide remain vendor-attributed and do not establish general ROI.

<a id="r26-40"></a>
### R26-40 — OpenAI: incremental agent architecture

- **Date:** Undated; revalidated 2026-08-07
- **Type / tier:** Official agent implementation guide; A for design guidance
- **Source:** [A practical guide to building AI agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- **Finding:** Agent-worthy workflows contain ambiguity, brittle rules, or unstructured information. The guide recommends establishing an eval baseline, starting with one agent, and introducing multiple agents only when instruction or tool complexity justifies it.
- **Portable pattern:** Compare deterministic software, a single model call, a coded workflow, and a single agent before adding orchestration complexity.
- **Anti-pattern:** Treating every AI feature as an agent or assuming multi-agent decomposition is an architectural upgrade.

<a id="r26-41"></a>
### R26-41 — Palantir: outcome-led use-case lifecycle

- **Date:** Undated; reviewed 2026-08-07
- **Type / tier:** Official product-development guidance; C
- **Sources:** [Use case lifecycle](https://www.palantir.com/docs/foundry/use-case-life-cycle/overview), [distilling functional requirements](https://www.palantir.com/docs/foundry/use-case-life-cycle/distilling-functional-requirements), [solution design](https://www.palantir.com/docs/foundry/use-case-life-cycle/solution-design), and [use-case roles](https://www.palantir.com/docs/foundry/use-case-life-cycle/use-case-roles)
- **Finding:** Palantir frames a use case as a time-bounded effort that improves a user's operational decision, not a source integration, dashboard, or model technique. Its requirement pattern connects user, interface, decision, decision inputs, action, outcomes, and owners to object models, lifecycle state, enrichments, and interface intent.
- **Portable pattern:** Work backward from the user's decision and action to the domain model, context, logic, effects, interface, and platform components; maintain requirement-to-solution traceability.
- **Anti-pattern:** Technology-first scoping, UI-first requirements, or architecture that cannot trace a component to a user decision and measurable outcome.

<a id="r26-42"></a>
### R26-42 — Palantir: decision-centric operational model

- **Date:** Undated; reviewed 2026-08-07
- **Type / tier:** Official architecture documentation; A for described design
- **Sources:** [Why create an Ontology?](https://www.palantir.com/docs/foundry/ontology/why-ontology), [Ontology overview](https://www.palantir.com/docs/foundry/ontology/overview), and [Ontology system](https://www.palantir.com/docs/foundry/architecture-center/ontology-system)
- **Finding:** Palantir models operational decisions through data, logic, action, and security, including stateful objects, relationships, functions, governed actions, and writeback. The model represents decisions and effects, not only source schemas or document semantics.
- **Portable pattern:** Build an operational domain contract that includes entities, states, rules, actions, authorization, feedback, and reconciliation.
- **Anti-pattern:** A retrieval index or static knowledge graph presented as the complete operational context for an action-taking agent.
- **Caveat:** This is an architecture pattern derived from vendor documentation, not a requirement to use Palantir or its terminology.

<a id="r26-43"></a>
### R26-43 — Palantir: close the decision-to-action loop

- **Date:** Undated; reviewed 2026-08-07
- **Type / tier:** Official application guidance; C
- **Source:** [What is an operational application?](https://www.palantir.com/docs/foundry/app-building/operational-apps)
- **Finding:** Palantir distinguishes read-only reporting from applications that support a specific decision and capture governed action or writeback. It states that operational decision workflows are more likely to affect adoption and outcomes.
- **Portable pattern:** Put the agent inside the professional's decision artifact, expose governed actions, and capture the resulting decision and outcome as feedback.
- **Anti-pattern:** A dashboard or chat surface that produces insight but leaves action, accountability, and outcome capture outside the system.
- **Caveat:** The adoption statement is a first-party operating observation; validate it with the target users.

<a id="r26-44"></a>
### R26-44 — Palantir: branch the end-to-end solution, then release it

- **Date:** Current documentation reviewed 2026-08-07; initial announcement 2025-04-29
- **Type / tier:** Official change-management documentation; A
- **Sources:** [Global Branching](https://www.palantir.com/docs/foundry/global-branching/overview) and [core concepts](https://www.palantir.com/docs/foundry/global-branching/core-concepts)
- **Finding:** Global Branching isolates changes across connected resources for end-to-end testing and review, while environment release remains a separate promotion concern.
- **Portable pattern:** Version data, domain model, agent, tools, policy, evaluations, and user surface as one compatible solution change; treat merge and production promotion as distinct events.
- **Anti-pattern:** Testing only code while data, policy, tool, or interface changes reach production independently.

<a id="r26-45"></a>
### R26-45 — Palantir: customer operating capability is the scale gate

- **Date:** Undated; reviewed 2026-08-07
- **Type / tier:** Official adoption and governance guidance; C
- **Sources:** [Foundry Program overview](https://www.palantir.com/docs/foundry/foundry-adoption/program-overview), [governance processes](https://www.palantir.com/docs/foundry/foundry-adoption/governance-processes), and [Phase 3 roles](https://www.palantir.com/docs/foundry/foundry-adoption/phase-3-roles)
- **Finding:** The guidance assigns program, domain, product, data, governance, support, training, and use-case ownership; it describes recurring planning, access, support, and enablement processes and treats embedded experts as temporary accelerators rather than permanent domain owners.
- **Portable pattern:** Begin transfer on day one and measure readiness through ownership, access governance, support, training, release competence, and incident response—not use-case count.
- **Anti-pattern:** Permanent dependence on the FDE, late handoff, or scaling deployments before the customer can operate and change them.

<a id="r26-46"></a>
### R26-46 — Palantir: evaluate effects and observe the whole workflow

- **Date:** Undated; reviewed 2026-08-07
- **Type / tier:** Official evaluation and observability documentation; A
- **Sources:** [AIP Evals](https://www.palantir.com/docs/foundry/aip-evals/overview), [Observability](https://www.palantir.com/docs/foundry/observability/overview), and [AIP architecture](https://www.palantir.com/docs/foundry/architecture-center/aip-architecture)
- **Finding:** Palantir exposes evaluation of functions and state changes alongside execution history, metrics, traces, logs, actions, data health, and alerting.
- **Portable pattern:** Evaluate intended world-state changes and operate the full dependency graph: data, models, tools, actions, policies, user workflow, outcomes, and cost.
- **Anti-pattern:** Model-call telemetry or text quality scores presented as complete production observability.

<a id="r26-47"></a>
### R26-47 — Anthropic: evaluation-driven agent development

- **Date:** 2026-01-09; revalidated 2026-08-07
- **Type / tier:** Official engineering guidance; A
- **Source:** [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- **Finding:** Agent evaluation covers outcome and trajectory, combines code, model, and human graders, separates capability from regression suites, uses repeated trials, and assigns infrastructure ownership while enabling product and domain teams to contribute cases.
- **Portable pattern:** State the evaluation claim, choose consistency or best-of metrics to match the product contract, preserve independent test environments, and make production failures into owned regressions.
- **Anti-pattern:** Single-trial reliability claims, final-answer-only grading, or eval ownership isolated from users and product requirements.

<a id="r26-48"></a>
### R26-48 — Anthropic: stable interfaces for long-running work

- **Date:** 2026-03-24 and 2026-04-08
- **Type / tier:** Official engineering experiments; A for implementation evidence, experimental for generalization
- **Sources:** [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) and [Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)
- **Finding:** Anthropic separates append-only session history, replaceable harness logic, and sandbox execution; it uses structured artifacts to carry verified state across context transitions and removes harness scaffolding when newer models no longer need it.
- **Portable pattern:** Use typed handoffs and stable runtime interfaces; version model-specific workarounds and require evidence before retaining them.
- **Anti-pattern:** Conversation history as the only durable state, or permanent scaffolding based on one model version's limitations.

<a id="r26-49"></a>
### R26-49 — Anthropic: capability-aware containment

- **Date:** 2026-05-25
- **Type / tier:** Official security engineering; A
- **Source:** [How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude)
- **Finding:** Anthropic documents data-exfiltration paths that can use approved destinations with attacker-controlled credentials, illustrating that a domain allowlist grants capability rather than proving safety.
- **Portable pattern:** Bind network access to operation, resolved destination, path, redirect behavior, credential provenance, account, tenant, request shape, and response limits.
- **Anti-pattern:** Destination-only egress policy or treating read-only access as low disclosure risk by default.

<a id="r26-50"></a>
### R26-50 — Anthropic: approval quality must be measured

- **Date:** 2026-03-25
- **Type / tier:** Official product-security engineering; A
- **Source:** [How we built Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode)
- **Finding:** Repeated approvals can become habitual, while automated action classifiers still have false positives and false negatives. The described monitor evaluates explicit intent and observable actions without treating the agent's rationale as authority.
- **Portable pattern:** Tier approvals by disclosure and effect risk; measure acceptance, denial, override, latency, fatigue, and sampled unsafe approvals; keep independent monitoring separate from authorization.
- **Anti-pattern:** A universal approval wall, or a model-based approval classifier as the sole gate for a high-stakes action.
- **Caveat:** Published rates are implementation-specific and do not define portable thresholds.

<a id="r26-51"></a>
### R26-51 — Anthropic: behavioral changes need per-model rollout controls

- **Date:** 2026-04-23
- **Type / tier:** Official engineering postmortem; A
- **Source:** [An update on recent Claude Code quality reports](https://www.anthropic.com/engineering/april-23-postmortem)
- **Finding:** Anthropic traced regressions to model-specific defaults, context handling, and a prompt change, then added per-model evaluations, prompt audits, soak periods, and gradual rollout.
- **Portable pattern:** Treat model, prompt, tool description, routing, context, and guardrail changes as behavioral releases with versioned diffs, per-route tests, canary, rollback, and dependency-lifecycle review.
- **Anti-pattern:** Global behavioral configuration rollout because aggregate evaluation passed.

<a id="r26-52"></a>
### R26-52 — OpenAI: evaluation claim and environment manifest

- **Date:** 2026-05-29
- **Type / tier:** Official evaluation guidance; A
- **Source:** [Trustworthy third-party evaluations: foundations](https://openai.com/index/trustworthy-third-party-evaluations-foundations/)
- **Finding:** OpenAI recommends reporting the claim, model and harness, tools, elicitation, environment, resource enforcement, time, tokens, cost, and uncertainty because the surrounding system materially affects the result.
- **Portable pattern:** A score is incomplete without the tested claim, version manifest, budgets, trials, uncertainty, and limitations.
- **Anti-pattern:** Benchmark or release claim without enough configuration to reproduce or interpret it.

<a id="r26-53"></a>
### R26-53 — OpenAI: audit the benchmark and evaluator

- **Date:** 2026-07-08
- **Type / tier:** Official benchmark audit; B
- **Source:** [Separating signal from noise in coding evaluations](https://openai.com/index/separating-signal-from-noise-coding-evaluations/)
- **Finding:** OpenAI found a material share of inspected SWE-Bench Pro tasks broken, reinforcing that test validity, contamination, answer-key access, and evaluator integrity are part of the measured system.
- **Portable pattern:** Audit tasks, reference solutions, hidden data, environment isolation, and negative controls before using a suite as a release gate.
- **Anti-pattern:** Treating a benchmark label or leaderboard score as ground truth.
- **Caveat:** The published percentage is benchmark-specific and must not become a general defect-rate assumption.

<a id="r26-54"></a>
### R26-54 — AI Engineer: production-agent practitioner corpus

- **Date:** 2026-04-09 to 2026-08-06
- **Type / tier:** Original conference talks and builder interviews; C unless paired with a primary artifact
- **Source:** [Curated AI Engineer video index](2026-08-07--ai-engineer-production-agent-video-index.md)
- **Finding:** Independent talks repeatedly converge on workflow observation, professional artifacts, scoped tools, durable state, full-trajectory evaluation, source-of-truth verification, production feedback loops, and explicit human interruption. Talks also surface contested or experimental practices such as same-agent review and dynamic worker code.
- **Portable pattern:** Use talks as implementation leads, then corroborate mechanisms with code, official engineering reports, and local evaluation before making them controls.
- **Anti-pattern:** Converting a speaker's architecture, scale metric, or demo result into a universal production requirement.

<a id="r26-55"></a>
### R26-55 — OpenAI: vendor lifecycle is an architecture input

- **Date:** 2026-06-03
- **Type / tier:** Official product update; A
- **Source:** [Introducing AgentKit](https://openai.com/index/introducing-agentkit/)
- **Finding:** OpenAI announced end-of-life dates for Agent Builder and the Evals product while recommending code-based alternatives.
- **Portable pattern:** Record vendor capability lifecycle, replacement path, and exit test in each behavioral release.
- **Anti-pattern:** A vendor UI, model route, or harness behavior as the permanent architectural source of truth.

<a id="r26-56"></a>
### R26-56 — Anthropic: simplest sufficient design and high-signal context

- **Date:** Foundational guidance revalidated 2026-08-07
- **Type / tier:** Official engineering guidance; A
- **Sources:** [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), and [writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- **Finding:** Anthropic recommends the simplest sufficient workflow, high-signal just-in-time context, task-shaped tools, semantic identifiers, concise outputs, and measured escalation to agents or multi-agent systems.
- **Portable pattern:** Keep the agent loop, context, and tool surface small enough to inspect; add complexity only after a measured failure demonstrates the need.
- **Anti-pattern:** Architecture complexity, context volume, or tool count used as a proxy for capability.

<a id="r26-57"></a>
### R26-57 — Palantir AI FDE: permission-bound interactive delegation

- **Date:** Undated; reviewed 2026-08-07
- **Type / tier:** Official product security documentation; A for described controls
- **Sources:** [AI FDE overview](https://www.palantir.com/docs/foundry/ai-fde/overview) and [security and governance](https://www.palantir.com/docs/foundry/ai-fde/security-and-governance)
- **Finding:** AI FDE uses the authenticated user's session, remains subject to server-side permissions, provides selectable tools and context, attributes activity to the user, and uses branch/review patterns for mutations.
- **Portable pattern:** Distinguish interactive delegated agents from unattended agents: retain both user and agent attribution, intersect current authority, and require policy or approval for consequential mutations.
- **Anti-pattern:** A shared service account for interactive users, or an unattended workflow impersonating a human user.
- **Caveat:** This describes one vendor's interactive development agent and does not prove that user-bound identity is appropriate for every runtime.

<a id="r26-58"></a>
### R26-58 — SLSA: verify provenance against an artifact and expectations

- **Date:** Version 1.2 released 2025-11-24; reviewed 2026-08-07
- **Type / tier:** Linux Foundation supply-chain specification; A
- **Sources:** [SLSA v1.2 release announcement](https://slsa.dev/blog/2025/11/announce-slsa-v1.2), [provenance](https://slsa.dev/spec/v1.2/provenance), and [artifact verification](https://slsa.dev/spec/v1.2/verifying-artifacts)
- **Finding:** Provenance is useful only when a verifier checks the signed envelope, matches the statement subject to the artifact digest, trusts the builder identity, and compares the build against expected source and parameters.
- **Portable pattern:** Verify capability bytes and provenance against an independently configured root of trust and admission expectations before registry entry or execution.
- **Anti-pattern:** Storing an attestation or checksum without verifying its signature, subject binding, builder identity, and expected source.
- **Caveat:** SLSA specifies software supply-chain controls; applying them to agent tools, skills, MCP servers, or prompts is a repository-derived adaptation.

<a id="r26-59"></a>
### R26-59 — in-toto: attestations bind authenticated claims to immutable subjects

- **Date:** Attestation Framework v1.2 released 2026-03-18
- **Type / tier:** Open supply-chain attestation specification; A
- **Sources:** [v1.2.0 release](https://github.com/in-toto/attestation/releases/tag/v1.2.0), [in-toto Attestation Framework](https://github.com/in-toto/attestation/blob/main/spec/README.md), [Statement layer](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md), and [Envelope layer](https://github.com/in-toto/attestation/blob/main/spec/v1/envelope.md)
- **Finding:** An in-toto Statement binds typed metadata to immutable subjects by digest; an authenticated envelope carries the signed statement, with DSSE recommended by the specification.
- **Portable pattern:** Put the artifact digest and typed provenance claim inside the signed subject; verify the envelope and policy outside the capability being admitted.
- **Anti-pattern:** A free-form signature string or signed description that is not cryptographically bound to the exact artifact and predicate.
- **Caveat:** The specification supplies an attestation structure, not a complete capability-admission policy or trust-root selection method.

<a id="r26-60"></a>
### R26-60 — IETF draft: separate stable operation identity from request fingerprint

- **Date:** Draft published 2025-10-15; expired 2026-04-18
- **Type / tier:** IETF Internet-Draft; C, work in progress
- **Source:** [The Idempotency-Key HTTP Header Field, draft-07](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header-07)
- **Finding:** The draft represents a client's only-once intent with a unique key, assigns key-lifecycle and enforcement responsibility to the resource, and treats a payload-derived fingerprint as an optional, separate request check.
- **Portable pattern:** Derive a stable operation identity from the business intent, enforce it at the service, and bind mutable request content or source revisions through a separate fingerprint and precondition.
- **Anti-pattern:** Recomputing an idempotency key from mutable source state or model output, which can assign a new identity to a retry of the same business operation.
- **Caveat:** This document is an expired Internet-Draft, not an RFC; it is a non-normative design reference and may be replaced or changed.

<a id="r26-61"></a>
### R26-61 — W3C SHACL: ontology semantics and closed-world validation are different layers

- **Date:** W3C Recommendation 2017-07-20; revalidated 2026-08-07
- **Type / tier:** W3C Recommendation; A
- **Source:** [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/)
- **Finding:** SHACL defines constraints and conformance checking for RDF data graphs, including validation reports, while ontology languages supply vocabulary and inference semantics.
- **Portable pattern:** Use an ontology to define shared meaning; use SHACL, JSON Schema, policy rules, or another explicit closed-world validator to reject invalid operational state.
- **Anti-pattern:** Claiming that RDFS or OWL vocabulary alone rejects undeclared or operationally invalid states.

<a id="r26-62"></a>
### R26-62 — Kevin Hoffman: Beyond the Twelve-Factor App

- **Date:** 2016; revalidated 2026-08-08
- **Type / tier:** Foundational cloud-native engineering guidance; A for the stated workload practices
- **Source:** [Beyond the Twelve-Factor Application](https://connect.pivotal.io/rs/625-IUJ-009/images/ebook-beyond-the-12-factor-app.pdf)
- **Finding:** Hoffman presents a fifteen-factor extension of the original twelve-factor application guidance, adding API-first design, telemetry, and authentication/authorization while retaining explicit build/release/run, configuration, dependency, backing-service, stateless-process, concurrency, disposability, parity, logging, and administrative-process disciplines.
- **Portable pattern:** Treat an AI-enabled workload as ordinary production software first: versioned contracts and dependencies, externalized configuration and credentials, durable state, safe restart, telemetry, and authorization belong around any model or agent.
- **Anti-pattern:** Treating a model runtime or prompt as the system while APIs, state, identity, release, and operations remain implicit.
- **Caveat:** The methodology is a cloud-native application baseline, not an AI-agent or FDE framework; the repository maps it to its own controls rather than adopting it as a standard.

<a id="r26-63"></a>
### R26-63 — Werner Vogels: Frugal Architecture laws

- **Date:** 2024-11-25; revalidated 2026-08-08
- **Type / tier:** Primary architecture guidance; C for the named operating philosophy
- **Sources:** [Return of The Frugal Architect(s)](https://www.allthingsdistributed.com/2024/11/return-of-the-frugal-architect.html) and [The Frugal Architect laws](https://www.thefrugalarchitect.com/laws/)
- **Finding:** Vogels frames frugality as cost-aware, sustainable architecture: make cost a non-functional requirement, align systems to business value, make explicit trade-offs, observe costs, implement cost controls, optimize incrementally, and challenge legacy assumptions.
- **Portable pattern:** Tie design and operations to an outcome-level cost allocation; choose the smallest adequate mechanism, set resource ceilings, observe trade-offs, and revisit decisions as workload behavior changes.
- **Anti-pattern:** Equating frugality with indiscriminate cost cutting, or optimizing token spend while ignoring quality, recovery, human review, and business value.
- **Caveat:** The seven laws are an architectural philosophy, not a prescriptive AI cost model or universal target.

<a id="r26-64"></a>
### R26-64 — AWS: cost and sustainability as non-functional requirements

- **Date:** 2024-08-14; revalidated 2026-08-08
- **Type / tier:** Official architecture guidance; A for the described Well-Architected interpretation
- **Source:** [Achieving Frugal Architecture using AWS Well-Architected Framework guidance](https://aws.amazon.com/th/blogs/architecture/achieving-frugal-architecture-using-the-aws-well-architected-framework-guidance/)
- **Finding:** AWS describes Frugal Architecture as continuous cost and sustainability work across design, development, and operation. It emphasizes transparent workload cost attribution, observing outputs against cost, rightsizing, managed-service trade-offs, and balancing cost with security, reliability, performance, and sustainability.
- **Portable pattern:** Measure full workload cost against an owned business outcome, set explicit budgets, and make cost/reliability/security trade-offs visible in architecture and service reviews.
- **Anti-pattern:** Treating cost as a post-launch dashboard, or reducing spend without considering reliability, security, performance, or outcome impact.
- **Caveat:** AWS implementation choices are cloud-provider-specific; the outcome-level and trade-off principles are the portable part.

<a id="r26-65"></a>
### R26-65 — C4 model: hierarchical software architecture views

- **Date:** Undated; reviewed 2026-08-08
- **Type / tier:** Official architecture guidance; A for the described model
- **Source:** [The C4 model](https://c4model.com/)
- **Finding:** C4 organizes software architecture into system context, containers, components, and code, with supplemental dynamic and deployment views.
- **Portable pattern:** Use scoped, audience-appropriate software views to make owners, interfaces, deployments, and dependencies inspectable; link them to operational and release evidence instead of treating diagrams as authority.
- **Anti-pattern:** One undifferentiated diagram that mixes business process, source-of-truth facts, policy, code, and infrastructure without provenance or intended use.
- **Caveat:** C4 is a notation and communication approach, not a runtime graph model, change-control system, or AI architecture framework.

<a id="r26-66"></a>
### R26-66 — Backstage: source-controlled software catalog and ownership

- **Date:** Current documentation reviewed 2026-08-08
- **Type / tier:** Official project documentation; A for described catalog behavior
- **Source:** [Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/)
- **Finding:** Backstage documents a centralized catalog that ingests metadata from source control and relates software entities, ownership, systems, and APIs.
- **Portable pattern:** Keep software metadata and ownership reviewable at the source, with stable identifiers and explicit relationships; connect it to operational maps only through versioned evidence.
- **Anti-pattern:** A manually maintained inventory that cannot identify an owner, source revision, or relationship evidence during an incident or release.
- **Caveat:** Backstage is one implementation; the repository does not require it or its entity model.

<a id="r26-67"></a>
### R26-67 — OpenLineage: job, dataset, and run lineage vocabulary

- **Date:** Current documentation reviewed 2026-08-08
- **Type / tier:** Open standard documentation; A for the described model
- **Source:** [OpenLineage documentation](https://openlineage.io/docs/)
- **Finding:** OpenLineage defines an extensible event model centered on jobs, datasets, and runs for capturing lineage across data systems.
- **Portable pattern:** Represent operational/data lineage as time-bound events with stable identifiers and provenance; do not conflate derived lineage with authorization or source-of-truth policy.
- **Anti-pattern:** Inferring business truth, data permissions, or complete impact from an undocumented dependency edge.
- **Caveat:** OpenLineage focuses on data lineage and does not itself govern agent context, effects, evaluations, or customer workflow ownership.

<a id="r26-68"></a>
### R26-68 — Graphify: deterministic and semantic project-map extraction

- **Date:** Current README reviewed 2026-08-08
- **Type / tier:** Project-maintained implementation documentation; C
- **Source:** [Graphify](https://github.com/Graphify-Labs/graphify)
- **Finding:** Graphify describes local Tree-sitter-based code extraction, optional semantic processing for unstructured material, explicit extracted versus inferred relationships, scoped graph queries, and incremental updates.
- **Portable pattern:** Separate deterministic from semantic extraction, retain relationship basis and provenance, and use scoped map queries for exploration and change review.
- **Anti-pattern:** Treating semantic edges or a generated graph as complete, authoritative, safe to expose, or safe to execute against without local verification.
- **Caveat:** This is project documentation, not an independent accuracy, security, or cost evaluation; its implementation choices require local review.

<a id="r26-69"></a>
### R26-69 — Understand Anything: generated architecture views and impact exploration

- **Date:** Current README reviewed 2026-08-08
- **Type / tier:** Project-maintained implementation documentation; C
- **Source:** [Understand Anything](https://github.com/Egonex-AI/Understand-Anything)
- **Finding:** Understand Anything describes generated repository maps, architecture and domain views, guided exploration, diff-based impact analysis, incremental updates, and token-aware processing.
- **Portable pattern:** Use generated views to accelerate orientation and candidate-impact discovery, then bind consequential conclusions to authoritative artifacts, owners, tests, and release evidence.
- **Anti-pattern:** Allowing a generated map or multi-agent analysis to replace source inspection, independent evaluation, or change approval.
- **Caveat:** Claims and implementation details are project-maintained; the repository treats them as design leads, not validated operating benchmarks.

<a id="r26-70"></a>
### R26-70 — PagerDuty: field delivery inside the product engineering path

- **Date:** 2026-03-24; reviewed 2026-08-10
- **Type / tier:** First-party operating report from an identifiable engineering leader; C
- **Source:** [From Embedded to Everywhere: How Forward Deployed Engineering Was Born at PagerDuty](https://www.pagerduty.com/eng/from-embedded-to-everywhere-how-forward-deployed-engineering-was-born-at-pagerduty/)
- **Finding:** PagerDuty describes moving its FDE function into Product Development after customer-specific work in separate infrastructure accumulated outside normal architecture, security, service-level, and on-call standards. It uses explicit contribution zones to distinguish independent, collaborative, and core-product-owned work, and routes recurring field signals through a product feedback loop.
- **Portable pattern:** Classify a field change before implementation; name its destination, repository or runtime, owner, contribution rights, release path, support obligation, and exit. Shared product changes use the product team's normal engineering, evaluation, release, and operating standards.
- **Anti-pattern:** A field-owned parallel stack that repeatedly solves product gaps without a durable product, customer, service, or retirement owner.
- **Caveat:** This is one vendor's retrospective and operating model. Its organizational shape and reported speed are not universal targets.

<a id="r26-71"></a>
### R26-71 — Legion Intelligence: FDE dependency as a product-maturity risk

- **Date:** 2026-07-03; modified 2026-07-16; reviewed 2026-08-10
- **Type / tier:** First-party vendor position paper from an identifiable practitioner; C
- **Source:** [The Forward Deployed Engineering Model Is Backward](https://www.legionintel.com/command-papers/forward-deployed-engineering)
- **Finding:** Legion argues that repeated one-off work and permanent reliance on field staff can indicate a product feedback loop that is not closing. It distinguishes customer-funded implementation from vendor-owned product development and asks whether the receiving organization can safely adapt the system as field support decreases.
- **Portable pattern:** Measure capability transfer and target-specific dependency directly; route recurring gaps to an owned product or platform decision; record contractual, intellectual-property, confidentiality, and reuse rights before promoting field work into shared capability.
- **Anti-pattern:** Treating a larger field organization, continuing staff dependence, or repeated bespoke delivery as proof of product leverage.
- **Caveat:** The article advances Legion's product strategy and intentionally argues against large FDE organizations. Team size is not a quality metric; local outcomes, economics, risk, and operating capability remain controlling.

<a id="r26-72"></a>
### R26-72 — Nasser Ghanemzadeh: narrow workflow ownership through handoff

- **Date:** 2026-06; reviewed 2026-08-10
- **Type / tier:** Practitioner-authored working guide; C
- **Sources:** [What Is a Forward Deployed AI Engineer?](https://ghanemzadeh.com/forward-deployed-ai-engineer/) and [Forward Deployed AI Engineering](https://ghanemzadeh.com/books/forward-deployed-ai-engineering/)
- **Finding:** Ghanemzadeh describes an end-to-end engagement that narrows a use case, places the workflow in the user's product, defines review and evaluation, implements production behavior, and hands over code plus an operating rubric that the receiving team can maintain.
- **Portable pattern:** Keep one delivery owner across scoping, work-surface design, implementation, evaluation, and handoff while making receiving-team operation and maintenance an explicit completion condition.
- **Anti-pattern:** A strategy deck, demo, or isolated workflow that never enters the target product and cannot survive the delivery engineer's exit.
- **Caveat:** This is practitioner synthesis and commercial positioning, not an independent outcome study. Pricing, role definitions, and market forecasts are not repository requirements.

<a id="r26-73"></a>
### R26-73 — Pace: long-running multimodal operations and accountable evaluation cases

- **Date:** 2026-06-22 and 2026-06-25; reviewed 2026-08-11
- **Type / tier:** First-party vendor engineering and product reports; C
- **Sources:** [Building a long-running, multimodal agent for insurance](https://withpace.com/news/multimodal-agents) and [One agent for the complexity of insurance operations](https://withpace.com/news/product-launch)
- **Finding:** Pace describes long-running work split across voice, document, general, and computer-use paths with persistent shared state, focused context, different latency and model constraints, and target-system writeback. It also describes real cases paired with known answers, customer corrections, graders, citations, screenshots, and recordings as part of evaluation and audit workflows.
- **Portable pattern:** Keep workflow state independent from transient context; apply the smallest suitable mechanism per modality; treat browser interaction as a controlled capability; bind expected results to a named source revision, accountable owner, approval, adjudication, classification, and review date.
- **Anti-pattern:** One undifferentiated agent context, visual success as completion proof, or an anonymous “golden set” whose expected answers have no governed authority or maintenance path.
- **Caveat:** Architecture and performance statements are first-party vendor reports from insurance deployments. Published accuracy, volume, and SLA figures are not portable thresholds, and screenshots or recordings do not replace authorization or source-of-truth readback.

<a id="r26-74"></a>
### R26-74 — Anthropic: browser content remains an adversarial action surface

- **Date:** 2025-11-24; revalidated 2026-08-11
- **Type / tier:** Official security research; A for the stated browser threat model
- **Source:** [Mitigating the risk of prompt injections in browser use](https://www.anthropic.com/research/prompt-injection-defenses)
- **Finding:** Anthropic identifies every webpage and embedded or dynamically loaded object as potential untrusted input, while browser agents can navigate, fill forms, click, and download. It explicitly states that prompt injection remains unsolved and that model-layer robustness is not complete protection.
- **Portable pattern:** Treat page content as tainted data; constrain browser capability by session, identity, tenant, resource, destination, operation, and effect; combine model defenses with containment, typed action boundaries, and independent readback.
- **Anti-pattern:** Assuming a browser agent is safe because its model resists known prompt injections, a human approved a broad session, or the page displayed a success message.
- **Caveat:** Product-specific classifier and attack-rate results are not portable assurance levels. The durable evidence is the threat model and need for layered controls.

## Social, Reddit, YouTube, and news screening notes

### Social and Reddit material admitted as leads or first-party field reports

| Channel | Item | Treatment |
| --- | --- | --- |
| X | [Cloudflare Code Mode thread](https://x.com/shao__meng/status/2025033171864354981) | Lead to primary implementation evidence R26-02; do not cite the repost over the technical article. |
| X | Kaxil Naik's operating report | Admitted as R26-05 because the identifiable practitioner describes a concrete review workflow. |
| X | Workato Enterprise MCP post | Admitted as R26-27 as a concise company control-plane field signal; paired with primary protocol/security sources. |
| Reddit | [Permit.io Agentjacking discussion](https://www.reddit.com/r/AgentAuthorization/comments/1ucbmt4/agentjacking_is_the_loud_failure_overprivileged/) | Lead to the primary CSA research note R26-18. The Reddit post is not independent evidence. |
| Reddit | Anonymous “production agent” threads | Excluded from core guidance unless they link to reproducible evidence or an identifiable incident report. |

### YouTube and news quality filter

- **YouTube:** Search covered original conference and company channels. The [curated AI Engineer video index](2026-08-07--ai-engineer-production-agent-video-index.md) records verified watch-page metadata, creator chapters, claim status, and primary corroboration where available. Talks remain Tier C unless a linked implementation artifact independently raises the evidence quality.
- **News:** [Axios reporting on the OpenAI/Hugging Face incident](https://www.axios.com/2026/08/06/openai-hugging-face-black-hat) was reviewed as a timely signal. Core guidance cites the affected organization's preliminary report (R26-36) instead; the Axios article should not be treated as a technical postmortem.

## Cross-source patterns established by this ledger

1. **Tool inventory is an architecture and security problem.** Progressive discovery, tight schemas, and compact primitives reduce context load, narrow exposed authority, and lower tool-selection ambiguity compared with loading a flat catalog into every run.
2. **Instructions are not authorization.** Agent identity, caller authority, egress, secrets, staging, and policy decisions must be enforced outside the model.
3. **State needs a trust lifecycle.** Context, cache entries, memory, and artifacts need provenance, integrity labels, approval gates, freshness, and invalidation.
4. **The evaluator is part of the attack surface.** Full outcomes and traces matter, but the test world and validator must be isolated from agent control.
5. **Concurrency needs semantics.** Idempotency, cancellation, merge rules, capacity, and compatibility are not optional implementation details.
6. **Observe populations, not only samples.** Behavior clusters and capability curves expose failures that global averages and hand-picked demos hide.
7. **The economic unit is accepted work.** Count tools, retries, waiting, human review, and recovery—not just model tokens.
8. **Field work needs an owned destination.** Classify a change before building it, use the destination team's normal engineering and operating path, and retire temporary parallel infrastructure.
9. **Transfer is measured capability.** Track whether the receiving team can operate, change, recover, and retire the system while target-specific delivery dependence falls without weakening outcomes or safety.
10. **Browser control is a distinct action boundary.** Treat pages and visual state as untrusted, constrain sessions and operations, and verify consequential results through an independent target path.
11. **Reference answers need accountable provenance.** Bind expected results and expert labels to a source revision, owner, independent approval, adjudication, classification, and review date.
