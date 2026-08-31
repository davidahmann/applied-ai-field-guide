---
name: build-ai-evaluation
description: Build or repair evaluations for a production AI-enabled system. Use for realistic cases, adversarial scenarios, graders, trial design, behavioral traces, cost and latency budgets, contamination controls, acceptance thresholds, a model or agent evaluation report when applicable, or an equivalent target-software evaluation record.
---

# Build an AI Evaluation

Evaluate the product claim in its real environment, not an isolated model answer. Keep candidate code away from fixtures, graders, thresholds, and pass signals.

## Read first

1. Read [Evaluation Corpus and Review Loops](../../../library/09-evaluation-corpus-and-review-loops.md) and the [release gates](../../../operations/release-gates.md).
2. When model or agent behavior is selected, use the [evaluation-case](../../../templates/evaluation-case.json) and [evaluation-report](../../../templates/evaluation-report.json) contracts. For a deterministic, optimization, or classical-ML-only system, use an equivalent target-software evaluation record; do not create placeholder model or agent artifacts.
3. Confirm the tested boundary is current and has no unresolved material reframe. Inspect the target system, threat model, workflow charter, [data-context manifest](../../../templates/data-context-manifest.json), selected components, tools, operating budgets, and real failure history. Inspect the behavior bundle only when one applies.
4. If the declared design uses a solution artifact, resolve it through the [solution portfolio](../../../solutions/README.md) and read only the selected business-flow pattern and optional vertical profile. Use acceptance, operating, and non-claim sections as case seeds; they are not evaluation evidence.
5. Apply `EVA-001` through `EVA-006`, `SEC-004`, `REL-002`, `OPS-004`, and `CST-002` from the [control catalog](../../../controls/control-catalog.json).

## Workflow

1. State the tested claim, target workflow slice, eligible population, environment, component versions, and release decision the evidence may support.
2. Build representative success, exception, denial, recovery, drift, and adversarial cases from observed work, local requirements, incidents, and any selected solution-case seeds. Cover missing, stale, conflicting, corrected, late, weak-segment, preparation, lineage, label, permission, and output-data failures where applicable. Preserve provenance and sensitive-data controls.
3. Combine deterministic contract and effect checks with calibrated semantic review and behavioral trajectory checks where appropriate.
4. Give high-risk slices and prohibited effects independent thresholds that aggregate performance cannot hide.
5. Run repeated isolated trials with explicit code, rule, optimizer, ML model, data, policy, runtime, budget, and evaluator versions as applicable; add foundation-model, prompt, context, and tool versions only when selected. Track uncertainty and contamination.
6. Validate outputs, external effects, readback, stop reasons, latency, cost, and resource use—not only final text.
7. Produce the model/agent evaluation report when that profile applies; otherwise produce the equivalent target-software evaluation record. Record `accept`, `inconclusive`, or `reject`, with limitations and required follow-up.

## Output contract

Return the cases and their source, fixture and grader responsibilities, execution manifest, slice-level results, uncertainty, failure taxonomy, contamination statement, applicable evaluation record and decision, and regression links.

Do not present self-review as independent proof, tune thresholds to pass a candidate, accept leaked answer keys, or infer production readiness from a benchmark alone.
