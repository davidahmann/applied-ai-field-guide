# Start Here: Design a Production-Ready AI System

For a linear introduction, read the concise [FDE Guide](../guide/README.md). This page is the Handbook's design-entry checklist.

Use this page at the beginning of a design session. It routes you to the right material and prevents the common failure mode of starting with a model, framework, or multi-agent diagram before the work is understood.

For an end-to-end customer or internal engagement, use the [FDE playbooks](../playbooks/README.md). This page is the shorter design checkpoint for one workflow.

## The thirteen design questions

1. Who performs the work today, and what did direct observation show?
2. What outcome changes if this works, and what is the current baseline?
3. What is the smallest workflow and user segment that can create that outcome?
4. Which steps belong in deterministic rules, optimization, ML, retrieval, a foundation model, an agent, or human review?
5. What evidence proves that the workflow completed correctly?
6. Which systems are sources of truth, and how fresh must they be?
7. Is the agent reading, recommending, drafting, or changing an external system?
8. What identity, permissions, approvals, and spending limits apply to each action?
9. What happens when a tool, retrieval, model, or downstream system fails?
10. What persistent artifact, evidence, and control will a reviewer receive?
11. What exact condition lets you increase autonomy—or roll it back?
12. Which realistic, high-risk, and adversarial conditions must the release suite cover?
13. Who will adopt, support, change, and eventually retire the workflow after delivery?

If any answer is missing, you are still in discovery. Start with [Product, Process, and Human Collaboration](01-product-process-and-ux.md), not implementation.

## Choose a starting path

| Situation | Start here | Do not skip |
| --- | --- | --- |
| You are leading a field or internal delivery engagement | [FDE playbooks](../playbooks/README.md) | Field observation, value evidence, adoption, service ownership, and exit criteria |
| You are building reusable applied-AI capability | [FDE and applied AI engineering synthesis](10-fde-and-production-agent-synthesis.md) | A clear productization boundary, reusable artifacts, and a governed field-learning loop |
| You are choosing a workflow or validating value | [12 Factors of AI Value Engineering](14-twelve-factors-ai-value-engineering.md) → [Discovery and Value](../playbooks/01-discovery-and-value.md) | A baseline, verifier, named outcome owner, full-cost case, and bounded authority |
| You are choosing rules, ML, models, or agents | [Software Architecture and Intelligence Selection](12-software-architecture-and-intelligence-selection.md) | The smallest sufficient mechanism, component boundary, fallback, and evidence plan |
| You need to understand a complex system or assess a material change | [Evidence Graphs and Change Intelligence](13-evidence-graphs-and-change-intelligence.md) | A versioned, derived dependency view and owner-backed impact review—not a new control plane |
| The agent needs company knowledge or data | [Context and Knowledge Systems](02-context-and-knowledge-systems.md) | Source ownership, freshness, scope, and evidence provenance |
| The workflow's data may not be fit for the decision | [Data Readiness and Context Contracts](16-data-readiness-and-context-contracts.md) | Four data planes, decision-critical quality, preparation lineage, output ownership, economics, and drift behavior |
| A local slice must cross legacy, restricted, or target-scale boundaries | [Enterprise Integration and Scale Reality](17-enterprise-integration-and-scale-reality.md) | Source authority, extraction, reconciliation, identity, durable execution, promotion, recovery, and target evidence |
| The agent will use tools, code, browser, or APIs | [Agent System Architecture](03-agent-system-architecture.md) | Identity, sandbox, structured contracts, idempotency, and budgets |
| The agent will write to production systems | [Production, Evaluation, and Governance](04-production-evaluation-and-governance.md) | Staged writes, approval gates, rollback, audit, and kill switch |
| You need to build or repair a release suite | [Evaluation Corpus and Review Loops](09-evaluation-corpus-and-review-loops.md) | Scenario contracts, slice coverage, evaluator isolation, and independent retests |
| You need a concrete design sequence | [Production Implementation Playbook](07-production-implementation-playbook.md) | Exit criteria for every phase |
| You are debugging a weak or unsafe system | [Patterns and Anti-Patterns](06-patterns-and-anti-patterns.md) | Fix the owning layer rather than blaming the model |
| You need the whole system in one view | [Agent Systems Mind Map](08-agent-systems-mind-map.md) | The dependencies between context, control, evidence, and operations |

