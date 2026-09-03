---
name: select-ai-mechanism
description: Select the smallest sufficient mechanism for each consequential decision step. Use when comparing deterministic code, optimization, classical ML, retrieval, a foundation-model call, a bounded agent workflow, or human review and documenting why the chosen mix is justified.
---

# Select an AI Mechanism

Choose intelligence route by route. An agent is an option, not the starting assumption.

## Read first

1. Require a qualified [workflow charter](../../../templates/workflow-charter.json), value case, and draft [data-context manifest](../../../templates/data-context-manifest.json).
2. Read [Software Architecture and Intelligence Selection](../../../library/12-software-architecture-and-intelligence-selection.md) and the [hybrid-intelligence blueprint](../../../blueprints/hybrid-intelligence-system.md).
3. Use the [intelligence-selection record](../../../templates/intelligence-selection-record.md) and an [architecture decision record](../../../templates/architecture-decision-record.md).
4. If the approved workflow uses a solution artifact, resolve it through the [solution portfolio](../../../solutions/README.md) and read only the selected business-flow pattern and optional vertical profile. Treat their mechanism allocations as candidates, not target policy or evidence.
5. Apply `ARC-002` through `ARC-005`, `CTX-006` through `CTX-008`, `REL-002`, `CST-001`, and `CST-002` from the [control catalog](../../../controls/control-catalog.json).

## Workflow

1. Decompose the workflow into consequential decision steps, evidence dependencies, actions, and fallback paths; record where the selected pattern or profile does not fit.
2. Establish deterministic, single-call, and coded-workflow baselines before proposing model-directed agency.
3. Compare rules, optimization, classical ML, retrieval, a foundation-model call, a bounded agent workflow, and human review where applicable. For each, state the required sources, quality, preparation, labels, context, and drift controls.
4. Select the smallest mechanism that meets the accepted outcome, risk ceiling, latency, maintainability, and cost constraints.
5. For every selected route, record version, authority ceiling, evidence, evaluation, cost allocation, monitor, fallback, and retirement trigger.
6. Keep policy enforcement, privileged effects, and authoritative state transitions outside model generation. Justify multi-agent work only through real context, permission, latency, or specialization boundaries.

## Output contract

Return:

- a decision-step matrix with candidates and rejection reasons;
- the selected mechanism and deterministic fallback for each route;
- an intelligence-selection record and any consequential ADRs;
- route-specific data, evaluation, cost, monitoring, and retirement requirements;
- explicit unknowns that block architecture or implementation.

Do not use model novelty, benchmark reputation, or framework preference as the selection rationale. If a deterministic or simpler route meets the requirement, prefer it.
