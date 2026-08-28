# Source Index

## How to read this index

The library draws from three evidence types:

- **Full text supplied:** the attached article or post was available in full.
- **Summary supplied:** the source was represented by the user's summary; no original URL was provided unless noted.
- **Direct external reference:** the linked primary source was reviewed directly.

These are mostly practitioner presentations and first-party company narratives, not controlled studies. Product metrics and scale figures are kept as attributed claims. Absence of a caveat in the original source is not proof of generalizability.

The repeated Matt Pocock summary was collapsed into one entry.

## Current implementation evidence

The original sources below establish the library's foundational concepts. For current practices, failure modes, protocol changes, security research, source-quality screening, and revalidated cloud-native/value-architecture foundations, use the separate [production-agent source ledger](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md). The ledger includes the *Beyond the Twelve-Factor App* baseline and Frugal Architecture evidence at [R26-62 through R26-64](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-62), plus C4, Backstage, OpenLineage, and graph-tool implementation evidence at [R26-65 through R26-69](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-65), alongside primary GitHub, company engineering, security, X/Reddit lead, YouTube, and news screening notes.

<a id="s01"></a>
## S01 — Ramp Sheets: domain-native agentic spreadsheets

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Alexander Shevchenko, head of applied research at Ramp
- **Published:** May 7, 2026
- **Link:** [How Ramp built an AI agent that can think outside of tokens](https://youtu.be/trEM9OKr5Sc)
- **Contribution:** Ramp Sheets evolved from internal process mining based on recordings of finance work. The product moved away from opaque code generation toward Excel-native range operations and formulas, using a Modal sandbox and Python only as an escape hatch. The notes also describe an internal `Inspect` coding agent that monitors the system and proposes pull requests, plus experimental latent briefing and steering-vector research.
- **Use in this library:** Workflow discovery, native artifacts, sandbox design, safe self-improvement, emerging research.

<a id="s02"></a>
## S02 — Hex: data agents and longitudinal evaluation

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Izzy Miller, AI engineer at Hex
- **Published:** April 9, 2026
- **Links:** [Talk](https://youtu.be/Xyh1EqcjGME), [Hex evaluation writeup](https://hex.tech/blog/evaluate-data-agents/)
- **Contribution:** Data analysis is iterative and project-scoped, which pushed Hex from single-shot text-to-SQL toward agents that carry context across notebooks and threads. Hex is unifying agents around a shared harness, tools, and context harvesting. “Metric City” is described as a 90-day simulation for evaluating behavior over time. Data-agent correctness remains more subjective than executable code correctness.
- **Use in this library:** Common harnesses, data-specific verification, longitudinal evaluation, domain compounding.

<a id="s03"></a>
## S03 — Listen: multi-agent qualitative research

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Florian Juengermann, CTO and co-founder of Listen
- **Published:** April 23, 2026
- **Link:** [How Listen builds AI Agents that review their own work](https://youtu.be/YTTH-0XXEBE)
- **Contribution:** A Composer, Interviewer, and Research Agent cover study design, multimodal interviews, and corpus analysis. The Research Agent turns interviews into a virtual table for map-reduce analysis. A feedback subagent reviews reports, while an E2B sandbox runs Python and produces presentation artifacts. The Composer supports iterative collaborative editing.
- **Use in this library:** Virtual tables, reviewer agents, sandboxed analysis, persistent artifacts.

<a id="s04"></a>
## S04 — Elastic: agentic search as context engineering

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Leonie Monigatti, Elastic
- **Published:** May 8, 2026
- **Link:** [Agentic Search for Context Engineering](https://youtu.be/ynJyIKwjonM)
- **Contribution:** Retrieval requires intentional tool design beyond generic RAG. Specialized semantic search, database query tools, and shell access have different strengths. Common failures are skipped tools, wrong tools, and bad parameters. Detailed descriptions, system guidance, and on-demand Skills improve selection. A robust stack combines a low floor of reliable tools with a high ceiling of sandboxed general capability.
- **Use in this library:** Retrieval portfolios, tool descriptions, staged instructions, low-floor/high-ceiling design.

<a id="s05"></a>
## S05 — Legora: the Verifier's Rule and interfaces beyond chat

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Jacob Lauritzen, CTO of Legora
- **Published:** April 22, 2026
- **Link:** [Agents need more than a chat](https://youtu.be/XNtkiQJ49Ps)
- **Contribution:** As execution becomes cheap, planning and review become bottlenecks. Tasks that are easy to verify are better candidates for automation. Decompose work, add guardrails, and encode human judgment in Skills and review stages. High-bandwidth persistent artifacts are better than chat for collaborative professional work.
- **Use in this library:** Verifiability, progressive autonomy, review UX, persistent artifacts.

<a id="s06"></a>
## S06 — Uber: production MCP gateway and registry

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speakers:** Meghana Somasundara and Rush Tehrani, Uber
- **Published:** May 7, 2026
- **Links:** [Talk](https://youtu.be/yVqMxBahjfA), [Uber identity and gateway writeup](https://www.uber.com/au/en/blog/solving-the-agent-identity-crisis/)
- **Contribution:** Uber reports scaling MCP to 5,000+ engineers, 60,000+ weekly agent executions, and an estate of 10,000+ microservices. Its control plane generates MCP definitions from IDLs, centralizes authorization and PII redaction, exposes tools through builder, SDK, and coding-agent surfaces, and uses derived tools to narrow selection and override parameters. Planned capabilities include evaluations, SLA tiers, cross-registry search, and A/B-tested Skills.
- **Use in this library:** Tool governance, discovery, generated schemas, derived tools, platform scale.
- **Caution:** Scale and performance are company-reported.

<a id="s07"></a>
## S07 — Event-sourced agent harness workshop

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Jonas Templestein, as named in the supplied notes
- **Published:** May 14, 2026
- **Link:** [Event-sourced agent harness workshop](https://youtu.be/vi-2nasppAg)
- **Contribution:** Every interaction becomes a serialized event. A synchronous reducer derives state; an after-append hook performs side effects. Replay recovers state without repeating costly calls. Multiple processors can subscribe to a stream, and circuit breakers stop runaway event generation. The workshop also demonstrates dynamically loading JavaScript processors from event payloads.
- **Use in this library:** Event sourcing, reducers, replay, extensibility, circuit breakers.
- **Caution:** Dynamically executing processor code creates a major supply-chain and sandboxing risk.

<a id="s08"></a>
## S08 — Datadog: production agents at organizational scale

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Diamond Bishop, Datadog
- **Published:** May 11, 2026
- **Link:** [Datadog Built 100 AI Agents—Here's What Broke](https://youtu.be/C3y3M_03Vco)
- **Contribution:** Datadog describes SRE, development, and security agents and advocates machine-readable documentation, proactive event-driven operation, durable execution such as Temporal, continuous evaluation, simple rewriteable harnesses, model/framework independence, and multiplayer human-agent surfaces.
- **Use in this library:** Proactive agents, durable execution, continuous evaluation, simple harnesses.
- **Caution:** “100+ production agents” and other scale claims are company-reported.

<a id="s09"></a>
## S09 — HumanLayer: 12-Factor Agents

- **Evidence:** Direct external reference
- **Author/maintainer:** HumanLayer; written in the voice of Dex Horthy
- **Links:** [Repository](https://github.com/humanlayer/12-factor-agents), [README](https://github.com/humanlayer/12-factor-agents/blob/main/README.md)
- **Contribution:** Twelve principles for reliable LLM applications: typed tool calls, owned prompts and context, deterministic execution, unified state, pause/resume APIs, human contact as tools, owned control flow, compact errors, small agents, trigger flexibility, and stateless reducers.
- **Use in this library:** Application control philosophy, event-state model, modularity, provider independence.
- **Caution:** This is an open design essay, not a formal standard or benchmark.

<a id="s10"></a>
## S10 — Five pillars for production AI

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Sandipan Bhaumik
- **Published:** June 18, 2026
- **Link:** [Production AI Playbook](https://youtu.be/ObTPqBGsEbA)
- **Contribution:** Define business success and evaluation infrastructure before choosing a model. The five pillars are evaluation, observability, data foundation, multi-agent orchestration, and governance. Evaluation spans deterministic, semantic, and behavioral checks. Prompts and model versions require change control. A retail-banking case attributes a satisfaction regression to stale retrieval data.
- **Use in this library:** Build order, evaluation layers, traceability, data freshness, governance.

<a id="s11"></a>
## S11 — Build Hour: valuemaxxing and inference efficiency

- **Evidence:** Summary supplied
- **Contribution:** Optimize for quality, saved time, and tangible outcomes rather than token consumption. The notes describe model tiers, prompt caching, programmatic JavaScript tool calling, and context compaction. A Ploy customer segment reports 2.2x faster builds at 27% lower cost after migration and batching/caching changes.
- **Use in this library:** Value metrics, caching, batching, compaction, model routing.
- **Caution:** Model names, pricing implications, and customer results are time-sensitive and were not independently checked in this library.

<a id="s12"></a>
## S12 — Matt Pocock: harness leverage and strategic programming

- **Evidence:** Summary supplied; duplicate copies collapsed
- **Conversation:** David Ondrej and Matt Pocock
- **Contribution:** Models increasingly handle tactical implementation, moving developer leverage toward architecture, scoping, review, and system design. AI work should be delegated as bounded tasks in a triaged queue, with human oversight for security and product decisions. The described “Teach” Skill orients learners around a mission and adapts difficulty using educational principles.
- **Use in this library:** Strategic programming, bounded delegation, human review, adaptive Skills.

<a id="s13"></a>
## S13 — Mike Fishbein: context extraction in forward-deployed engineering

- **Evidence:** Post text supplied in the request
- **Author:** [Mike Fishbein](https://x.com/mfishbein), `@mfishbein`
- **Contribution:** FDE combines consulting, product, and engineering. The primary bottleneck is extracting scattered client context and creating missing context before coding. Proposed automation includes voice discovery interviews, cloud-agent prototypes and demos, feedback collection, and a consultant subagent ranking use cases by impact and effort.
- **Use in this library:** Discovery, workflow mapping, context extraction, productization of deployment methods.
- **Caution:** Market and fundraising claims in the post were not needed for the synthesis and were not independently verified.

<a id="s14"></a>
## S14 — Cerebras: How we built our knowledge base

- **Evidence:** Full text supplied
- **Authors:** `@hi_im_isaac_`, `@learnwdaniel`, `@gaozenghao`
- **Published:** July 15, 2026
- **Link:** [Interactive technical blog](https://www.cerebras.ai/blog/how-we-built-our-knowledge-base)
- **Contribution:** Meet knowledge where it lives and expose a common query contract across source-aware connectors. The system uses raw lexical search, distilled semantic representations, IDF, age decay, Slack-thread bursting, incremental code embeddings, RRF, model reranking, context expansion, project scoping, and narrow MCP retrieval primitives.
- **Reported implementation details:** Postgres and GIN, CocoIndex, config-driven repository onboarding, planner/executor/synthesizer fan-out, top-20 fusion and top-10 reranking.
- **Reported adoption:** 15,000+ questions per day three months after launch.
- **Caution:** The article does not provide an accuracy benchmark, error rate, latency, or business-outcome analysis.

<a id="s15"></a>
## S15 — Annelies Gamble: The Agent Is Not the Product

- **Evidence:** Full text supplied
- **Author:** [Annelies Gamble](https://x.com/AnneliesGamble), `@AnneliesGamble`
- **Contribution:** Enterprise transformation is process engineering. Use deterministic automation for rules, agents for judgment under context, and humans for accountability and trust. Deployment is an apprenticeship that converts tacit work into workflow maps, exception taxonomies, escalation paths, evaluation sets, access policies, and approval thresholds. Pattern libraries can compound across deployments without transferring customer data.
- **Use in this library:** Workflow selection, process discovery, change management, modernization, operational pattern libraries.

<a id="s16"></a>
## S16 — Lunar: harness engineering versus loop engineering versus graph engineering

- **Evidence:** Full text supplied
- **Author:** Lunar, `@LunarResearcher`
- **Title:** “Agent Harness Engineering vs Loop Engineering vs Graph Engineering: A Practical Guide to the 3 Layers People Keep Mixing Together”
- **Contribution:** Harness is environment, loop is feedback, and graph is flow. The article provides layer-specific diagnostics, a loop anatomy, evidence-based stop rules, graph criteria, anti-patterns, and a production checklist.
- **Use in this library:** Core architecture taxonomy and failure diagnosis.
- **Caution:** It is a conceptual framework, not an empirical comparison.

<a id="s17"></a>
## S17 — Replit: The Self-Driving Company

- **Evidence:** Full text supplied
- **Author:** Amjad Masad, `@amasad`
- **Contribution:** Replit describes a company-wide agent fabric built on its harness, microVMs, remote filesystems, integrations, policies, token proxies, audit logs, and ZeroTrust network. Manager agents can spawn parallel agents; a semantic data layer supports BI; teams add Skills and playbooks. People retain direction, taste, tradeoffs, and accountability.
- **Reported outcomes:** 5.8x growth in weekly changed lines, 2.9x for a fixed cohort, flat review latency, 30% human review time saved, flat reversion/incident trends, and 60% faster resolution for difficult support tickets.
- **Caution:** These are first-party figures without detailed methodology or independent validation. Lines changed is not itself a value metric.

<a id="s18"></a>
## S18 — Harvey: Why we Built our own Cloud Agent Infrastructure

- **Evidence:** Full text supplied
- **Author:** [Gabe Pereyra](https://www.harvey.ai/blog/author/gabe-pereyra), Harvey
- **Published:** June 1, 2026
- **Link:** [Harvey article](https://www.harvey.ai/blog/why-we-built-our-own-cloud-agent-infrastructure)
- **Contribution:** Harvey owns its agent runtime to support matter-specific multi-model restrictions, zero data retention, cost routing, sandbox control, model/provider normalization, residency, sovereign deployment, and legal audit requirements. It distinguishes true ZDR from delete-after-run retention and uses lifecycle-bound transient sandbox disks.
- **Reported result:** 3–5x cost reduction versus a frontier-only approach, depending on task and workload.
- **Caution:** The article does not provide reproducible cost data or fully explain the tension between crash recovery, auditability, and zero retention.

<a id="s19"></a>
## S19 — Tejas Kumar: building reliable agents with harnesses

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Tejas Kumar, IBM
- **Published:** May 17, 2026
- **Link:** [Harness demonstration](https://youtu.be/C_GG5g38vLU)
- **Contribution:** Using GPT-3.5 Turbo, the presentation argues that a harness can improve even an older, cheaper model through a controlled tool registry, context compaction, maximum-step guardrails, deterministic verification, and programmatic handling of known states. In the browser demonstration, an unharnessed agent encountered a Hacker News login page but hallucinated that an upvote succeeded. A verifier inspected tool history and page state, while a later login handler enabled authenticated completion.
- **Use in this library:** Minimum viable harness, postcondition verification, bounded loops, credential isolation.
- **Emerging claim:** The speaker anticipates dynamically generated, on-the-fly harnesses by 2027. This is a forecast, not an established production pattern.

<a id="s20"></a>
## S20 — Frank Coyle: ontologies as agentic guardrails

- **Evidence:** Summary supplied; original talk metadata and cited chapters reviewed
- **Speaker:** Frank Coyle
- **Published:** July 22, 2026
- **Link:** [Ontology guardrails talk](https://youtu.be/Sir59K8ZDPU)
- **Contribution:** Neurosymbolic systems combine probabilistic LLM interpretation with formal domain entities and relationships. RDFS and OWL express vocabularies and logical axioms for inference; a separate constraint mechanism such as SHACL shapes or deterministic rules is needed to reject proposed states or actions under application policy. A schema tool such as Pydantic separately validates input types. The proposed pattern validates structure at the “door” and domain consistency at the “ledger” before executing an action—for example, preventing duplicate refunds or payouts to the wrong role. [R26-61](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-61)
- **Use in this library:** Ontologies, semantic constraints, layered validation, deterministic business invariants.
- **Caution:** Ontologies require careful domain modeling, ownership, versioning, and integration; they do not independently solve stale evidence, incorrect intent selection, or authorization.

<a id="s21"></a>
## S21 — Internal exam-prep simulator design review

- **Evidence:** [Archived internal implementation review](../research/archive/internal-design-studies/exam-prep-design-review.md); not an external source of truth
- **Material:** Scenario-based agent-architecture exam simulator, reviewed 2026-08-07
- **Contribution:** A scenario-based agent-architecture simulator with structured question metadata, automated corpus audits, diagnostic-to-targeted-review-to-retest flow, and feedback that explains both the best action and why plausible alternatives fail.
- **Use in this library:** Evaluation-corpus contracts, slice coverage, evaluator shortcut checks, reviewer feedback design, and independent retests.
- **Caution:** Educational test mechanics do not validate production behavior on their own; production cases still require controlled fixtures, authorization, postcondition readback, and operational ownership. No question text or answer key was copied into this library.

<a id="s22"></a>
## S22 — Varick: operational redesign before AI mechanism selection

- **Evidence:** Full text supplied; publication date and canonical article URL were not supplied; reviewed 2026-08-08
- **Author/publisher:** Varick, as named in the supplied article
- **Contribution:** The article argues that transformation begins with observing and redesigning end-to-end work, then separating deterministic automation, contextual AI, and accountable human decisions. It distinguishes systems of record, business rules, raw intake, and feedback as separate operational layers; it also argues for an incremental path through sandbox, shadow, and supervised use.
- **Use in this library:** Operational redesign, workflow qualification, context classification, adoption, and operating-model change.
- **Caution:** Efficiency, value, and accuracy claims are vendor-reported. The article is practitioner perspective, not an independent transformation study or a normative source for control thresholds.

<a id="s23"></a>
## S23 — Aaron Levie: the applied-AI workflow layer

- **Evidence:** Post text supplied; timestamp and permalink were not supplied; reviewed 2026-08-08
- **Author:** Aaron Levie, as named in the supplied post
- **Contribution:** The post frames the applied layer as the workflow-specific product around intelligence: context capture, task-shaped tools, human-in-the-loop interfaces, evaluation-informed model routing, and domain-specific delivery/change expertise.
- **Use in this library:** Workflow-native product surfaces, route-level model economics, and the connection between FDE delivery and reusable platform capability.
- **Caution:** This is an executive practitioner viewpoint, not a technical specification, independent market analysis, or evidence that any product layer creates a durable moat.

<a id="s24"></a>
## S24 — Fan Bing / XDash: FDE Guidance Book

- **Evidence:** [Direct external secondary reference](https://github.com/xdash/FDE-the-Guidance-Book-of-Forward-Deployed-Engineer); repository and selected chapters reviewed 2026-08-09
- **Author:** Fan Bing / XDash
- **Contribution:** The book organizes FDE work around problem selection, deployment activation, continuation, expansion, replication, operating metrics, and professional ethics. Useful research leads include a time-bounded pilot graduation event, sponsor-continuity and continuation signals, full delivery economics, customer-specific effort trends, field-to-product reuse, and explicit professional boundaries.
- **Use in this library:** [FDE commercial and professional-practice research note](../research/2026-08-09--fde-commercial-and-professional-practice.md), portfolio review, pilot graduation, sponsor resilience, and field-learning economics.
- **Caution:** This is a narrative synthesis rather than a primary technical or audited operating source. Quantitative benchmarks, vendor outcomes, forecasts, sales tactics, pricing recommendations, and case claims are not adopted as project standards. The source permits non-commercial sharing but requires written permission for commercial adaptation; no source text, tables, or named framework vocabulary is incorporated here.

<a id="s25"></a>
## S25 — Adithya Sanjay / Pace: inside an applied-AI company

- **Evidence:** Full post text supplied without a stable permalink or publication date; dated Pace architecture sources reviewed directly on 2026-08-11
- **Author/publisher:** Adithya Sanjay, describing Pace
- **Primary corroboration:** [Long-running multimodal architecture](https://withpace.com/news/multimodal-agents) and [insurance-operations product architecture](https://withpace.com/news/product-launch)
- **Contribution:** The post connects workflow ownership, durable state, route-specific models and tools, browser fallback for legacy systems, human oversight, customer-approved evaluation cases, production drift, and field-to-product learning. The portable gaps are reference-answer provenance and a controlled computer-use action boundary. [R26-73](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-73) [R26-74](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-74)
- **Use in this library:** [Multimodal and computer-use research note](../research/2026-08-11--multimodal-operations-and-computer-use.md), [computer-use blueprint](../blueprints/computer-use-action-boundary.md), and evaluation-reference authority.
- **Caution:** Performance, volume, SLA, organizational, moat, pricing, and vertical-market claims remain first-party assertions. They are not production thresholds or independent evidence that an insurance profile is reusable.

<a id="s26"></a>
## S26 — Bridgewater AIA Labs: PAT, the Pocket Analyst Tool

- **Evidence:** [Direct first-party presentation](https://www.bridgewater.com/aia-labs/how-bridgewaters-aia-labs-built-pat-the-ai-pocket-analyst-tool), recorded 2026-05-19 and reviewed 2026-08-27
- **Speakers:** Brendan McManus, Michael Ran, and Santi Weight, Bridgewater AIA Labs
- **Contribution:** The reported internal research system combines codified institutional methods, structured and unstructured data, identity-scoped tools, typed analytical planning, compiler-like code generation, system-managed execution, narrow specialists, validation, and expert-feedback-derived candidate improvements.
- **Use in this library:** [Bounded PAT evidence review](../research/2026-08-27--bridgewater-pocket-analyst-tool.md), governed data analysis, data-context contracts, controlled improvement, and measured specialist admission.
- **Caution:** The presentation is a first-party field report. Deployment scale, speed, accuracy, and learning claims are not independently reproducible or portable thresholds; same-system checking does not establish independent verification.

<a id="s27"></a>
## S27 — Uber: production AI operating reports

- **Evidence:** Four first-party engineering reports published 2026-05-19 through 2026-08-27 and reviewed 2026-08-28
- **Publisher:** Uber Engineering
- **Contribution:** The reports provide inspectable operating detail for causal agent-work cost decomposition, controlled model and route comparisons, direct-versus-downstream model contracts, calibration drift, staged semantic file analysis, and verifiable caller-plus-agent delegation across hops.
- **Use in this library:** [Bounded Uber evidence review](../research/2026-08-28--uber-production-ai-operating-lessons.md), value and service economics, hybrid-system evaluation, secure AI workloads, change management, and delegated-agent identity.
- **Caution:** The architecture, scale, cost reductions, quality gains, revenue impact, file-security metrics, and latency are first-party claims from Uber's environment. They are not portable thresholds or a required platform design.

<a id="s28"></a>
## S28 — Warp: self-improving software factories

- **Evidence:** [First-party vendor engineering article](https://www.warp.dev/blog/agent-self-improving-software-factories), published 2026-08-27 and reviewed 2026-08-28
- **Publisher:** Warp
- **Contribution:** The article connects a version-controlled agent-system configuration with trace scorers, human-interaction evidence, agent-proposed diffs, and representative configuration benchmarks. The portable lesson is to bind the exact release graph and route scored observations through protected evaluation, review, canary, and rollback.
- **Use in this library:** [Bounded Warp evidence review](../research/2026-08-28--warp-self-improving-software-factories.md), production evaluation, controlled improvement, behavior monitoring, change management, and execution portability.
- **Caution:** The article promotes Warp Factories. Its cloud-only, API-first, multi-model, multi-agent, scorer, and metric recommendations are product claims and design leads, not universal requirements or independent outcome evidence.

## Cross-source convergence

The most repeated ideas are:

1. Context and process knowledge matter more than another thin agent wrapper.
2. Deterministic software should execute and verify whenever possible.
3. Tools need narrow contracts, clear descriptions, scoping, and centralized governance.
4. Persistent domain artifacts improve human review and trust.
5. Loops need external evidence, retry limits, and escalation.
6. Long-running agents need durable, observable execution.
7. Evaluation and data foundations should precede model selection.
8. Human accountability remains essential where verification is weak or stakes are high.
9. Cost and model routing are part of architecture, not post-launch optimization.
10. Deployment, workflow-native experience, adoption, and operating ownership are part of the product—not services around an otherwise complete agent.
11. Typed schemas and symbolic business invariants can constrain probabilistic model output.
12. The durable differentiator is the full system around the model.
13. FDE work starts from an observed operational decision and measurable outcome, not a model or integration.
14. Adoption, support, and customer operating ownership are production gates, not post-launch documentation tasks.
15. Data, domain, behavior, tools, policy, evaluation, runtime, and user experience form one compatible release boundary.
16. Evaluation results need explicit claims, environment versions, repeated trials, uncertainty, and contamination controls.
17. Engagement conversion, continuation, and reuse are portfolio signals; they do not replace workflow-level accepted outcomes, realized value, or release evidence.
18. Codified institutional methods compound only when their ownership, version, provenance, scope, authority, evaluation, and correction paths are explicit.
19. Agent-work efficiency needs causal cost drivers beneath full cost per accepted outcome; cheaper requests are not evidence of better outcomes.
20. Closed-loop improvement needs an exact configuration baseline, governed scorers, matched comparisons, and separate proposal, evaluation, approval, deployment, and rollback authority.
21. Upstream model improvements require downstream contract, calibration, compatibility, and replay evidence before release.
22. Delegated authority remains verifiable only when caller, workload, logical-agent, recipient, scope, tenant, expiry, and policy lineage survive every hop.
