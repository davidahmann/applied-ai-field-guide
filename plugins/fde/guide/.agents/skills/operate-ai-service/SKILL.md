---
name: operate-ai-service
description: Establish or run the operating model for a production AI-enabled service. Use for telemetry, SLOs, behavior monitoring, incident response, cost control, change management, service review, kill switches, regression learning, scaling, or retirement.
---

# Operate an AI Service

Operate the accepted business outcome, not only the model endpoint. Keep value, adoption, reliability, safety, cost, ownership, and change visible together.

## Read first

1. Read factors 11–12 in the [12 Factors of AI Value Engineering](../../../library/14-twelve-factors-ai-value-engineering.md), [Operate and Scale](../../../playbooks/03-operate-and-scale.md), and the [operations map](../../../operations/README.md).
2. Use the [production service review](../../../templates/production-service-review.md), [SLO scorecard](../../../operations/slo-scorecard.md), [data quality and drift contract](../../../operations/data-quality-and-drift.md), [telemetry contract](../../../operations/telemetry-contract.md), [behavior monitoring](../../../operations/behavior-monitoring.md), [incident runbook](../../../operations/incident-runbook.md), and [change management](../../../operations/change-management.md). For more than one workflow, add the [FDE and applied-AI portfolio review](../../../templates/fde-portfolio-review.md); it never replaces a service-level gate.
3. If the service uses a solution artifact, resolve it through the [solution portfolio](../../../solutions/README.md) and read only the selected business-flow pattern and optional vertical profile. Use their operating measures as seeds; local denominators, objectives, and owners control.
4. Apply `CTX-009`, `OPS-001` through `OPS-007`, `REL-002` through `REL-004`, `ADP-002`, `CST-001`, and `CST-002` from the [control catalog](../../../controls/control-catalog.json).

## Workflow

1. Confirm the service owner, technical owner, risk owner, support path, release authority, and business metric owner.
2. Define target-specific SLOs for accepted outcomes, prohibited and duplicate effects, cycle time, cost, source/schema/permission/quality/coverage/lineage/drift health, recovery, and adoption. Validate any solution-profile measure against local denominators and sources; set alert routes and error-budget actions.
3. Trace identity, context, decisions, tools, policy, approvals, state, effects, readback, cost, and stop reason with privacy-safe identifiers.
4. Exercise kill switches for new work, writes, workload identities, egress, and capability bundles. Rehearse severe failure detection, containment, readback, recovery, and communication.
5. Review behavior clusters, incidents, user corrections, adoption barriers, and cost per accepted outcome. Turn diagnosed failures into replayable regressions.
6. Version and evaluate changes, canary them by route or segment, monitor rollback triggers, and preserve compatible release evidence.
7. At each service review, decide continue, constrain, improve, expand, or retire. At a portfolio review, compare declared cohorts on stage flow, time to accepted value, full delivery economics, target-specific effort, validated reuse, sponsor continuity, and operating capacity without treating continuation signals as realized value.

## Output contract

Return the current service or portfolio decision, scorecard, evidence links, breached objectives, incident and change actions, owners and deadlines, value and cost trend, continuation context, capacity or capability gaps, and retirement conditions.

Do not hide outcome failures behind uptime, average away prohibited effects, or expand autonomy while support, evaluation, or customer operating capability is unproven.
