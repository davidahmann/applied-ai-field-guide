---
name: operate-ai-service
description: Establish or run the operating model for production AI-enabled services or a multi-workflow adoption program. Use for decision rights, shared enablement, telemetry, SLOs, incidents, cost, change, service review, scaling, or retirement.
---

# Operate an AI Service

Operate the accepted business outcome, not only the model endpoint. Keep value, adoption, reliability, safety, cost, ownership, and change visible together. Treat agents as replaceable system components, not the unit of organizational accountability.

## Read first

1. Read factors 11–12 in the [12 Factors of AI Value Engineering](../../../library/14-twelve-factors-ai-value-engineering.md), [Operate and Scale](../../../playbooks/03-operate-and-scale.md), and the [operations map](../../../operations/README.md).
2. Use the [production service review](../../../templates/production-service-review.md), [SLO scorecard](../../../operations/slo-scorecard.md), [data quality and drift contract](../../../operations/data-quality-and-drift.md), [telemetry contract](../../../operations/telemetry-contract.md), [behavior monitoring](../../../operations/behavior-monitoring.md), [incident runbook](../../../operations/incident-runbook.md), and [change management](../../../operations/change-management.md). For company adoption or more than one workflow, add the [FDE and applied-AI workflow portfolio review](../../../templates/fde-portfolio-review.md); it never replaces a service-level gate.
3. If the service uses a solution artifact, resolve it through the [solution portfolio](../../../solutions/README.md) and read only the selected business-flow pattern and optional vertical profile. Use their operating measures as seeds; local denominators, objectives, and owners control.
4. Apply `CTX-009`, `OPS-001` through `OPS-007`, `REL-002` through `REL-004`, `ADP-002`, `CST-001`, and `CST-002` from the [control catalog](../../../controls/control-catalog.json).

## Workflow

1. Map shared enablement, workflow-local accountability, and temporary delivery capacity. Confirm the executive/program owner, workflow owner, independent verifier and metric owner, service owner, operational owner, technical owner, platform owner, data/policy/security/risk owners, operator and support path, release authority, and backups; keep every required independent approval separate even when one person holds more than one declared role.
2. For a proof, predeclare maximum duration, evidence cutoff, decision owner, receiving owner, required participant capacity and delegates, baseline acknowledgment, and separate technical, operator, adoption, value, economics, data/risk, and production-readiness gates. Require material work to yield a decision, tested assumption, working increment, or sanitized reusable learning; decide stop, reshape, continue proving, or bounded production. Require every applicable mandatory gate to pass before bounded production; time-bounded remediation may address only an explicitly non-blocking residual.
3. Define target-specific SLOs for accepted outcomes, prohibited and duplicate effects, cycle time, cost, source/schema/permission/quality/coverage/lineage/drift health, recovery, and adoption. Validate any solution-profile measure against local denominators and sources; set alert routes and error-budget actions.
4. Trace identity, context, decisions, tools, policy, approvals, state, effects, readback, cost, and stop reason with privacy-safe identifiers.
5. Exercise kill switches for new work, writes, workload identities, egress, and capability bundles. Rehearse severe failure detection, containment, readback, recovery, and communication.
6. Review behavior clusters, incidents, user corrections, adoption barriers, and cost per accepted outcome. Turn diagnosed failures into replayable regressions.
7. Version and evaluate changes, canary them by route, segment, and effect class, monitor rollback triggers, and preserve compatible release evidence. For reused capability, bind the exact prior version and scope, record residual target differences, and revalidate locally. Expand from observe to recommend, act with approval, or bounded autonomous action only for the evaluated effect class.
8. At each service review, decide continue, constrain, improve, expand, or retire. At a portfolio review, compare declared cohorts on stage flow, time to accepted value, full delivery economics, target-specific effort, validated reuse, owner continuity, shared capacity, and temporary substitutions without treating continuation signals as realized value.

## Output contract

Return the current service or workflow-portfolio decision, decision-rights and capability map, proof or promotion gate, scorecard, evidence links, breached objectives, incident and change actions, owners and deadlines, value and cost trend, capacity gaps, temporary substitutions, and retirement conditions.

Do not hide outcome failures behind uptime, average away prohibited effects, let a central or delivery team absorb workflow authority silently, or expand autonomy while support, evaluation, or receiving-team operating capability is unproven.
