# Data Readiness Assessment

Use this before architecture approval and keep it current through pilot and operation. The output is a decision about one bounded workflow—not a generic claim that a lake, warehouse, knowledge base, or model is “ready.” Promote the accepted results into `data-context-manifest.json`.

## Decision and population

- Workflow and consequential decision:
- Eligible population and exclusions:
- Unit of analysis and entity keys:
- Time semantics: event time, effective time, observed time, correction window
- Accepted outcome, baseline source, verifier, and guardrails:
- Mechanism candidates and their minimum data needs:

## Four data planes

| Plane | Purpose | Sources | Owner | Allowed use | Prohibited use | Retention / deletion |
| --- | --- | --- | --- | --- | --- | --- |
| Operational | Current state and source-of-truth identifiers |  |  |  |  |  |
| Knowledge and context | Policy, documents, history, and explanatory evidence |  |  |  |  |  |
| Evaluation and training | Cases, labels, reference answers, and evaluation environments |  |  |  |  |  |
| Telemetry and feedback | Runs, outcomes, guardrails, corrections, and drift |  |  |  |  |  |

Do not silently mix these planes. Runtime retrieval is not a training grant; telemetry is not automatically a label; an evaluation answer key is never runtime context; and a source used for explanation does not authorize an action.

## Source inventory and authority

For every decision-bearing source, record:

| Source | Where it lives | Owner | Source of truth? | Population / grain / keys | Schema and revision | Freshness | Classification | Tenant / row / field scope | Known corrections and conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |

Ask what operators actually trust when sources disagree. In brownfield systems, code behavior, policy, SOW language, runbooks, database state, and operator practice often express different truths. Record precedence and an accountable adjudicator; do not let the model reconcile them silently.

## Decision-fit profile

Define a threshold and fallback for each decision-critical field. Measure by eligible segment, not only in aggregate.

| Field / source | Decision use | Completeness | Validity | Uniqueness | Consistency | Timeliness | Coverage | Representativeness | Failure fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |

Check join cardinality, duplicate entities, correction latency, missing-not-at-random patterns, policy coverage, retrieval recall, label agreement, and temporal leakage where applicable. “Not applicable” needs a reason. Unknown decision-critical quality is a release condition, not an empty cell.

## Preparation and lineage

| Step | Inputs and revisions | Output | Code / parser / model version | Deterministic? | Validation | Reversible? | Lineage event |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

Include parsing, OCR, normalization, deduplication, entity resolution, redaction, chunking, indexing, joins, feature engineering, aggregation, and human adjudication when used. Preserve raw evidence and source references. Derived views may guide retrieval and review; they do not become source-of-truth policy.

## Labels and reference authority

- Label or expected-result definition:
- Source revision and observation window:
- Accountable owner:
- Independent approver:
- Agreement measure and disagreement sample:
- Adjudication and correction path:
- Contamination and answer-key isolation:
- Review / expiry date:

Leave this section explicitly not applicable when the mechanism uses no learned labels or expected results. Do not invent anonymous ground truth.

## Output data contract

- Output record, owner, and system of record:
- Classification and tenant binding:
- Provenance carried forward:
- Ephemeral, reviewable, or durable:
- Correction and supersession behavior:
- Downstream uses:
- Retention, deletion, export, and training use:

Generated content and decisions create data obligations too. Assign ownership before launch.

## Remediation economics

Compare at least the practical alternatives: repair the source, create a governed derived view, constrain the population, add human collection/review, select a smaller mechanism, or do not build. For each, state one-time cost, recurring cost, delay, coverage, residual risk, and owner. Keep data remediation inside the workflow value ceiling.

## Operating contract

- Source, schema, permission, and freshness monitors:
- Quality and segment-coverage monitors:
- Transformation and lineage health:
- Drift and correction detection:
- Stop, fallback, replay, and rollback behavior:
- Rebaseline trigger:
- Change owner and service-review cadence:

## Decision

- Status: `draft | conditionally_ready | ready | remediation_required | not_viable`
- Disposition: `continue | remediate | constrain | pause | do_not_build`
- Conditions and owners:
- Data, operational, and risk approvals as applicable:
- Review due:

Controls: `CTX-001`, `CTX-006`, `CTX-007`, `CTX-008`, `CTX-009`, plus mechanism-specific security, evaluation, and operations controls.
