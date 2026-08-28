# Warp Software Factories: Governed Configuration Improvement

**Review date:** 2026-08-28

**Scope:** exact agent-system configuration, trace scoring, benchmarked change proposals, execution portability, and protected improvement loops

**Decision:** admit one bounded vendor engineering article as an implementation lead; refine the existing evaluation, controlled-improvement, change, and service-review contracts without creating a software-factory module, parallel manifest, new control family, or cloud and multi-agent default

<a id="r26-81"></a>
## R26-81 — Warp: closing the software-factory improvement loop

- **Date:** Published 2026-08-27; reviewed 2026-08-28
- **Type / tier:** First-party vendor engineering and product article; C
- **Source:** [Closing the loop with self-improving cloud software factories](https://www.warp.dev/blog/agent-self-improving-software-factories)
- **Reported scope:** Warp's proposed operating model for versioned coding-agent configurations, trace scorers, improvement agents, and configuration benchmarks

Warp describes a source-controlled factory definition that binds agent definitions, skills, MCP servers, model routing, automations, scorers, and benchmarks. It proposes collecting agent traces and human interactions, grading runs, using an agent to suggest a configuration diff, and retaining human review and merge authority. It also recommends comparing configurations over representative tasks before adopting a change.

## Portable findings

### 1. Bind the complete configuration, not only the model

A result is attributable only when the evaluated baseline identifies the exact workflow topology, model routes, prompts, admitted skills and capabilities, tool and MCP contracts, context and guardrail policy, evaluator, runtime, permissions, budgets, and environment. The Guide already divides these concerns across the agent-system, behavior-bundle, capability-manifest, evaluation-report, and solution-release contracts. A vendor-specific factory file is one possible projection of that release graph, not a reason to create a second source of truth.

### 2. Keep observation, scoring, proposal, and promotion separate

The safe loop is:

```text
privacy-reviewed run and human-interaction evidence
  -> versioned scorer and sampled evaluation
  -> reproducible failure or opportunity
  -> isolated configuration diff
  -> matched benchmark and protected holdout
  -> human review and release approval
  -> canary, monitored decision, and rollback
```

An agent may diagnose patterns and write a candidate diff. It must not change the scorer, rubric, fixtures, threshold, hidden holdout, permissions, protected branch, approval, deployment, or rollback evidence that judges that diff.

### 3. Treat scorers as governed evaluators

A scorer needs a declared claim, eligible population, sampling policy, inputs, rubric, version and digest, label or reference authority, uncertainty, cost, calibration, disagreement path, and failure behavior. Agent traces, PR comments, task-tracker input, overrides, and reviewer corrections can be useful evidence, but they remain purpose-bound and potentially sensitive. Human interaction is not automatically ground truth, and an LLM judge is not independent merely because it runs in a separate process.

### 4. Compare complete configurations under matched conditions

For a configuration benchmark, run the current and candidate configurations on the same representative tasks, world and policy revisions, resource ceilings, scorer versions, trial rules, and acceptance criteria. Retain per-task results, failures, exclusions, uncertainty, and the unchanged holdout. Prefer the workload-specific Pareto frontier across accepted-outcome quality, reliability, safety, latency, reviewer effect, and full cost; a single aggregate score or apparent winner is insufficient when a consequential slice regresses.

### 5. Keep delivery proxies subordinate to accepted outcomes

PR throughput, cost per PR, automation percentage, and estimated human savings may diagnose an engineering workflow. They do not establish useful or accepted software. Review time to verified and accepted change, escaped defects, rework, reversions, incidents, reviewer burden, adoption, and full cost per accepted outcome. Human touchpoints are not waste by category when they supply necessary judgment, authorization, or independent verification.

### 6. Specify operating properties instead of prescribing cloud

Unattended work needs durable state, schedulable execution, shared evidence, current identity, controlled access, observability, cancellation, recovery, and an accountable team. Public cloud, private cloud, VPC, on-premises, hybrid, or a local development path may satisfy different parts of that contract. Likewise, typed APIs are useful automation surfaces, but an API does not by itself provide authorization, tenancy, idempotency, auditability, or verified completion.

### 7. Admit multiple models or agents only when the workload earns them

Multi-model routing and multi-agent decomposition are optional mechanisms. Compare them with a deterministic, single-model, single-agent, or human-reviewed path under matched budgets. Keep the simpler route when additional topology does not improve accepted outcomes, failure isolation, reliability, latency, or full cost.

## Claim limits

- This is a vendor-authored product and engineering article, not an independently reproducible benchmark, incident report, or comparative study.
- Warp's screenshots, scorer results, product primitives, configuration layout, scheduling defaults, and deployment assumptions are not production evidence for another system.
- The article does not establish that cloud deployment, API-first operation, multiple models, or multiple agents are universally necessary.
- A source-controlled configuration enables review and rollback only when every effective dependency is actually pinned and the deployed runtime enforces the reviewed release.
- A scored trace does not prove root cause, accepted output, safe effect, realized value, or evaluator independence.
- An agent-generated pull request is a candidate change, not self-improvement evidence, until a matched evaluation, independent approval, bounded rollout, and post-change outcome check pass.

## Repository impact

| Artifact | Bounded change |
| --- | --- |
| [Production evaluation and governance](../library/04-production-evaluation-and-governance.md) | Define exact configuration baselines and separate trace scoring from protected benchmark and release decisions |
| [Controlled improvement agent](../blueprints/controlled-improvement-agent.md) | Add scorer provenance, matched configuration comparison, and explicit no-self-judging boundaries |
| [Behavior monitoring](../operations/behavior-monitoring.md) and [production service review](../templates/production-service-review.md) | Make scorer sampling, human-interaction evidence, evaluator cost, and accepted-outcome effects reviewable |
| [Change management](../operations/change-management.md) | Require exact before/after release graphs and matched configuration benchmarks for claimed improvement |
| [Enterprise integration and scale reality](../library/17-enterprise-integration-and-scale-reality.md) | State durable team operation and typed control surfaces as requirements without prescribing cloud deployment |
| [FDE and applied-AI synthesis](../library/10-fde-and-production-agent-synthesis.md) | Keep closed-loop improvement governed and reject cloud or multi-agent choices by category |

Disposition: `configure`. Reuse the Guide's existing release graph, evaluation report, controlled-improvement, and change-management contracts. Do not create a parallel factory manifest or import Warp-specific infrastructure and metrics as defaults. Revisit by 2027-02-28 or sooner after a public benchmark, material correction, incident report, or independently inspectable implementation artifact.
