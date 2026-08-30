# Healthcare Claims Context and Evaluation Field Report

**Review date:** 2026-08-30

**Scope:** data-first delivery, compiled model context, model-boundary privacy, deterministic adjudication, narrow workflow agents, and change-triggered evaluation

**Decision:** admit one qualified first-party practitioner field report as supporting evidence; refine existing data-context, privacy, evaluation, and change guidance without creating a healthcare module, a new control family, or a universal architecture default

<a id="r26-82"></a>
## R26-82 — Mark Ajzenstadt: healthcare-claims agent delivery

- **Date:** Published 2026-08-18; reviewed 2026-08-30
- **Type / tier:** Full post text supplied; identifiable-practitioner field report; C
- **Source:** [Mark Ajzenstadt on X](https://x.com/mardehaym/status/2089648072217243780)
- **Reported scope:** a four-month delivery engagement for healthcare billing and denial workflows operating under HIPAA constraints

Ajzenstadt reports that the team spent its first month mapping data rather than integrating a model, then built versioned enrichment payloads for seven narrow workflows. The described route removes patient data before model invocation, validates model output against a strict schema, lets deterministic software accept or reject the proposal, and replays a curated evaluation suite when a provider or payer rule changes.

## Portable findings

### 1. Establish the data contract before selecting model behavior

Observe the workflow, locate authoritative records, identify missing facts, reconcile policy and operator practice, and measure critical data quality before asking a model to reason. A model should not be used to conceal an unresolved source, identity, permission, or domain-rule contract.

### 2. Compile decision-scoped context in trusted software

For a bounded model route, build one versioned context packet from approved sources and preparation steps. Bind its eligible workflow and segment, allowed model-visible fields, source and policy revisions, preparation versions, freshness, sensitivity class, provenance, digest, and compatible provider routes. The packet is a runtime projection of the data-context manifest and behavior bundle—not a new authority source.

### 3. Test privacy on the payload that actually leaves the boundary

Redaction earlier in a pipeline is not sufficient evidence. Inspect the final serialized request after prompt assembly and middleware for the primary route, retries, fallbacks, and provider failover. Check error payloads, logs, traces, caches, and retained evaluation material too. Record a scoped claim such as “these prohibited fields were absent from these measured egress paths”; do not generalize it to zero exposure without independently inspectable evidence.

### 4. Separate probabilistic proposals from deterministic decisions

Use a closed output schema, explicit abstention, and bounded candidate values. Deterministic policy or an accountable human decides whether a proposal is acceptable and authorized. Unknown schema members, unsupported values, stale context, or failed privacy checks stop or fall back before an effect.

### 5. Keep workflow boundaries narrow unless evidence earns reuse

One route per materially different decision can improve testability, ownership, and failure isolation. The number of agents is not a maturity measure. Reuse a shared harness or preparation component only when matched evaluation shows that the common path preserves accepted outcomes and consequential slices.

### 6. Treat every behavior-bearing dependency as a production change

Source semantics, enrichment logic, preparation code, domain or payer rules, prompt and schema changes, models, and provider routes can all change outcomes. Rebuild the affected packet, replay representative and adversarial cases, inspect the failed cases, and retain rollback before promotion.

### 7. Report the evaluation decision, not only a pass count

A result such as 59 of 60 is incomplete without the tested claim, eligible population, case provenance, label authority, coverage, failed case and severity, acceptance threshold, route and environment versions, trial policy, uncertainty, limitations, and disposition. A single high-severity failure can block a release even when the aggregate is high.

## Claim limits

- The post supplies no independently inspectable architecture, source data, privacy audit, evaluation cases, labels, grader, release record, or customer confirmation.
- The reported four-month timeline, seven agents, 34 variables, 59-of-60 result, provider portability, and zero-patient-data-exposure claim are self-reported. They are not portable targets or target-system evidence.
- “Patient data” is not defined in the post. A production privacy claim must specify fields, transformations, routes, retention surfaces, threat model, sampling or proof method, and accountable reviewer under the applicable legal and customer policy.
- Matching outputs across two providers does not establish semantic equivalence, safety, calibration, cost, latency, or future portability.
- A curated suite has a revision half-life. Its owner, source revisions, review date, update triggers, contamination controls, and adjudication path must remain current as policy and workflow behavior change.
- Healthcare billing rules, data formats, authorizations, and regulatory duties remain customer- and jurisdiction-specific.

## Repository impact

| Artifact | Bounded change |
| --- | --- |
| [Data readiness and context contracts](../library/16-data-readiness-and-context-contracts.md) | Define a compiled context packet as a release-bound runtime projection and make boundary privacy measurable |
| [Data preparation and context pipeline](../blueprints/data-preparation-and-context-pipeline.md) | Add packet compilation, invalidation, egress tests, and privacy-minimized telemetry |
| [Behavior monitoring](../operations/behavior-monitoring.md) | Monitor packet lineage and privacy checks without retaining protected payloads |
| [Change management](../operations/change-management.md) | Trigger affected-slice replay for enrichment, domain-rule, context, model, and provider changes and require failed-case disposition |

Disposition: `configure`. Apply the pattern through the Guide's existing data-context manifest, behavior bundle, evaluation report, solution release, and software-enforced policy boundaries. Do not copy the engagement's topology, variable count, performance result, privacy claim, or implementation timeline. Revisit by 2027-02-28 or sooner after a public correction, independently inspectable technical artifact, audit, or incident report.
