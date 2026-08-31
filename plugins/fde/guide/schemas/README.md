# Machine-Readable Contracts

These JSON Schema 2020-12 contracts make design, runtime, evaluation, and release assumptions reviewable by people and enforceable by repository tooling.

The current agent-system, evaluation-report, and solution-release contracts are scoped to model and agent releases: the evaluation report binds model-behavior components, and the solution release binds an agent-system artifact. Do not populate them with placeholder components for deterministic, optimization, or classical-ML-only systems. Those systems still need versioned software architecture, test, provenance, deployment, rollback, and operating evidence outside these schemas.

| Schema | Governs |
| --- | --- |
| [Artifact catalog](artifact-catalog.schema.json) | Stable repository IDs, types, paths, and tags |
| [Control catalog](control-catalog.schema.json) | Normative project requirements, evidence, and release gates |
| [System-map manifest](system-map-manifest.schema.json) | Derived software/operational views, provenance, freshness, classification, and prohibited authority uses |
| [Change-impact assessment](change-impact-assessment.schema.json) | Material-change scope, impacts, validation, review, promotion, and rollback evidence |
| [Workflow charter](workflow-charter.schema.json) | Problem, scope, outcome, value, readiness, owners, and disposition |
| [Engagement reframe](engagement-reframe.schema.json) | Inherited brief, accountable field roles, competing claims, material conflicts, scoped disposition, selective propagation, and chronology |
| [AI Value Engineering Scorecard](ai-value-engineering-scorecard.schema.json) | Four hard gates, twelve evidence scores, bounded decisions, owners, and review timing |
| [Data-context manifest](data-context-manifest.schema.json) | Four data planes, source authority, quality, preparation lineage, labels, output records, economics, and operations |
| [Operational ontology](operational-ontology.schema.json) | Domain entities, relationships, policies, actions, and invariants |
| [Agent system](agent-system.schema.json) | System topology, tools, state, verification, and operations dependencies |
| [Behavior bundle](behavior-bundle.schema.json) | Exact model-route, prompt, harness, context-policy, tool-bundle, and guardrail configuration |
| [Tool contract](tool-contract.schema.json) | Input/output/error shape, authorization, data exposure, effects, network policy, and failure behavior |
| [Capability manifest](capability-manifest.schema.json) | Publisher, build provenance, artifact digests, authority, runtime profile, assurance, and lifecycle |
| [Threat model](threat-model.schema.json) | Assets, boundaries, threats, mitigations, recovery, and negative cases |
| [Evaluation case](evaluation-case.schema.json) | Replay world, expected trajectory, source-bound reference authority, outcome, graders, and evaluator isolation |
| [Evaluation output](evaluation-output.schema.json) | Exact isolated-runner output and case-level execution evidence bound to an evaluation report |
| [Evaluation report](evaluation-report.schema.json) | Tested claim, complete environment, trials, results, uncertainty, contamination, and decision |
| [Handoff envelope](handoff-envelope.schema.json) | Objective, verified state, provenance, remaining work, delegated authority, budget, expiry, and terminal reason |
| [Solution release](solution-release.schema.json) | Compatible artifact versions, deployment segment, migration, rollout, approvals, and rollback |
| [Trace event](trace-event.schema.json) | Closed, release-bound runtime state and terminal-event evidence |
| [Effect receipt](effect-receipt.schema.json) | Identity-bound effect, signed service receipt, readback, and compensation evidence |
| [Pattern catalog](pattern-catalog.schema.json) | Evidence-linked patterns, anti-patterns, controls, and review dates |

Schema validity does not prove that a value is true or a control is implemented. Templates provide canonical structural examples; executable examples and release evidence must prove behavior.

For a breaking change, update the schema version, canonical template, governed examples, validator mapping, positive and negative tests, and the applicable note in the [`docs/migrations/` index](../docs/migrations/README.md). Evaluation Case 1.1 users should follow the [reference-authority migration](../docs/migrations/evaluation-case-1.1.md); Workflow Charter 1.2 users should follow the [residual-loss migration](../docs/migrations/workflow-charter-1.2.md); Solution Release 1.2 users should follow the [data-context migration](../docs/migrations/solution-release-1.2.md).
