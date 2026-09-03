# Multi-Agent Topology Selection Evidence

Reviewed 2026-08-14. This note records one controlled architecture study as evidence for local evaluation design. It does not establish a universal agent-count or topology rule.

<a id="r26-75"></a>
## R26-75 — Kim et al.: coordination gains depend on task–topology fit

- **Date:** Published 2026-07-24; reviewed 2026-08-14
- **Type / tier:** Peer-reviewed controlled evaluation with a public manuscript; B
- **Sources:** [Capable language models can outgrow the benefits of collaboration](https://www.nature.com/articles/s42256-026-01268-y) and [public manuscript](https://arxiv.org/abs/2512.08296)
- **Finding:** Across 260 configurations spanning six agentic benchmarks, five architectures, and three model families, the researchers standardized prompts, tools, and compute while varying coordination structure and model capability. Multi-agent performance relative to the single-agent baseline ranged from +80.8% on decomposable financial analysis to −70.0% on sequential planning; the overall mean change was −0.3%. The single-agent baseline was the most robust predictor, while a separately fitted threshold near 45% served as a within-domain selection rule. Trace analysis measured 17.2× error amplification for independent aggregation and 4.4× for centralized coordination with a verification bottleneck.
- **Portable pattern:** Keep deterministic, coded-workflow, and serial single-agent baselines as live controls. Compare candidate topologies on representative target work under matched prompts, tools, total compute, and repeated trials; score accepted outcome, safety, latency, full cost, review load, and failure isolation. Prefer serial execution for sequentially dependent work, and admit fan-out only when decomposition or a real context, permission, specialization, ownership, or latency boundary earns the coordination cost. Rerun the comparison when a model, prompt, tool, context policy, or topology changes.
- **Anti-pattern:** Treating 45% as a universal release threshold, assuming a weak single-agent result automatically justifies a supervisor or crew, or using an aggregate benchmark mean to choose a production topology.
- **Caveat:** The study covers six benchmark clusters. Its threshold and architecture rankings are practical within-domain priors, not portable scaling laws or substitutes for target-workflow evaluation; the paper reports weak absolute generalization to unseen domains.
