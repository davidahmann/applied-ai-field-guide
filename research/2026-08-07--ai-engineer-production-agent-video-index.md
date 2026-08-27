# AI Engineer Production-Agent Video Index

Review date: **2026-08-27**.

This index records original talks and builder interviews that contain concrete implementation detail. Dates, durations, and chapters were checked against YouTube watch-page metadata and creator-supplied descriptions. A talk is evidence of what the named speaker or company reported, not independent proof that the design or metric generalizes.

## Admission labels

| Label | Meaning |
| --- | --- |
| Corroborated | A first-party engineering post, documentation page, or reproducible repository supports the mechanism |
| Field report | An identifiable builder describes a deployed system; scale and results remain attributed |
| Experimental | The implementation is inspectable or demonstrated but needs independent safety and performance validation |

## Workflow discovery, professional UX, and FDE practice

| Recording | Chapters used | Status and portable finding |
| --- | --- | --- |
| [How Ramp built an AI agent that can think outside of tokens](https://youtu.be/trEM9OKr5Sc), Alexander Shevchenko, Ramp, 2026-05-07, 44:06 | `02:27` process mining from operator recordings; `06:13` spreadsheet-native workflow; `12:41` tools and sandbox; `21:55` expert evals; `23:40` self-monitoring; `28:43` failed memory experiments | Field report. Observe work before automating it; preserve the professional's native artifact; treat self-generated fixes as proposals subject to independent CI and review. |
| [Agents need more than a chat](https://youtu.be/XNtkiQJ49Ps), Jacob Lauritzen, Legora, 2026-04-22, 14:21 | `03:22` verifier rule; `05:05` decomposition and guardrails; `11:13` persistent artifact UX | Field report. Decompose around cheap verification and give reviewers durable, structured work products rather than a transcript alone. |
| [FDE 101](https://youtu.be/KwhgfwOSToQ), Kevin Bai, Anthropic, 2026-07-28, 17:48 | `01:47` FDE lineage; `03:14` solution versus product/service; `04:18` nontechnical buyer; `07:16` reusable platform partnership; `09:48` starting questions | Field guidance. Begin with the customer's important problem and current work, then distinguish reusable platform improvements from customer-specific delivery. |
| [How Ramp engineers work with AI agents at every step](https://youtu.be/i4odXOmgMLw), Ramp and Anthropic, 2026-08-06, 21:59 | `03:36` dynamic workflows; `06:49` lifecycle; `09:11` least privilege; `12:00` cost and review; `16:05` on-call assistant | Field report. Treat agents as part of an engineering and operating lifecycle, not only a code-generation interface; performance claims remain attributed. |

## Architecture, tools, and state

| Recording | Chapters used | Status and portable finding |
| --- | --- | --- |
| [How Hex builds AI agents that reason like human data analysts](https://youtu.be/Xyh1EqcjGME), Izzy Miller, Hex, 2026-04-09, 1:08:20 | `07:36` verification challenge; `09:30` common harness; `18:59` tool context; `27:28` verification versus transparency; `34:38` eval system; `59:59` longitudinal simulation | Corroborated by [Hex's evaluation lab](https://hex.tech/blog/evaluate-data-agents/). Data agents need realistic environments, pairwise candidate/baseline comparison, calibrated judges, and long-running state tests. |
| [How Bridgewater built PAT, the AI Pocket Analyst Tool](https://www.youtube.com/watch?v=lXZb21CfeIY), Brendan McManus, Michael Ran, and Santi Weight, Bridgewater AIA Labs, recorded 2026-05-19, 26:18 | `04:30` scope; `05:01` data, tools, and diagnosability; `09:33` per-user security; `11:14` planning; `15:24` feedback-derived candidates; `18:08` compiler framing; `22:37` validation; `25:29` specialization | First-party field report with a [bounded evidence review](2026-08-27--bridgewater-pocket-analyst-tool.md#r26-76). Codified institutional methods need governed context contracts; analytical plans can compile into constrained execution; specialist workers and feedback-derived changes still require measured admission and independent release authority. Scale, speed, and accuracy remain attributed claims. |
| [How Listen builds AI Agents that review their own work](https://youtu.be/YTTH-0XXEBE), Florian Juengermann, Listen, 2026-04-23, 47:38 | `06:37` virtual table; `10:05` sandbox; `14:11` contextual prompting; `16:32` feedback agent; `18:14` production evals; `29:10` co-editing | Field report. Map-reduce over a typed analytical surface and collaborative editing are useful; same-system review is a signal, not independent verification. |
| [Agentic Search for Context Engineering](https://youtu.be/ynJyIKwjonM), Leonie Monigatti, Elastic, 2026-05-08, 1:03:12 | `08:50` tool-call failure modes; `10:41` descriptions and parameters; `28:36` skills; `34:42` shell; `44:42` low-floor/high-ceiling stack | Field report with [first-party notes](https://leoniemonigatti.com/). Pair reliable specialist tools with a sandboxed escape hatch and test no-tool, wrong-tool, and bad-parameter paths. |
| [How Uber Runs 60,000 AI Agent Tasks Per Week With MCP](https://youtu.be/yVqMxBahjfA), Meghana Somasundara and Rush Tehrani, Uber, 2026-05-07, 14:27 | `03:29` gateway and registry; `04:45` authorization and PII; `05:40` architecture; `09:10` derived tools; `11:42` evaluation and SLA roadmap | Corroborated in part by [Uber's identity and gateway post](https://www.uber.com/au/en/blog/solving-the-agent-identity-crisis/). Central registries, caller-aware authorization, metadata scanning, and task-scoped derived tools are portable; scale remains a company claim. |
| [Event-sourced agent harness workshop](https://youtu.be/vi-2nasppAg), Jonas Templestein, Iterate, 2026-05-14, 1:04:26 | `01:33` event-source thesis; `05:40` stream architecture; `11:57` circuit breakers; `30:06` reducers; `50:35` dynamic workers | Experimental. Append-only events and pure state reducers improve replay and diagnosis; executable code carried in events is a supply-chain and code-execution boundary, not a default recommendation. |
| [The Multi-Agent Architecture That Actually Ships](https://youtu.be/ow1we5PzK-o), Luke Alvoeiro, Factory, 2026-05-06, 18:30 | `04:04` orchestrator/workers/validators; `06:34` validation contracts; `08:09` typed handoffs; `09:17` serial-first; `10:30` mission control | Corroborated in part by [Factory's architecture post](https://factory.ai/news/missions-architecture). Establish a serial baseline, use typed handoffs, and justify workers through measurable specialization or parallelism. |
| [The Future of MCP](https://youtu.be/v3Fr2JR47KA), David Soria Parra, Anthropic, 2026-04-19, 18:45 | `05:07` skills/MCP/CLI stack; `07:47` progressive discovery; `09:39` programmatic calls; `12:00` server/client practices | Field guidance. Use stable protocol specifications as authority; treat roadmap statements as non-normative and discover capabilities progressively. |

## Evaluation, reliability, and continuous improvement

| Recording | Chapters used | Status and portable finding |
| --- | --- | --- |
| [Datadog Built 100 AI Agents—Here's What Broke](https://youtu.be/C3y3M_03Vco), Diamond Bishop, Datadog, 2026-05-11, 10:11 | `04:20` agent-first docs; `06:30` proactive agents; `07:00` durable runtime; `07:30` living evals; `08:40` simple harness | Corroborated in part by Datadog engineering sources R26-07 and R26-17. Long-running systems need durable execution, machine-usable docs, living evals, and replaceable harnesses; counts remain attributed. |
| [Harness engineering at OpenAI](https://youtu.be/am_oeAoUhew), Ryan Lopopolo, OpenAI, 2026-04-16, 46:20 | Creator chapters cover repository maps, feedback loops, agent legibility, and organizational implications | Corroborated by [OpenAI's harness engineering report](https://openai.com/index/harness-engineering/). Repository structure, feedback speed, and agent-readable interfaces are engineering inputs; OpenAI states that long-term coherence remains an open question. |
| [Your Agent Didn't Fail. Your Harness Did](https://youtu.be/BInpv7lGp1o), Vinoth Govindarajan, OpenAI, 2026-07-29, 18:25 | `01:32` delivery versus truth; `02:46` propose/commit/receipt; `04:14` state rehydration; `05:48` idempotency and ordering; `11:23` approval drift; `13:05` visible proof | Field guidance that strongly converges with this repository's existing effect-receipt, durable-state, approval-freshness, and postcondition controls. |
| [From Signal to PR](https://youtu.be/9HbzAWnKbo4), Jason Lopatecki, Arize, 2026-07-24, 20:35 | `02:55` self-fix goal; `04:14` investigation; `06:08` trace files; `07:23` sandbox; `13:09` private deployment; `18:04` evals | Corroborated by the [Phoenix repository](https://github.com/Arize-ai/phoenix). Production signals can produce diagnosis and candidate changes, but the agent must not control its evaluator, CI result, review, or merge authority. |
| [Production replay for agent failures](https://youtu.be/Lc8zRh9muoY), Tisha Chawla and Susheem Koul, Microsoft, 2026-06-28, 14:09 | Creator chapters cover trajectory normalization, invariant checking, replay, and failure classification | Corroborated by [Microsoft AgentRx](https://github.com/microsoft/AgentRx). Normalize traces into a stable representation, identify the first violated invariant, and preserve replayable diagnostic evidence. |
| [From Vibes to Production: Evaluating and Shipping AI Agents That Work](https://youtu.be/Xfl50508LZM), Laurie Voss, Arize, 2026-05-14, 2:04:18 | `05:17` eval and tracing; `38:12` trace categories; `49:52` code graders; `57:51` model judges; `01:19:14` datasets and experiments | Educational workshop. Layer deterministic, model, and human evaluation; calibrate rubrics; turn production traces into reviewed datasets and experiments. |

## Counterweights and exclusions

- A self-reviewer can find defects but does not supply independent proof.
- An auto-fix agent may investigate and open a candidate change; it must not alter the evaluator, forge CI evidence, approve, or merge its own work.
- Shell access is a sandboxed high-ceiling capability, not a substitute for task-shaped tools or authorization.
- Dynamic executable workers require signed provenance, isolation, resource limits, and a separate admission decision.
- Multi-agent performance and organizational productivity figures remain vendor claims until reproduced in the target workflow.
- Roadmap statements, conference demos, and speaker heuristics do not override stable specifications, source-of-truth behavior, or local evaluation.
