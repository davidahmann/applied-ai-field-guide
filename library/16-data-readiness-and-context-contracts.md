# Data Readiness and Context Contracts

Data readiness is not “we have data” and it is not a warehouse, vector index, or model-training project. It is evidence that the specific information needed for one bounded decision is authoritative, accessible, representative, timely, lawful, economical, and operable.

The governing question is:

> What must be true about the data for this decision to be safe, useful, and independently verifiable—and what happens when it is not true?

Use the [assessment](../templates/data-readiness-assessment.md) to discover the answer and the [machine-readable manifest](../templates/data-context-manifest.json) to bind it to design, evaluation, release, and operation. The manifest is evidence about data dependencies; it does not grant access or action authority.

## Why it fails in practice

Most failures are not caused by a universally “bad dataset.” They arise from a mismatch between a decision and its evidence:

- the population, grain, keys, denominator, or time semantics are undefined;
- operational state, policy, documents, and operator practice disagree;
- a clean aggregate hides a weak segment or missing-not-at-random population;
- parsing, joins, OCR, entity resolution, labels, or indexes change without lineage;
- evaluation data leaks into runtime context, or telemetry quietly becomes training data;
- generated outputs have no owner, correction path, retention rule, or system of record;
- data repair costs more than the bounded workflow can return; or
- launch gates check model behavior but not source, schema, permission, freshness, or drift.

## Keep four planes separate

| Plane | Primary job | Typical contents | Critical boundary |
| --- | --- | --- | --- |
| Operational | Establish current world state | transactions, cases, entities, permissions, revisions | Source-of-truth state and effect readback |
| Knowledge and context | Support interpretation | policy, documents, code, history, runbooks | Evidence, not instruction or authorization |
| Evaluation and training | Measure or shape behavior | cases, labels, reference answers, environments | Independent authority, contamination controls, reproducibility |
| Telemetry and feedback | Operate and learn | runs, outcomes, errors, corrections, drift | Governed feedback; not an automatic label or training grant |

A physical source may support more than one plane, but each use still needs its own purpose, access, retention, and authority rule.

## The lifecycle

### 1. Bound the decision and population

Start from the workflow charter: decision, eligible population, exclusions, grain, entity keys, time semantics, accepted outcome, baseline, verifier, guardrails, and cost ceiling. A generic platform-readiness score cannot replace this boundary.

### 2. Inventory sources where they actually live

Record system, environment, interface, residency, owner, source-of-truth status, schema, revision, freshness, classification, tenant and field scope, retention, deletion, and correction behavior. Observe what operators trust when SOWs, policy, runbooks, code, databases, and actual practice disagree.

Treat codified methods, expert logic, metric definitions, analytical routines, and tool interfaces as sources too. Record owner, version, provenance, applicable population, permitted purpose, authority class, dependencies, review date, and correction path. A widely used internal method can be valuable context without becoming source-of-truth state, action authority, or anonymous evaluation ground truth. The [Bridgewater PAT field report](../research/2026-08-27--bridgewater-pocket-analyst-tool.md#r26-76) illustrates the leverage of institutional legibility while remaining first-party and non-portable.

### 3. Profile decision-critical quality

Measure the fields and relationships that can change the decision:

- completeness and missingness pattern;
- validity and domain constraints;
- uniqueness and duplicate identity;
- cross-source consistency;
- timeliness, effective time, and correction latency;
- eligible-population and segment coverage; and
- representativeness for the declared use.

Use explicit thresholds, evidence, and fallbacks. Unknown critical quality means remediate, constrain, or stop; it does not mean “let the model handle it.”

### 4. Design preparation as software

Parsing, OCR, normalization, deduplication, entity resolution, redaction, chunking, indexing, joins, feature engineering, and aggregation are production components. Version them. Test them. Record input revisions, implementation versions, output digests, validation, reversibility, and lineage. Preserve the raw source and make derived relationships explainable.

### 5. Establish label and reference authority

When evaluation, classical ML, or learned ranking needs labels, bind each definition to a source revision, observation window, owner, independent approver, agreement measure, disagreement sample, adjudication path, classification, and review date. Keep protected answers out of runtime context. An expert opinion without scope and provenance is not ground truth.

### 6. Select the smallest sufficient mechanism

Data needs change by mechanism:

- deterministic rules need complete fields, stable semantics, and explicit exceptions;
- optimization needs valid constraints, objective terms, and sensitivity analysis;
- classical ML needs representative features, stable labels, leakage controls, calibration, and drift monitoring;
- retrieval needs authoritative sources, permission-aware indexing, citations, freshness, recall, and sufficiency checks;
- foundation-model calls need bounded context, provenance, injection resistance, output validation, and fallback;
- agents need all of the above plus state, tool, authority, budget, and effect contracts.

Do not fund an agent to compensate for an unresolved source contract.

### 7. Bind data to evaluation and release

The evaluated release must identify the exact data-context manifest, source and schema revisions, preparation versions, index or feature revisions, label/evaluation authority, and known limitations. Cases should cover weak segments, missing/stale/conflicting/corrected data, permission changes, and transformation failures—not only happy-path records.

### 8. Operate the data product

Monitor schema, permission, freshness, completeness, validity, uniqueness, consistency, coverage, representativeness, lineage, corrections, and drift at the segments that matter. Route failures to stop, fallback, reconciliation, replay, rollback, or rebaseline paths with owners. Review both source inputs and generated output records.

## Brownfield and greenfield

Brownfield work begins by reconciling inherited truths. Characterization tests preserve observed behavior while owners decide which behavior is policy, accident, or debt. A versioned context contract keeps code analysis, operator knowledge, commercial promises, and system state linked without pretending any one artifact is automatically authoritative.

Greenfield work is not exempt. It must establish the population, identifiers, event and correction semantics, ownership, quality telemetry, access, retention, deletion, output records, and change process before synthetic examples harden into accidental contracts.

## The economic decision

Compare source repair, governed derived views, constrained population, human collection or review, a smaller mechanism, and not building. State one-time and recurring cost, delay, coverage, residual risk, and owner. If the required data contract cannot fit the workflow’s value ceiling or lawful operating model, the correct result may be `constrain`, `pause`, or `do_not_build`.

## Evidence and limits

This chapter applies source ownership and readiness from [R26-14](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-14), retrieval sufficiency from [R26-16](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-16), evaluation authority from [R26-47](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-47) and [R26-53](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-53), lineage vocabulary from [R26-67](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-67), and bounded institutional-method evidence from [R26-76](../research/2026-08-27--bridgewater-pocket-analyst-tool.md#r26-76). These sources support the engineering boundaries, not universal thresholds. Target owners must set and verify thresholds for their workflow.

Controls: `CTX-001`, `CTX-006`, `CTX-007`, `CTX-008`, `CTX-009`, `EVA-001`, `EVA-006`, `OPS-001`, `OPS-002`, `OPS-005`, `VAL-001`, `VAL-002`.
