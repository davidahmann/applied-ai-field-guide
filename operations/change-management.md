# Production AI System Change Management

Every change that can alter context, behavior, authority, effects, evaluation, user decisions, or operating evidence is a production change.

Controls: `DEL-001`, `DEL-002`, `EVA-006`, `OPS-007`.

## Change classes

| Class | Examples | Minimum gate |
| --- | --- | --- |
| Documentation only | Explanation with no contract, code, policy, prompt, fixture, or procedure effect | Link, claim, and navigation validation |
| Internal refactor | Behavior-preserving code or infrastructure change | Contract and regression suite; shadow if runtime path changes |
| Data and context | Source semantics, keys, schema, access, quality, preparation, parser/OCR, join, index, feature, enrichment, redaction, compiled context packet, label, population, output, correction | Manifest diff, affected-segment evaluation, lineage verification, canary, replay, rebaseline or rollback |
| Behavioral | Model, provider, prompt, tool description, route, context, memory, guardrail, budget | Per-model/route eval, soak or canary, rollback |
| Capability | New/changed tool, skill, MCP server, browser/code access, egress, credential | Threat update, contract/authorization/security tests, sandbox, scoped canary |
| Domain/policy | Source, schema, ontology, business or payer rule, policy, approval | Data reconciliation, migration, representative replay, owner approval |
| State/runtime | Workflow state, checkpoint, concurrency, retry, queue, sandbox, dependency | Compatibility, recovery, load, cancellation, rollback rehearsal |
| Evaluator | Fixture, grader, rubric, label, hidden test, threshold | Independent review, negative controls, calibration, baseline rerun |
| User/operating model | Review surface, escalation, training, support, SLO, autonomy | Operator acceptance, adoption capacity, runbook and ownership review |

## Candidate manifest

Record:

- Change ID, owner, reason, affected requirements, controls, segments, tenants, and effect classes
- Before/after digests for the complete effective release graph, including workflow topology, behavior, admitted skills and capabilities, tools and MCP servers, evaluator, runtime, permissions, budgets, environment, data, and policy
- Dependency and vendor lifecycle dates
- Data/state migration and backward compatibility
- Threat and failure-mode delta
- Evaluation claim, environment, trials, uncertainty, and limitations
- Operator, service, security, and risk acceptance where applicable
- Current system-map revision and a change-impact assessment for material or critical changes, including excluded sources and unresolved inferred impacts
- Soak/canary scope, duration, sample, observability, and capacity
- Automatic rollback triggers and verified prior configuration
- Support, communication, training, and retirement impact

When model or agent behavior is selected, use the machine-readable [solution-release template](../templates/solution-release.json) and attach a valid [evaluation report](../templates/evaluation-report.json). For a deterministic, optimization, or classical-ML-only system, retain equivalent mechanism, evaluation, build/configuration, approval, deployment, rollback, and retirement evidence in the target software delivery system. In every route, an approval binds the exact release digest; a changed artifact invalidates that approval.

## Map-supported impact review

When a governed [system-map manifest](../templates/system-map-manifest.json) exists, use it to identify likely software and operational impacts. Record the result in a [change-impact assessment](../templates/change-impact-assessment.json). Material or critical changes require complete scope coverage plus technical, operational, and risk review; an inferred relationship remains a review lead until confirmed by the owner or source of truth.

The map is derived context. It cannot authorize a tool, define policy, prove completion, or approve a release. See [map freshness and change impact](map-freshness-and-change-impact.md). `CTX-001`, `CTX-002`, `CTX-004`, `OPS-007`.

## Promotion sequence

```text
isolated branch/environment
  -> schema, contract, policy, and static checks
  -> representative replay + negative controls
  -> cross-resource compatibility and migration
  -> shadow comparison
  -> named canary segment
  -> health + outcome + adoption soak
  -> bounded promotion
  -> rollback window
```

Merge, deploy, healthy runtime, accepted outcome, and realized value are different events. Record each separately.

## Model/agent behavioral-change rules

Apply these additional rules when a model or agent route changes. Other selected mechanisms still require route-specific regression, effect, safety, cost, and rollback evidence under the same promotion sequence.

