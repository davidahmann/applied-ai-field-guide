# Production Operations

Use these artifacts after design begins—not only after launch. They define how a production-agent workflow is promoted, observed, contained, recovered, changed, reviewed, and retired.

| Need | Start with | Output |
| --- | --- | --- |
| Decide whether to promote | [Release gates](release-gates.md) | Evidence-backed hold, shadow, canary, bounded-production, or autonomy decision |
| Define runtime evidence | [Telemetry contract](telemetry-contract.md) | Trace, effect, version, identity, outcome, and cost events |
| Set service targets | [SLO scorecard](slo-scorecard.md) | Segment-specific objectives, budgets, capacity, and recovery policy |
| Operate data readiness | [Data quality and drift](data-quality-and-drift.md) | Source, quality, lineage, correction, drift, rebaseline, and retirement decisions |
| Contain and recover | [Incident runbook](incident-runbook.md) | Scoped containment, reconciliation, regression, ownership, and re-enable decision |
| Change behavior safely | [Change management](change-management.md) | Compatible release bundle, evaluation report, canary, rollback, and post-change decision |
| Keep dependency views useful | [Map freshness and change impact](map-freshness-and-change-impact.md) | Derived maps with source provenance, freshness, impact review, and no shadow authority |
| Detect dangerous divergence | [Behavior monitoring](behavior-monitoring.md) | Independent intent/action signal routed to trusted containment controls |
| Govern capability provenance | [Capability supply chain](capability-supply-chain.md) | Admitted, pinned, constrained, monitored, and revocable tools, MCP servers, skills, CLIs, and code packages |
| Measure adoption and transfer ownership | [Delivery and adoption plan](../templates/delivery-and-adoption-plan.md) and [customer handoff](../templates/customer-enablement-handoff.md) | Predeclared adoption contract, exercised harness ownership, and artifact lineage |
| Review production value and service health | [Production service review](../templates/production-service-review.md) | Expand, continue, constrain, pause, improve, or retire decision |
| Review an FDE or applied-AI portfolio | [FDE and applied-AI portfolio review](../templates/fde-portfolio-review.md) | Cohort-aware investment, continuation, productization, transfer, capacity, or exit decision |
| Route field learning | [Field-learning register](../templates/field-learning-register.md) | Confidentiality-reviewed customer configuration, product backlog, reusable artifact, or retirement input |
| Improve or retire | [Operate and Scale](../playbooks/03-operate-and-scale.md#10-run-the-improve-expand-or-retire-sequence) | Gated compatible release or verified decommission |

Start adoption instrumentation, artifact-lineage capture, and customer harness pairing during the pilot. The recurring cadence and improve/retire sequence are in [Operate and Scale](../playbooks/03-operate-and-scale.md).
