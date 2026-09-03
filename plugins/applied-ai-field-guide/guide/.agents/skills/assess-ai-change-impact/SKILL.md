---
name: assess-ai-change-impact
description: Assess the direct and transitive impact of a material AI-system or engagement change before promotion. Use when a source, workflow claim, policy, data contract, model route, tool, capability, evaluator, runtime, operation, or user surface changes.
---

# Assess AI Change Impact

Use declared dependencies and current source revisions to find what must be reviewed. The map routes inspection; it does not authorize promotion or prove completion.

## Read first

1. Read the [evidence graph and change-intelligence blueprint](../../../blueprints/evidence-graph-and-change-intelligence.md), [map freshness and change impact](../../../operations/map-freshness-and-change-impact.md), and [change management](../../../operations/change-management.md).
2. Use the current [system-map manifest](../../../templates/system-map-manifest.json) and [change-impact assessment](../../../templates/change-impact-assessment.json). If no fresh map exists, inspect primary artifacts directly.
3. Read only the affected [solution context](../../../solutions/README.md); it is not a substitute for target dependencies or release evidence.
4. Apply `CTX-004`, `DEL-001`, `DEL-002`, `OPS-007`, and all controls governing the changed boundary.

## Workflow

1. Define the changed subject, prior and proposed revisions or digests, reason, materiality, affected workflow and segment, owner, and required decision.
2. Verify map scope, producer, source revisions, classification, freshness, coverage, and invalidation triggers. Mark it stale when any binding is missing or changed.
3. Identify direct dependencies from declared relations and primary references. Traverse transitive dependencies without converting semantic similarity into confirmed impact.
4. Label each candidate `confirmed`, `inferred`, `unaffected`, or `unknown`; cite the relation or source and name the owner who must dispose material uncertainty.
5. Inspect workflow, data, identity, evaluation, operations, economics, user-surface, migration, rollout, rollback, and dependency-lifecycle consequences.
6. Preserve unaffected revisions and prior decisions. Update only dependency-linked work; route stale or conflicting artifacts for review.
7. Define per-route tests, representative cases, soak or canary, rollback trigger, source-of-truth verification, and post-change outcome check.
8. Decide `proceed_to_validation`, `revise_scope`, `block`, or `rollback`. Incomplete critical scope blocks promotion.

## Output contract

Return:

- a completed change-impact assessment bound to the exact map and change revisions;
- direct and transitive impacts with evidence, confidence class, owner, and disposition;
- explicit unaffected and unknown areas;
- required validation, migration, rollout, rollback, and post-change checks;
- one promotion decision.

Do not let a graph, generated summary, model inference, merge, or passing subset of tests authorize a release.