- Run the suite on every affected model and route; aggregate pass rate cannot hide one failing route.
- Rebuild the affected compiled context packet and replay its consequential slices when source semantics, preparation, enrichment, redaction, domain rules, or policy revisions change.
- Inspect the final serialized request for every supported primary, retry, fallback, and provider-failover path; a provider or route change cannot promote if prohibited fields appear in requests, errors, logs, traces, or caches.
- Compare against the current production candidate using identical worlds and enforced resources.
- State the causal claim. Hold the model and representative workload constant when isolating context, caching, batching, tool-loading, or harness effects; treat model, workload-mix, adoption, and price changes as separate drivers.
- Select model and route candidates on the workload-specific Pareto frontier across accepted-outcome quality, reliability, latency, reviewer effect, and full cost—not token price alone.
- Use ablation to identify whether the changed component is load-bearing.
- Test tool selection, trajectory, final artifact, effect, safety, latency, cost, and reviewer impact.
- When an upstream component feeds another model, optimizer, policy, workflow, or customer-visible decision, bind its direct contract and the downstream product contract. Run downstream replay and a bounded experiment where justified; local metric improvement alone cannot promote the change.
- Version and bind material aggregation, feature, calibration, and post-processing components. Test calibration and drift by consequential slice and declare correction, rollback, and compatibility behavior.
- Preserve a holdout not used to tune the change.
- Retain every failed case, its source and label authority, severity, coverage denominator, threshold impact, and disposition. An aggregate pass count cannot overrule a blocking slice.
- Record prompt/instruction/tool-description diffs or immutable digests.
- Set an expiry for model-specific workarounds and retest them after model upgrades.
- Never lower a threshold, weaken a fixture, or alter a grader solely to make the candidate pass.

When a configuration benchmark compares complete routes, freeze the representative tasks, world and policy revisions, resource ceilings, scorer versions, trial rules, and acceptance criteria across the current and candidate release graphs. Retain per-case outcomes, failures, exclusions, uncertainty, safety slices, scorer cost, and an unchanged holdout. A synthesized recommendation or agent-authored diff remains a candidate; it cannot approve, merge, deploy, or alter the evaluator and release evidence that judges it. [R26-81](../research/2026-08-28--warp-self-improving-software-factories.md#r26-81)

For a long-running optimization search, bind the initial artifact, objective, development evaluator, and separately controlled promotion evaluator before the first experiment. Each experiment should retain one falsifiable hypothesis, its factual result, a reusable insight, the exact artifact revision, and its disposition. Development results may select the next experiment; they must not expose or alter the promotion evaluator. Test a proposed best candidate on the protected evaluator in a fresh environment, then send it through the normal compatibility, safety, approval, canary, and rollback sequence. A hypothesis tree is one optional way to preserve this state; autonomous search topology is not a release authority. [S35](../library/05-source-index.md#s35)

Anthropic's April 2026 postmortem is direct evidence that model defaults, context handling, and a small prompt change can produce route-specific regressions. Uber's traffic-forecasting report separately illustrates why an improved upstream metric can still degrade a downstream product decision when calibration and component contracts drift. These cases motivate controlled comparison and downstream replay; their implementation details and reported effects are not guide defaults. [R26-51](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-51) [R26-78](../research/2026-08-28--uber-production-ai-operating-lessons.md#r26-78)

The healthcare-claims field report adds a concrete but self-reported example of versioned enrichment, boundary redaction, deterministic output adjudication, and replay after provider or domain-rule changes. It does not validate the claimed privacy, topology, timing, or pass rate; use the operating pattern only through the Guide's existing release evidence. [R26-82](../research/2026-08-18--healthcare-claims-context-and-evaluation.md#r26-82)

## Evaluator-change rules

- Evaluator and candidate changes do not share an approval path.
- Re-run the current production version and known-positive, known-negative, and adversarial controls.
- Review task validity, reference solution, grader calibration, leakage, hidden-data access, and cross-trial state.
- Version the claim and report when the evaluator changes; do not compare incompatible scores without qualification.
- Invalidate reports produced by a compromised or materially defective evaluator.

Controls: `EVA-002`, `EVA-005`, `EVA-006`.

## Automatic rollback

Rollback or disable the affected segment on:

- Unauthorized, cross-tenant, prohibited, or duplicate effect
- Source-of-truth readback mismatch
- Evaluator integrity or contamination failure
- Required trace, policy, or receipt evidence missing
- High-severity slice below threshold
- Error-budget, cost, reviewer-capacity, or adoption guardrail breach
- Dependency incompatibility, lifecycle violation, or unbounded egress
- Kill switch, credential broker, identity, or policy enforcement failure

## Post-change review

After the rollback window, compare the candidate with the prior release on accepted outcomes, safety, latency, cost, adoption, overrides, review load, incidents, and support contacts. Record keep, constrain, revert, or redesign, and add every diagnosed failure to the regression suite.