## The minimum viable production system

Do not begin with a general autonomous worker. Begin with one bounded workflow that has:

- One accountable owner and a measurable accepted outcome
- A recorded choice of deterministic logic, optimization, ML, retrieval, model/agent, or human decision for each consequential step
- A defined input contract and a limited set of source systems
- A task-scoped tool bundle with typed parameters
- An explicit agent or workload identity with least privilege
- Isolated execution, controlled egress, and no model-visible secrets
- An externally enforced write policy: read-only, staged, or approval-gated
- A deterministic or human-reviewable postcondition
- A trace containing source evidence, tool calls, policy decisions, and final artifact
- A retry budget, timeout, escalation path, and rollback or compensation plan
- A replayable evaluation case before it reaches real users

This is intentionally narrower than most “agent platform” demos. Narrow scope is a feature: it makes failure visible, recovery tractable, and the evidence meaningful.

## Canonical artifact pack

| Artifact | Contract/template |
| --- | --- |
| Field evidence | [Field-observation log](../templates/field-observation-log.md) and [FDE discovery pack](../templates/fde-discovery-pack.md) |
| Workflow decision | [Workflow charter](../templates/workflow-charter.json) and [value case](../templates/value-case.md) |
| Intelligence choice | [Intelligence-selection record](../templates/intelligence-selection-record.md) and [architecture decision record](../templates/architecture-decision-record.md) |
| Operational domain | [Ontology template](../templates/operational-ontology.json) |
| Complex-system navigation | [System-map manifest](../templates/system-map-manifest.json) and [change-impact assessment](../templates/change-impact-assessment.json) when complexity justifies the maintenance cost |
| System design when a foundation-model or agent workflow is selected | [Agent-system template](../templates/agent-system.json) |
| Tool boundary | [Tool-contract template](../templates/tool-contract.json) |
| Capability provenance | [Capability-manifest template](../templates/capability-manifest.json) for each admitted tool, MCP server, skill, CLI, or code build |
| Delegation boundary | [Handoff-envelope template](../templates/handoff-envelope.json) when work passes to a worker, agent, or reset context |
| Release case | [Evaluation-case template](../templates/evaluation-case.json) |
| Model or agent evaluation claim | [Evaluation-report template](../templates/evaluation-report.json) |
| Threat boundary | [Threat-model template](../templates/threat-model.json) |
| Design decision | [Architecture decision record](../templates/architecture-decision-record.md) |
| Production promotion | [Release gates](../operations/release-gates.md) |
| Compatible model or agent release | [Solution-release template](../templates/solution-release.json) |
| Delivery and adoption | [Delivery and adoption plan](../templates/delivery-and-adoption-plan.md) |
| Customer ownership | [Customer enablement handoff](../templates/customer-enablement-handoff.md) |
| Ongoing service | [Production service review](../templates/production-service-review.md) |
| Field-to-product learning | [Field-learning register](../templates/field-learning-register.md) |

For deterministic, optimization, or classical-ML-only systems, retain equivalent ordinary software architecture, evaluation, provenance, deployment, rollback, and operating records. Do not create placeholder model or agent artifacts merely to fill the current model/agent release contracts.

## Production-ready means all six are true

| Dimension | Question | Evidence |
| --- | --- | --- |
| Valuable | Does it improve a business outcome with positive net value after full lifecycle cost and realized loss? | Baseline, counterfactual, independently accepted outcomes, residual loss, and full-cost value case |
| Adopted | Do intended users complete the changed workflow and trust its evidence? | Eligible use, completion, override, abandonment, and review load |
| Reliable | Can it reach and prove the desired state? | Replay suite, postconditions, sampled review |
| Safe | Can it be contained when inputs or behavior are hostile? | Scoped identity, sandbox, egress, staged writes |
| Operable | Can a team diagnose, pause, recover, and improve it? | Traces, dashboards, runbook, rollback, ownership |
| Owned | Can the receiving team support, change, govern, and retire it? | Named service owner and exercised handoff |

An AI component that is only capable is a demo. A production system must be valuable, adopted, reliable, safe, operable, and owned.
