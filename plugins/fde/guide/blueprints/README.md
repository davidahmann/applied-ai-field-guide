# Reference Blueprints

## Selection matrix

| Condition | Default |
| --- | --- |
| Fixed steps, enumerated branches, deterministic rules | Deterministic workflow |
| Decision-critical sources need profiling, preparation, reconciliation, lineage, or drift controls | [Data preparation and context pipeline](data-preparation-and-context-pipeline.md) |
| One workflow needs deliberate routing between rules, optimization, ML, retrieval, foundation models, and human review | [Hybrid intelligence system](hybrid-intelligence-system.md) |
| Variable evidence path, read-only outcome, reliable sufficiency test | [Bounded retrieval agent](bounded-retrieval-agent.md) |
| External mutation, policy constraints, approval or rollback | [Transactional write agent](transactional-write-agent.md) |
| A browser, desktop client, or visual interface is the only viable path to a target system | [Computer-use action boundary](computer-use-action-boundary.md) |
| External trigger, long duration, retries, pause/resume | [Event-driven investigation agent](event-driven-investigation-agent.md) |
| Distinct tools, data scopes, permissions, or specialist contexts | [Multi-agent coordinator](multi-agent-coordinator.md) |
| Several production workflows need shared governance and reusable services | [Enterprise agent platform](enterprise-agent-platform.md) |
| Complex or changing systems need navigable software and operational dependency views | [Evidence graph and change intelligence](evidence-graph-and-change-intelligence.md) |
| Iterative analysis needs governed semantics, query/code execution, and claim-level evidence | [Governed data analysis agent](data-analysis-agent.md) |
| Production signals should create isolated, reviewable improvement candidates | [Controlled improvement agent](controlled-improvement-agent.md) |

For recurring operational decisions, use the [solution portfolio](../solutions/README.md) to select a business-flow pattern, apply an industry profile where useful, and then choose the horizontal foundation for tenant and identity, integrations, sensitive evidence, or deployment and operations. These artifacts compose the blueprints and canonical templates; they do not replace workflow qualification or release evidence.

## Applicable design packet

Use only the artifacts justified by the selected decision mechanisms. The current agent-system, behavior-bundle, evaluation-report, and solution-release contracts form the machine-readable path for model and agent releases. A deterministic, optimization, or classical-ML-only system retains equivalent ordinary software architecture, test, provenance, deployment, rollback, and operating evidence instead of placeholder agent artifacts.

| Artifact | Contract |
| --- | --- |
| Workflow discovery | [`templates/fde-discovery-pack.md`](../templates/fde-discovery-pack.md) |
| Workflow and value decision | [`schemas/workflow-charter.schema.json`](../schemas/workflow-charter.schema.json) |
| Data readiness and context contract | [`schemas/data-context-manifest.schema.json`](../schemas/data-context-manifest.schema.json) |
| Intelligence selection | [`templates/intelligence-selection-record.md`](../templates/intelligence-selection-record.md) |
| System-boundary decision | [`templates/architecture-decision-record.md`](../templates/architecture-decision-record.md) |
| Operational ontology | [`schemas/operational-ontology.schema.json`](../schemas/operational-ontology.schema.json) |
| System map and material-change impact review when justified by complexity | [`schemas/system-map-manifest.schema.json`](../schemas/system-map-manifest.schema.json) and [`schemas/change-impact-assessment.schema.json`](../schemas/change-impact-assessment.schema.json) |
| Agent design when a foundation-model or agent workflow is selected | [`schemas/agent-system.schema.json`](../schemas/agent-system.schema.json) |
| Versioned behavior configuration when model behavior is selected | [`schemas/behavior-bundle.schema.json`](../schemas/behavior-bundle.schema.json) |
| Tool contract | [`schemas/tool-contract.schema.json`](../schemas/tool-contract.schema.json) |
| Capability provenance for each admitted build | [`schemas/capability-manifest.schema.json`](../schemas/capability-manifest.schema.json) |
| Delegation handoff when a worker, agent, or context reset is used | [`schemas/handoff-envelope.schema.json`](../schemas/handoff-envelope.schema.json) |
| Evaluation cases | [`schemas/evaluation-case.schema.json`](../schemas/evaluation-case.schema.json) |
| Model or agent evaluation report | [`schemas/evaluation-report.schema.json`](../schemas/evaluation-report.schema.json) |
| Threat model | [`schemas/threat-model.schema.json`](../schemas/threat-model.schema.json) |
| Controls | [`controls/control-catalog.json`](../controls/control-catalog.json) |
| Release gate | [`operations/release-gates.md`](../operations/release-gates.md) |
| Compatible model or agent release | [`schemas/solution-release.schema.json`](../schemas/solution-release.schema.json) |
| Adoption and handoff | [`templates/delivery-and-adoption-plan.md`](../templates/delivery-and-adoption-plan.md) and [`templates/customer-enablement-handoff.md`](../templates/customer-enablement-handoff.md) |
| Field learning and lifecycle | [`templates/field-learning-register.md`](../templates/field-learning-register.md) and [`templates/production-service-review.md`](../templates/production-service-review.md) |

When model behavior is selected, build the behavior bundle after the agent design establishes its authority ceiling. Every tool build admitted to that bundle then needs a tool contract and capability manifest, membership in the bundle, evaluation under that exact bundle, and inclusion in the solution-release digest.

## Architecture escalation rule

```text
workflow
  -> deterministic, optimization, ML, retrieval, or human path when sufficient
  -> bounded single agent when path variance requires model judgment
  -> durable execution when time/failure boundaries exceed one request
  -> multiple agents only when context, permission, latency, or ownership boundaries are distinct
```
